import React from "react";
import NotificationLayout from "../../layout/NotificationLayout/NotificationLayout";


const NotificationPage: React.FC = () => {

    return (
        <>
            <main className={`w-100 h-full backdrop-blur-2xl theme-bg-primary/80 border-r-4 theme-border`}>
                <NotificationLayout />
            </main>
        </>
    )
}


export default NotificationPage