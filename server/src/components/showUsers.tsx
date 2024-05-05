import { Col } from "react-bootstrap";
import { useApiUsers } from "./api";
import Link from "next/link";


export function ShowUsers() {
    const users = useApiUsers([]);

    return (
        <>
            {users.map((user) => (
                <Col key={user.id}>
                    <Link href={`/user/${user.id}`}>
                        <h4>{user.showName} <small className="text-muted">({user.username})</small></h4>
                    </Link>
                </Col>
            ))}
        </>
    );
}