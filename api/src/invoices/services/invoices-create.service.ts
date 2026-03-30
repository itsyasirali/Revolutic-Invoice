import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../invoice.entity';
import { InvoiceItem } from '../invoice-item.entity';
import { Customer } from '../../customers/customer.entity';
import { Template } from '../../templates/template.entity';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { calculateInvoiceTotals } from '../utils/invoice-calculations.util';

@Injectable()
export class InvoicesCreateService {
    constructor(
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,
        @InjectRepository(InvoiceItem)
        private invoiceItemRepository: Repository<InvoiceItem>,
        @InjectRepository(Customer)
        private customerRepository: Repository<Customer>,
        @InjectRepository(Template)
        private templateRepository: Repository<Template>,
    ) { }

    async create(userId: number, createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
        try {
            const { customerId, templateId, items, ...invoiceData } = createInvoiceDto;

            // Verify customer exists and belongs to user
            const customer = await this.customerRepository.findOne({
                where: { id: customerId, userId },
            });

            if (!customer) {
                throw new NotFoundException(`Customer with ID ${customerId} not found for this user`);
            }

            // Get template (provided or default)
            let finalTemplateId = templateId;
            if (!finalTemplateId) {
                const defaultTemplate = await this.templateRepository.findOne({
                    where: { userId, isDefault: true },
                });
                if (defaultTemplate) {
                    finalTemplateId = defaultTemplate.id;
                }
            }

            // Calculate totals
            const calculatedData = calculateInvoiceTotals({
                ...invoiceData,
                items: items || [],
            });

            // Create invoice
            const invoice = this.invoiceRepository.create({
                ...invoiceData,
                ...calculatedData,
                items: items?.map(item => ({
                    itemId: item.itemId || null, // Ensure itemId is handled
                    title: item.title,
                    description: item.description,
                    quantity: Number(item.quantity) || 0,
                    rate: Number(item.rate) || 0,
                    amount: Number(item.amount) || 0,
                })) || [],
                userId,
                customerId,
                templateId: finalTemplateId || null,
                status: 'Draft',
            });

            const savedInvoice = await this.invoiceRepository.save(invoice);

            // Create invoice items - Removed because cascade: true on Invoice entity handles this
            // if (items && items.length > 0) {
            //     const invoiceItems = items.map((item) => {
            //         const { itemId, ...itemData } = item;
            //         return this.invoiceItemRepository.create({
            //             ...itemData,
            //             itemId: itemId || null,
            //             invoiceId: savedInvoice.id,
            //         });
            //     });
            //     await this.invoiceItemRepository.save(invoiceItems);
            // }

            // Fetch and return with relations
            const result = await this.invoiceRepository.findOne({
                where: { id: savedInvoice.id },
                relations: ['customer', 'template', 'items'],
            });

            if (!result) {
                throw new NotFoundException('Invoice not found after creation');
            }

            return result;
        } catch (error) {
            console.error('Error creating invoice:', error);
            throw error; // Re-throw to let NestJS handle it, but now we have logs
        }
    }
}
