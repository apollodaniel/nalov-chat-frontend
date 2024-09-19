import { get_auth_token, refresh_user_token } from "./user";
import { Attachment, ChatResult, ChatType, HttpError, HttpResult, Message } from "../types";
import { execRequest, get_current_host, onReqError } from "./functions";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { EVENT_ERROR_EMITTER, MAXIMUM_TRIES, RETRY_CONNECTION_TIMEOUT, toast_error_messages } from "../constants";

export const get_user_chats = (): Promise<ChatType[]> =>
	new Promise((r, _rj) => execRequest({ endpoint: '/api/chats', method: "GET", onSucess: r }));

export const get_messages = (receiver_id: string): Promise<Message[]> =>
	new Promise((r, _rj) => execRequest({ endpoint: '/api/messages', method: "GET", onSucess: r }));

export const send_message = (message: {
	receiver_id: string;
	content: string;
	attachments?: Attachment[];
}): Promise<any> =>
	new Promise((r, _rj) => execRequest({ endpoint: '/api/messages', method: "PUT", errorMessage: toast_error_messages.send_message_error, options: { body: message }, onSucess: r }));

export const patch_message = (message_id: string, content: any): Promise<void> =>
	new Promise((r, _rj) => execRequest({ endpoint: `/api/messages/${message_id}`, options: { body: content }, method: "PATCH", onSucess: r }));

export const delete_message = (message_id: string): Promise<void> =>
	new Promise((r, _rj) => execRequest({ endpoint: `/api/messages/${message_id}`, method: "DELETE", onSucess: r }));

export async function listen_messages(
	receiver_id: string,
	callback: (messages: Message[]) => void,
	tries?: number
) {
	if (!tries)
		tries = MAXIMUM_TRIES;
	const token = await get_auth_token();
	await fetchEventSource(
		get_current_host(`/api/messages/listen?receiver_id=${receiver_id}`),
		{
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "text/event-stream",
			},
			onopen: async (response) => {
				if (response.status === 601) {
					// refresh token
					await refresh_user_token();
					listen_messages(receiver_id, callback, tries - 1)
				}
			},
			onmessage: (event) => {
				if (event.data) {
					callback(JSON.parse(event.data)["messages"] as Message[]);
				}
			},
			onerror: (err) => {
				console.log(err);
				console.log(`Got an error while trying to listen messages, retrying... Tries left: ${tries}`);
				if (tries > 1) {
					setTimeout(() => listen_messages(receiver_id, callback, tries - 1), RETRY_CONNECTION_TIMEOUT);
				} else {
					console.log("got error");
					EVENT_ERROR_EMITTER.emit('add-error', toast_error_messages.listen_messages_error);
				}
			}
		},
	);

}


export async function listen_chats(
	callback: (chats: ChatType[]) => void,
	tries?: number
) {
	if (!tries)
		tries = MAXIMUM_TRIES;
	const token = await get_auth_token();
	await fetchEventSource(
		get_current_host(`/api/chats/listen`),
		{
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "text/event-stream",
			},
			onopen: async (response) => {
				if (response.status === 601) {
					// refresh token
					await refresh_user_token();
					listen_chats(callback, tries - 1);
				}
			},
			onmessage: (event) => {
				if (event.data) {
					callback(JSON.parse(event.data) as ChatType[]);
				}
			},
			onerror: (err) => {
				console.log(`Got an error while trying to listen chats, retrying... Tries left: ${tries}`);
				if (tries > 1) {
					setTimeout(() => listen_chats(callback, tries - 1), RETRY_CONNECTION_TIMEOUT);
				} else {
					EVENT_ERROR_EMITTER.emit('add-error', toast_error_messages.listen_chats_error);
				}
			}
		},
	);
}
