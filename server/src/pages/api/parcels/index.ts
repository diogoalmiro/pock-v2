import { initializeDb } from "@/core/db";
import { ParcelEntity } from "@/entities/parcel";
import { TransactionEntity } from "@/entities/transaction";
import { TripEntity } from "@/entities/trip";
import { UserEntity } from "@/entities/user";
import { resourceName } from "@/shared/resourceName";
import { TransactionCreateDto } from "@/validators/transaction.dto";
import { plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import { NextApiRequest, NextApiResponse } from "next";

export default async function ParcelsApiIndexHandler(req: NextApiRequest, res: NextApiResponse) {
    const dt = await initializeDb();
    async function ParcelsApiIndexGetHandler() {
        const parcels = await ParcelEntity.find({
            relations: {
                payee: true,
                payer: true,
                transaction: {
                    trip: true,
                },
            }
        });
        return res.json(parcels);
    }
    if( req.method === 'GET' ){
        return ParcelsApiIndexGetHandler();
    }
    return res.status(405).json({ message: 'Method not allowed' });
}