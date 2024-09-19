import { get_auth_token, refresh_user_token } from "./user";
import { Attachment, ChatResult, ChatType, HttpError, HttpResult, Message } from "../types";
import { execRequest, get_current_host, listenEvents, onReqError } from "./functions";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { ABORT_CONTROLLER, abortControllerRef, EVENT_EMITTER, EVENT_ERROR_EMITTER, MAXIMUM_TRIES, RETRY_CONNECTION_TIMEOUT, toast_error_messages } from "../constants";



export const get_user_chats = (): Promise<ChatType[]> =>
	new Promise((r, _rj) => execRequest({ endpoint: '/api/chats', method: "GET", onSucess: r }));

export const get_messages = (receiver_id: string): Promise<Message[]> =>
	new Promise((r, _rj) => execRequest({ endpoint: '/api/messages', method: "GET", options: { content: { receiver_id: receiver_id } }, onSucess: r }));

export const send_message = (message: {
	receiver_id: string;
	content: string;
	attachments?: Attachment[];
}): Promise<any> =>
	new Promise((r, _rj) => execRequest({ endpoint: '/api/messages', method: "PUT", errorMessage: toast_error_messages.send_message_error, options: { content: message }, onSucess: r }));

export const patch_message = (message_id: string, content: any): Promise<void> =>
	new Promise((r, _rj) => execRequest({ endpoint: `/api/messages/${message_id}`, options: { content: content }, method: "PATCH", onSucess: r, onFail: () => r() }));

export const delete_message = (message_id: string): Promise<void> =>
	new Promise((r, _rj) => execRequest({ endpoint: `/api/messages/${message_id}`, method: "DELETE", onSucess: r }));

export async function listen_messages(
	receiver_id: string,
	callback: (messages: Message[]) => void,
) {
	console.log("called listen messages");
	await listenEvents({
		endpoint: `/api/messages/listen`,
		args: `receiver_id=${receiver_id}`,
		onData: callback,
		tries: MAXIMUM_TRIES,
		errorMessage: toast_error_messages.listen_messages_error
	});
}


export async function listen_chats(
	callback: (chats: ChatType[]) => void,
) {
	await listenEvents({
		endpoint: '/api/chats/listen',
		onData: callback,
		tries: MAXIMUM_TRIES,
		errorMessage: toast_error_messages.listen_messages_error
	});
}
