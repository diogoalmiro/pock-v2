import { Entity, PrimaryGeneratedColumn, Column, Unique, Check, BaseEntity } from 'typeorm';

@Entity("trip")
export class TripEntity extends BaseEntity implements Trip {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column({
        type: 'text',
        unique: true,
        nullable: false,
    })
    @Check('length("tripname") > 0')
    tripname?: string;

    @Column({
        type: 'text',
        nullable: false,
    })
    @Check('length("showName") > 0')
    showName?: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    description?: string;
}
