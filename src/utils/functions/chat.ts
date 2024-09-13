import axios, { isAxiosError } from "axios";
import { get_auth_token } from "./user";
import { ChatResult, HttpError, HttpResult, Message } from "../types";
import { get_current_host } from "./functions";
import { EventSourcePolyfill } from "event-source-polyfill";
import { EVENT_EMITTER } from "../constants";

export async function get_user_chats(): Promise<ChatResult> {
	const token = await get_auth_token();
	const response = await axios.get(get_current_host("/api/chats"), {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	const chats_result = new HttpResult(response);

	if (chats_result.sucess) {
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

export async function listen_messages(
	receiver_id: string,
	callback: (messages: Message[]) => void,
) {
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
		setTimeout(() => listen_messages(receiver_id, callback), 1000);
	};

	EVENT_EMITTER.on("close", () => {
		if (evt_src) {
			evt_src.close();
			console.log("EventSource close requested.");
		}
	});
}

export async function send_message(message: {
	receiver_id: string;
	content: string;
}) {
	while (true) {
		try {
			const token = await get_auth_token();
			await axios.put(get_current_host("/api/messages"), message, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			break;
		} catch (err: any) {
			if (isAxiosError(err) && err.status && err.status === 400) {
				break;
			}
		}
	}
}


export async function patch_message(message_id: string, content: any){
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

	if(!response.ok && !(response.status >= 200 && response.status < 300)){
		// error
		const response_body = await response.json();
		throw new HttpError(response_body);
	}
}


export async function delete_message(message_id: string){
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

	if(!response.ok && !(response.status >= 200 && response.status < 300)){
		// error
		const response_body = await response.json();
		throw new HttpError(response_body);
	}
}

