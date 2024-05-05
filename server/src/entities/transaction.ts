import { Entity, PrimaryGeneratedColumn, Column, Unique, Check, ManyToOne, JoinColumn, ManyToMany, JoinTable, BaseEntity, OneToMany } from 'typeorm';
import { TripEntity } from './trip';
import { UserEntity } from './user';
import { ParcelEntity } from './parcel';

@Entity()
export class TransactionEntity extends BaseEntity implements Transaction {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column({
        type: 'text',
        nullable: false,
    })
    description?: string;

    @Column({
        type: 'numeric',
        nullable: false,
    })
    amount?: number;

    @Column({
        type: "date",
        nullable: true,
    })
    date?: string;

    @ManyToOne(() => TripEntity, (trip) => trip.id)
    @JoinColumn({ name: 'tripId'})
    trip?: Trip;

    @Column({
        type: 'uuid',
        nullable: false,
    })
    tripId?: string | undefined;

    @ManyToOne(() => UserEntity, (payer) => payer.id)
    @JoinColumn({ name: 'payerId'})
    payer?: User;

    @Column({
        type: 'uuid',
        nullable: false,
    })
    payerId?: string | undefined;

    @OneToMany(() => ParcelEntity, (parcel) => parcel.transaction)
    parcels?: Parcel[];
}