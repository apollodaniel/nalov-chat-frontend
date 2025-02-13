import { execRequest, getCurrentHost as getCurrentHost } from './Functions';
import { RegisterFormSubmit, User, UserCredentials } from '../Types';
import { AllErrors } from '../Constants';

export const registerUser = (user: RegisterFormSubmit): Promise<void> =>
	new Promise((r, _rj) =>
		execRequest({
			endpoint: `/auth/register`,
			method: 'POST',
			customAuth: null,
			options: { content: user, headers: { Authorization: null } },
			onSucess: r,
			onFail: _rj,
		}),
	);

export const loginUser = (user: UserCredentials): Promise<any> =>
	new Promise((r, _rj) =>
		execRequest({
			endpoint: `/auth/login`,
			method: 'POST',
			options: { content: user },
			customAuth: null,
			onSucess: r,
			onFail: _rj,
		}),
	);

export const getAvailableUsers = (params?: string): Promise<User[]> =>
	new Promise((r, _rj) =>
		execRequest({
			endpoint: `/api/users${params || ''}`,
			method: 'GET',
			onSucess: r,
		}),
	);

export const getUser = (id: string): Promise<User> =>
	new Promise((r, _rj) =>
		execRequest({
			endpoint: `/api/users/${id}`,
			method: 'GET',
			onSucess: r,
		}),
	);

export const getCurrentUser = (): Promise<User> =>
	new Promise((r, _rj) =>
		execRequest({
			endpoint: `/api/users/current`,
			method: 'GET',
			onSucess: r,
		}),
	);

export const logoutUser = (): Promise<User> =>
	new Promise((r, _rj) =>
		execRequest({
			endpoint: `/auth/logout`,
			method: 'POST',
			onSucess: () => {
				window.open(window.location.href, '_self');
			},
		}),
	);

// token related functions
export async function refreshUserToken(): Promise<void> {
	const result = await fetch(getCurrentHost('/auth/token'), {
		method: 'POST',
		credentials: 'include',
	});

	if (result.status === 602) {
		// no session
		window.open(`${window.location.protocol}/login`, '_self');
	}
}

export async function getAuthToken(): Promise<string> {
	const result = await fetch(getCurrentHost('/auth/token'), {
		method: 'POST',
		credentials: 'include',
	});
	if (result.ok || result.status === 200) {
		return (await result.json()).token;
	}

	throw new Error('error while trying to get user auth token');
}

export const checkUserSession = async (
	onFail: () => void,
	onSucess: () => void,
) => {
	// const token = await get_auth_token();
	const result = await fetch(getCurrentHost('/auth/check-token'), {
		method: 'POST',
		credentials: 'include',
		body: JSON.stringify({
			type: 'Auth',
		}),
		headers: {
			'Content-Type': 'application/json',
		},
	});

	if (result.status === 602) return onFail();
	else if (result.status === 601) {
		await refreshUserToken();
	}
	onSucess();
};

export const deleteUser = (onFail: () => void) =>
	execRequest({
		endpoint: '/api/users/current',
		method: 'DELETE',
		onSucess: () => {
			window.open(window.location.href, '_self');
		},
		onFail: onFail,
	});
