import { useEffect, useRef, useState } from "react";
import { useApiTransactions } from "./api";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { AddTransactionFormRow, DeleteTransactionForm, EditTransactionForm } from "./addTransactionForm";
import { Pencil } from "react-bootstrap-icons";

export type TablePageProps = {
    user?: string;
    trip?: string;
}

function printAmount(amount: number){
    return amount.toFixed(2)
}

export default function TransactionsTable(props: TablePageProps){
    const form = useRef<HTMLFormElement>(null);
    const [knownTransactions, setKnownTransactions] = useState<Transaction[]>([]);
    const transactions = useApiTransactions(props.user, props.trip);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

    useEffect(() => {
        setKnownTransactions(transactions)
    }, [transactions])
    
    const userBalance = {} as Record<string, [string, number, number]>
    const registerAmount = (payer: User, payee: User, amount: number) => {
        if(!(payer.id! in userBalance)) userBalance[payer.id!] = [payer.showName!, 0, 0]
        if(!(payee.id! in userBalance)) userBalance[payee.id!] = [payee.showName!, 0, 0]

        userBalance[payer.id!][1] -= amount;
        userBalance[payee.id!][1] += amount;

        return amount;
    }
    const registerAmountTransaction = (trn: Transaction) => {
        if(!(trn.payerId! in userBalance)) userBalance[trn.payerId!] = [trn.payer!.showName!, 0, 0]
        userBalance[trn.payerId!][2] += trn.amount!;
        return trn.amount!;
    }
    return <>
        <Form ref={form}>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Trip</th>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Payer</th>
                        <th>Payee</th>
                        <th className="d-print-none">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {knownTransactions.flatMap((trn) => [
                        <tr key={trn.id}>
                            <td>{trn.trip?.showName}</td>
                            <td>{trn.description}</td>
                            <td>{trn.date}</td>
                            <td className="text-end"><code className="text-success">{printAmount(registerAmountTransaction(trn))}</code></td>
                            <td>{trn.payer?.showName}</td>
                            <td></td>
                            <td className="d-print-none"><Button className="p-0 m-0 px-1" onClick={() => setEditingTransaction(trn)}><Pencil /> Edit</Button></td>
                        </tr>
                        ,...(trn.parcels || []).map(p => <tr key={trn.id! + p.id!}>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td className="text-end"><code className={(p.amount! >= 0 ? "text-success" : "text-danger")}>{printAmount(registerAmount(p.payer!, p.payee!, p.amount!))}</code></td>
                            <td></td>
                            <td>{p.payee?.showName}</td>
                            <td className="d-print-none"></td>
                        </tr>)
                    ])}
                </tbody>
                <tbody className="d-print-none">
                    <AddTransactionFormRow form={form.current} onNewTransaction={(trn) => setKnownTransactions(tr => tr.concat(trn))}/>
                </tbody>
                <tbody>
                    <tr>
                        <th>User</th>
                        <td></td>
                        <td>Total Spent</td>
                        <td>Balance</td>
                        <td></td>
                        <td></td>
                    </tr>
                    {Object.entries(userBalance).map(([id, [name, balance, total]]) => <tr key={id}>
                        <td>{name}</td>
                        <td></td>
                        <td className="text-end"><code>{printAmount(total)}</code></td>
                        <td className="text-end"><code className={balance >= 0 ? "text-success" : "text-danger"}>{printAmount(balance)}</code></td>
                        <td></td>
                        <td></td>
                    </tr>)}
                </tbody>
            </Table>
        </Form>
        <Modal id="edit-transaction" onHide={() => setEditingTransaction(null)} show={!!editingTransaction}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Transaction</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <EditTransactionForm transaction={editingTransaction} onEditTransaction={(trn) => {
                    setKnownTransactions(tr => tr.map(t => t.id === trn.id ? trn : t))
                    setEditingTransaction(null)
                }}/>
                <DeleteTransactionForm transaction={editingTransaction} onDeleteTransaction={(trn) => {
                    setKnownTransactions(tr => tr.filter(t => t.id !== trn.id))
                    setEditingTransaction(null)
                }}/>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => setEditingTransaction(null)}>Close</Button>
            </Modal.Footer>
        </Modal>
    </>
}