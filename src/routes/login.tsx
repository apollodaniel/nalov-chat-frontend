import { useState } from "react";
import FormField from "../components/form_field";

function Login() {
	let [usernameErrorText, setUsernameErrorText] = useState("");
	let [usernameContent, setUsernameContent] = useState("");

	let [passwordErrorText, setPasswordErrorText] = useState("");
	let [passwordContent, setPasswordContent] = useState("");
	return (
		<main className='d-flex flex-column w-100 h-100 justify-content-center align-items-center'>
			<div className="card w-100 h-100" style={{ maxWidth: "600px", maxHeight: "300px" }}>
				<form className="d-flex flex-column h-100 w-100 justify-content-center gap-2 p-4">
					<FormField label="Nome de usuário" onChanged={(value: string) => setUsernameContent(value)} errorText={usernameErrorText} />
					<FormField label="Senha" onChanged={(value: string) => setPasswordContent(value)} errorText={passwordErrorText} />
					<a href="/register" className="align-self-end link-primary">não tem uma conta? Crie uma!</a>
					<button className="mt-3 btn btn-primary">Login</button>
				</form>
			</div>
		</main>
	)
}

export default Login;
