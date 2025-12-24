import React from "react";
import NotificationLayout from "../../layout/NotificationLayout/NotificationLayout";
import { useTheme } from "../../hooks/theme/usetheme";


const NotificationPage: React.FC = () => {

    const {theme} = useTheme()
    return (
        <>
            <main className={`w-100 h-full backdrop-blur-2xl theme-bg-primary/80 border-r-4 theme-border`}>
                <NotificationLayout />
            </main>
        </>
    )
}


export default NotificationPage