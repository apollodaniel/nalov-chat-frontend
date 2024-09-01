import { useState } from "react";
import FormField from "../components/form_field";
import { field_errors } from "../utils/constants";
import { useForm } from "react-hook-form";

function Login() {

	const {register, handleSubmit, setError, formState: {errors}} = useForm({mode: "onChange"});

	return (
		<main className='d-flex flex-column w-100 h-100 justify-content-center align-items-center'>
			<div className="card w-100 h-100" style={{ maxWidth: "600px", maxHeight: "300px" }}>
				<form className="d-flex flex-column h-100 w-100 justify-content-center gap-2 p-4">
					<div className="form-floating m-0">
						<input className="form-control" type="text" {...register('username')} />
						{(errors.username) && (<p className="m-0 fs-6 text-danger">{field_errors.unknown_username}</p>)}
					</div>
					<div className="form-floating m-0">
						<input className="form-control" type="text" {...register('password')} />
						{(errors.password) && (<p className="m-0 fs-6 text-danger">{field_errors.wrong_password}</p>)}
					</div>
					<a href="/register" className="align-self-end link-primary">não tem uma conta? Crie uma!</a>
					<input className="mt-3 btn btn-primary" type="submit" value="Login"/>
				</form>
			</div>
		</main>
	)
}

export default Login;
