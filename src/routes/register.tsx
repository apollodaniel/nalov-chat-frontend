import { useState } from "react";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FormField from "../components/form_field";

function Register() {

	let [nameErrorText, setNameErrorText] = useState("");
	let [nameContent, setNameContent] = useState("");

	let [usernameErrorText, setUsernameErrorText] = useState("");
	let [usernameContent, setUsernameContent] = useState("");

	let [passwordErrorText, setPasswordErrorText] = useState("");
	let [passwordContent, setPasswordContent] = useState("");

	let [confirmPasswordErrorText, setConfirmPasswordErrorText] = useState("");
	let [confirmPasswordContent, setConfirmPasswordContent] = useState("");

	return (
		<main className='d-flex flex-column w-100 h-100 justify-content-center align-items-center'>
			<div className="card w-100 h-100" style={{ maxWidth: "600px", maxHeight: "400px" }}>
				<form className="d-flex flex-column h-100 w-100 justify-content-center gap-2 p-4">
					<FormField label="Nome" onChanged={(value: string) => setNameContent(value)} errorText={nameErrorText} />
					<FormField label="Nome de usuário" onChanged={(value: string) => setUsernameContent(value)} errorText={usernameErrorText} />
					<FormField label="Senha" onChanged={(value: string) => setPasswordContent(value)} errorText={passwordErrorText} />
					<FormField label="Confirmar Senha" onChanged={(value: string) => setConfirmPasswordContent(value)} errorText={confirmPasswordErrorText} />
					<a href="/login" className="align-self-end link-primary">já possui uma conta? Entre já!</a>
					<button className="mt-3 btn btn-primary">Registre-se</button>
				</form>
			</div>
		</main>
	)
}

export default Register;
