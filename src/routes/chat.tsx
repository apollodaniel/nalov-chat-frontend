import { useEffect, useRef, useState } from "react";
import { Attachment, Message, PositionOffset, User } from "../utils/types";
import LoadingBar from "../components/loading_bar";
import { get_user } from "../utils/functions/user";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import {
	delete_message,
	get_messages,
	listen_messages,
	patch_message,
	send_message,
} from "../utils/functions/chat";
import {
	DATETIME_FORMATTER,
	ON_ERROR_CALLBACK,
} from "../utils/constants";
import { get_current_host, upload_files } from "../utils/functions/functions";
import MessageContainer from "../components/message_container";
import { Modal } from "react-bootstrap";
import MessageContextMenu from "../components/message_context_menu";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import filetypeinfo from "magic-bytes.js";

async function onAction(
	event: string,
	msg: Message,
	onShowMessageInfo: (msg: Message) => void,
	onEditContextMenu?: (msg: Message) => void,
	closeContextMenu?: () => void,
) {
	if (closeContextMenu) closeContextMenu();
	switch (event) {
		case "edit":
			onEditContextMenu!(msg);
			break;
		case "delete":
			// delete message
			console.log("deleted");
			await delete_message(msg.id);
			break;
		default:
			// show message
			onShowMessageInfo(msg);
			break;
	}
}

