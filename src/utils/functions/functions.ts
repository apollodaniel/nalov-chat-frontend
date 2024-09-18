import { SHORT_TIME_FORMATTER } from "../constants";
import { Attachment, BackendError, FieldError, HttpResult } from "../types";
import { delete_message } from "./chat";
import { get_auth_token } from "./user";
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
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`
			}
		}
	);

	if (response.status === 200) {
		return response.json();
	}

	throw new Error("unable to get attachments");
}

export async function upload_files(files: File[], message_id: string, onError: (reason: string) => void) {

	const _onError = (aditional_message?: string)=>{
		onError(`Could not send you attachment file. ${aditional_message || ""}`);
		delete_message(message_id);
	}

	try {
		const token = await get_auth_token();
		let form_data = new FormData();

		const attachments = await get_attachments(message_id);

		console.log(files);
		console.log(attachments);

		for (const attachment of attachments) {
			console.log("Unable to find file that matches attachments info");
			const file = files.find((file)=> file.name == attachment.filename && file.size == attachment.byte_length);
			if(!file)
				throw new Error("Unable to find file that matches attachments info");

			form_data.append(attachment.id!, file);
		}

		let request = new XMLHttpRequest();

		const url = get_current_host(`/api/upload?message_id=${message_id}`);
		console.log(url);
		request.open("POST", url);

		request.setRequestHeader("Authorization", `Bearer ${token}`);
		request.send(form_data);

		request.addEventListener("error", () => _onError(`Server responded with code ${request.status}`));
	}catch(err){
		_onError();
	}
}
