import { AxiosResponse } from 'axios';
import { getAuthToken, refreshUserToken } from './Functions/User';
import { EVENT_ERROR_EMITTER, TOAST_ERROR_MESSAGES } from './Constants';
import axios from 'axios';

export type PositionOffset = {
	offsetLeft: number;
	offsetTop: number;
};

// templates
export type UserTemplate = {
	id?: string;
	name: string;
	username: string;
	password: string;
	profilePicture: string;
};

export type User = {
	id: string;
	name: string;
	username: string;
	profilePicture: string;
};

export type UserCredentials = {
	username: string;
	password: string;
};

// errors

export type PopupErrorMessages = [string, string][];

export type BackendError = {
	type: string;
	path: string;
	location: string;
	msg: string;
};

export type ErrorResult = {
	errors: BackendError[];
};

export type FieldError = {
	errorMsg: string;
	check?: RegExp;
};

//// result
//export class HttpResult {
//	sucess: boolean;
//	_data: any;
//
//	response: AxiosResponse;
//	status_code: number;
//	constructor(response: AxiosResponse) {
//		this.sucess = response.status >= 200 && response.status < 300;
//		this.status_code = response.status;
//		this._data = response.data;
//		this.response = response;
//	}
//	async data(): Promise<any> {
//		console.log('Retrieving data');
//		if (this.status_code === 601) {
//			if (!this.response.config) {
//				console.log('Cannot retrieve last request');
//				EVENT_ERROR_EMITTER.emit(
//					'add-error',
//					toast_error_messages.check_token_error,
//				);
//
//				return this._data;
//			}
//
//			try {
//				console.log('refreshing token');
//				await refresh_user_token();
//				const token = await get_auth_token();
//
//				// retry request
//				const response = await axios({
//					...this.response.config,
//					headers: {
//						Authorization: `Bearer ${token}`,
//					},
//				});
//
//				console.log(response.data);
//
//				this.sucess = response.status >= 200 && response.status < 300;
//				this.status_code = response.status;
//				this._data = response.data;
//
//				return this._data;
//			} catch (err: any) {
//				console.log(err.message);
//				EVENT_ERROR_EMITTER.emit(
//					'add-error',
//					toast_error_messages.check_token_error,
//				);
//			}
//		}
//		return this._data;
//	}
//}
//
//export type RefreshAuthTokenResult = {
//	authToken: string;
//};
//
// forms
export type RegisterFormSubmit = {
	name: string;
	username: string;
	password: string;
	confirmPassword: string;
};

export type LoginFormSubmit = {
	username: string;
	password: string;
};

// Messages
export type Message = {
	id: string;
	content: string;
	creationDate: number;
	lastModifiedDate: number;
	seenDate: number;
	senderId: string;
	receiverId: string;
	attachments: Attachment[];
};

export type Attachment = {
	id?: string;
	messageId?: string;
	date?: number;
	path?: string;
	previewPath?: string;
	filename: string;
	mimeType: string;
	byteLength: number;
};

// chats
export type ChatType = {
	user: User;
	lastMessage: Message;
	unseenMessageCount: number;
};

export type ChatResult = {
	chats: ChatType[];
};
