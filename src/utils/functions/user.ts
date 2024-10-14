import { execRequest, get_current_host } from './functions';
import {
	RefreshAuthTokenResult,
	RegisterFormSubmit,
	User,
	UserCredentials,
} from '../types';
import { toast_error_messages } from '../constants';

export const register_user = (user: RegisterFormSubmit): Promise<void> =>
	new Promise((r, _rj) =>
		execRequest({
			endpoint: `/auth/register`,
			method: 'POST',
			customAuth: null,
			options: { content: user, headers: { Authorization: null } },
			errorMessage: toast_error_messages.register_error,
			onSucess: r,
			onFail: _rj,
		}),
	);

export const login_user = (user: UserCredentials): Promise<any> =>
	new Promise((r, _rj) =>
		execRequest({
			endpoint: `/auth/login`,
			method: 'POST',
			options: { content: user },
			customAuth: null,
			errorMessage: toast_error_messages.login_error,
			onSucess: r,
			onFail: _rj,
		}),
	);

export const get_available_users = (params?: string): Promise<User[]> =>
	new Promise((r, _rj) =>
		execRequest({
			endpoint: `/api/users${params || ''}`,
			method: 'GET',
			errorMessage: toast_error_messages.get_users_error,
			onSucess: r,
		}),
	);

export const get_user = (id: string): Promise<User> =>
	new Promise((r, _rj) =>
		execRequest({
			endpoint: `/api/users/${id}`,
			method: 'GET',
			onSucess: r,
			errorMessage: toast_error_messages.get_users_error,
		}),
	);

export const get_current_user = (): Promise<User> =>
	new Promise((r, _rj) =>
		execRequest({
			endpoint: `/api/users/current`,
			method: 'GET',
			errorMessage: toast_error_messages.get_users_error,
			onSucess: r,
		}),
	);

export const logout_user = (): Promise<User> =>
	new Promise((r, _rj) =>
		execRequest({
			endpoint: `/auth/logout`,
			method: 'POST',
			onSucess: () => {
				window.localStorage.clear();
				window.sessionStorage.clear();
				window.open(window.location.href, '_self');
			},
		}),
	);

// token related functions
export async function refresh_user_token(): Promise<void> {
	const refresh_token = window.localStorage.getItem('refresh_token');

	if (!refresh_token) {
		window.sessionStorage.clear();
		window.localStorage.clear();
		throw new Error('unauthorized');
	}

	const result = await fetch(get_current_host('/auth/token'), {
		headers: {
			Authorization: `Bearer ${refresh_token!}`,
		},
	});

	if (result.ok) {
		const refresh_token_result: RefreshAuthTokenResult =
			await result.json();
		window.sessionStorage.setItem(
			'auth_token',
			refresh_token_result.auth_token,
		);
	}
}

export async function get_auth_token(): Promise<string> {
	let auth_token = window.sessionStorage.getItem('auth_token');
	if (!auth_token) await refresh_user_token();

	auth_token = window.sessionStorage.getItem('auth_token');
	if (!auth_token) {
		throw new Error('error while trying to get user auth token');
	}

	return auth_token;
}

export const check_user_logged_in = async (onFail: () => void) => {
	const token = await get_auth_token();
	return await new Promise((r) =>
		execRequest({
			endpoint: '/auth/check-token',
			method: 'POST',
			options: {
				content: {
					token: token,
					type: 'Auth',
				},
			},
			onSucess: r,
			onFail: () => onFail(),
		}),
	);
};

export const delete_user = (onFail: () => void) =>
	execRequest({
		endpoint: '/auth/account',
		method: 'DELETE',
		errorMessage: toast_error_messages.delete_account_error,
		onSucess: () => {
			window.localStorage.clear();
			window.sessionStorage.clear();
			window.open(window.location.href, '_self');
		},
		onFail: onFail,
	});
