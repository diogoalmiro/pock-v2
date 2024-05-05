import { resourceName } from "@/shared/resourceName";
import { fetchTrips, fetchUsers } from "./api";
import { useNotifications } from "./notification"
import { FormEvent, LegacyRef, Ref, useCallback, useEffect, useRef, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import AsyncCreateableSelect from "react-select/async-creatable";
import CreateableSelect from "react-select/creatable";
import { validAmount } from "@/shared/validAmount";
import { PlusCircle } from "react-bootstrap-icons";

const amounts = [
    "0.50",
    "1.00",
    "2.00",
    "5.00",
    "10.00",
    "20.00",
    "50.00",
    "100.00",
].map(a => ({label: a, value: parseFloat(a)}));

export function AddTransactionForm({onNewTransaction}:{onNewTransaction?: (transaction: Transaction) => void}){
    const {notify} = useNotifications() || {notify: (msg: any) => {console.warn('Notify not available', msg)}};
    const [transactionCount, setTransactionCount] = useState(0);
    const handleFormSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let form = e.currentTarget;
        let fd = new FormData(form);
        fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                trip: fd.get('trip'),
                description: fd.get('description'),
                date: fd.get('date'),
                payer: fd.get('payer'),
                amount: parseFloat(fd.get('amount') as string),
                payees: fd.getAll('payees'),
            }),
        }).then((r) => {
            if (r.status === 200) {
                r.json().then(trn => {
                    notify({status: 'Success', text: 'Transaction created'});
                    form.reset();
                    setTransactionCount(c => c+1);
                    if(onNewTransaction) onNewTransaction(trn);
                });
            }
            else {
                r.text().then(console.error);
                notify({status: 'Warning', text: 'Failed to create transaction'});
            }
        });
    }, [notify, setTransactionCount, onNewTransaction]);
    return <Form onSubmit={handleFormSubmit}>
        <InputGroup>
            <InputGroup.Text className="w-25">Trip</InputGroup.Text>
            <AsyncCreateableSelect
                key={`trip-${transactionCount}`}
                className="form-control p-0 m-0 border-0"
                name="trip"
                cacheOptions defaultOptions loadOptions={fetchTrips}
                required
                getOptionValue={(trp) => trp.id || trp.showName || ""}
                getOptionLabel={(trp) => `${trp.showName} (${trp.tripname})`}
                getNewOptionData={(inp) => ({showName: inp, id: inp, tripname: "new: "+resourceName(inp)})}
            />
        </InputGroup>
        <InputGroup>
            <InputGroup.Text className="w-25">Transaction Description</InputGroup.Text>
            <Form.Control 
                key={`transaction-description-${transactionCount}`}
                type="text" name="description" required/>
        </InputGroup>
        <InputGroup>
            <InputGroup.Text className="w-25">Date</InputGroup.Text>
            <Form.Control
                key={`transaction-date-${transactionCount}`}
                type="date" name="date" required/>
        </InputGroup>
        <InputGroup>
            <InputGroup.Text className="w-25">Payer</InputGroup.Text>
            <AsyncCreateableSelect
                key={`payer-${transactionCount}`}
                className="form-control p-0 m-0 border-0"
                name="payer"
                cacheOptions defaultOptions loadOptions={fetchUsers}
                required
                getOptionValue={(usr) => usr.id || usr.showName || ""}
                getOptionLabel={(usr) => `${usr.showName} (${usr.username})`}
                getNewOptionData={(inp) => ({showName: inp, id: inp, username: "new: "+resourceName(inp)})}
            />
        </InputGroup>
        <InputGroup>
            <InputGroup.Text className="w-25">Amount</InputGroup.Text>
            <CreateableSelect
                key={`amount-${transactionCount}`}
                className="form-control p-0 m-0 border-0"
                name="amount"
                options={amounts}
                isValidNewOption={validAmount}
                formatCreateLabel={val => `Custom amount: ${parseFloat(val)}`}
                required
            />
        </InputGroup>
        <InputGroup>
            <InputGroup.Text className="w-25">Payees</InputGroup.Text>
            <AsyncCreateableSelect
                key={`payees-${transactionCount}`}
                className="form-control p-0 m-0 border-0"
                name="payees"
                isMulti
                cacheOptions defaultOptions loadOptions={fetchUsers}
                required
                getOptionValue={(usr) => usr.id || usr.showName || ""}
                getOptionLabel={(usr) => `${usr.showName} (${usr.username})`}
                getNewOptionData={(inp) => ({showName: inp, id: inp, username: "new: "+resourceName(inp)})}
            />
        </InputGroup>
        <Button variant="primary" type="submit">Add Transaction</Button>
    </Form>
}

