import { NotificationProvider } from "@/components/notification";
import TransactionsTable, { TablePageProps } from "@/components/transactionsTable";
import { Container } from "react-bootstrap";


export default function TablePage(props: TablePageProps){
    return <NotificationProvider>
        <Container className="mw-md-75">
            <TransactionsTable user={props.user} trip={props.trip}/>
        </Container>
    </NotificationProvider>
}