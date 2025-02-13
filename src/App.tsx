import { useCallback, useEffect, useRef, useState } from 'react';
import './index.css';
import '~bootstrap/dist/css/bootstrap.min.css';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { checkUserSession, getAuthToken } from './Utils/Functions/User';
import LoadingBar from './Components/LoadingBar';
import { EVENT_EMITTER } from './Utils/Constants';
import PopupErrorMessage from './Components/PopupErrorMessage';

function App() {
	const [loading, setLoading] = useState(true);
	const location = useLocation();
	const navigate = useNavigate();

	const firstTime = useRef(true);

	useEffect(() => {
		if (firstTime.current) {
			checkUserSession(
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
