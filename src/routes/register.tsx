import { useForm } from "react-hook-form";
import { field_errors, field_patterns, modal_errors } from "../utils/constants";
import { useState } from "react";
import {
	BackendError,
	RegisterFormSubmit,
} from "../utils/types";
import { register_user } from "../utils/functions/user";
import { parse_errors } from "../utils/functions/functions";
import { useNavigate } from "react-router-dom";
import ErrorPopup from "../components/error_modal";
import { isAxiosError } from "axios";

function Register() {
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<RegisterFormSubmit>({
		mode: "onChange",
	});

	const [usernameErrorMessage, setUsernameErrorMessage] = useState<
		string | undefined
	>(undefined);
	const [unknownErrorMessage, setUnknownErrorMessage] = useState<
		string | undefined
	>(undefined);
	const navigate = useNavigate();
	return (
		<main className="d-flex flex-column w-100 h-100 justify-content-center align-items-center">
			<div className="card w-100 py-5" style={{ maxWidth: "600px" }}>
				<form
					className="d-flex flex-column h-100 w-100 justify-content-center gap-1 p-4"
					onSubmit={handleSubmit(async (data: RegisterFormSubmit) => {
						try {
							await register_user({ ...data });
							navigate("/")
						} catch (err: any) {
							console.log(err);
							if (isAxiosError(err) && err.response && err.response.data.errors) {
								let contains_username_error = false;
								const errors_obj = err.response.data.errors
								errors_obj.forEach(
									(err: BackendError) => {
										if (err.path === "username")
											contains_username_error = true;
									},
								);

								if (contains_username_error)
									setUsernameErrorMessage(
										field_errors.username_exists,
									);
								else setUsernameErrorMessage(undefined);

								// unknown error
								setUnknownErrorMessage(
									parse_errors(errors_obj),
								);
							}
						}
					})}
				>
					<div className="form-floating m-0">
						<input
							className="form-control"
							type="text"
							{...register("name", {
								pattern: field_patterns.name,
							})}
						/>
						<label>Name</label>
						{errors.name && (
							<p className="m-0 fs-6 text-danger">
								{field_errors.invalid_firstname_and_lastname}
							</p>
						)}
					</div>
					<div className="form-floating m-0">
						<input
							className="form-control"
							type="text"
							{...register("username", {
								pattern: field_patterns.username,
							})}
						/>
						<label>Username</label>
						{(errors.username || usernameErrorMessage) && (
							<p className="m-0 fs-6 text-danger">
								{usernameErrorMessage
									? usernameErrorMessage
									: field_errors.invalid_username}
							</p>
						)}
					</div>
					<div className="form-floating m-0">
						<input
							className="form-control"
							type="password"
							{...register("password", {
								pattern: field_patterns.password,
							})}
						/>
						<label>Password</label>
						{errors.password && (
							<p className="m-0 fs-6 text-danger">
								{field_errors.invalid_password}
							</p>
						)}
					</div>
					<div className="form-floating m-0">
						<input
							className="form-control"
							type="password"
							{...register("confirm_password", {
								validate: (val) => {
									if (watch("password") != val) {
										return field_errors.password_mismatch;
									}
								},
							})}
						/>
						<label>Confirm password</label>
						{errors.confirm_password && (
							<p className="m-0 fs-6 text-danger">
								{field_errors.password_mismatch}
							</p>
						)}
					</div>
					<a href="/login" className="align-self-end link-primary">
						já possui uma conta? Entre já!
					</a>
					<input
						className="mt-3 btn btn-primary"
						type="submit"
						value="Register"
					/>
				</form>
			</div>
			<ErrorPopup
				visible={unknownErrorMessage ? true : false}
				title={modal_errors.register.title}
				content={unknownErrorMessage || ""}
			/>
		</main>
	);
}

export default Register;
