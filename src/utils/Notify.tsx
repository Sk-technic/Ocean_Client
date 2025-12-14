import { Toaster } from "react-hot-toast";
import { useTheme } from "../hooks/theme/usetheme";

const Notify = () => {
  const { theme } = useTheme()
  return (
    <Toaster
      position="top-center"
      gutter={8}
       containerStyle={{
        zIndex: 999999,  // higher than your modal (9999)
      }}

      toastOptions={{
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
