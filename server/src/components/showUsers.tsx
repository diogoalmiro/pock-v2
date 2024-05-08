import { Col, Row } from "react-bootstrap";
import { useApiUsers } from "./api";
import Link from "next/link";


export function ShowUsers({users}: {users: User[]}) {
    return (
        <>
            {users.map((user) => (
                <Row key={user.id}>
                    <Link href={`/user/${user.id}`}>
                        <p>{user.showName} <small className="text-muted">({user.username})</small></p>
                    </Link>
                </Row>
            ))}
        </>
    );
}