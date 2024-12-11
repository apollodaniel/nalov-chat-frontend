import { Attachment, ChatType, Message } from '../Types';
import { execRequest, listenEvents } from './Functions';
import {
	MAXIMUM_TRIES,
	TOAST_ERROR_MESSAGES as TOAST_ERROR_MESSAGES,
} from '../Constants';

export const getUserChats = (): Promise<ChatType[]> =>
	new Promise((r, _rj) =>
		execRequest({ endpoint: '/api/chats', method: 'GET', onSucess: r }),
	);

export const getMessages = (receiverId: string): Promise<Message[]> =>
	new Promise((r, _rj) =>
		execRequest({
			endpoint: '/api/messages',
			method: 'GET',
			options: { content: { receiverId: receiverId } },
			onSucess: r,
		}),
	);

export const sendMessage = (message: {
	receiverId: string;
	content: string;
	attachments?: Attachment[];
}): Promise<any> =>
	new Promise((r, _rj) =>
		execRequest({
			endpoint: '/api/messages',
			method: 'POST',
			errorMessage: TOAST_ERROR_MESSAGES.SEND_MESSAGE_ERROR,
			options: { content: message },
			onSucess: r,
			onFail: r,
		}),
	);

export const patchMessage = (messageId: string, content: any): Promise<void> =>
	new Promise((r, _rj) =>
		execRequest({
			endpoint: `/api/messages/${messageId}`,
			options: { content: content },
			method: 'PATCH',
			onSucess: r,
			onFail: () => r(),
		}),
	);

export const deleteMessage = (messageId: string): Promise<void> =>
	new Promise((r, _rj) =>
		execRequest({
			endpoint: `/api/messages/${messageId}`,
			method: 'DELETE',
			onSucess: r,
		}),
	);

export async function listenMessages(
	receiverId: string,
	callback: (messages: Message[]) => void,
) {
	await listenEvents({
		endpoint: `/ws/api/messages/listen`,
		args: `receiverId=${receiverId}`,
		onData: callback,
		tries: MAXIMUM_TRIES,
		errorMessage: TOAST_ERROR_MESSAGES.LISTEN_MESSAGES_ERROR,
	});
}

export async function listenChats(callback: (chats: ChatType[]) => void) {
	await listenEvents({
		endpoint: '/ws/api/chats/listen',
		onData: callback,
		tries: MAXIMUM_TRIES,
		errorMessage: TOAST_ERROR_MESSAGES.LISTEN_MESSAGES_ERROR,
	});
}
