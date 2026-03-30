import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  unit: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  sellingPrice: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 'Active' })
  status: string; // 'Active' | 'inActive'

  // Establishing relationship with User
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
