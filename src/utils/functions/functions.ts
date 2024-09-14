import { DATETIME_FORMATTER, SHORT_TIME_FORMATTER } from "../constants";
import { BackendError, FieldError } from "../types";

export function get_current_host(args?: string): string {
	let location = window.location.href;
	const ports = location.match(/:([0-9]+)\//)![0];
	// .substring(0, location.lastIndexOf(":") + 1)
	return location.substring(0, location.indexOf(ports)) + ":8751" + (args || "");
}

export function parse_errors(errors: BackendError[]): string {
	return errors.map((e: BackendError)=>e.msg).join("\n");
}
export function verify_field_valid(value: string, error: FieldError, setFieldError: (error: string) => void, valid?: boolean){
	if((error.check && (value.match(error.check!) || []).length !== 0) || valid)
		setFieldError(error.error_msg);
	else
		setFieldError("");
}

export function format_date_user_friendly(date: number): string{
	const UNIT = 1000; // SECOND
	const DAY_UNIT =
		UNIT * 60 // MINUTE
		* 60 // HOUR
		* 24 // DAY
	;

	const now = Date.now();
	const DAYS_DIFF = Math.floor((now - date) / DAY_UNIT);

	const WEEK_DAY_FORMATTER = Intl.DateTimeFormat('pt-BR', {weekday: "long"});
	const MONTH_DAY_FORMATTER = Intl.DateTimeFormat('pt-BR', {month: "long", "day": "numeric"});
	const GENERIC_DATE_FORMATTER = Intl.DateTimeFormat('pt-BR', {dateStyle: "medium"});
	const MONTH_SHORT = Intl.DateTimeFormat('pt-BR', {month: "2-digit"});
	const YEAR_SHORT = Intl.DateTimeFormat('pt-BR', {year: "numeric"});

	// today
	if(DAYS_DIFF === 0) return SHORT_TIME_FORMATTER.format(date);
	// yesterday
	else if(DAYS_DIFF === 1) return "Ontem";
	// this week
	else if(DAYS_DIFF > 1) return WEEK_DAY_FORMATTER.format(date);
	// last week
	else if(DAYS_DIFF > 7 && DAYS_DIFF < 14) return "Semana passada";
	// same month, different week
	else if(DAYS_DIFF > 14 && MONTH_SHORT.format(date) == MONTH_SHORT.format(now)) return `${Math.floor(DAYS_DIFF / 14)} semanas atrás`;
	// same year
	else if(YEAR_SHORT.format(now) === YEAR_SHORT.format(date)) return MONTH_DAY_FORMATTER.format(date);
	// generic formatter
	else return GENERIC_DATE_FORMATTER.format(date);
}
