import { useState } from 'react';
import { field_errors, modal_errors } from '../utils/constants';
import { useForm } from 'react-hook-form';
import { BackendError, LoginFormSubmit } from '../utils/types';
import { useNavigate } from 'react-router-dom';
import { login_user } from '../utils/functions/user';
import { parse_errors } from '../utils/functions/functions';
import { isAxiosError } from 'axios';
import { Button, Card, Input, Link } from '@nextui-org/react';
import LoginIcon from '@mui/icons-material/Login';
import RevealPassIcon from '@mui/icons-material/Visibility';
import RevealPassIconOff from '@mui/icons-material/VisibilityOff';

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
	const [passwordVisible, setPasswordVisible] = useState(false);
	return (
		<main className="d-flex flex-column w-100 h-100 justify-content-center align-items-center">
			<Card
				className="w-100 bg-opacity-40 border rounded-2xl p-3"
				style={{ maxWidth: '600px', maxHeight: '900px' }}
			>
				<form
					className="flex flex-col h-100 w-100 justify-content-center gap-2 p-4"
					onSubmit={handleSubmit(async (result: LoginFormSubmit) => {
						login_user({ ...result })
							.then((data: any) => {
								navigate('/');
							})
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
							});
					})}
				>
					<Input
						type="text"
						label="Username"
						isInvalid={!!errors.username}
						errorMessage={field_errors.unknown_username}
						{...register('username')}
					/>

					<Input
						type={passwordVisible ? 'text' : 'password'}
						endContent={
							<button
								className="focus:outline-none"
								type="button"
								onClick={() =>
									setPasswordVisible(!passwordVisible)
								}
								aria-label="toggle password visibility"
							>
								{passwordVisible ? (
									<RevealPassIcon className="text-2xl text-default-400 pointer-events-none" />
								) : (
									<RevealPassIconOff className="text-2xl text-default-400 pointer-events-none" />
								)}
							</button>
						}
						{...register('password')}
						label="Password"
						classNames={{
							errorMessage: 'm-0 fs-6 text-danger',
						}}
						isInvalid={!!errors.password}
						errorMessage={field_errors.wrong_password}
					/>
					<Button
						variant="solid"
						className="mt-1 flex flex-row gap-2 h-[48px] text-md"
						type="submit"
						color="primary"
					>
						Entrar
						<LoginIcon className="text-lg" />
					</Button>
					<Link
						href="/register"
						className="align-self-end text-[16px] mt-1"
					>
						não tem uma conta? Crie uma!
					</Link>
				</form>
			</Card>
		</main>
	);
}

export default Login;
