
type Parcel = {
    id?: string,
    payerId?: string,
    payer?: User,
    payeeId?: string,
    payee?: User,
    amount?: number
    description?: string
}