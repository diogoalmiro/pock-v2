import { initializeDb } from "@/core/db";
import { ParcelEntity } from "@/entities/parcel";
import { TransactionEntity } from "@/entities/transaction";
import { TripEntity } from "@/entities/trip";
import { UserEntity } from "@/entities/user";
import { resourceName } from "@/shared/resourceName";
import { TransactionCreateDto, TransactionUpdateDto } from "@/validators/transaction.dto";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import { NextApiRequest, NextApiResponse } from "next";

export default async function TransactionsApiIdHandler(req: NextApiRequest, res: NextApiResponse) {
    const dt = await initializeDb();
    const id = req.query.id as string;
    async function TransactionsApiIdGetHandler() {
        return res.json(await TransactionEntity.findOne({
            where: { id },
            relations: {
                parcels: {
                    payee: true,
                    payer: true,
                },
                payer: true,
                trip: true,
            }
        }));
    }
    async function TransactionsApiIndexPutHandler() {
        if( !req.body ){
            console.error('Request body is required');
            return res.status(400).json({ message: 'Request body is required' });
        }
        const body = {
            ...req.body,
            id,
        }
        const updateTransaction = plainToInstance(TransactionUpdateDto, body, { enableImplicitConversion: true });
        try {
            await validateOrReject(updateTransaction, { enableDebugMessages: true });
        }
        catch( errors ){
            console.error(errors);
            return res.status(400).json({ message: 'Invalid request body', errors });
        }
    
        const transaction = await TransactionEntity.findOne({where: { id: updateTransaction.id}, relations: {
            trip: true,
            payer: true,
            parcels: {
                payee: true,
                payer: true,
            },
        }});
        if( !transaction ){
            return res.status(404).json({ message: 'Transaction not found' });
        }
        const tripname = resourceName(updateTransaction.trip);
        const payername = resourceName(updateTransaction.payer);
        return dt.transaction(async (manager) => {
            let trip = await TripEntity.findOne({where: [{id: updateTransaction.trip}, {tripname: tripname}]});
            if( !trip ){
                trip = new TripEntity();
                trip.showName = updateTransaction.trip;
                trip.tripname = resourceName(updateTransaction.trip);
                trip = await manager.save(trip);
            }
            let payer = await UserEntity.findOne({where: [{id: updateTransaction.payer}, {username: payername}]});
            if( !payer ){
                payer = new UserEntity();
                payer.showName = updateTransaction.payer;
                payer.username = resourceName(updateTransaction.payer);
                payer = await manager.save(payer);
            }
            transaction.trip = trip;
            transaction.payer = payer;
            transaction.amount = updateTransaction.amount;
            transaction.description = updateTransaction.description;
            transaction.date = updateTransaction.date;
            await manager.save(transaction);
            transaction.parcels = [];

            await ParcelEntity.delete({transactionId: transaction.id});
            
            let perPayerAmount = Math.round(updateTransaction.amount / updateTransaction.payees.length * 100) / 100;
    
            for( let payee of updateTransaction.payees ){
                const payeename = resourceName(payee);
                let payeeUser = await UserEntity.findOne({where: [{id: payee}, {username: payeename}]});
                if( !payeeUser ){
                    payeeUser = new UserEntity();
                    payeeUser.showName = payee;
                    payeeUser.username = resourceName(payee);
                    payeeUser = await manager.save(payeeUser);
                }
                let parcel = new ParcelEntity();
                parcel.transactionId = transaction.id;
                parcel.payeeId = payeeUser.id;
                parcel.payerId = payer.id;
                parcel.amount = -perPayerAmount;
                if( payer.id === payeeUser.id ){
                    parcel.amount = updateTransaction.amount - perPayerAmount; 
                }
                parcel = await manager.save(parcel);
                parcel.payee = payeeUser;
                parcel.payer = payer;
                transaction.parcels.push(parcel);
            }
            
            return res.json(transaction);
        });
    }
    async function TransactionsApiIdDeleteHandler() {
        const transaction = await TransactionEntity.findOne({where: { id }, relations: {
            parcels: {
                payee: true,
                payer: true,
            },
            payer: true,
            trip: true,
        }});
        if( !transaction ){
            return res.status(404).json({ message: 'Transaction not found' });
        }
        await dt.transaction(async (manager) => {
            await ParcelEntity.delete({transactionId: transaction.id});
            await TransactionEntity.delete({id: transaction.id});
        });
        return res.json(transaction);
    }
    if( req.method === 'GET' ){
        return TransactionsApiIdGetHandler();
    }
    if( req.method === 'PUT' ){
        return TransactionsApiIndexPutHandler();
    }
    if( req.method === 'DELETE' ){
        return TransactionsApiIdDeleteHandler();
    }
    return res.status(405).json({ message: 'Method not allowed' });
}