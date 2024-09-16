import { AxiosResponse } from "axios";

export type PositionOffset = {
	offset_left: number, offset_top: number
}

// templates
export type UserTemplate = {
	id?: string,
	name: string,
	username: string,
	password: string,
	profile_picture: string
};

export type User = {
	id: string,
	name: string,
	username: string
	profile_picture: string
};

export type UserCredentials = {
	username: string,
	password: string
};


// errors
export class HttpError extends Error {
	data: any;
	status_code: number;
	constructor(result: HttpResult | { status_code: number, data: any }) {
		super("http error");
		this.data = result.data;
		this.status_code = result.status_code;
	}
}

export type BackendError = { type: string, path: string, location: string, msg: string };

export type ErrorResult = {
	errors: BackendError[]
}

export type FieldError = {
	error_msg: string,
	check?: RegExp
};

// result
export class HttpResult {
	sucess: boolean;
	data: any;
	status_code: number;
	constructor(response: AxiosResponse) {
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



// forms
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


// Messages
export type Message = {
	id: string,
	content: string,
	creation_date: number,
	last_modified_date: number,
	seen_date: number,
	sender_id: string,
	receiver_id: string
};

// chats
export type ChatType = {
	user: User,
	last_message: Message,
	unseen_message_count: number
};

export type ChatResult = {
	chats: ChatType[]
};
