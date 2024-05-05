import { AddTransactionForm } from "@/components/addTransactionForm";
import { NotificationProvider } from "@/components/notification";
import { ShowTrips } from "@/components/showTrips";
import { ShowUsers } from "@/components/showUsers";
import { useRouter } from "next/navigation";
import { Card, Container, Row } from "react-bootstrap";
import TablePage from "./table";

export default function IndexPage(){
    const router = useRouter();

    return <NotificationProvider>
        <Container>
        <Card>
            <Card.Header>
                <Card.Title>Add Transactions</Card.Title>
            </Card.Header>
            <Card.Body>
                <Row>
                    <AddTransactionForm onNewTransaction={trn => router.push(`/trip/${trn.tripId}`)}/>
                </Row>
            </Card.Body>
        </Card>
        <Card>
            <Card.Header>
                <Card.Title>All Trips</Card.Title>
            </Card.Header>
            <Card.Body>
                <Row>
                    <ShowTrips />
                </Row>
            </Card.Body>
        </Card>
        <Card>
            <Card.Header>
                <Card.Title>All Users</Card.Title>
            </Card.Header>
            <Card.Body>
                <Row>
                    <ShowUsers />
                </Row>
            </Card.Body>
        </Card>
        <Card>
            <Card.Header>
                <Card.Title>All Transactions</Card.Title>
            </Card.Header>
            <Card.Body>
                <Row>
                    <TablePage />
                </Row>
            </Card.Body>
        </Card>
        </Container>
    </NotificationProvider>
}