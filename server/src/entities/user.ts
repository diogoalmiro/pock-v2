import { Entity, PrimaryGeneratedColumn, Column, Unique, Check, BaseEntity, OneToMany } from 'typeorm';
import { ParcelEntity } from './parcel';

@Entity("user")
export class UserEntity extends BaseEntity implements User {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column({
        type: 'text',
        unique: true,
        nullable: false,
    })
    @Check('length("username") > 0')
    username?: string;

    @Column({
        type: 'text',
        nullable: false,
    })
    @Check('length("showName") > 0')
    showName?: string;
}