import { AxiosResponse } from "axios";

export type UserTemplate = {
	id: string,
	name: string,
	username: string,
	password?: string,
};

export type UserCredentials = {
	username: string,
	password: string
};

export class HttpError extends Error{
	data: any;
	constructor(result: HttpResult){
		super("http error");
		this.data = result.data;
	}
}


export type ErrorResult = {
	errors: {type: string, path: string, location: string, msg: string}[]
}

export class HttpResult {
	sucess: boolean;
	data: any;

	constructor(response: AxiosResponse){
		this.sucess = response.status >= 200 && response.status < 300;
		this.data = response.data;
	}
}


export type LoginResult = {
	refresh_token: string,
	auth_token: string
};
export type RefreshAuthTokenResult = {
	auth_token: string
};
