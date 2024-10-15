import { useCallback, useEffect, useRef, useState } from 'react';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { check_user_logged_in, get_auth_token } from './utils/functions/user';
import LoadingBar from './components/loading_bar';
import {
	abortControllerRef,
	EVENT_EMITTER,
	EVENT_ERROR_EMITTER,
} from './utils/constants';
import PopupErrorMessage from './components/PopupErrorMessage';

function App() {
	const [loading, setLoading] = useState(true);
	const location = useLocation();
	const navigate = useNavigate();

	const firstTime = useRef(true);

	useEffect(() => {
		const lastLocation = location.pathname;
		let currentLocation = location.pathname;
		if (!loading || firstTime.current) {
			check_user_logged_in(
				() => {
					// on fail
					if (
						location.pathname !== '/login' &&
						location.pathname !== '/register'
					) {
						navigate('/login');
					}
					setLoading(false);
					firstTime.current = false;
				},
				() => {
					// on sucess
					if (firstTime.current) {
						navigate('/');
					}
					setLoading(false);
					firstTime.current = false;
				},
			);
		}

		EVENT_EMITTER.emit('close-stream');
	}, [location]);

	useEffect(() => {
		return () => {
			setLoading(true);
		};
	}, []);

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
