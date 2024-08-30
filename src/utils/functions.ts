import { useLocation, useNavigate } from "react-router-dom";
import { HttpError, HttpResult, LoginResult, RefreshAuthTokenResult, UserCredentials, UserTemplate } from "./types";
import { Axios } from "axios";

export function get_current_host(args?: string): string {
	let location = window.location.href;
	return location.substring(0, location.indexOf(":") + 1).replace(":", "8671") + args || "";
}

export async function register_user(user: UserTemplate) {
	if (!user.password)
		throw Error("cannot register user with empty password");

	const axios = new Axios();
	const result = new HttpResult((await axios.post(
		get_current_host("/auth/register"),
		user
	)));

	if(!result.sucess)
		throw new HttpError(result)
}


export async function login_user(user: UserCredentials) {
	if (!user.password)
		throw Error("cannot login user with empty password");

	const axios = new Axios();
	const result = new HttpResult((await axios.post(
		get_current_host("/auth/login"),
		user
	)));

	if (!result.sucess)
		throw new HttpError(result);

	const login_result = result.data as LoginResult;
	window.localStorage.setItem("refresh_token", login_result.refresh_token);
	window.sessionStorage.setItem("auth_token", login_result.auth_token);
}

export async function refresh_user_token() {
	const refresh_token = window.localStorage.getItem("refresh_token");
	if (!refresh_token) {
		window.sessionStorage.clear();
		window.localStorage.clear();
		throw new Error("unauthorized");
	}

	const axios = new Axios();
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
}


export async function get_auth_token(){
	let auth_token = window.sessionStorage.getItem("auth_token");
	const refresh_token = window.localStorage.getItem("refresh_token");
	if(auth_token && refresh_token)
		return;
	await refresh_user_token();
}
