import { ToastContainer, Flip, Bounce, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../hooks/theme/usetheme";

const Notify = () => {
  const { theme } = useTheme();

  return (
    <ToastContainer
      //  POSITION
      // Controls where the toast appears: "top-right" | "top-center" | "top-left" | 
      // "bottom-right" | "bottom-center" | "bottom-left"
      position="top-center"

      //  AUTO CLOSE
      // How long (in ms) before it automatically disappears
      autoClose={1500} // e.g. 2.5 seconds

      //  PROGRESS BAR
      // true = visible | false = hidden
      hideProgressBar={false}

      //  ORDER
      // true = newest toast appears on top
      newestOnTop={true}

      //  USER INTERACTIONS
      closeOnClick={true} // allows click to close
      draggable={true}// allows drag to dismiss
      pauseOnHover={false} // stops the timer when hovering
      pauseOnFocusLoss={false} // stops timer when window loses focus
      rtl={false} // for right-to-left languages like Arabic

      //  THEME
      // "light" | "dark" | "colored"
      theme={theme} // dynamically applies your app's theme (from useTheme)

      //  TRANSITION EFFECT
      // Available: Slide | Bounce | Zoom | Flip
      transition={Bounce}

      //  LIMIT
      // Prevents too many toasts stacking (e.g., only 3 visible at once)
      limit={3}

      //  CLOSE BUTTON
      // Can hide or replace with a custom element
      closeButton={false}
//  transition={Slide}

  //  MULTI-COLOR GRADIENT PROGRESS BAR
  progressClassName="!bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
    />
  );
};

export default Notify;
