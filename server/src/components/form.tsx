import AsyncCreateableSelect from 'react-select/async-creatable';
import { AsyncCreatableProps } from 'react-select/async-creatable';
import CreateableSelect from 'react-select/creatable';
import { fetchTrips, fetchUsers } from './api';
import { resourceName } from '@/shared/resourceName';
import { validAmount } from '@/shared/validAmount';
import { BorderLeft } from 'react-bootstrap-icons';
import { GroupBase } from 'react-select';

type SelectProps<T> = {
    value?: T;
    onChange: (value: T) => void;
}

const RESET_STYLE: AsyncCreatableProps<any, true | false, GroupBase<any>>["styles"] = {
    control: (provided, state) => ({
        ...provided,
        borderColor: "var(--bs-border-color)",
        borderLeft: 0,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
    })
}

export function SelectTrip(props: SelectProps<Trip>){
    return <AsyncCreateableSelect
        className="form-control p-0 m-0 border-0"
        styles={RESET_STYLE}
        name="trip"
        value={props.value || null}
        onChange={(v) => props.onChange(v as Trip)}
        cacheOptions defaultOptions loadOptions={fetchTrips}
        required
        getOptionValue={(trp) => trp.id || trp.showName || ""}
        getOptionLabel={(trp) => `${trp.showName} (${trp.tripname})`}
        getNewOptionData={(inp) => ({showName: inp, id: inp, tripname: "new: "+resourceName(inp)})}
    />
}

export function SelectPayer(props: SelectProps<User>){
    return <AsyncCreateableSelect
        className="form-control p-0 m-0 border-0"
        styles={RESET_STYLE}
        name="user"
        value={props.value || null}
        onChange={(v) => props.onChange(v as User)}
        cacheOptions defaultOptions loadOptions={fetchUsers}
        required
        getOptionValue={(usr) => usr.id || usr.showName || ""}
        getOptionLabel={(usr) => `${usr.showName} (${usr.username})`}
        getNewOptionData={(inp) => ({showName: inp, id: inp, username: "new: "+resourceName(inp)})}
    />
}

export function SelectPayees(props: SelectProps<User[]>){
    return <AsyncCreateableSelect
        className="form-control p-0 m-0 border-0"
        styles={RESET_STYLE}
        name="users"
        value={props.value || null}
        onChange={(v) => props.onChange(v as User[])}
        cacheOptions defaultOptions loadOptions={fetchUsers}
        required
        isMulti
        getOptionValue={(usr) => usr.id || usr.showName || ""}
        getOptionLabel={(usr) => `${usr.showName} (${usr.username})`}
        getNewOptionData={(inp) => ({showName: inp, id: inp, username: "new: "+resourceName(inp)})}
    />
}

export function SelectAmount(props: SelectProps<string>){
    const amounts = [
        "0.50",
        "1.00",
        "2.00",
        "5.00",
        "10.00",
        "20.00",
        "50.00",
        "100.00",
    ].map((v) => ({value: v, label: v}));
    return <CreateableSelect
        className="form-control p-0 m-0 border-0"
        placeholder="Amount..."
        name="amount"
        styles={RESET_STYLE}
        value={props.value ? {value: props.value, label: props.value} : null}
        onChange={(v) => props.onChange(v.value)}
        options={amounts}
        isValidNewOption={validAmount}
        formatCreateLabel={val => `Custom amount: ${parseFloat(val)}`}
        getNewOptionData={(inp) => ({value: inp, label: inp})}
        required
    />
}