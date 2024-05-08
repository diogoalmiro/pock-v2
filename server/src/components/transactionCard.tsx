import { Badge, Button, Card, CloseButton, Col, Form, InputGroup, Row } from "react-bootstrap";
import { EditTransactionForm } from "./addTransactionForm";
import { Airplane, ArrowDown, ArrowUp, CardText, Cash, CashCoin, ChevronDown, ChevronUp, CurrencyExchange, Floppy, Pencil, People, Person, PlusCircle, Save, Save2, Trash, XLg } from "react-bootstrap-icons";
import { useMemo, useState } from "react";
import { SelectPayer, SelectPayees, SelectTrip, SelectAmount } from "./form";
import { deleteTransaction, newTransaction, updateTransaction } from "./api";
import { useNotifications } from "./notification";
import Link from "next/link";

type TransactionRowProps = {
    transaction: Transaction;
    onEdit: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => void;
}

export function TransactionCard({transaction, onEdit, onDelete}: TransactionRowProps){
    const intl = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });
    const payerParticipation = transaction.parcels?.find(({payee}) => payee?.id === transaction.payer?.id)?.amount || transaction.amount;
    const [seePayees, setSeePayees] = useState(false);
    const [editing, setEditing] = useState(false);
    const {notify} = useNotifications();
    if( editing ) return <EditTransactionCard transaction={transaction} onUpdatedTransaction={(t) => {
        setEditing(false);
        onEdit(t);
    }} />
    return <Card className="mt-1">
        <Card.Body>
            <div className="d-flex">
                <div>
                    <Card.Title><Person /><Link className="text-decoration-none text-black" href={`/user/${transaction.payerId}`} >{transaction.payer?.showName}</Link></Card.Title>
                    <Card.Subtitle><CardText /> {transaction.description} {transaction.date && <small className="text-muted">({transaction.date})</small>}</Card.Subtitle>
                </div>
                <div className="ms-auto text-end">
                    <Card.Title><CashCoin /> {intl.format(transaction.amount!)}</Card.Title>
                    <Card.Subtitle><Airplane /> <Link className="text-decoration-none text-black" href={`/trip/${transaction.tripId}`} >{transaction.trip?.showName}</Link></Card.Subtitle> 
                </div>
            </div>
            <div className="d-flex mt-1">
                <span className="mx-2" onClick={() => setSeePayees((v) => (!v))}>{transaction.parcels?.length} <People /></span>
                {seePayees && payerParticipation && <span key={transaction.payer?.id} className="mx-2">{transaction.payer?.showName} <small className="text-success"><ChevronUp /> {intl.format(payerParticipation)}</small></span>}
                {seePayees && transaction.parcels?.map(({payee, amount}) => {
                    let amountNode = <small className="text-danger"><ChevronDown /> {intl.format(amount!)}</small>
                    if( payee?.id === transaction.payer?.id ){
                        return null
                    }
                    return <span key={payee?.id} className="mx-2">{payee?.showName} {amountNode}</span>
                })}
                <div className="ms-auto">
                    <Button variant="link" className="p-0" onClick={() => setEditing(true)}><Pencil /></Button>
                    <Button variant="link text-danger" className="p-0" onClick={async () => {
                        if( !confirm("Are you sure you want to delete this transaction?") ) return;
                        try{
                            await deleteTransaction(transaction.id!);
                            onDelete(transaction);
                            notify({status: "Success", text: "Transaction deleted"});
                        }
                        catch(error){
                            notify({status: "Warning", text: (error as Error).message});
                        }
                    }}><Trash /></Button>
                </div>
            </div>
        </Card.Body>
    </Card>
}

export function TotalBalance({transactions}: {transactions: Transaction[]}){
    const balance: [User, number][] = useMemo(() => {
        const userBalance = {} as Record<string, [User, number]>;
        for( let transaction of transactions ){
            let payerParticipated = false;
            if(!(transaction.payerId! in userBalance)) userBalance[transaction.payerId!] = [transaction.payer!, 0]
            for( let parcel of transaction.parcels || [] ){
                if(!(parcel.payeeId! in userBalance)) userBalance[parcel.payeeId!] = [parcel.payee!, 0]
                if(parcel.payeeId === transaction.payerId){
                    payerParticipated = true;
                }
                userBalance[parcel.payeeId!][1] += parcel.amount!;
            }
            if(!payerParticipated){
                userBalance[transaction.payerId!][1] += transaction.amount!;
            }
        }
        return Object.values(userBalance);
    }, [transactions]);

    const intl = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });

    return <Card className="my-1">
        <Card.Body>
            <Card.Title><CurrencyExchange /> Total Balance</Card.Title>
            {balance.map(([user, amount]) => <Row key={user.id}>
                <Col>{user.showName}</Col>
                {amount >= 0 ? <Col className="text-success text-end"><ChevronUp /> {intl.format(amount)}</Col> : <Col className="text-danger text-end"><ChevronDown /> {intl.format(amount)}</Col>}
            </Row>)}
        </Card.Body>
    </Card>


}

