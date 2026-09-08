import "reflect-metadata";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Invoice } from "./Invoice";
import { Item } from "./Item";

@Entity("invoice_items")
export class InvoiceItem {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column()
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column("decimal", { precision: 12, scale: 2 })
  quantity!: number;

  @Column("decimal", { precision: 12, scale: 2 })
  rate!: number;

  @Column("decimal", { precision: 12, scale: 2 })
  amount!: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "invoiceId" })
  invoice!: Invoice;

  @Column()
  invoiceId!: number;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: "itemId" })
  item!: Item;

  @Column({ type: "integer", nullable: true })
  itemId!: number | null;
}
