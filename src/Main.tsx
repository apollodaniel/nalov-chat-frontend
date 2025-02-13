import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './Routes/Login.tsx';
import NotFound from './Routes/NotFound.tsx';
import Register from './Routes/Register.tsx';
import Home from './Routes/Home.tsx';
import Chat from './Routes/Chat.tsx';
import Config from './Routes/Config.tsx';
import ProfileConfig from './Routes/ProfileConfig.tsx';
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
