import { useCallback, useEffect, useRef, useState } from 'react';
import './index.css';
import '~bootstrap/dist/css/bootstrap.min.css';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { check_user_logged_in, get_auth_token } from './utils/functions/user';
import LoadingBar from './components/loading_bar';
import { EVENT_EMITTER } from './utils/constants';
import PopupErrorMessage from './components/PopupErrorMessage';

function App() {
	const [loading, setLoading] = useState(true);
	const location = useLocation();
	const navigate = useNavigate();

	const firstTime = useRef(true);

	useEffect(() => {
		if (firstTime.current) {
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

	return (
		<main className="d-flex flex-column w-100 h-100 px-4 justify-content-center align-items-center">
			{loading ? <LoadingBar /> : <Outlet />}
			<PopupErrorMessage />
		</main>
	);
}
export default App;
