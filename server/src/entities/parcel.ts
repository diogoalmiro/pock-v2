import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user";
import { TransactionEntity } from "./transaction";

@Entity()
export class ParcelEntity extends BaseEntity implements Parcel {
    @PrimaryGeneratedColumn('uuid')
    id?: string

    @ManyToOne(() => TransactionEntity, (transaction) => transaction.id)
    @JoinColumn({ name: 'transactionId'})
    transaction?: Transaction;

    @Column({
        type: 'uuid',
        nullable: false,
    })
    transactionId?: string;
    
    @Column({
        type: 'numeric',
        nullable: false,
    })
    amount?: number;

    @ManyToOne(() => UserEntity, (payer) => payer.id)
    @JoinColumn({ name: 'payerId'})
    payer?: User;

    @Column({
        type: 'uuid',
        nullable: false,
    })
    payerId?: string;

    @ManyToOne(() => UserEntity, (payee) => payee.id)
    @JoinColumn({ name: 'payeeId'})
    payee?: User;

    @Column({
        type: 'uuid',
        nullable: false,
    })
    payeeId?: string;
}