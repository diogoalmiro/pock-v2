import { initializeDb } from "@/core/db";
import { TripEntity } from "@/entities/trip";
import { TripCreateDto } from "@/validators/trip.dto";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import { NextApiRequest, NextApiResponse } from "next";
import { Like } from "typeorm";

export default async function TripsApiIndexHandler(req: NextApiRequest, res: NextApiResponse) {
    await initializeDb();
    async function TripsApiIndexPostHandler() {
        if( !req.body ){
            console.error('Request body is required');
            return res.status(400).json({ message: 'Request body is required' });
        }
        const createTrip = plainToInstance(TripCreateDto, req.body);
        try {
            await validateOrReject(createTrip, { enableDebugMessages: true });
        }
        catch( errors ){
            console.error(errors);
            return res.status(400).json({ message: 'Invalid request body', errors });
        }
        const trip = new TripEntity();
        trip.showName = createTrip.showName;
        trip.tripname = createTrip.tripname;

        try{
            const savedTrip = await TripEntity.save(trip);
            res.json(instanceToPlain(savedTrip));
        }
        catch( error ){
            console.error(error);
            return res.status(500).json({ message: 'Failed to save trip', error });
        }
    }
    async function TripsApiIndexGetHandler() {
        let queriedTrip = (req.query.trip ? Array.isArray(req.query.trip) ? req.query.trip : [req.query.trip] : []).filter(qu => qu.length > 0);
        const where = queriedTrip.flatMap(Trip => [{
            id: Trip
        },{
            showName: Like(`${Trip.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`)
        },{
            tripname: Like(`${Trip.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`)
        }]);
        return res.json(await TripEntity.find({ where }));
    }
    
    if( req.method === 'POST' ){
        return TripsApiIndexPostHandler();
    }
    if( req.method === 'GET' ){
        return TripsApiIndexGetHandler();
    }
    return res.status(405).json({ message: 'Method not allowed' });
}