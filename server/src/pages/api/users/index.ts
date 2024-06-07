import { initializeDb } from "@/core/db";
import { UserEntity } from "@/entities/user";
import { UserCreateDto } from "@/validators/user.dto";
import { instanceToInstance, instanceToPlain, plainToClass, plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import { get } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { Like, ObjectLiteral } from "typeorm";

export default async function UsersApiIndexHandler(req: NextApiRequest, res: NextApiResponse) {
    await initializeDb();
    async function UsersApiIndexPostHandler() {
        if( !req.body ){
            console.error('Request body is required');
            return res.status(400).json({ message: 'Request body is required' });
        }
        const createUser = plainToInstance(UserCreateDto, req.body);
        try {
            await validateOrReject(createUser, { enableDebugMessages: true });
        }
        catch( errors ){
            console.error(errors);
            return res.status(400).json({ message: 'Invalid request body', errors });
        }
        const user = new UserEntity();
        user.showName = createUser.showName;
        user.username = createUser.username;
        try{
            const savedUser = await UserEntity.save(user);
            res.json(instanceToPlain(savedUser));
        } catch( error ){
            console.error(error);
            return res.status(500).json({ message: 'Failed to save user', error });
        }
    }
    async function UsersApiIndexGetHandler() {
        let queriedUser = (req.query.user ? Array.isArray(req.query.user) ? req.query.user : [req.query.user] : []).filter(qu => qu.length > 0);
        const where = queriedUser.flatMap(user => [{
            id: user
        },{
            showName: Like(`${user.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`)
        },{
            username: Like(`${user.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`)
        }]);
        return res.json(await UserEntity.find({ where }));
    }
    
    if( req.method === 'POST' ){
        return UsersApiIndexPostHandler();
    }
    if( req.method === 'GET' ){
        return UsersApiIndexGetHandler();
    }
    return res.status(405).json({ message: 'Method not allowed' });
}