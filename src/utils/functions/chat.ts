import axios, { isAxiosError } from "axios";
import { get_auth_token } from "./user";
import { Attachment, ChatResult, ChatType, HttpError, HttpResult, Message } from "../types";
import { get_current_host } from "./functions";
import { EventSourcePolyfill } from "event-source-polyfill";
import { EVENT_EMITTER, MAXIMUM_TRIES, RETRY_CONNECTION_TIMEOUT, toast_error_messages } from "../constants";

export async function get_user_chats(): Promise<ChatResult> {
	const token = await get_auth_token();
	const response = await axios.get(get_current_host("/api/chats"), {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	const chats_result = new HttpResult(response);

	if (chats_result.sucess) {
		console.log(chats_result);
		return chats_result.data as ChatResult;
	}

	throw new HttpError(chats_result);
}

export async function get_messages(receiver_id: string): Promise<Message[]> {
	const token = await get_auth_token();

	const messages_result = new HttpResult(
		await axios.get(
			get_current_host(`/api/messages?receiver_id=${receiver_id}`),
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		),
	);

	if (messages_result.sucess) {
		return messages_result.data.messages as Message[];
	}

	throw new Error("unable to get messages");
}

function close_evt_src(evt_src: EventSourcePolyfill) {
	const listener = () => {
		if (evt_src) {
			evt_src.close();
			EVENT_EMITTER.removeListener("close-stream", listener);
			console.log("EventSource close requested.");
		}
	};

	EVENT_EMITTER.on("close-stream", listener);
}

export async function listen_messages(
	receiver_id: string,
	callback: (messages: Message[]) => void,
	onError: (reason: string) => void,
	tries?: number
) {
	if (!tries)
		tries = MAXIMUM_TRIES;
	const token = await get_auth_token();
	const evt_src = new EventSourcePolyfill(
		get_current_host(`/api/messages/listen?receiver_id=${receiver_id}`),
		{
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "text/event-stream",
			},
		},
	);

	evt_src.onmessage = (event) => {
		if (event.data) {
			callback(JSON.parse(event.data)["messages"] as Message[]);
		}
	};

	evt_src.onerror = () => {
		evt_src.close();
		console.log(`Got an error while trying to listen messages, retrying... Tries left: ${tries}`);
		if (tries > 1) {
			setTimeout(() => listen_messages(receiver_id, callback, onError, tries - 1), RETRY_CONNECTION_TIMEOUT);
		} else {
			console.log("got error");
			onError(toast_error_messages.listen_messages_error);
		}
	};


	close_evt_src(evt_src);
}


export async function listen_chats(
	callback: (chats: ChatType[]) => void,
	onError: (reason: string) => void,
	tries?: number
) {
	if (!tries)
		tries = MAXIMUM_TRIES;
	const token = await get_auth_token();
	const evt_src = new EventSourcePolyfill(
		get_current_host(`/api/chats/listen`),
		{
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "text/event-stream",
			},
		},
	);

	evt_src.onmessage = (event) => {
		if (event.data) {
			callback(JSON.parse(event.data) as ChatType[]);
		}
	};

	evt_src.onerror = () => {
		evt_src.close();
		console.log(`Got an error while trying to listen chats, retrying... Tries left: ${tries}`);
		if (tries > 1) {
			setTimeout(() => listen_chats(callback, onError, tries - 1), RETRY_CONNECTION_TIMEOUT);
		} else {
			console.log("got error");
			onError(toast_error_messages.listen_chats_error);
		}
	};

	close_evt_src(evt_src);
}

export async function send_message(message: {
	receiver_id: string;
	content: string;
	attachment?: Attachment;
}, onError?: (reason: string) => void, onSucess?: (result: {message_id: string, attachment_id: string|undefined}) => void
) {
	let tries = 3;
	while (tries > 0) {
		try {
			const token = await get_auth_token();
			const response = await axios.put(get_current_host("/api/messages"), message, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			console.log(response.data)
			if(onSucess)
				return onSucess(response.data);
			break;
		} catch (err: any) {
			if (isAxiosError(err) && err.status && err.status === 400) {
				break;
			}
		}
		tries--;
		console.log(`Could not send the messagem, retrying... Tries left: ${tries}`);
		await new Promise((r) => setTimeout(r, 1000));
	}
	if (tries <= 0) {
		// there was an error on sending
		if (onError) onError(toast_error_messages.send_message_error);
	}
}


export async function patch_message(message_id: string, content: any) {
	const auth_token = await get_auth_token();

	const response = await fetch(
		get_current_host(`/api/messages/${message_id}`),
		{
			method: "PATCH",
			body: JSON.stringify(content),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${auth_token}`
			}
		}
	);

	if (!response.ok && !(response.status >= 200 && response.status < 300)) {
		// error
		const response_body = await response.json();
		throw new HttpError(response_body);
	}
}


export async function delete_message(message_id: string) {
	const auth_token = await get_auth_token();

	const response = await fetch(
		get_current_host(`/api/messages/${message_id}`),
		{
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${auth_token}`
			}
		}
	);

	if (!response.ok && !(response.status >= 200 && response.status < 300)) {
		// error
		const response_body = await response.json();
		throw new HttpError(response_body);
	}
}
