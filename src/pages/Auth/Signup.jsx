import "../../assets/css/login.css"
import Logo from '../../assets/images/logo.png';
import { useState } from "react";
import useLoginShake from "../../hooks/useLoginShake";
import { Link, useNavigate } from 'react-router-dom';
import useMyToaster from "../../hooks/useMyToaster";
import Loading from '../../components/Loading'


document.title = "Signup";
const Signup = () => {
  const navigate = useNavigate();
  const shakeIt = useLoginShake();
  const [signupData, setsignupData] = useState({ name: '', email: '', password: '' });
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
      setLoading(true)
      const url = process.env.REACT_APP_API_URL + "/user/create";
      const req = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(signupData)
      });

      const res = await req.json();

      setLoading(false)
      if (req.status !== 200 || !res.register) {
        return toast(res.err, "error")
      }

      navigate("/admin")

    } catch (error) {
      setLoading(false)
      console.log(error)
    }


  }

  return (
    <main className='login__main'>
      <img src={Logo} alt="Logo.png" className='mb-5' />
      <div className="login__box flex flex-col" id="loginBox">
        <h1 className='text-center text-[25px] mb-8 mt-4'>Sign Up</h1>
        <form onSubmit={formAction}>
          <input type="text" name="name"
            value={signupData.name}
            onChange={(e) => setsignupData({ ...signupData, name: e.target.value })}
            className='input_style' placeholder='Enter username'
          />
          <input type="emial" name="email"
            value={signupData.email}
            onChange={(e) => setsignupData({ ...signupData, email: e.target.value })}
            className='input_style' placeholder='Enter login email'
          />
          <input type="password" name="pass"
            value={signupData.password}
            onChange={(e) => setsignupData({ ...signupData, password: e.target.value })}
            className='input_style' placeholder='Enter password'
          />
          <button className='button_style flex items-center justify-center gap-2'>
            {loading ? <Loading /> : null}
            Sign up
          </button>
        </form>
        <div className='flex justify-center text-[12px]'>
          All ready have an account?
          <Link to={'/admin'} className="ml-1">
            Login
          </Link>
        </div>
      </div>
    </main>
  )
}

export default Signup;