import axios from "axios";
import { get_auth_token } from "./user";
import { ChatResult, HttpError, HttpResult, Message } from "../types";
import { get_current_host } from "./functions";
import { EventSourcePolyfill } from "event-source-polyfill";


export async function get_user_chats(): Promise<ChatResult> {
	const token = await get_auth_token();
	const response = await axios.get(
		get_current_host("/api/chats"),
		{
			headers: {
				Authorization: `Bearer ${token}`
			}
		}
	);

	const chats_result = new HttpResult(response);

	if (chats_result.sucess) {
		return chats_result.data as ChatResult;
	}

	throw new HttpError(chats_result);
}

export async function get_messages(receiver_id: string): Promise<Message[]> {
	const token = await get_auth_token();

	const messages_result = new HttpResult((await axios.get(
		get_current_host(`/api/messages?receiver_id=${receiver_id}`),
		{
			headers: {
				Authorization: `Bearer ${token}`
			}
		}
	)));

	if (messages_result.sucess) {
		return messages_result.data.messages as Message[];
	}

	throw new Error("unable to get messages");
}

export async function listen_messages(receiver_id: string, callback: (messages: Message[])=>void) {
	const token = await get_auth_token();
	const evt_src = new EventSourcePolyfill(get_current_host(`/api/messages/listen?receiver_id=${receiver_id}`), {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	evt_src.onmessage = (event)=>{
		if(event.data){
			console.log("Fui chamado")
			callback(JSON.parse(event.data)["messages"] as Message[]);
		}

	}



}

export async function send_message(message: {receiver_id: string, content: string}){
	const token = await get_auth_token();
	await axios.put(
		get_current_host("/api/messages"),
		message,
		{
			headers: {
				Authorization: `Bearer ${token}`
			}
		}
	);
}

