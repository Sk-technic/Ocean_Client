import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import App from "../App";
import ProtectedRoute from "./ProtectedRoutes";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import NotFound from "../pages/NotFound/Notfound";
import ChatPage from "../pages/Chat/ChatPage";
import { AccountPrivary } from "../layout/settings/components/AccountPrivary";
const LoginPage = lazy(() => import("../pages/Login/Login"));
const SignupPage = lazy(() => import("../pages/Signup/Signup"));
const HomePage = lazy(() => import("../pages/Home/Home"));
const SettingsLayout = lazy(()=>import("../layout/settings/SettingsLayout"))
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const ContentSection = lazy(() => import("../pages/Content/Content"));
const ProfilePage = lazy(() => import("../layout/ProfileLayout/ProfileLayout"));
const UserProfilePage = lazy(() => import("../pages/userProfile/userProfile"));
const ExplorePage = lazy(() => import("../pages/ExplorePage/ExplorePage"));
const NotificationPage = lazy(() => import("../pages/Notification/Notification"));

const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const videos = [
    {
      id: "1",
      thumbnail: "https://i.ytimg.com/vi/abcd1234/hqdefault.jpg",
      title: "How to Build a React App",
      channel: "Code Academy",
      views: "120K",
      duration: "12:34",
    },
    {
      id: "2",
      thumbnail: "https://i.ytimg.com/vi/wxyz5678/hqdefault.jpg",
      title: "Tailwind CSS Tips & Tricks",
      channel: "UI Mastery",
      views: "85K",
      duration: "08:21",
    },
  ];

  return (
    <Suspense fallback={<div style={{ textAlign: "center", marginTop: "50px" }}>Loading page...</div>}>
      <Routes>
        <Route path="/" element={<App />}>
          {/* Public Routes */}
          {!isAuthenticated && <Route index element={<LoginPage />} />}
          {!isAuthenticated && <Route path="signup" element={<SignupPage />} />}

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route index element={<HomePage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="browse" element={<ExplorePage />} />
            <Route path="notification" element={<NotificationPage />} />


            {/* Nested Dashboard */}
            <Route path="dashboard" element={<Dashboard />}>
              <Route index element={<ProfilePage />} />
              <Route path="dashboard" element={<ProfilePage />} />
              <Route path="content" element={<ContentSection videos={videos} />} />
            </Route>

            {/* Other Protected Routes */}
            <Route path="/:username" element={<UserProfilePage />} />
            <Route path="message" element={<ChatPage />} />
            <Route path="/message/:roomId" element={<ChatPage />}></Route>
            {/* </Route> */}
          </Route>

          <Route path="settings" element={<SettingsLayout />}>
            <Route path="account_privacy" element={<AccountPrivary/>}/>
          </Route>
          {/* Protected Routes */}

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
