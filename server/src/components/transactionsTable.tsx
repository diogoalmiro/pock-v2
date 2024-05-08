import { useEffect, useRef, useState } from "react";
import { deleteTransaction, useApiTransactions } from "./api";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { AddTransactionFormRow, DeleteTransactionForm, EditTransactionForm } from "./addTransactionForm";
import { Pencil } from "react-bootstrap-icons";
import { EditTransactionCard, TotalBalance, TransactionCard } from "./transactionCard";

export type TablePageProps = {
    user?: string;
    trip?: string;
}

export default function TransactionsTable(props: TablePageProps){
    const [knownTransactions, setKnownTransactions] = useState<Transaction[]>([]);
    const transactions = useApiTransactions(props.user, props.trip);
    useEffect(() => {
        setKnownTransactions(transactions)
    }, [transactions])

    return <>
        <EditTransactionCard onNewTransaction={(trn) => setKnownTransactions(tr => tr.concat(trn))} />
        {knownTransactions.map((trn, i) => <TransactionCard onEdit={(t) => setKnownTransactions(ts => ts.map(tr => tr.id === t.id ? t : tr))} key={i} transaction={trn} onDelete={(t) => setKnownTransactions(tr => tr.filter(tr => tr.id !== t.id))} />)}
        <EditTransactionCard onNewTransaction={(trn) => setKnownTransactions(tr => tr.concat(trn))} />
        <TotalBalance transactions={knownTransactions} />
    </>
}