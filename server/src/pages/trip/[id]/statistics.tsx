import { GetServerSideProps } from "next";
import { TripEntity } from "@/entities/trip";
import { initializeDb } from "@/core/db";
import { useApiTransactions } from "@/components/api";
import dynamic from "next/dynamic";
import { Alert, CloseButton } from "react-bootstrap";
import Link from "next/link";
const Plot = dynamic(() => import('react-plotly.js'), {ssr: false});

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

export default function TripStatisticsPage({trip}: {trip: Trip}) {
    const transactions = useApiTransactions(undefined, trip.id);
    const payers = transactions.map((t) => t.payer?.showName!).reduce((acc, cur) => {
        cur in acc ? acc[cur] += 1 : acc[cur] = 1;
        return acc;
    }, {} as {[key: string]: number});
    const parcels = transactions.flatMap((t) => t.parcels!);
    return <>
        <Alert variant="info" className="d-flex">
            <h5>Show statistics for trip {trip.showName} <small>({trip.tripname})</small></h5>
            <Link href={`../${trip.id}`} className="ms-auto"><CloseButton/></Link>
        </Alert>
        <Plot 
            data={[
                {
                    type: 'bar',
                    x: transactions.map((t) => t.payer?.showName!),
                    y: transactions.map((t) => t.amount!),
                }
            ]}
            layout={{title: 'Payer vs Amount'}}
        />
        <Plot
            layout={{title: 'Commulative Amount per Payer'}}
            data={Object.keys(payers).map((payer) => ({
                type: 'scatter',
                x: transactions.map((_t, i) => i).concat([transactions.length]),
                y: transactions.reduce((acc, cur) => {
                    if (cur.payer?.showName !== payer){
                        acc.push(acc[acc.length - 1]);
                        return acc;
                    }
                    acc.push((acc[acc.length - 1]) + cur.amount!);
                    return acc;
                }, [0] as number[]),
                name: payer,
            }))}
        />
        <Plot
            layout={{title: 'Balance per Payer'}}
            data={Object.keys(payers).map((payer) => ({
                type: 'scatter',
                x: parcels.map((_p, i) => i).concat([parcels.length]),
                y: parcels.reduce((acc, cur) => {
                    let valToPush = acc[acc.length - 1];
                    if( cur.payer?.showName === payer ) valToPush -= cur.amount!;
                    if( cur.payee?.showName === payer ) valToPush += cur.amount!;
                    acc.push(valToPush);
                    return acc;
                }, [0] as number[]),
                name: payer,
            }))}
        />
    </>
}