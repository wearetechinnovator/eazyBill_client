import "../../assets/css/login.css"
import Logo from '../../assets/images/logo.png';
import { useState } from "react";
import useLoginShake from "../../hooks/useLoginShake";
import { useNavigate } from 'react-router-dom';
import useMyToaster from "../../hooks/useMyToaster";
import Cookies from 'js-cookie';
import Loading from "../../components/Loading";




const Forget = () => {
  const [loginData, setLoginData] = useState({ email: '' });
  const shakeIt = useLoginShake();
  const navigate = useNavigate();
  const toast = useMyToaster();
  const [loading, setLoading] = useState(false);

  const formAction = async (e) => {
    e.preventDefault();
    const fields = Object.fromEntries(new FormData(e.target));

    for (let field of Object.keys(fields)) {
      if (fields[field] === '' || fields[field] === undefined || fields[field] === null) {
        shakeIt('loginBox');
        return;
      }
    }

    try {
      const url = process.env.REACT_APP_API_URL + "/user/forgot";
      setLoading(true);
      const req = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
      });

      const res = await req.json();
      setLoading(false);
      if (req.status !== 200 || res.err) {
        return toast(res.err, "error")
      }

      Cookies.set("user-token", res.token);
      navigate("/admin/otp", { state: { email: loginData.email } });

    } catch (error) {
      console.log(error)
      return toast("Something went wrong", "error")
    }


  }

  return (
    <main className='login__main'>
      <img src={Logo} alt="Logo.png" className='mb-5' />
      <div className="login__box flex flex-col" id="loginBox">
        <p className="text-2xl font-bold">Forgot Your Password</p>
        <p className="mb-10">
          Please enter the email address you'd like your password<br />
          reset information sent to.</p>
        <form onSubmit={formAction}>
          <input type="emial" name="email"
            value={loginData.email}
            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            className='input_style' placeholder='Enter email'
          />
          <button className='button_style' type="submit">
            {loading ? <Loading /> : 'Send'}
          </button>
          <div className="text-center my-2">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="text-blue-500 font-bold">Back To Login</button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default Forget;