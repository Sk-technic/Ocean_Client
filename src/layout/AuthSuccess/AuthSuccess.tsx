import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Loader from '../../components/Loader/Loader'

const AuthSuccess = () => {

 const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken && refreshToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    }

    navigate("/"); // or your dashboard
  }, []);
    return (
        <main className='w-full h-screen flex items-center justify-center'>
                 <Loader fullScreen size={20} message='veryfing...' />
        </main>
    )
}

export default AuthSuccess