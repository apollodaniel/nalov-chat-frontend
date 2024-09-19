import { useCallback, useEffect, useState } from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { check_user_logged_in, get_auth_token } from "./utils/functions/user";
import LoadingBar from "./components/loading_bar";
import { abortControllerRef, EVENT_EMITTER, EVENT_ERROR_EMITTER } from "./utils/constants";
import PopupErrorMessage from "./components/PopupErrorMessage";

function App() {
	const [loading, setLoading] = useState(true);
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		setLoading(true);
		get_auth_token().then((token) => {
			if (
				location.pathname === "/register" ||
				location.pathname === "/login"
			) {
				navigate("/");
			}
			setLoading(false);
		}).catch(() => {
			if (
				location.pathname !== "/login" &&
				location.pathname !== "/register"
			) {
				navigate("/login");
			}
			setLoading(false);
		})


		EVENT_EMITTER.emit("close-stream");

	}, [location]);


	// useCallback(() => {
	//
	// }, [location])

	return (
		<main className="d-flex flex-column w-100 h-100 px-4 justify-content-center align-items-center">
			{loading ? <LoadingBar /> : <Outlet />}
			<PopupErrorMessage />
		</main>
	);
}
export default App;
