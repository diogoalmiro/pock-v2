import { useParams } from "next/navigation";
import { NotificationProvider } from "@/components/notification";
import TransactionsTable from "@/components/transactionsTable";
import { Alert, CloseButton, Container } from "react-bootstrap";
import { UserEntity } from "@/entities/user";
import { GetServerSideProps } from "next";
import { initializeDb } from "@/core/db";
import Link from "next/link";

export const getServerSideProps: GetServerSideProps<{user: User}> = async (context) => {
    await initializeDb();
    const { id } = context.query;
    if( Array.isArray(id) ) throw new Error("Expected a single ID");
    try{
        const user = await UserEntity.findOneOrFail({where: {id}});
        return { props: { user: {
            id: user.id,
            showName: user.showName,
            username: user.username,
        } } };
    }
    catch(e){
        return { notFound: true };
    }
}

export default function UserTablePage({user}: {user: User}) {
    return <NotificationProvider>
        <Alert variant="info" className="d-flex m-0">
            <h5 className="m-0">Show transactions for user {user.showName} <small>({user.username})</small></h5>
            <Link href=".." className="ms-auto"><CloseButton/></Link>
        </Alert>
        <Container className="mw-md-75">
            <TransactionsTable user={user.id} />
        </Container>
    </NotificationProvider>
}
