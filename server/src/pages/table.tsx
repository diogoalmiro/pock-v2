import { NotificationProvider } from "@/components/notification";
import TransactionsTable, { TablePageProps } from "@/components/transactionsTable";


export default function TablePage(props: TablePageProps){
    return <NotificationProvider>
        <TransactionsTable user={props.user} trip={props.trip}/>
    </NotificationProvider>
}