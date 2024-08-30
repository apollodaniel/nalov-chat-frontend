import { useState } from "react";

interface Props{
	label: string,
	errorText?: string
	onChanged(value: string): void
}

function FormField({label, errorText, onChanged}: Props) {
	let [value, setValue] = useState("");


	return (
		<div className="form-floating">
			<input className="form-control" onChange={(event)=>onChanged(event.currentTarget.textContent || "")} type="text" />
			<label>{label}</label>
			{
				(errorText && errorText.trim().length != 0) &&
				<p>{errorText!}</p>
			}
		</div>
	)
}

export default FormField;
