import "../../assets/css/login.css"
import Logo from '../../assets/images/logo.png';
import { useState } from "react";
import useLoginShake from "../../hooks/useLoginShake";
import { useNavigate } from 'react-router-dom';
import useMyToaster from "../../hooks/useMyToaster";
import Cookies from 'js-cookie';

const ChangePassword = () => {
  const [loginData, setLoginData] = useState({ confirPassword: '', password: '' });
  const shakeIt = useLoginShake();
  const navigate = useNavigate();
  const toast = useMyToaster();


  const formAction = async (e) => {
    e.preventDefault();
    const fields = Object.fromEntries(new FormData(e.target));

    for (let field of Object.keys(fields)) {
      if (fields[field] === '' || fields[field] === undefined || fields[field] === null) {
        shakeIt('loginBox');
        return;
      }
    }


    if (loginData.password !== loginData.confirPassword) {
      return toast("Confirm password not match", "error")
    }


    try {
      const url = process.env.REACT_APP_API_URL + "/user/reset-pass";
      const req = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({password: loginData.password, token: Cookies.get("user-token")})
      });

      const res = await req.json();
      if (req.status !== 200 || !res.change) {
        return toast(res.err, "error")
      }

      Cookies.remove("user-token");
      Cookies.set("token", res.newToken, { secure: true });
      navigate("/admin/dashboard")

    } catch (error) {
      console.log(error)
      return toast("Something went wrong", "error")
    }


  }

  return (
    <main className='login__main'>
      <img src={Logo} alt="Logo.png" className='mb-5' />
      <div className="login__box flex flex-col" id="loginBox">
        <h1 className='text-center text-[25px] mb-8 mt-4'>Change Password</h1>
        <form onSubmit={formAction}>
          <input type="password" name="text"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            className='input_style' placeholder='New password'
          />
          <input type="password" name="text"
            value={loginData.confirPassword}
            onChange={(e) => setLoginData({ ...loginData, confirPassword: e.target.value })}
            className='input_style' placeholder='Confirm password'
          />
          <button className='button_style'>Save</button>
        </form>
      </div>
    </main>
  )
}

export default ChangePassword;