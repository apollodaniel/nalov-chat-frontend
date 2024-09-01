import { useState } from "react";
import { FieldError } from "../utils/types";

interface Props {
	label: string,
	valid?: (value: string)=>boolean,
	type?: string,
	error: FieldError,
	onChanged(value: string, valid: bool): void,
}

function FormField({ type = "text", label, error, valid, onChanged }: Props) {
	let [value, setValue] = useState("");
	let [showError, setShowError] = useState(false);
	return (
		<div className="form-floating m-0">
			<input className="form-control" onChange={(event) => {
				const current_value = event.target.value || "";

				if(!valid){
					if(error.check)
						setShowError((current_value.match(error.check!)||[]).length === 0 );
				}else{
					setShowError(!valid(current_value));
				}
				onChanged(current_value, showError);
			}} type={type} />
			<label>{label}</label>
			{
				showError &&
				<p className="m-0 fs-6 text-danger">{error.error_msg!}</p>
			}
		</div>
	)
}

export default FormField;
