import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import useMyToaster from '../hooks/useMyToaster';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';


const ProtectRoute = ({ children }) => {
  const toast = useMyToaster();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const userData = useSelector(state => state.userDetail);



  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("/admin")
      return toast("You need to login first", "error")
    }

    const checkToken = async () => {
      try {
        const url = process.env.REACT_APP_API_URL + "/user/check-token";
        const req = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ token })
        });

        const res = await req.json();
        if (req.status === 500 || res.err) {
          navigate("/admin");
          return toast(res.err, "error");
        }

        setLoading(false)

      } catch (error) {
        console.log(error)
        navigate("/admin");
        return toast("Something went wrong", "error")
      }
    }

    checkToken();

  }, [])


  if (userData?.companies?.length < 1) {
    if (window.location.pathname !== "/admin/company" && window.location.pathname !== "/admin/profile") {
      toast("You need to create a company first", "warning")
      navigate("/admin/company");

    }
  }

  return (
    <>
      {loading ? <p></p> : children}
    </>
  )

}




const UnProtectRoute = ({ children }) => {
  const token = Cookies.get("token");
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (token) {
  //     navigate("/admin/dashboard")
  //   }
  // }, [token])


  useEffect(() => {
    const checkToken = async () => {
      try {
        const url = process.env.REACT_APP_API_URL + "/user/check-token";
        const req = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ token })
        });

        const res = await req.json();
        if (req.status === 200 || !res.err) {
          navigate("/admin/dashboard");
        }

      } catch (error) {
        console.log("[*Error]", error)
        // navigate("/admin");
      }
    }

    checkToken();

  }, [token])

  return (
    <>
      {children}
    </>
  )
}

export { ProtectRoute, UnProtectRoute };

