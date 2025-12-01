import LoginForm from "../../components/ui/auth/Login/LoginForm";
import { useTheme } from "../../hooks/theme/usetheme";

function Login() {
  const { theme } = useTheme();

  return (
    <main
      className={`
        min-h-screen flex items-center justify-center px-4
        text-[var(--text-primary)]
        relative overflow-hidden
        transition-all duration-700 ease-[cubic-bezier(0.77,0,0.175,1)]
      `}
    >
      {/* 🌤 Smooth static background gradient */}
      <div
        className={`
          absolute inset-0 -z-10 transition-all duration-700
          ${
            theme === "dark"
              ? "bg-gradient-to-br from-[#0b0615] via-[#150e25] to-[#1b1230]"
              : "bg-gradient-to-br from-[#f9f9ff] via-[#f2f6ff] to-[#eaf3ff]"
          }
        `}
      />

      {/* 🧊 Frosted overlay for subtle depth */}
      <div
        className={`
          absolute inset-0 -z-5 backdrop-blur-[80px]
          transition-all duration-700 pointer-events-none
          ${
            theme === "dark"
              ? "bg-[rgba(0,0,0,0.2)]"
              : "bg-[rgba(255,255,255,0.4)]"
          }
        `}
      />

      {/* Centered form */}
      <LoginForm />
    </main>
  );
}

export default Login;
