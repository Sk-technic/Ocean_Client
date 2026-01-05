import { Toaster } from "react-hot-toast";
import { useTheme } from "../hooks/theme/usetheme";

const Notify = () => {
  const { theme } = useTheme()
  return (
    <Toaster
      position="top-center"
      gutter={8}
       containerStyle={{
        zIndex: 999999,  
      }}
      

      toastOptions={{
        custom: {
          duration: 5000,
          style: {
            background: theme === "dark" ? "#222" : "#fff",
            color: theme === "dark" ? "#fff" : "#000",
            borderRadius: "12px",
            padding: "0px", 
          },
        },
        success: {
          style: {
            borderRadius: "20px",
            background: theme === "dark" ? "#333" : "#e8ffe8",
            color: theme === "dark" ? "#fff" : "#166534",
          },
        },
        error: {
          style: {
            borderRadius: "20px",
            background: theme === "dark" ? "#333" : "#ffe8e8",
            color: theme === "dark" ? "#fff" : "#b91c1c",
          },
        },
      }}
      reverseOrder={true}
    />
  );
};

export default Notify;
