import { Toast } from "react-bootstrap"
import { PopupErrorMessages } from "../utils/types"
import { useEffect, useState } from "react"
import { EVENT_ERROR_EMITTER, toast_error_messages } from "../utils/constants";

export default function PopupErrorMessage() {
	const [errorMessages, setErrorMessages] = useState<PopupErrorMessages>([]);

	const listener = (reason: string) => {

		setErrorMessages((prev) => {
			// only stack same message when the message is send message error, except ignores
			if (reason !== toast_error_messages.send_message_error && prev.filter((e) => e[0] === reason).length != 0) {
				// ignores error message
				return prev;
			}

			const id = Date.now();
			setTimeout(
				() =>
					setErrorMessages((prev) =>
						prev.filter(
							(msg) => msg[1] != id.toString(),
						),
					),
				10000,
			);
			return [...prev, [reason, id.toString()]];
		});

	};

	useEffect(() => {
		EVENT_ERROR_EMITTER.on("add-error", listener);
	}, []);

	return (
		<div
			className="position-absolute d-flex flex-column gap-2"
			style={{
				top: "16px",
				right: "16px",
			}}
		>
			{errorMessages.map((msg: [string, string]) => (
				<Toast
					key={msg[1]}
					bg="danger"
					style={{ zIndex: "10" }}
					show={true}
					onClose={() =>
						setErrorMessages((prev: PopupErrorMessages) =>
							prev.filter((m) => m[1] != msg[1]),
						)
					}
				>
					<Toast.Header className="d-flex flex-row justify-content">
						<div className="h6 fw-bold m-0 me-auto">
							Sistema
						</div>
						<small>
							{Intl.DateTimeFormat("pt-BR", {
								timeStyle: "medium",
							}).format(parseInt(msg[1]))}
						</small>
					</Toast.Header>
					<Toast.Body>{msg[0]}</Toast.Body>
				</Toast>
			))}
		</div>

	)
}
