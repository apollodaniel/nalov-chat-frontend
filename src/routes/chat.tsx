import { useEffect, useRef, useState } from "react";
import { Message, User } from "../utils/types";
import LoadingBar from "../components/loading_bar";
import { get_user } from "../utils/functions/user";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import {
	get_messages,
	listen_messages,
	patch_message,
	send_message,
} from "../utils/functions/chat";
import { DATETIME_FORMATTER, EVENT_EMITTER, SHORT_TIME_FORMATTER } from "../utils/constants";
import { get_current_host } from "../utils/functions/functions";
import MessageContainer from "../components/message_container";
import { Modal, Toast } from "react-bootstrap";

function Chat() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [user, setUser] = useState<User | undefined>(undefined);
	const [sendMessageContent, setSendMessageContent] = useState<string>("");
	const [editingMessage, setEditingMessage] = useState<Message | undefined>(
		undefined,
	);
	const bottomRef = useRef(null);

	const [errorMessages, setErrorMessages] = useState<string[][]>([]);

	const params = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const [contextMenuMessage, setContextMenuMessage] = useState<string | null>(null);
	const [showMessageInfoPopup, setShowMessageInfoPopup] = useState<Message | undefined>(undefined);

	const getMessages = async () => {
		try {
			const messages = await get_messages(params["id"]!);
			setMessages(messages);

			await listen_messages(params["id"]!, (messages: Message[]) => {
				setMessages(messages);
			},
				(reason: string) => {
					// unable to listen
					setErrorMessages((prev) => {
						const id = Date.now();
						setTimeout(() => setErrorMessages((prev) => prev.filter((msg) => msg[1] != id.toString())), 10000);
						return [...prev, [reason, id.toString()]];
					});
				});
		} catch (err: any) {
			navigate(location.pathname);
		}
	};
	const getUser = async () => {
		try {
			const user = await get_user(params["id"] || "");
			setUser(user);
		} catch (err: any) {
			if (isAxiosError(err) && err.response) {
				// erro na response
				if (!err.status || (err.status && err.status === 404)) {
					navigate("/");
				}
			}
		}
	};

	const sendMessage = async () => {
		const message_content = sendMessageContent;
		try {
			await send_message({
				content: message_content,
				receiver_id: params["id"]!,
			}, (reason: string) => {
				// unable to listen
				setErrorMessages((prev) => {
					const id = Date.now();
					setTimeout(() => setErrorMessages((prev) => prev.filter((msg) => msg[1] != id.toString())), 10000);
					return [...prev, [reason, id.toString()]];
				});
			});
			setSendMessageContent("");
		} catch (err: any) { }
	};
	const editMessage = async () => {
		try {
			await patch_message(editingMessage!.id, {
				content: sendMessageContent,
			});
			setEditingMessage(undefined);
			setSendMessageContent("");
		} catch (err: any) { }
	};

	useEffect(() => {
		getUser().then(() => {
			getMessages();
		});
	}, []);

	useEffect(() => {
		if (bottomRef.current) {
			(bottomRef.current as any).scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	useEffect(() => {
		console.log(errorMessages);
	}, [errorMessages]);

	return !user ? (
		<LoadingBar />
	) : (
		<div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center">
			<div
				className="card w-100 h-100 d-flex flex-column "
				style={{ maxHeight: "90vh", maxWidth: "800px" }}
				onMouseDown={() => setContextMenuMessage(null)}
			>
				<div
					className="card rounded-0 w-100 p-3 d-flex flex-row gap-3"
					style={{ height: "100px" }}
				>
					<img
						className="ratio-1x1 rounded-circle"
						src={get_current_host(user.profile_picture)}
						style={{
							height: "50px",
							aspectRatio: 1 / 1,
							objectFit: "cover",
						}}
						alt={`${user.name} profile picture`}
					/>
					<div className="d-flex flex-column align-items-start justify-content-start">
						<div className="fs-5 fw-bold">{user.name}</div>
						{user.username}
					</div>
				</div>
				<div
					className="card w-100 h-100 d-flex flex-column gap-3 p-4"
					style={{
						overflowY: "auto",
					}}
				>
					<div className="card-body d-flex flex-column align-items-start gap-2">
						{messages.map((msg) => (
							<MessageContainer
								key={msg.id}
								msg={msg}
								chat_id={params["id"]!}
								onEdit={() => {
									setEditingMessage(msg);
									setSendMessageContent(msg.content);
								}}
								onShowMessageInfo={(msg) => {
										console.log(msg.creation_date);
										console.log(msg.last_modified_date);
										return setShowMessageInfoPopup(msg)
									}}
								onContextMenu={() => setContextMenuMessage(msg.id)}
								showContextMenu={contextMenuMessage === msg.id}
								closeContextMenu={() => setContextMenuMessage(null)}
							/>
						))}
						<div ref={bottomRef}></div>
					</div>
				</div>
				<div className="w-100 bg-white rounded-top-0 rounded-bottom-3">
					{!editingMessage ? (
						// sending message input
						<div className="form-floating">
							<input
								className="form-control rounded-0 rounded-bottom-3"
								type="text"
								onChange={(event) => {
									setSendMessageContent(event.target.value);
								}}
								onKeyDownCapture={(event) => {
									if (event.key == "Enter") {
										sendMessage();
									}
								}}
								value={sendMessageContent}
							/>
							<label>Message</label>
						</div>
					) : (
						// editing message input
						<div className="w-100 rounded-bottom d-flex flex-row m-0">
							<div className="form-floating w-100 h-100 m-0 rounded-bottom">
								<input
									className="form-control h-100 h-100 m-0 rounded-top-0 rounded-end-0"
									type="text"
									onChange={(event) => {
										setSendMessageContent(event.target.value);
									}}
									onKeyDownCapture={(event) => {
										if (event.key == "Enter") {
											editMessage();
										}
									}}
									value={sendMessageContent}
								/>
								<label>Editing message</label>
							</div>
							<button
								className="btn btn-primary w-auto rounded-top-0 rounded-bottom-3 rounded-start-0 m-0"
								onClick={() => {
									setEditingMessage(undefined);
									setSendMessageContent("");
								}}
								style={{
									textWrap: "nowrap",
								}}
							>
								Stop editing
							</button>
						</div>
					)}
				</div>
			</div>

			{
				!(!showMessageInfoPopup) &&

				<Modal show={true}  >
					<Modal.Header>
						<Modal.Title>Informações da mensagem</Modal.Title>
						<input
							type="button"
							className="btn btn-close"
							onClick={() => setShowMessageInfoPopup(undefined)}
						/>
					</Modal.Header>
					<Modal.Body className="d-flex flex-column gap-3">
						<div>
							<h6 className="m-0">Conteúdo</h6>
							<small>{showMessageInfoPopup?.content}</small>
						</div>
						<div className="d-flex flex-row gap-1 align-items-center">
							<h6 className="m-0 me-1">Enviado por</h6>
							<p className="m-0 fw-bold">{showMessageInfoPopup?.sender_id === user.id ? user.username : "Você"}</p>
							<h6 className="m-0 mx-1">para</h6>
							<p className="m-0 fw-bold">{showMessageInfoPopup?.receiver_id === user.id ? user.username : "Você"}</p>
						</div>
						{
							showMessageInfoPopup!.creation_date < showMessageInfoPopup!.last_modified_date ? (

								<div>
									<h6 className="m-0">Modificado por ultimo</h6>
									<small>{DATETIME_FORMATTER.format(showMessageInfoPopup?.last_modified_date)}</small>
								</div>
							) : (
							<div></div>

						)}
						<div>
							<h6 className="m-0">Data de criação</h6>
							<small>{DATETIME_FORMATTER.format(showMessageInfoPopup?.creation_date)}</small>
						</div>
					</Modal.Body>
				</Modal>
			}

			<div
				className="position-absolute d-flex flex-column gap-2"
				style={{
					top: "16px",
					right: "16px"
				}}
			>
				{
					errorMessages.map((msg) => (
						<Toast key={msg[1]} bg="danger" show={true} onClose={() => setErrorMessages((prev) => prev.filter((m) => m[1] != msg[1]))}>
							<Toast.Header className="d-flex flex-row justify-content">
								<div className="h6 fw-bold m-0 me-auto">Sistema</div>
								<small>{Intl.DateTimeFormat('pt-BR', { timeStyle: "medium" }).format(parseInt(msg[1]))}</small>
							</Toast.Header>
							<Toast.Body>{msg[0]}</Toast.Body>
						</Toast>
					))
				}
			</div>
		</div>
	);
}

export default Chat;
