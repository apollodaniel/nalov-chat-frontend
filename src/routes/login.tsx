import { useState } from 'react';
import { field_errors, modal_errors } from '../utils/constants';
import { useForm } from 'react-hook-form';
import { BackendError, LoginFormSubmit } from '../utils/types';
import { useNavigate } from 'react-router-dom';
import { login_user } from '../utils/functions/user';
import { parse_errors } from '../utils/functions/functions';
import { isAxiosError } from 'axios';

function Login() {
	const {
		register,
		handleSubmit,
		setError,
		clearErrors,
		formState: { errors },
	} = useForm<LoginFormSubmit>({ mode: 'onChange' });
	const [unknownError, setUnknownError] = useState<string | undefined>(
		undefined,
	);

	const navigate = useNavigate();
	return (
		<main className="d-flex flex-column w-100 h-100 justify-content-center align-items-center">
			<div
				className="card w-100"
				style={{ maxWidth: '600px', maxHeight: '800px' }}
			>
				<form
					className="d-flex flex-column h-100 w-100 justify-content-center gap-2 p-4"
					onSubmit={handleSubmit(async (result: LoginFormSubmit) => {
						login_user({ ...result })
							.catch(async (errors: any) => {
								// error from backend
								const errors_obj: BackendError[] =
									errors.errors;
								let contains_username = errors_obj.find((e) =>
									e.path.includes('username'),
								);
								let contains_password = errors_obj.find((e) =>
									e.path.includes('password'),
								);

								if (!contains_username && !contains_password) {
									// uknown error
									setUnknownError(parse_errors(errors_obj));
								}

								if (contains_username) setError('username', {});
								else clearErrors('username');
								if (contains_password) setError('password', {});
								else clearErrors('password');
							})
							.then((data: any) => {
								window.localStorage.setItem(
									'refresh_token',
									data.refresh_token,
								);
								window.sessionStorage.setItem(
									'auth_token',
									data.auth_token,
								);
								navigate('/');
							});
					})}
				>
					<div className="form-floating m-0">
						<input
							className="form-control"
							type="text"
							{...register('username')}
						/>
						<label>Username</label>
						{errors.username && (
							<p className="m-0 fs-6 text-danger">
								{field_errors.unknown_username}
							</p>
						)}
					</div>
					<div className="form-floating m-0">
						<input
							className="form-control"
							type="password"
							{...register('password')}
						/>
						<label>Password</label>
						{errors.password && (
							<p className="m-0 fs-6 text-danger">
								{field_errors.wrong_password}
							</p>
						)}
					</div>
					<a href="/register" className="align-self-end link-primary">
						não tem uma conta? Crie uma!
					</a>
					<input
						className="mt-3 btn btn-primary"
						type="submit"
						value="Login"
					/>
				</form>
			</div>
		</main>
	);
}

export default Login;
