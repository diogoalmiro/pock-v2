import { useContext, createContext, useState, ReactNode } from "react";
import { Toast } from "react-bootstrap";

type NotificationStatus = "Success" | "Warning" | "Info";
type Notification = {
    status: NotificationStatus;
    text: string;
}

export const NotificationContext = createContext<{
    notify: (notification: Notification) => void,
} | null>(null);

export function useNotifications() {
    return useContext(NotificationContext) || {notify: (msg: any) => {console.warn("Notification provider not found", msg)}};
}

export function NotificationProvider({children}: {children: ReactNode}) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const notify = (not: Notification) => setNotifications(nots => nots.concat(not));

    return <NotificationContext.Provider value={{notify}}>
        {children}
        <div style={{position: 'fixed', bottom: 10, right: 10, zIndex: 999999}}>
            {notifications.map((msg, idx) => (
                <Toast key={idx} onClose={() => setNotifications(notifications.filter((_, i) => i !== idx))} bg={msg.status.toLowerCase()} delay={5000} autohide>
                    <Toast.Header>
                        <strong className="me-auto">{msg.status}</strong>
                    </Toast.Header>
                    <Toast.Body>{msg.text}</Toast.Body>
                </Toast>
            ))}
        </div>
    </NotificationContext.Provider>
}
