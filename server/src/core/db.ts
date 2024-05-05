import { ParcelEntity } from '@/entities/parcel';
import { TransactionEntity } from '@/entities/transaction';
import { TripEntity } from '@/entities/trip';
import { UserEntity } from '@/entities/user';
import { DataSource } from 'typeorm';
import "reflect-metadata";

let _dataSource: DataSource | null = null;

export const initializeDb = async () => {
    if( !_dataSource ){
        _dataSource = new DataSource({
            type: 'better-sqlite3',
            database: 'pock.db',
            entities: [UserEntity, TripEntity, TransactionEntity, ParcelEntity],
            migrations: [],
            subscribers: [],
            logging: true,
            logger: 'simple-console',
            synchronize: true,
        });
        await _dataSource.initialize();
    }
    return _dataSource;
};

