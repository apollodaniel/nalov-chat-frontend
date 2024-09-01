import { BackendError, FieldError } from "../types";

export function get_current_host(args?: string): string {
	let location = window.location.href;
	return location.substring(0, location.lastIndexOf(":") + 1).replace(/:(?!.\/)/, ":8751") + (args || "");
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
