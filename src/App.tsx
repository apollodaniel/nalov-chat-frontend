import { useEffect, useState } from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { check_user_logged_in } from "./utils/functions/user";

function App() {
	const [loading, setLoading] = useState(true);
	const location = useLocation();
	const navigate = useNavigate();
	useEffect(() => {
		new Promise(async (r, rj) => {
			try {
				setLoading(true);
				await check_user_logged_in();
				if (
					location.pathname === "/register" ||
					location.pathname === "/login"
				) {
					navigate("/");
				}
				setLoading(false);
			} catch (err: any) {
				if (
					location.pathname !== "/login" &&
					location.pathname !== "/register"
				) {
					navigate("/login");
				}
				setLoading(false);
			}
		}).finally(() => console.log("stoped"));
	}, [location]);

	return (
		<main className="d-flex flex-column w-100 h-100 justify-content-center align-items-center">
			{loading ? (
				<div>
					<p className="text-white fs-3">Loading</p>
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
				</div>
			) : (
				<Outlet />
			)}
		</main>
	);
}
export default App;
