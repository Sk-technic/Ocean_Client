import React from "react";
import NotificationLayout from "../../layout/NotificationLayout/NotificationLayout";
import { useTheme } from "../../hooks/theme/usetheme";


const NotificationPage: React.FC = () => {

    const {theme} = useTheme()
    return (
        <>
            <main className={`w-100 h-full backdrop-blur-lg ${theme=="dark"?'bg-black/70':"bg-stone-100/70"}`}>
                <NotificationLayout />
            </main>
        </>
    )
}


export default NotificationPage