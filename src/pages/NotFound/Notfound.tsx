import React from "react";
import { Link } from "react-router-dom";
const NotFound: React.FC = () => {
  return (
    <div className="w-full h-screen  flex items-center justify-center  text-gray-700 px-4">
      <main className="border w-full shadow-2xl theme-border theme-text-primary gap-5 h-9/12 theme-bg-secondary rounded-md flex flex-col items-center justify-center">

      <h1 className="text-3xl font-bold mb-2">404-Page not found</h1>
    
      <p className="text-[12px] theme-text-muted text-center max-w-[70%]">
        The page you are looking for doesn't exist or an other error occurred.
        Go back, or head over to the homepage to choose a new direction.
      </p>

      {/* Home Button */}
      <Link
        to={'/feed'}
        className="px-10 py-2 rounded-full  text-purple-900 bg-purple-400 transition-all duration-200"
      >
        Go Home
      </Link>
      </main>
    </div>
  );
};

export default NotFound;