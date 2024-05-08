import { AddTransactionForm } from "@/components/addTransactionForm";
import { NotificationProvider } from "@/components/notification";
import { ShowTrips } from "@/components/showTrips";
import { ShowUsers } from "@/components/showUsers";
import { useRouter } from "next/navigation";
import { Alert, Card, Col, Container, Row } from "react-bootstrap";
import TablePage from "./table";
import { EditTransactionCard } from "@/components/transactionCard";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useApiTrips, useApiUsers } from "@/components/api";
import { Airplane, People } from "react-bootstrap-icons";

export default function IndexPage(){
    const [knownUsers, setKnownUsers] = useState<User[]>([]);
    const [knowTrips, setKnownTrips] = useState<Trip[]>([]);
    const users = useApiUsers([]);
    const trips = useApiTrips([]);
    useEffect(() => {
        setKnownUsers(users);
        setKnownTrips(trips);
    }, [users, trips]);

    return <NotificationProvider>
        <Container className="mw-md-75">
            <Alert variant="info" className="m-0">
                <h5 className="m-0">Welcome to the trip calculator</h5>
                <ul>
                    <li><Link href="/table">Show all transactions</Link></li>
                </ul>
            </Alert>
            <EditTransactionCard onNewTransaction={(trn) => {
                const users = trn.parcels?.flatMap(({payee, payer}) => [payee!, payer!]).filter((us) => knownUsers.findIndex((u) => u.id === us?.id) === -1) || [];
                const trip = trn.trip;
                if( trip && knowTrips.findIndex((t) => t.id === trip.id) === -1 ){
                    setKnownTrips([...knowTrips, trip]);
                }
                if( users && users.length > 0){
                    setKnownUsers([...knownUsers, ...users]);
                }
            }}/>
            <Row>
                <Col>
                    <h3><Airplane /> Trips</h3>
                    <ShowTrips trips={knowTrips} />
                </Col>
                <Col>
                    <h3><People /> Users</h3>
                    <ShowUsers users={knownUsers} />
                </Col>
            </Row>
        </Container>
    </NotificationProvider>
}