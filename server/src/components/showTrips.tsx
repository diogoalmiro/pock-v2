import { Col, Row } from "react-bootstrap";
import { useApiTrips } from "./api";
import Link from "next/link";


export function ShowTrips({trips}: {trips: Trip[]}) {
    return (
        <>
            {trips.map((trip) => (
                <Row key={trip.id}>
                    <Link href={`/trip/${trip.id}`}>
                        <p>{trip.showName} <small className="text-muted">({trip.tripname})</small></p>
                    </Link>
                    <p>{trip.description}</p>
                </Row>
            ))}
        </>
    );
}