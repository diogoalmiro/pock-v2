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
    const parcels = transactions.flatMap((t) => t.parcels!);
    const payers = parcels.flatMap((p) => [p.payer?.showName!, p.payee?.showName!]).reduce((acc, cur) => {
        cur in acc ? acc[cur] += 1 : acc[cur] = 1;
        return acc;
    }, {} as {[key: string]: number});

    const cumulativeAmountData = Object.keys(payers).map((payer) => ({
        type: 'scatter',
        x: parcels.map((_p, i) => i).concat([parcels.length]),
        y: parcels.reduce((acc, cur) => {
            let valToPush = acc[acc.length - 1];
            if (cur.payer?.showName === payer && cur.payee?.showName === payer) valToPush += cur.amount!;
            if (cur.payer?.showName === payer) valToPush -= cur.amount!;
            acc.push(valToPush);
            return acc;
        }, [0] as number[]),
        name: payer + ' (cumulative)',
        legendgroup: payer,
        xaxis: 'x',
        yaxis: 'y1',
    }));
    const balanceData = Object.keys(payers).map((payer) => ({
        type: 'scatter',
        x: parcels.map((_p, i) => i).concat([parcels.length]),
        y: parcels.reduce((acc, cur) => {
            let valToPush = acc[acc.length - 1];
            if (cur.payer?.showName === payer) valToPush -= cur.amount!;
            if (cur.payee?.showName === payer) valToPush += cur.amount!;
            acc.push(valToPush);
            return acc;
        }, [0] as number[]),
        name: payer + ' (balance)',
        xaxis: 'x',
        yaxis: 'y2',
        legendgroup: payer,
    }));
    return <>
        <Alert variant="info" className="d-flex m-0">
            <h5>Show statistics for trip {trip.showName} <small>({trip.tripname})</small></h5>
            <Link href={`../${trip.id}`} className="ms-auto"><CloseButton/></Link>
        </Alert>
        <Plot
            style={{width: '100%', minHeight: '400px', height: '75vh'}}
            data={[
                ...cumulativeAmountData,
                ...balanceData,
            ] as Plotly.Data[]}
            layout={{
                grid: {rows: 2, columns: 1, pattern: 'coupled'},
                xaxis: { visible: false },
                legend: {
                    x: 0,
                    y: 0,
                    orientation: 'h',
                },
                margin: {
                    l: 50,
                    r: 20,
                    t: 20,
                    b: 50,
                    pad: 20,
                }
            }}
            config={{responsive: true, autosizable: true}}
        />
    </>
}