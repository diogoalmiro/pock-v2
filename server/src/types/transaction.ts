
type Transaction = {
    id?: string;
    amount?: number;
    description?: string;
    trip?: Trip;
    tripId?: string;
    payer?: User;
    payerId?: string;
    parcels?: Parcel[];
    date?: string;
}