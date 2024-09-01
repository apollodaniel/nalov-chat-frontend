import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './routes/login.tsx'
import NotFound from './routes/not_found.tsx'
import Register from './routes/register.tsx'
import Home from './routes/home.tsx'

const router = createBrowserRouter([
	{
		path: "/",
		errorElement: <NotFound />,
		element: <App />,
		children: [
			{
				path: "/",
				element: <Home />
			},
			{
				path: "/login",
				element: <Login />
			},
			{
				path: "/register",
				element: <Register />
			}
		]
	},
]);

createRoot(document.getElementById('root')!).render(
	<RouterProvider router={router} />
)
