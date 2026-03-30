export interface InvoiceItem {
    itemId?: string;
    title?: string;
    description?: string;
    quantity: number;
    rate: number;
    amount: number;
    unit?: string;
}

export interface InvoiceCalculationData {
    items?: any[];
    subTotal?: number;
    taxPercent?: number;
    discountPercent?: number;
    shipping?: number;
    total?: number;
    received?: number;
    remaining?: number;
    [key: string]: any;
}

export const calculateInvoiceTotals = (
    data: InvoiceCalculationData,
    existingData?: InvoiceCalculationData,
) => {
    const result = { ...data };

    // 1. Process Items
    if (data.items && Array.isArray(data.items)) {
        const processedItems = data.items.map((item: any) => {
            const quantity = Number(item.quantity || 0);
            const rate = Number(item.rate || 0);
            const amount =
                item.amount !== undefined ? Number(item.amount) : quantity * rate;

            return {
                ...item,
                quantity,
                rate,
                amount: Number(amount.toFixed(2)),
            };
        });

        result.items = processedItems;

        // Calculate Subtotal from items
        const subTotal = processedItems.reduce(
            (sum: number, item: any) => sum + item.amount,
            0,
        );
        result.subTotal = Number(subTotal.toFixed(2));
    } else if (existingData) {
        // If no new items, use existing subtotal
        result.subTotal =
            data.subTotal !== undefined
                ? Number(data.subTotal)
                : existingData.subTotal || 0;
    }

    // 2. Calculate Total
    const taxPercent = Number(
        data.taxPercent !== undefined
            ? data.taxPercent
            : existingData?.taxPercent || 0,
    );
    const discountPercent = Number(
        data.discountPercent !== undefined
            ? data.discountPercent
            : existingData?.discountPercent || 0,
    );
    const shipping = Number(
        data.shipping !== undefined ? data.shipping : existingData?.shipping || 0,
    );

    const subTotal = Number(result.subTotal || 0);

    const taxAmount = (subTotal * taxPercent) / 100;
    const discountAmount = (subTotal * discountPercent) / 100;

    const calculatedTotal = subTotal + taxAmount - discountAmount + shipping;
    result.total = Number(Math.max(0, calculatedTotal).toFixed(2));

    // 3. Calculate Remaining
    const received = Number(
        data.received !== undefined
            ? data.received
            : existingData?.received || 0,
    );
    result.received = received;

    result.remaining = Number(Math.max(0, result.total - received).toFixed(2));

    return result;
};
