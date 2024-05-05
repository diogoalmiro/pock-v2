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

export default async function TransactionsApiIndexHandler(req: NextApiRequest, res: NextApiResponse) {
    const dt = await initializeDb();
    async function TransactionsApiIndexPostHandler() {
        if( !req.body ){
            console.error('Request body is required');
            return res.status(400).json({ message: 'Request body is required' });
        }
        const createTransaction = plainToInstance(TransactionCreateDto, req.body, { enableImplicitConversion: true });
        try {
            await validateOrReject(createTransaction, { enableDebugMessages: true });
        }
        catch( errors ){
            console.error(errors);
            return res.status(400).json({ message: 'Invalid request body', errors });
        }
        const tripname = resourceName(createTransaction.trip);
        const payername = resourceName(createTransaction.payer);
        return dt.transaction(async (manager) => {
            let trip = await TripEntity.findOne({where: [{id: createTransaction.trip}, {tripname: tripname}]});
            if( !trip ){
                trip = new TripEntity();
                trip.showName = createTransaction.trip;
                trip.tripname = resourceName(createTransaction.trip);
                trip = await manager.save(trip);
            }
            let payer = await UserEntity.findOne({where: [{id: createTransaction.payer}, {username: payername}]});
            if( !payer ){
                payer = new UserEntity();
                payer.showName = createTransaction.payer;
                payer.username = resourceName(createTransaction.payer);
                payer = await manager.save(payer);
            }
            let transaction = new TransactionEntity();
            transaction.trip = trip;
            transaction.payer = payer;
            transaction.amount = createTransaction.amount;
            transaction.description = createTransaction.description;
            transaction.date = createTransaction.date;
            transaction = await manager.save(transaction);
            transaction.parcels = [];

            let perPayerAmount = Math.round(createTransaction.amount / createTransaction.payees.length * 100) / 100;

            for( let payee of createTransaction.payees ){
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
                    parcel.amount = createTransaction.amount - perPayerAmount; 
                }
                parcel = await manager.save(parcel);
                parcel.payee = payeeUser;
                parcel.payer = payer;
                transaction.parcels.push(parcel);
            }
            
            return res.json(transaction);
        });
    }
    async function TransactionsApiIndexGetHandler() {
        let user = req.query.user;
        if( Array.isArray(user) ) throw new Error('User query parameter must be a single value');
        let trip = req.query.trip;
        if( Array.isArray(trip) ) throw new Error('Trip query parameter must be a single value');
        return res.json(await TransactionEntity.find({
            where: [{
                tripId: trip,
                payerId: user,
            },{
                tripId: trip,
                parcels: {
                    payeeId: user,
                },
            },{
                tripId: trip,
                parcels: {
                    payerId: user,
                },
            }],
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
    if( req.method === 'POST' ){
        return TransactionsApiIndexPostHandler();
    }
    if( req.method === 'GET' ){
        return TransactionsApiIndexGetHandler();
    }
    return res.status(405).json({ message: 'Method not allowed' });
}