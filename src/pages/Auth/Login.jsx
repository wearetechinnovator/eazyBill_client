import "../../assets/css/login.css"
import Logo from '../../assets/images/logo.png';
import { useState } from "react";
import useLoginShake from "../../hooks/useLoginShake";
import { useNavigate } from 'react-router-dom';
import useMyToaster from "../../hooks/useMyToaster";
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading'
import { Icons } from "../../helper/icons";



const Login = () => {
	const [loginData, setLoginData] = useState({ email: '', password: '' });
	const shakeIt = useLoginShake();
	const navigate = useNavigate();
	const toast = useMyToaster();
	const [loading, setLoading] = useState(false);
	const [showPass, setShowPass] = useState(false);


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
			const url = process.env.REACT_APP_API_URL + "/user/login";
			const req = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(loginData)
			});

			const res = await req.json();

			setLoading(false);
			if (req.status !== 200 || !res.login) {
				return toast(res.err, "error")
			}

			// Cookies.set("token", res.token, { secure: true });
			Cookies.set("token", res.token);
			navigate("/admin/dashboard")

		} catch (error) {
			setLoading(false)
			console.log(error)
			return toast("Something went wrong", "error")
		}


	}

	return (
		<main className='login__main glow-shape'>
			<img src={Logo} alt="Logo.png" className='mb-5' />
			<div className="login__box flex flex-col" id="loginBox">
				<h1 className='text-center text-[25px] mb-8 mt-4'>Sign In</h1>
				<form onSubmit={formAction}>
					<input type="emial" name="email"
						value={loginData.email}
						onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
						className='input_style' placeholder='Enter email'
					/>
					<div className="relative">
						<input type={showPass ? "text" : "password"} name="pass"
							value={loginData.password}
							onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
							className='input_style' placeholder='Enter password'
						/>

						{
							showPass ? <Icons.EYE className="absolute right-3 top-6 cursor-pointer" onClick={() => setShowPass(false)} /> :
								<Icons.EYE_CLOSE className="absolute right-3 top-6 cursor-pointer" onClick={() => setShowPass(true)} />
						}
					</div>
					<button
						disabled={loading ? true : false}
						className='button_style flex items-center gap-2 justify-center'>
						{loading ? <Loading /> : null}
						Sign in
					</button>
				</form>
				<div className='flex justify-center text-[12px]'>
					You have no account?
					<Link to={'/admin/signup'} className="ml-1">
						SignUp
					</Link>
				</div>
				<div className='flex justify-center mt-2 text-[12px]'>
					<Link to={'/admin/forget'}>Forgot password</Link>
				</div>
			</div>
		</main>
	)
}

export default Login