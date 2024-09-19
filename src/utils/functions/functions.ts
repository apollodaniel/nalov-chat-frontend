import { EVENT_ERROR_EMITTER, SHORT_TIME_FORMATTER, toast_error_messages } from "../constants";
import { Attachment, BackendError, FieldError, HttpResult } from "../types";
import { delete_message } from "./chat";
import { get_auth_token, refresh_user_token } from "./user";
import axios from "axios";

export function get_current_host(args?: string): string {
	let location = window.location.href;
	const ports = location.match(/:([0-9]+)\//)![0];
	// .substring(0, location.lastIndexOf(":") + 1)
	return location.substring(0, location.indexOf(ports)) + ":8751" + (args || "");
}

export function parse_errors(errors: BackendError[]): string {
	return errors.map((e: BackendError) => e.msg).join("\n");
}
export function verify_field_valid(value: string, error: FieldError, setFieldError: (error: string) => void, valid?: boolean) {
	if ((error.check && (value.match(error.check!) || []).length !== 0) || valid)
		setFieldError(error.error_msg);
	else
		setFieldError("");
}

export function format_date_user_friendly(date: number): string {
	const UNIT = 1000; // SECOND
	const DAY_UNIT =
		UNIT * 60 // MINUTE
		* 60 // HOUR
		* 24 // DAY
		;

	const now = Date.now();
	const DAYS_DIFF = Math.floor((now - date) / DAY_UNIT);

	const WEEK_DAY_FORMATTER = Intl.DateTimeFormat('pt-BR', { weekday: "long" });
	const MONTH_DAY_FORMATTER = Intl.DateTimeFormat('pt-BR', { month: "long", "day": "numeric" });
	const GENERIC_DATE_FORMATTER = Intl.DateTimeFormat('pt-BR', { dateStyle: "medium" });
	const MONTH_SHORT = Intl.DateTimeFormat('pt-BR', { month: "2-digit" });
	const YEAR_SHORT = Intl.DateTimeFormat('pt-BR', { year: "numeric" });

	// today
	if (DAYS_DIFF === 0) return SHORT_TIME_FORMATTER.format(date);
	// yesterday
	else if (DAYS_DIFF === 1) return "Ontem";
	// this week
	else if (DAYS_DIFF > 1) return WEEK_DAY_FORMATTER.format(date);
	// last week
	else if (DAYS_DIFF > 7 && DAYS_DIFF < 14) return "Semana passada";
	// same month, different week
	else if (DAYS_DIFF > 14 && MONTH_SHORT.format(date) == MONTH_SHORT.format(now)) return `${Math.floor(DAYS_DIFF / 14)} semanas atrás`;
	// same year
	else if (YEAR_SHORT.format(now) === YEAR_SHORT.format(date)) return MONTH_DAY_FORMATTER.format(date);
	// generic formatter
	else return GENERIC_DATE_FORMATTER.format(date);
}

export async function get_attachments(message_id: string): Promise<Attachment[]> {
	const token = await get_auth_token();

	const response = await fetch(
		get_current_host(`/api/messages/${message_id}/attachments`),
		{
			headers: {
				Authorization: `Bearer ${token}`
			}
		}
	);

	if (response.ok)
		return (await response.json()) as Attachment[];

	throw onReqError({ self: get_attachments(message_id), response: response, errorMsg: "Unable to get attachments" });
}

export async function upload_files(files: File[], message_id: string) {

	const _onError = () => delete_message(message_id);

	try {
		const token = await get_auth_token();
		let form_data = new FormData();

		const attachments = await get_attachments(message_id);

		console.log(files);
		console.log(attachments);

		for (const attachment of attachments) {
			console.log("Unable to find file that matches attachments info");
			const file = files.find((file) => file.name == attachment.filename && file.size == attachment.byte_length);
			if (!file)
				throw new Error("Unable to find file that matches attachments info");

			form_data.append(attachment.id!, file);
		}

		let request = new XMLHttpRequest();

		const url = get_current_host(`/api/upload?message_id=${message_id}`);
		console.log(url);
		request.open("POST", url);

		request.setRequestHeader("Authorization", `Bearer ${token}`);
		request.send(form_data);

		request.addEventListener("error", () => onReqError({ self: upload_files(files, message_id), response: request.response, errorMsg: `Could not send your attachment file.`, callback: _onError }));
	} catch (err) {
		onReqError({ self: upload_files(files, message_id), errorMsg: `Could not send your attachment file.`, callback: _onError });
	}
}

export async function execRequest<Result>(
	obj:
		{
			endpoint: string,
			method: "POST" | "DELETE" | "PATCH" | "GET" | "PUT",
			errorMessage?: string,
			onSucess: (data: Result) => void,
			options?: { body?: any, headers?: any },
			onFail?: (status_code: number) => void
		}): Promise<void> {

	const { endpoint, method, errorMessage, options, onSucess, onFail } = obj;

	const url = get_current_host(endpoint);
	const token = get_auth_token();

	let opt = options || {
		body: "",
		headers: {
			Authorization: `Bearer ${token}`
		}
	};
	if(!opt.headers)
		opt.headers = {
			Authorization: `Bearer ${token}`,
		};


	if(opt.body) {// stringify obj
		opt.body = JSON.stringify(opt.body);
		opt.headers = {
			...opt.headers,
			'Content-Type': "application/json"
		}
	}

	const response = await fetch(
		url,
		{
			method: method,
			...opt
		}
	);

	if (response.status === 601) { // expired token
		await refresh_user_token();
		execRequest(obj);
	}

	if (response.status === 401) { // reload session in case unauthorized
		EVENT_ERROR_EMITTER.emit('add-error', toast_error_messages.expired_session);
		window.localStorage.clear();
		window.sessionStorage.clear();
		setTimeout(() => window.open(window.location.href, "_self"), 3000);
	}

	if (response.status >= 200 && response.status < 300) {
		const data = await response.json();
		onSucess(data);
	}

	if (errorMessage)
		EVENT_ERROR_EMITTER.emit('add-error', errorMessage);
	if (onFail)
		onFail(response.status);
}

export function onReqError({ self, response, errorMsg, callback }: { self: any, response?: Response, errorMsg?: string, callback?: () => void }) {
	if (response && response.status === 601)
		self();
	if (errorMsg)
		EVENT_ERROR_EMITTER.emit("add-error", errorMsg);
	if (callback)
		callback();
}
