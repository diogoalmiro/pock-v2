import { useParams, useRouter } from "next/navigation";
import { NotificationProvider, useNotifications } from "@/components/notification";
import TransactionsTable from "@/components/transactionsTable";
import { Alert, Button, CloseButton, Container } from "react-bootstrap";
import { GetServerSideProps } from "next";
import { TripEntity } from "@/entities/trip";
import { initializeDb } from "@/core/db";
import Link from "next/link";
import { Calculator, Trash } from "react-bootstrap-icons";
import { deleteTrip } from "@/components/api";

export const getServerSideProps: GetServerSideProps<{trip: Trip}> = async (context) => {
    await initializeDb();
    const { id } = context.query;
    if( Array.isArray(id) ) throw new Error("Expected a single ID");
    try{
        const trip = await TripEntity.findOneOrFail({where: {id}});
        return { props: { trip: {
            id: trip.id,
            showName: trip.showName,
            tripname: trip.tripname,
        } } };
    }
    catch(e){
        return { notFound: true };
    }
}

export default function TripTablePage({trip}: {trip: Trip}) {
    const {notify} = useNotifications();
    const router = useRouter();
    return <NotificationProvider>
        <Alert variant="info" className="d-flex m-0">
            <h5 className="m-0">Show transactions for trip {trip.showName} <small>({trip.tripname})</small></h5>
            <Link href={`${trip.id}/statistics`}><Calculator/> Stats</Link>
            <div className="ms-auto d-flex align-items-center">
                <Button variant="link" className="text-danger p-0 m-0" onClick={() => {
                    if( confirm('Are you sure you want to delete this trip?') ){
                        deleteTrip(trip.id!).then(() => {
                            router.push('..');
                        }).catch(e => {
                            notify({text: 'Failed to delete trip', status: 'Warning'});
                        })
                    }
                }}><Trash/></Button>
                <Link href=".." className="ms-5"><CloseButton/></Link>
            </div>
        </Alert>
        <Container className="mw-md-75">
            <TransactionsTable trip={trip.id} />
        </Container>
    </NotificationProvider>
}