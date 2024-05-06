import { useParams } from "next/navigation";
import { NotificationProvider } from "@/components/notification";
import TransactionsTable from "@/components/transactionsTable";
import { Alert, CloseButton } from "react-bootstrap";
import { GetServerSideProps } from "next";
import { TripEntity } from "@/entities/trip";
import { initializeDb } from "@/core/db";
import Link from "next/link";
import { Calculator } from "react-bootstrap-icons";

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
    return <NotificationProvider>
        <Alert variant="info" className="d-flex">
            <h5>Show transactions for trip {trip.showName} <small>({trip.tripname})</small></h5>
            <Link href={`${trip.id}/statistics`}><Calculator/> Stats</Link>
            <Link href=".." className="ms-auto"><CloseButton/></Link>
        </Alert>
        <TransactionsTable trip={trip.id} />
    </NotificationProvider>
}