import React, { useEffect } from 'react'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom';



const ProtectCP = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const userToken = Cookies.get("user-token");
      if (!userToken) {
        navigate("/admin");
      }

      try {
        const url = process.env.REACT_APP_API_URL + "/user/protect-change-pass";
        const req = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ token: userToken })
        });

        const res = await req.json();
        if (req.status !== 200 || !res.verify) {
          Cookies.remove("user-token");
          navigate("/admin");
        }

      } catch (error) {
        Cookies.remove("user-token");
        navigate("/admin");
      }

    }

    check()

  })


  return (
    <>
      {children}
    </>
  )
}

export default ProtectCP