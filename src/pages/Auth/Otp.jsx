import "../../assets/css/login.css"
import Logo from '../../assets/images/logo.png';
import { useState } from "react";
import useLoginShake from "../../hooks/useLoginShake";
import { useLocation, useNavigate } from 'react-router-dom';
import useMyToaster from "../../hooks/useMyToaster";
import Cookies from 'js-cookie';
import { MdEmail } from "react-icons/md";
import Loading from "../../components/Loading";




const Otp = () => {
  const [otpdata, setOtp] = useState([]);
  const shakeIt = useLoginShake();
  const navigate = useNavigate();
  const toast = useMyToaster();
  const location = useLocation();
  const email = location.state?.email;
  const [loading, setLoading] = useState(false);



  const checkOtp = async () => {
    if (otpdata.length === 0) {
      shakeIt();
      toast("Invalid OTP", 'error')
      return;
    }


    try {
      setLoading(true)
      const url = process.env.REACT_APP_API_URL + "/user/verify-otp";
      const req = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ otp: otpdata.join(''), token: Cookies.get("user-token") })
      });

      const res = await req.json();
      setLoading(false);
      if (req.status !== 200 || res.err) {
        return toast(res.err, "error")
      }

      navigate("/admin/change-password");

    } catch (error) {
      setLoading(false)
      return toast("Something went wrong", "error")
    }

  }



  return (
    <main className='login__main'>
      <img src={Logo} alt="Logo.png" className='mb-5' />
      <div className="login__box flex flex-col" id="loginBox">
        <div className="w-[50px] h-[50px] bg-[#0000001e] text-blue-500 rounded-full flex justify-center items-center mx-auto">
          <MdEmail className="text-2xl" />
        </div>
        <p className="text-2xl font-bold text-center">OTP Verification</p>
        <p className="mb-8 text-center">
          Please enter your verification code we sent <br />to <i>{email}</i>
        </p>
        <form className='flex gap-4 justify-center items-center'>
          <input type="text" name="text"
            value={otpdata[0]}
            onChange={(e) => {
              const newLoginData = [...otpdata];
              newLoginData[0] = e.target.value;
              setOtp(newLoginData);
              if (e.target.value && e.target.nextSibling) {
                e.target.nextSibling.focus();
              }
            }}
            className='otp__field'
            maxLength="1"
          />
          <input type="text" name="text"
            value={otpdata[1]}
            onChange={(e) => {
              const newLoginData = [...otpdata];
              newLoginData[1] = e.target.value;
              setOtp(newLoginData);
              if (e.target.value && e.target.nextSibling) {
                e.target.nextSibling.focus();
              }
            }}
            className='otp__field'
            maxLength="1"
          />
          <input type="text" name="text"
            value={otpdata[2]}
            onChange={(e) => {
              const newLoginData = [...otpdata];
              newLoginData[2] = e.target.value;
              setOtp(newLoginData);
              if (e.target.value && e.target.nextSibling) {
                e.target.nextSibling.focus();
              }
            }}
            className='otp__field'
            maxLength="1"
          />
          <input type="text" name="text"
            value={otpdata[3]}
            onChange={(e) => {
              const newLoginData = [...otpdata];
              newLoginData[3] = e.target.value;
              setOtp(newLoginData);
              if (e.target.value && e.target.nextSibling) {
                e.target.nextSibling.focus();
              }
            }}
            className='otp__field'
            maxLength="1"
          />
        </form>
        <div className='flex justify-center'>
          <button
            className='bg-[#003E32] p-3 rounded mt-7 text-white flex justify-center'
            onClick={checkOtp}>{loading ? <Loading /> : "Verify OTP"}</button>
        </div>
      </div>
    </main>
  )
}

export default Otp;