function Chat() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [user, setUser] = useState<User | undefined>(undefined);
	const [sendMessageContent, setSendMessageContent] = useState<string>("");
	const [editingMessage, setEditingMessage] = useState<Message | undefined>(
		undefined,
	);

	const bottomRef = useRef(null);
	const filePickerRef = useRef(null);
	const [selectedAttachments, setSelectedAttachments] = useState<File[]>([]);

	const params = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const [showMessageInfoPopup, setShowMessageInfoPopup] = useState<
		Message | undefined
	>(undefined);

	const [showContextMenu, setShowContextMenu] = useState<[Message, PositionOffset] | undefined>();
	const getMessages = async () => {
		try {
			const messages = await get_messages(params["id"]!);
			setMessages(messages);

			await listen_messages(
				params["id"]!,
				(messages: Message[]) => {
					setMessages(messages);
				},
				ON_ERROR_CALLBACK,
			);
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

		let attachments: Attachment[] = selectedAttachments.map((fileAttachment)=>{
			let mimetype = "text/plain";

			const blob = fileAttachment.slice(0, 1024);
			const fileReader = new FileReader();
			fileReader.onloadend = (f) => {
				if(f.target && f.target.result){
					const bytes = new Uint8Array(f.target.result as ArrayBuffer);
					const fileinfo = filetypeinfo(bytes)[0];
					if(fileinfo && fileinfo.mime)
						mimetype = fileinfo.mime;
				}
			}
			fileReader.readAsArrayBuffer(blob);

			return {
				filename: fileAttachment.name,
				mime_type: mimetype,
				byte_length: fileAttachment.size
			};
		});

		await send_message(
			{
				content: message_content,
				receiver_id: params["id"]!,
				attachments: attachments
			},
			ON_ERROR_CALLBACK,
			(result) => {
				if (selectedAttachments.length > 0 ) {
					upload_files(selectedAttachments, result.message_id, ON_ERROR_CALLBACK);
				}

			}
		);

		setSendMessageContent("");
		setSelectedAttachments([]);
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


	return !user ? (
		<LoadingBar />
	) : (
		<div
			className="w-100 h-100 d-flex flex-column align-items-center justify-content-center"

			onMouseDown={() => setShowContextMenu(undefined)}
		>
			<div
				className="card w-100 h-100 d-flex flex-column "
				style={{ maxHeight: "90vh", maxWidth: "800px" }}
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
								onContextMenu={(msg, pos_offset) => setShowContextMenu([msg, pos_offset])}
							/>
						))}
						<div ref={bottomRef}></div>
					</div>
				</div>
				<div className="w-100 bg-white rounded-top-0 rounded-bottom-3">
					{!editingMessage ? (
						// sending message input
						<div className="d-flex flex-row">
							<div className="form-floating w-100 rounded-0 rounded-end-0 rounded-start-3 rounded-top-0">
								<input
									className="form-control rounded-0 rounded-end-0 rounded-start-3 rounded-top-0"
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
								<label>Message{selectedAttachments.length > 0 && ` + ${selectedAttachments.map((at)=>at.name).join(" + ")}`}</label>
							</div>

							{ /* upload file button */}
							<button
								className="btn btn-primary rounded-0 rounded-top-0 rounded-end"
								onClick={() => (filePickerRef.current! as HTMLElement).click()}
							> <AttachFileIcon /> </button>

						</div>
					) : (
						// editing message input
						<div className="w-100 rounded-bottom d-flex flex-row m-0">
							<div className="form-floating w-100 h-100 m-0 rounded-bottom">
								<input
									className="form-control h-100 h-100 m-0 rounded-top-0 rounded-end-0"
									type="text"
									onChange={(event) => {
										setSendMessageContent(
											event.target.value,
										);
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

			<input
				className="d-none"
				ref={filePickerRef}
				type="file"
				onChange={
					(event) => setSelectedAttachments(event.target.files ? Array.from(event.target.files) : [])
				} multiple={true} />

			{!!showMessageInfoPopup && (
				<Modal show={true}>
					<Modal.Header>
						<Modal.Title>Informações da mensagem</Modal.Title>
						<input
							type="button"
							className="btn btn-close"
							onClick={() => setShowMessageInfoPopup(undefined)}
						/>
					</Modal.Header>
					<Modal.Body
						className="d-flex flex-column gap-3 text-nowrap overflow-hidden"
						style={{
							overflow: "hidden",
							whiteSpace: "nowrap",
						}}
					>
						<div
							className="mw-100 text-nowrap"
							style={{
								overflow: "hidden",
								whiteSpace: "nowrap",
								textOverflow: "ellipsis",
							}}
						>
							<h6 className="m-0">Conteúdo</h6>
							<small
								className="mw-100"
							>
								{showMessageInfoPopup?.content}
							</small>
						</div>
						<div className="d-flex flex-row gap-1 align-items-center">
							<h6 className="m-0 me-1">Enviado por</h6>
							<p className="m-0 fw-bold">
								{showMessageInfoPopup?.sender_id === user.id
									? user.username
									: "Você"}
							</p>
							<h6 className="m-0 mx-1">para</h6>
							<p className="m-0 fw-bold">
								{showMessageInfoPopup?.receiver_id === user.id
									? user.username
									: "Você"}
							</p>
						</div>
						{showMessageInfoPopup!.creation_date <
							showMessageInfoPopup!.last_modified_date ? (
							<div>
								<h6 className="m-0">Modificado por ultimo</h6>
								<small>
									{DATETIME_FORMATTER.format(
										showMessageInfoPopup?.last_modified_date,
									)}
								</small>
							</div>
						) : (
							<div></div>
						)}
						<div>
							<h6 className="m-0">Data de criação</h6>
							<small>
								{DATETIME_FORMATTER.format(
									showMessageInfoPopup?.creation_date,
								)}
							</small>
						</div>
						{showMessageInfoPopup.seen_date && <div>
							<h6 className="m-0">Visualizado em</h6>
							<small>
								{DATETIME_FORMATTER.format(
									showMessageInfoPopup?.seen_date,
								)}
							</small>
						</div>}
					</Modal.Body>
				</Modal>
			)}
			{
				showContextMenu &&
				<MessageContextMenu
					msg={showContextMenu![0]}
					chat_id={params["id"]!}
					onAction={(_event: any, _msg: any, _onEditContextMenu: any) =>
						onAction(
							_event,
							_msg,
							(msg: any) => {
								console.log(msg.creation_date);
								console.log(msg.last_modified_date);
								return setShowMessageInfoPopup(msg);
							},
							_onEditContextMenu,
							() => setShowContextMenu(undefined),
						)
					}
					onFocusExit={() => setShowContextMenu(undefined)}
					onEdit={() => {
						setEditingMessage(showContextMenu[0]);
						setSendMessageContent(showContextMenu[0].content);
					}}
					position_offset={showContextMenu[1]}
				/>
			}
		</div>
	);
}

export default Chat;
