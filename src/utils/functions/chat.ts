import axios from "axios";
import { get_auth_token } from "./user";
import { ChatResult, HttpError, HttpResult } from "../types";
import { get_current_host } from "./functions";


export async function get_user_chats(): Promise<ChatResult>{
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

	if(chats_result.sucess){
		return chats_result.data as ChatResult;
	}

	throw new HttpError(chats_result);
}