export function EditTransactionForm({transaction, onEditTransaction}:{transaction: Transaction | null, onEditTransaction?: (transaction: any) => void}){
    const {notify} = useNotifications() || {notify: (msg: any) => {console.warn('Notify not available', msg)}};
    const handleFormSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let form = e.currentTarget;
        let fd = new FormData(form);
        fetch(`/api/transactions/${transaction?.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                trip: fd.get('trip'),
                description: fd.get('description'),
                date: fd.get('date'),
                payer: fd.get('payer'),
                amount: parseFloat(fd.get('amount') as string),
                payees: fd.getAll('payees'),
            }),
        }).then((r) => {
            if (r.status === 200) {
                r.json().then(trn => {
                    notify({status: 'Success', text: 'Transaction updated'});
                    form.reset();
                    if(onEditTransaction) onEditTransaction(trn);
                });
            }
            else {
                r.text().then(console.error);
                notify({status: 'Warning', text: 'Failed to update transaction'});
            }
        });
    }, [notify, transaction, onEditTransaction]);
    return <Form onSubmit={handleFormSubmit}>
        <InputGroup>
            <InputGroup.Text className="w-25">Trip</InputGroup.Text>
            <AsyncCreateableSelect
                key={`trip-${transaction?.id}`}
                className="form-control p-0 m-0 border-0"
                name="trip"
                defaultValue={transaction?.trip}
                cacheOptions defaultOptions loadOptions={fetchTrips}
                required
                getOptionValue={(trp) => trp.id || trp.showName || ""}
                getOptionLabel={(trp) => `${trp.showName} (${trp.tripname})`}
                getNewOptionData={(inp) => ({showName: inp, id: inp, tripname: "new: "+resourceName(inp)})}
            />
        </InputGroup>
        <InputGroup>
            <InputGroup.Text className="w-25">Transaction Description</InputGroup.Text>
            <Form.Control 
                key={`transaction-description-${transaction?.id}`}
                defaultValue={transaction?.description}
                type="text" name="description" required/>
        </InputGroup>
        <InputGroup>
            <InputGroup.Text className="w-25">Date</InputGroup.Text>
            <Form.Control 
                key={`transaction-date-${transaction?.id}`}
                defaultValue={transaction?.date}
                type="date" name="date"/>
        </InputGroup>
        <InputGroup>
            <InputGroup.Text className="w-25">Payer</InputGroup.Text>
            <AsyncCreateableSelect
                key={`payer-${transaction?.id}`}
                defaultValue={transaction?.payer}
                className="form-control p-0 m-0 border-0"
                name="payer"
                cacheOptions defaultOptions loadOptions={fetchUsers}
                required
                getOptionValue={(usr) => usr.id || usr.showName || ""}
                getOptionLabel={(usr) => `${usr.showName} (${usr.username})`}
                getNewOptionData={(inp) => ({showName: inp, id: inp, username: "new: "+resourceName(inp)})}
            />
        </InputGroup>
        <InputGroup>
            <InputGroup.Text className="w-25">Amount</InputGroup.Text>
            <CreateableSelect
                key={`amount-${transaction?.id}`}
                defaultValue={{label: transaction?.amount?.toString() || "0.00", value: transaction?.amount || 0}}
                className="form-control p-0 m-0 border-0"
                name="amount"
                options={amounts}
                isValidNewOption={validAmount}
                formatCreateLabel={val => `Custom amount: ${parseFloat(val)}`}
                required
            />
        </InputGroup>
        <InputGroup>
            <InputGroup.Text className="w-25">Payees</InputGroup.Text>
            <AsyncCreateableSelect
                key={`payees-${transaction?.id}`}
                defaultValue={transaction?.parcels?.map(p => p.payee!) || []}
                className="form-control p-0 m-0 border-0"
                name="payees"
                isMulti
                cacheOptions defaultOptions loadOptions={fetchUsers}
                required
                getOptionValue={(usr) => usr.id || usr.showName || ""}
                getOptionLabel={(usr) => `${usr.showName} (${usr.username})`}
                getNewOptionData={(inp) => ({showName: inp, id: inp, username: "new: "+resourceName(inp)})}
            />
        </InputGroup>
        <Button variant="primary" type="submit">Update Transaction</Button>
    </Form>
}

export function DeleteTransactionForm({transaction, onDeleteTransaction}:{transaction: Transaction | null, onDeleteTransaction?: (transaction: any) => void}){
    const {notify} = useNotifications() || {notify: (msg: any) => {console.warn('Notify not available', msg)}};
    const handleFormSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        fetch(`/api/transactions/${transaction?.id}`, {
            method: 'DELETE',
        }).then((r) => {
            if (r.status === 200) {
                if(onDeleteTransaction) onDeleteTransaction(transaction);
                notify({status: 'Success', text: 'Transaction deleted'});
            }
            else {
                r.text().then(console.error);
                notify({status: 'Warning', text: 'Failed to delete transaction'});
            }
        });
    }, [notify, transaction, onDeleteTransaction]);

    return <Form onSubmit={handleFormSubmit}>
        <Button variant="danger" type="submit">Delete Transaction</Button>
    </Form>
}

export function AddTransactionFormRow({onNewTransaction, form: maybeForm}:{onNewTransaction: (trn: any) => void, form: HTMLFormElement | null}){
    const {notify} = useNotifications() || {notify: (msg: any) => {console.warn('Notify not available', msg)}};
    const [transactionCount, setTransactionCount] = useState(0);

    const handleFormSubmit = useCallback((e: SubmitEvent) => {
        e.preventDefault();
        let form = e.currentTarget as HTMLFormElement;
        let fd = new FormData(form);
        fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                trip: fd.get('trip'),
                description: fd.get('description'),
                date: fd.get('date'),
                payer: fd.get('payer'),
                amount: parseFloat(fd.get('amount') as string),
                payees: fd.getAll('payees'),
            }),
        }).then((r) => {
            if (r.status === 200) {
                r.json().then(trn => {
                    notify({status: 'Success', text: 'Transaction created'});
                    form.reset();
                    setTransactionCount(c => c+1);
                    if(onNewTransaction) onNewTransaction(trn);
                });
            }
            else {
                r.text().then(console.error);
                notify({status: 'Warning', text: 'Failed to create transaction'});
            }
        });
    }, [notify, setTransactionCount, onNewTransaction]);

    useEffect(() => {
        if( maybeForm ){
            const form = maybeForm;
            form.addEventListener('submit', handleFormSubmit);
        }
        return () => {
            if( maybeForm ){
                const form = maybeForm;
                form.removeEventListener('submit', handleFormSubmit);
            }
        }
    }, [maybeForm, handleFormSubmit]);
    
    return <tr>
            <td>
                <AsyncCreateableSelect
                    key={`trip-${transactionCount}`}
                    className="form-control p-0 m-0 border-0"
                    name="trip"
                    cacheOptions defaultOptions loadOptions={fetchTrips}
                    required
                    getOptionValue={(trp) => trp.id || trp.showName || ""}
                    getOptionLabel={(trp) => `${trp.showName} (${trp.tripname})`}
                    getNewOptionData={(inp) => ({showName: inp, id: inp, tripname: "new: "+resourceName(inp)})}
                    />
            </td>
            <td>
                <Form.Control 
                    key={`transaction-description-${transactionCount}`}
                    type="text" name="description" required/>
            </td>
            <td>
                <Form.Control 
                    key={`transaction-date-${transactionCount}`}
                    defaultValue={new Date().toISOString().split('T')[0]}
                    type="date" name="date"/>
            </td>
            <td>
                <CreateableSelect
                    key={`amount-${transactionCount}`}
                    className="form-control p-0 m-0 border-0"
                    name="amount"
                    options={amounts}
                    isValidNewOption={validAmount}
                    formatCreateLabel={val => `Custom amount: ${parseFloat(val)}`}
                    required
                    />
            </td>
            <td>
                <AsyncCreateableSelect
                    key={`payer-${transactionCount}`}
                    className="form-control p-0 m-0 border-0"
                    name="payer"
                    cacheOptions defaultOptions loadOptions={fetchUsers}
                    required
                    getOptionValue={(usr) => usr.id || usr.showName || ""}
                    getOptionLabel={(usr) => `${usr.showName} (${usr.username})`}
                    getNewOptionData={(inp) => ({showName: inp, id: inp, username: "new: "+resourceName(inp)})}
                    />
            </td>
            <td>
                <AsyncCreateableSelect
                    key={`payees-${transactionCount}`}
                    className="form-control p-0 m-0 border-0"
                    name="payees"
                    isMulti
                    cacheOptions defaultOptions loadOptions={fetchUsers}
                    required
                    getOptionValue={(usr) => usr.id || usr.showName || ""}
                    getOptionLabel={(usr) => `${usr.showName} (${usr.username})`}
                    getNewOptionData={(inp) => ({showName: inp, id: inp, username: "new: "+resourceName(inp)})}
                    />
            </td>
            <td>
                <Button variant="primary" type="submit"><PlusCircle className="p-0"/></Button>
            </td>
    </tr>  
}