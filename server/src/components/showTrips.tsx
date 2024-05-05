import { Col } from "react-bootstrap";
import { useApiTrips } from "./api";
import Link from "next/link";


export function ShowTrips() {
    const trips = useApiTrips([]);

    return (
        <>
            {trips.map((trip) => (
                <Col key={trip.id}>
                    <Link href={`/trip/${trip.id}`}>
                        <h4>{trip.showName} <small className="text-muted">({trip.tripname})</small></h4>
                    </Link>
                    <p>{trip.description}</p>
                </Col>
            ))}
        </>
    );
}