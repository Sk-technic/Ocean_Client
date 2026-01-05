import ProfileVerticalNav from '../../components/ProfileNavigation/ProfileNavigation';
import { Outlet } from 'react-router-dom';
import './Dashboard.css'; // add this CSS file

const Dashboard: React.FC = () => {
  return (
    <main className="relative h-full  bg-transparent flex gap-5">
      {/* Main content with custom scrollbar */}
      <section className="flex-1 overflow-y-scroll custom-scrollbar">
        <Outlet />
      </section>

      {/* Vertical navigation */}
      {/* <section className="pr-4 h-full flex flex-col items-center justify-center">
        <ProfileVerticalNav />
      </section> */}
    </main>
  );
};

export default Dashboard;
