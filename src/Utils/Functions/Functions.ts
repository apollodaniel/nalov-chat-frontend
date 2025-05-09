import {
	AllErrors,
	EVENT_EMITTER,
	EVENT_ERROR_EMITTER,
	RETRY_CONNECTION_TIMEOUT,
	SHORT_TIME_FORMATTER,
} from '../Constants';
import { Attachment, BackendError, ErrorEntry, FieldError } from '../Types';
import { getAuthToken, refreshUserToken } from './User';
import qs from 'qs';
import { FFmpeg } from '@diffusion-studio/ffmpeg-js';

export async function convertAudio(
	audio: File,
	onSuccess: (result: File) => void,
	onFail: () => void,
) {
	const ffmpeg = new FFmpeg({
		log: true,
	});

	ffmpeg.whenReady(async () => {
		try {
			const data = await ffmpeg
				.input({ source: audio })
				.ouput({ format: 'wav' })
				.export();
			onSuccess(
				new File([data!], audio.name.replace('.weba', '.wav'), {
					type: 'audio/wav',
				}),
			);
		} catch (e: any) {
			console.log(e.message);
			onFail();
		}
	});
}

export function formatAudioDuration(time: number) {
	const hours = Math.floor(time / 3600);
	const minutes = Math.floor((time % 3600) / 60);
	const seconds = Math.floor(time % 60);
	return `${hours === 0 ? '' : hours.toString().padStart(2, '0') + ':'}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function formatRecordingAudioTime(time: number) {
	const hours = Math.floor(time / 3600);
	const minutes = Math.floor((time % 3600) / 60);
	const seconds = Math.floor(time % 60);
	return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function getCurrentHost(args?: string, ws: boolean = false): string {
	let location = window.location.href;
	const ports = location.match(/:([0-9]+)\//)![0];
	// .substring(0, location.lastIndexOf(":") + 1)
	if (ws) {
		location = location.replace('http', 'ws');
	}
	const _args = !args
		? ''
		: args?.startsWith('/')
			? args.substring(1, args.length)
			: args;
	const _location = location.substring(
		0,
		location.indexOf(ports) + ports.length - 1,
	);
	return `${_location}/v1/${_args}`;
}

export async function getAttachment(path: string): Promise<Blob | null> {
	const result: Blob | null = await new Promise<any>((r) =>
		execRequest({
			method: 'GET',
			onSucess: r,
			blob: true,
			endpoint: path,
			onFail: () => r(null),
		}),
	);
	if (result) {
		return result;
	}

	return null;
}

export function parseErrors(errors: BackendError[]): string {
	return errors.map((e: BackendError) => e.msg).join('\n');
}
export function verifyFieldValid(
	value: string,
	error: FieldError,
	setFieldError: (error: string) => void,
	valid?: boolean,
) {
	if (
		(error.check && (value.match(error.check!) || []).length !== 0) ||
		valid
	)
		setFieldError(error.errorMsg);
	else setFieldError('');
}

export function formatDateUserFriendly(date: number): string {
	const UNIT = 1000; // SECOND
	const DAY_UNIT =
		UNIT *
		60 * // MINUTE
		60 * // HOUR
		24; // DAY
	const NOW = Date.now();
	const DAYS_DIFF = Math.floor((NOW - date) / DAY_UNIT);

	const WEEK_DAY_FORMATTER = Intl.DateTimeFormat('pt-BR', {
		weekday: 'long',
	});
	const MONTH_DAY_FORMATTER = Intl.DateTimeFormat('pt-BR', {
		month: 'long',
		day: 'numeric',
	});
	const GENERIC_DATE_FORMATTER = Intl.DateTimeFormat('pt-BR', {
		dateStyle: 'medium',
	});
	const MONTH_SHORT = Intl.DateTimeFormat('pt-BR', { month: '2-digit' });
	const YEAR_SHORT = Intl.DateTimeFormat('pt-BR', { year: 'numeric' });

	// today
	if (DAYS_DIFF === 0) return SHORT_TIME_FORMATTER.format(date);
	// yesterday
	else if (DAYS_DIFF === 1) return 'Ontem';
	// this week
	else if (DAYS_DIFF > 1) return WEEK_DAY_FORMATTER.format(date);
	// last week
	else if (DAYS_DIFF > 7 && DAYS_DIFF < 14) return 'Semana passada';
	// same month, different week
	else if (
		DAYS_DIFF > 14 &&
		MONTH_SHORT.format(date) == MONTH_SHORT.format(NOW)
	)
		return `${Math.floor(DAYS_DIFF / 14)} semanas atrás`;
	// same year
	else if (YEAR_SHORT.format(NOW) === YEAR_SHORT.format(date))
		return MONTH_DAY_FORMATTER.format(date);
	// generic formatter
	else return GENERIC_DATE_FORMATTER.format(date);
}

export const getAttachments = async (
	messageId: string,
): Promise<Attachment[]> =>
	await new Promise((r, rj) =>
		execRequest({
			endpoint: `/api/messages/${messageId}/attachments`,
			method: 'GET',
			onSucess: (attachments: Attachment[]) => r(attachments),
			onFail(response) {
				r([]);
			},
		}),
	);

// export async function get_attachments(
//     message_id: string,
// ): Promise<Attachment[]> {
//     const token = await get_auth_token();
//
//     const response = await fetch(
//         get_current_host(`/api/messages/${message_id}/attachments`),
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//         },
//     );
//
//     if (response.ok) return (await response.json()) as Attachment[];
//
//     throw onReqError({
//         self: get_attachments(message_id),
//         response: response,
//         errorMsg: "Unable to get attachments",
//     });
// }

export async function uploadFiles(files: File[], messageId: string) {
	try {
		let formData = new FormData();

		const attachments = await getAttachments(messageId);

		for (const attachment of attachments) {
			const file = files.find(
				(file) =>
					(file.name || '') == attachment.filename &&
					file.size == attachment.byteLength,
			);
			if (!file)
				throw new Error(
					'Unable to find file that matches attachments info',
				);

			formData.append(attachment.id!, file);
		}

		let request = new XMLHttpRequest();

		const url = getCurrentHost(`/api/upload?messageId=${messageId}`);
		console.log(url);
		request.withCredentials = true;

		request.open('POST', url);
		// request.setRequestHeader('Authorization', `Bearer ${token}`);
		request.send(formData);

		request.addEventListener('error', () => {
			onReqError({
				self: uploadFiles(files, messageId),
				response: request.response,
				errorMsg: `Could not send your attachment file.`,
			});
		});
	} catch (err) {
		onReqError({
			self: uploadFiles(files, messageId),
			errorMsg: `Could not send your attachment file.`,
		});
	}
}

export async function execRequest(obj: {
	endpoint: string;
	method: 'POST' | 'DELETE' | 'PATCH' | 'GET' | 'PUT';
	blob?: boolean;
	onSucess: (data: any | Blob) => void;
	options?: { content?: any; headers?: any };
	customAuth?: string | null;
	onFail?: (response: Response | undefined) => void;
}): Promise<void> {
	const { endpoint, blob = false, method, onSucess, onFail } = obj;

	let url = getCurrentHost(endpoint);

	let requestOptions: { body?: any; headers?: any } = {};

	if (obj.options) {
		const headers = obj.options.headers || {};
		let body: any;
		if (obj.options.content && method === 'GET') {
			url = url.endsWith('/')
				? `${url}?${qs.stringify(obj.options.content)}`
				: `${url}/?${qs.stringify(obj.options.content)}`;
		} else if (obj.options.content) {
			body = obj.options.content;
		}
		requestOptions = {
			body: body,
			headers: headers,
		};
	} else {
		requestOptions = {};
	}

	try {
		const response = await fetch(url, {
			method: method,
			body: JSON.stringify(requestOptions.body),
			headers: {
				...requestOptions.headers,
				'Content-Type': 'application/json',
			},
			credentials: 'include',
		});

		// get json response if it's a json
		const responseContent = await response.text();
		let jsonResponse;
		try {
			jsonResponse = JSON.parse(responseContent);
		} catch (err) {}

		// --- display errors on screen if errors is not field related
		if (
			jsonResponse &&
			jsonResponse.error?.code &&
			!jsonResponse.error?.field
		) {
			// single error
			EVENT_ERROR_EMITTER.emit(
				'add-error',
				AllErrors[jsonResponse.error.code]?.message.ptBr ||
					AllErrors['UNKNOWN_ERROR'].message.ptBr,
			);
		} else if (
			jsonResponse &&
			jsonResponse.errors instanceof Array &&
			jsonResponse.errors.every((err: any) => err.code && !err.field)
		) {
			// multiple errors
			jsonResponse.errors.forEach((err: ErrorEntry) => {
				EVENT_ERROR_EMITTER.emit(
					'add-error',
					AllErrors[err.code]?.message.ptBr ||
						AllErrors['UNKNOWN_ERROR'].message.ptBr,
				);
			});
		}
		// --- end of displaying errors

		if (response.status >= 200 && response.status < 300) {
			if (
				!jsonResponse ||
				typeof jsonResponse !== 'object' ||
				responseContent.trim().length === 0
			)
				return onSucess(undefined);
			if (blob) return onSucess(await response.blob());
			else return onSucess(JSON.parse(responseContent));
		} else if (response.status === 601) {
			// expired token
			await refreshUserToken();
			return execRequest(obj);
		} else if (response.status === 602) {
			window.open(`${window.location.protocol}/login`, '_self');
			if (onFail) onFail(response);
		} else if (response.status === 401) {
			if (
				jsonResponse &&
				typeof jsonResponse === 'object' &&
				jsonResponse.error === 'no active session'
			) {
				window.open(window.location.href, '_self');
			}

			if (onFail && jsonResponse && typeof jsonResponse === 'object')
				onFail(jsonResponse);
			if (onFail) onFail(response);
		} else {
			if (onFail && jsonResponse && typeof jsonResponse === 'object')
				onFail(jsonResponse);
		}
	} catch (err: any) {
		EVENT_ERROR_EMITTER.emit(
			'add-error',
			AllErrors['UNKNOWN_ERROR'].message.ptBr,
		);
		if (onFail) onFail(undefined);
	}
}

export async function listenEvents(obj: {
	endpoint: string;
	args?: string;
	onData: (data: any) => void;
	tries: number;
	errorMessage?: string;
	onError?: (reason: number | string) => void;
	authToken?: string;
}) {
	const { onData, endpoint, onError, errorMessage, tries, args, authToken } =
		obj;

	const token = authToken || (await getAuthToken());

	let socket = new WebSocket(
		getCurrentHost(
			`${endpoint}?token=${token}${args ? `&${args}` : ''}`,
			true,
		),
	);

	let forcedClose = false;
	EVENT_EMITTER.on('close-stream', () => {
		console.log('Close socket');
		forcedClose = true;
		socket.close();
	});

	socket.onmessage = (evt: MessageEvent) => {
		const msg: string = evt.data;
		if (msg === 'expired token') {
			refreshUserToken().then(() => {
				listenEvents(obj);
			});
		} else if (msg === 'invalid token') {
			if (onError) onError('invalid token');
			if (errorMessage)
				EVENT_ERROR_EMITTER.emit('add-error', errorMessage);
		} else {
			// valid data and ok response
			onData(JSON.parse(msg));
		}
	};

	socket.onerror = () => {
		// retry
		console.log(
			`Got an error trying to listen the messages, trying again... tries ${tries} `,
		);
		if (tries > 0) {
			setTimeout(() => {
				listenEvents({ ...obj, tries: tries - 1, authToken: token });
			}, RETRY_CONNECTION_TIMEOUT);
		} else {
			if (errorMessage)
				EVENT_ERROR_EMITTER.emit('add-error', errorMessage);
		}
	};

	socket.onclose = (ev) => {
		console.log(
			`Connection interrupted, trying again... tries ${tries}\n${ev.code}`,
		);

		if (!forcedClose) {
			if (tries > 0) {
				setTimeout(() => {
					listenEvents({
						...obj,
						tries: tries - 1,
						authToken: token,
					});
				}, RETRY_CONNECTION_TIMEOUT);
			} else {
				EVENT_ERROR_EMITTER.emit(
					'add-error',
					AllErrors['CONNECTION_INTERRUPTED'].message.ptBr,
				);
			}
		}
	};
}

export async function onReqError({
	self,
	response,
	errorMsg,
	callback,
}: {
	self: any;
	response?: Response;
	errorMsg?: string;
	callback?: () => void;
}) {
	if (response && response.status === 601) {
		await refreshUserToken();
		self();
	} else if (response?.status === 602) {
		window.open(`${window.location.protocol}/login`, '_self');
	}
	if (errorMsg) EVENT_ERROR_EMITTER.emit('add-error', errorMsg);
	if (callback) callback();
}
