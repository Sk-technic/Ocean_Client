import { useParams } from "react-router-dom";
import { AccountPrivary } from "./AccountPrivary";
import Password_Security from "./Password&Security";
import BlockedLists from "./BlockedLists";
export default function Privacy_Settings() {
    const { section } = useParams();

    const renderContent = () => {
        switch (section) {
            case "account_privacy":
                return (<AccountPrivary />);

            case "privacy_security":
                return (<Password_Security/>);
            case "blocked":
              return (<BlockedLists/>)

            case "story_location":
                return (
                    <div>
                        <h2>Story & Location</h2>
                        {/* story settings */}
                    </div>
                );

            default:
                return <div className="flex items-center justify-center w-full h-screen">Select a setting</div>;
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-3 ">
            <section className="w-full h-full flex flex-col gap-3 ">
            <h1 className="capitalize text-lg font-bold border-b-2 py-2 theme-border">{section?.replace('_'," ")}</h1>
            
            <section className="overflow-x-auto hide-scrollbar w-full">
            {renderContent()}
            </section>
            </section>
        </div>
    );
}
