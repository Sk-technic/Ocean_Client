import type React from "react";
import NotificationInbox from "./component/notificationInbox";

const NotificationLayout:React.FC = ()=>{
    return (
        <>
        <main className="flex flex-col overflow-hidden w-full h-full items-center justify-center gap-2">
            <NotificationInbox/>
        </main>
        </>
    )
} 

export default NotificationLayout