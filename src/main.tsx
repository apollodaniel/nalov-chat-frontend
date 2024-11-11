import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './routes/login.tsx';
import NotFound from './routes/not_found.tsx';
import Register from './routes/register.tsx';
import Home from './routes/home.tsx';
import Chat from './routes/chat.tsx';
import Config from './routes/config.tsx';
import ProfileConfig from './routes/profile_config.tsx';
import { NextUIProvider } from '@nextui-org/react';

const router = createBrowserRouter([
	{
		path: '/',
		errorElement: (
			<NextUIProvider>
				<main className="h-[100vh] w-[100vw] flex flex-column justify-center dark text-foreground bg-background">
					<NotFound />
				</main>
			</NextUIProvider>
		),
		element: (
			<NextUIProvider className="dark">
				<main className="h-[100vh] w-[100vw] flex flex-column justify-center dark text-foreground background-gradient">
					<App />
				</main>
			</NextUIProvider>
		),
		children: [
			{
				path: '/',
				element: <Home />,
			},
			{
				path: '/chat/:id',
				element: <Chat />,
			},
			{
				path: '/login',
				element: <Login />,
			},
			{
				path: '/register',
				element: <Register />,
			},
			{
				path: '/config',
				element: <Config />,
			},
			{
				path: '/config/profile',
				element: <ProfileConfig />,
			},
		],
	},
]);

createRoot(document.getElementById('root')!).render(
	<RouterProvider router={router} />,
);
