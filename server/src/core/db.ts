import { ParcelEntity } from '@/entities/parcel';
import { TransactionEntity } from '@/entities/transaction';
import { TripEntity } from '@/entities/trip';
import { UserEntity } from '@/entities/user';
import { DataSource, ObjectLiteral } from 'typeorm';

const _dataSource = new DataSource({
    type: 'better-sqlite3',
    database: 'pock.db',
    entities: [UserEntity, TripEntity, TransactionEntity, ParcelEntity],
    migrations: [],
    subscribers: [],
    logging: true,
    logger: 'simple-console',
    synchronize: true,
})

const _ready = _dataSource.initialize();

export const initializeDb = async () => await _ready;

