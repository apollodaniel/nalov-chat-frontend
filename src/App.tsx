import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import { Outlet, useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { get_auth_token } from './utils/functions'

function App() {
	const [loading, setLoading] = useState(true);
	const location = useLocation();
	const navigate = useNavigate();
	useEffect(
		()=>{
			if(location.pathname === "/register" || location.pathname === "/login"){
				setLoading(false);
				return;
			}
			get_auth_token().catch((error: any) => {
				navigate("/login");
				setLoading(false);
			}).then(()=>{
				setLoading(false);
			});
		},
		[location]
	);



	return loading ?
			(<main className='d-flex flex-column w-100 h-100 justify-content-center align-items-center'>
					<p className='text-white fs-3'>Loading</p>
					<div className="progress">
						<div
							className="progress-bar progress-bar-striped progress-bar-animated"
							role="progressbar"
							aria-valuenow={75}
							aria-valuemin={0}
							aria-valuemax={100}
							style={{ width: "350px" }}
						/>
					</div>
				</main>
			) : (<Outlet/>)}

export default App
