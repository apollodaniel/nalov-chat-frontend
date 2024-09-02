import axios from "axios";
import { get_current_host } from "./functions";
import { HttpError, HttpResult, LoginResult, RefreshAuthTokenResult, User, UserCredentials, UserTemplate } from "../types";

export async function register_user(user: UserTemplate) {
	const result = await axios.post(
		get_current_host("/auth/register"),
		user
	);

	console.log(result);
	const register_result = new HttpResult(result);
	console.log(register_result);
	if(!register_result.sucess){
		throw new HttpError(register_result)
	}


	await login_user({
		username: user.username,
		password: user.password
	})
}


export async function login_user(user: UserCredentials) {
	if (!user.password)
		throw Error("cannot login user with empty password");

	const result = await axios.post(
		get_current_host("/auth/login"),
		user
	);
	const login_result = new HttpResult(result);

	if (!login_result.sucess)
		throw new HttpError(login_result);

	const _login_result = result.data as LoginResult;
	window.localStorage.setItem("refresh_token", _login_result.refresh_token);
	window.sessionStorage.setItem("auth_token", _login_result.auth_token);
}

export async function refresh_user_token(): Promise<string> {
	const refresh_token = window.localStorage.getItem("refresh_token");
	if (!refresh_token) {
		window.sessionStorage.clear();
		window.localStorage.clear();
		throw new Error("unauthorized");
	}

	const result = new HttpResult((await axios.get(
		get_current_host("/auth/token"),
		{
			headers: {
				Authorization: `Bearer ${refresh_token!}`
			}
		},
	)));

	if (!result.sucess)
		throw new Error("could not get the token")

	const refresh_token_result = result.data as RefreshAuthTokenResult;
	window.sessionStorage.setItem("auth_token", refresh_token_result.auth_token);

	return refresh_token_result.auth_token;
}


export async function check_user_logged_in(){
	const token = window.sessionStorage.getItem("auth_token");
	const refresh_token = window.localStorage.getItem("refresh_token");

	if(!refresh_token){
		window.sessionStorage.clear();
		window.localStorage.clear();
		throw new Error("no token");
	}

	if(!token || (token && (await verify_token(token, "Auth")))){
		window.sessionStorage.clear();
		await refresh_user_token();
	}
}
export async function get_auth_token(): Promise<string>{
	let auth_token = window.sessionStorage.getItem("auth_token");
	if(!auth_token)
		await refresh_user_token();
	auth_token = window.sessionStorage.getItem("auth_token");
	if(!auth_token){
		throw new Error("error while trying to get user auth token");
	}

	return auth_token;
}

export async function verify_token(token: string, type: "Refresh" | "Auth"): Promise<boolean>{
	const result = await axios.post(
		get_current_host("/auth/check-token"),
		{
			type: type,
			token: token
		}
	);
	return result.status >= 200 && result.status < 300;
}


export async function get_available_users(): Promise<User[]>{
	const token = await get_auth_token();

	const response = await axios.get(
		get_current_host("/api/users"),
		{
			headers: {
				Authorization: `Bearer ${token}`
			}
		}
	);

	const result = new HttpResult(response);
	if(result.sucess){
		return result.data.users as User[];
	}

	throw new HttpError(result);
}

export async function get_user(id: string){
	const token = await get_auth_token();

	const response = await axios.get(
		get_current_host(`/api/users/${id}`),
		{
			headers: {
				Authorization: `Bearer ${token}`
			}
		}
	);

	const http_result = new HttpResult(response);

	if(http_result.sucess){
		return http_result.data as User;
	}

	throw new Error("could not retrieve user info");
}