export function EditTransactionCard({transaction, onNewTransaction, onUpdatedTransaction}: {transaction?: Transaction, onNewTransaction?: (transaction: Transaction) => void, onUpdatedTransaction?: (transaction: Transaction) => void}){
    const {notify} = useNotifications();
    const [user, setUser] = useState<User | undefined>(transaction?.payer);
    const [payees, setPayees] = useState<User[]>(transaction?.parcels?.map(({payee}) => payee!) || []);
    const [trip, setTrip] = useState<Trip | undefined>(transaction?.trip);
    const [amount, setAmount] = useState<string | undefined>(transaction?.amount?.toString());
    const [description, setDescription] = useState<string | undefined>(transaction?.description);
    const [date, setDate] = useState<string | undefined>(transaction?.date);

    const enabledAdd = user && payees.length >= 0 && trip && amount && description;
    
    return <Card className="my-1 d-print-none">
        <Card.Body className="row">
            <div className="col-6">
                <div>
                    <div className="d-flex">
                        <InputGroup>
                            <InputGroup.Text><Person /></InputGroup.Text>
                            <SelectPayer onChange={(u) => setUser(u)} value={user}/>
                        </InputGroup>
                    </div>
                    <div className="d-flex">
                        <InputGroup>
                            <InputGroup.Text><CardText /></InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <Form.Control
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </InputGroup>
                    </div>
                    <div className="d-flex">
                        <InputGroup>
                            <InputGroup.Text><People /></InputGroup.Text>
                            <SelectPayees onChange={(u) => setPayees(u)} value={payees}/>
                        </InputGroup>
                    </div>
                </div>
            </div>
            <div className="col-6">
                <div className="d-flex">
                    <InputGroup>
                        <InputGroup.Text><Cash /></InputGroup.Text>
                        <SelectAmount value={amount} onChange={(a) => setAmount(a)}/>
                    </InputGroup>
                </div>
                <div className="d-flex">
                    <InputGroup>
                        <InputGroup.Text><Airplane /></InputGroup.Text>
                        <SelectTrip onChange={(t) => setTrip(t)} value={trip}/>
                    </InputGroup>
                </div>
                <div className="d-flex">
                    <div className="ms-auto">
                        <Button variant="link" disabled={!enabledAdd} onClick={() => {
                            let promise: Promise<void>;
                            if(transaction){
                                promise = updateTransaction(transaction.id!, trip!.id!, user!.id!, payees.map(({id}) => id!), parseFloat(amount!), description!, date!).then((trn) => {
                                    setAmount(trn.amount?.toString());
                                    setDescription(trn.description);
                                    setDate(trn.date);
                                    setTrip(trn.trip);
                                    setUser(trn.payer);
                                    setPayees(trn.parcels?.map(({payee}) => payee!) || []);
                                    if( onUpdatedTransaction ) onUpdatedTransaction(trn);
                                    notify({status: "Success", text: "Transaction updated"});
                                })
                            }
                            else{
                                promise = newTransaction(trip!.id!, user!.id!, payees.map(({id}) => id!), parseFloat(amount!), description!, date!).then((trn) => {
                                    setAmount(undefined);
                                    setDescription("");
                                    setDate("");
                                    setTrip(undefined);
                                    setUser(undefined);
                                    setPayees([]);
                                    if( onNewTransaction ) onNewTransaction(trn);
                                    notify({status: "Success", text: "Transaction added"});
                                })
                            }
                            promise.catch((error) => {
                                notify({status: "Warning", text: (error as Error).message});
                            })
                        }} >{transaction ? <Floppy /> : <PlusCircle />}</Button>
                        <Button variant="link text-secondary" onClick={() => {
                            if( onUpdatedTransaction && transaction ) onUpdatedTransaction(transaction);
                            else if( !onUpdatedTransaction ){
                                setAmount(undefined);
                                setDescription("");
                                setDate("");
                                setTrip(undefined);
                                setUser(undefined);
                                setPayees([]);
                            }
                        }}><XLg /></Button>
                    </div>
                </div>
            </div>
        </Card.Body>
    </Card>
}