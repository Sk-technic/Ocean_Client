import type React from "react";
import NotificationHeader from "./component/notificationHeader";
import NotificationInbox from "./component/notificationInbox";

const NotificationLayout:React.FC = ()=>{
    return (
        <>
        <main className="flex flex-col items-center justify-center m-0 p-0 gap-2">
            <NotificationHeader/>
            <NotificationInbox/>
        </main>
        </>
    )
} 

export default NotificationLayout