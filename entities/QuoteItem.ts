import "reflect-metadata";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { encryptedText } from "@/lib/encryption";
import type { Quote } from "./Quote";
import type { Item } from "./Item";

@Entity("quote_items")
export class QuoteItem {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  // Snapshot of the item name/description at quote time.
  @Column({ transformer: encryptedText })
  name!: string;

  @Column({ type: "text", nullable: true, transformer: encryptedText })
  description!: string;

  @Column("decimal", { precision: 12, scale: 2 })
  quantity!: number;

  @Column("decimal", { precision: 12, scale: 2 })
  rate!: number;

  // Line discount / tax percentages.
  @Column("float", { default: 0 })
  discount!: number;

  @Column("float", { default: 0 })
  tax!: number;

  // Line net amount after discount and tax.
  @Column("decimal", { precision: 12, scale: 2 })
  amount!: number;

  @Column("integer", { default: 0 })
  sortOrder!: number;

  @ManyToOne("quotes", "items", { onDelete: "CASCADE" })
  @JoinColumn({ name: "quoteId" })
  quote!: Quote;

  @Column()
  quoteId!: number;

  @ManyToOne("items", { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "itemId" })
  item!: Item;

  @Column({ type: "integer", nullable: true })
  itemId!: number | null;
}

Object.defineProperty(QuoteItem, "name", { value: "QuoteItem", configurable: true });
