import { initializeDb } from "@/core/db";
import { ParcelEntity } from "@/entities/parcel";
import { TransactionEntity } from "@/entities/transaction";
import { TripEntity } from "@/entities/trip";
import { UserEntity } from "@/entities/user";
import { resourceName } from "@/shared/resourceName";
import { TransactionCreateDto, TransactionUpdateDto } from "@/validators/transaction.dto";
import { TripUpdateDto } from "@/validators/trip.dto";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import { NextApiRequest, NextApiResponse } from "next";

export default async function TripsApiIdHandler(req: NextApiRequest, res: NextApiResponse) {
    const dt = await initializeDb();
    const id = req.query.id as string;
    async function TripsApiIdGetHandler() {
        return res.json(await TripEntity.findOne({
            where: { id },
            relations: {
                transactions: {
                    payer: true,
                    parcels: {
                        payee: true,
                        payer: true,
                    },
                },
            }
        }));
    }
    async function TripsApiIndexPutHandler() {
        if( !req.body ){
            console.error('Request body is required');
            return res.status(400).json({ message: 'Request body is required' });
        }
        const body = {
            ...req.body,
            id,
        }
        const updateTrip = plainToInstance(TripUpdateDto, body, { enableImplicitConversion: true });
        try {
            await validateOrReject(updateTrip, { enableDebugMessages: true });
        }
        catch( errors ){
            console.error(errors);
            return res.status(400).json({ message: 'Invalid request body', errors });
        }
    
        const trip = await TripEntity.findOne({where: { id: updateTrip.id}});
        if( !trip ){
            return res.status(404).json({ message: 'Trip not found' });
        }
        return await dt.transaction(async (manager) => {
            return await manager.save(TripEntity, {
                ...trip,
                ...updateTrip,
            });
        });
    }
    async function TripsApiIdDeleteHandler() {
        const trip = await TripEntity.findOne({where: { id }, relations: {
            transactions: {
                payer: true,
                parcels: {
                    payee: true,
                    payer: true,
                },
            },
        }});
        if( !trip ){
            return res.status(404).json({ message: 'Trip not found' });
        }
        await dt.transaction(async (manager) => {
            for( const transaction of (trip.transactions || []) ){
                await ParcelEntity.delete({transactionId: transaction.id});
                await TransactionEntity.delete({id: transaction.id});
            }
            await TripEntity.delete({id});
        });
        return res.json(trip);
    }
    if( req.method === 'GET' ){
        return TripsApiIdGetHandler();
    }
    if( req.method === 'PUT' ){
        return TripsApiIndexPutHandler();
    }
    if( req.method === 'DELETE' ){
        return TripsApiIdDeleteHandler();
    }
    return res.status(405).json({ message: 'Method not allowed' });
}