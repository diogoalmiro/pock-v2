import { useRouter } from "next/router";
import { useDeferredValue, useEffect, useState } from "react";

export async function fetchApi<T>(url: string, abortController: AbortController | undefined): Promise<T | null> {
    try {
        let r = await fetch(url, { signal: abortController?.signal });
        if (r.ok){
            return r.json();
        }
        else {
            return null;
        }
    } catch (error) {
        if( typeof error !== 'object' ){
            console.error('Error is not an object', error);
        }
        if ( (error as any)?.name === 'AbortError') return null;
        throw error;
    }
}

export async function fetchUsers(inp?: string){
    if( !inp ) return await fetchApi<User[]>('/api/users', undefined) || [];

    return await fetchApi<User[]>('/api/users?user=' + encodeURIComponent(inp), undefined) || [];
}

export async function fetchTrips(inp?: string){
    if( !inp ) return await fetchApi<Trip[]>('/api/trips', undefined) || [];

    return await fetchApi<Trip[]>('/api/trips?trip=' + encodeURIComponent(inp), undefined) || [];
}

export async function fetchTransactions(user?: string, trip?: string){
    if( !user && !trip ) return await fetchApi<Transaction[]>('/api/transactions', undefined) || [];
    if( !trip ) return await fetchApi<Transaction[]>('/api/transactions?user=' + encodeURIComponent(user!), undefined) || [];
    if( !user ) return await fetchApi<Transaction[]>('/api/transactions?trip=' + encodeURIComponent(trip), undefined) || [];
    
    return await fetchApi<Transaction[]>('/api/transactions?user=' + encodeURIComponent(user) + '&trip=' + encodeURIComponent(trip), undefined) || [];
}

export function useApiTransactions(user?: string, trip?: string){
    const [data, setData] = useState<Transaction[]>([]);

    useEffect(() => {
        const abortController = new AbortController();
        fetchTransactions(user, trip).then(dt => setData(dt || []));
        return () => abortController.abort();
    }, [user, trip]);

    return data;
}

export function useApi<T>(resource: string, deps: any[]): T[] {
    const router = useRouter();
    const [data, setData] = useState<T[]>([]);
    const url = `${router.basePath}/api/${resource}`;

    useEffect(() => {
        const abortController = new AbortController();
        fetchApi<T[]>(url, abortController).then(dt => setData(dt || []));
        return () => abortController.abort();
    }, [url, ...deps]);

    return data;
}

export function useApiUsers(deps: any[]){
    return useApi<User>('users', deps);
}

export function useApiTrips(deps: any[]){
    return useApi<Trip>('trips', deps);
}

export function newTransaction(trip: string, payer: string, payees: string[], amount: number, description: string, date: string){
    return fetch('/api/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({trip, payer, payees, amount, description, date})
    }).then(r => {
        if( r.ok ){
            return r.json();
        }
        else{
            throw new Error(`Failed to create transaction (${r.status})`);
        }
    });
}

export function updateTransaction(id: string, trip: string, payer: string, payees: string[], amount: number, description: string, date: string){
    return fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({trip, payer, payees, amount, description, date})
    }).then(r => {
        if( r.ok ){
            return r.json() as Transaction;
        }
        else{
            throw new Error(`Failed to update transaction (${r.status})`);
        }
    });
}

export function deleteTransaction(id: string){
    return fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
    }).then(r => {
        if( r.ok ){
            return r.json();
        }
        else{
            throw new Error(`Failed to delete transaction (${r.status})`);
        }
    });
}

export function deleteTrip(id: string){
    return fetch(`/api/trips/${id}`, {
        method: 'DELETE'
    }).then(r => {
        if( r.ok ){
            return r.json() as Trip;
        }
        else{
            throw new Error(`Failed to delete trip (${r.status})`);
        }
    });
}