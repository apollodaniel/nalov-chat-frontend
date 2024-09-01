import { AxiosResponse } from "axios";

export type UserTemplate = {
	id?: string,
	name: string,
	username: string,
	password: string,
};

export type UserCredentials = {
	username: string,
	password: string
};

export class HttpError extends Error{
	data: any;
	status_code: number;
	constructor(result: HttpResult){
		super("http error");
		this.data = result.data;
		this.status_code = result.status_code;
	}
}


export type BackendError = {type: string, path: string, location: string, msg: string};

export type ErrorResult = {
	errors: BackendError[]
}

export class HttpResult {
	sucess: boolean;
	data: any;
	status_code: number;
	constructor(response: AxiosResponse){
		this.sucess = response.status >= 200 && response.status < 300;
		this.status_code = response.status;
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

export type FieldError = {
	error_msg: string,
	check?: RegExp
};

export type RegisterFormSubmit = {
	name: string,
	username: string,
	password: string,
	confirm_password: string
}

export type LoginFormSubmit = {
	username: string,
	password: string
}
