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
	EVENT_EMITTER,
} from "../utils/constants";
import {
	format_recording_audio_time,
	get_current_host,
	upload_files,
} from "../utils/functions/functions";
import MessageContainer from "../components/message_container";
import { Modal } from "react-bootstrap";
import MessageContextMenu from "../components/message_context_menu";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import filetypeinfo from "magic-bytes.js";

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
	const [showMessageDeletePopup, setShowMessageDeletePopup] = useState<
		Message | undefined
	>(undefined);

	const [showContextMenu, setShowContextMenu] = useState<
		[Message, PositionOffset] | undefined
	>();
	const getMessages = async () => {
		try {
			const messages = await get_messages(params["id"]!);
			setMessages(messages);

			await listen_messages(params["id"]!, (messages: Message[]) => {
				setMessages(messages);
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

		let attachments: Attachment[] = selectedAttachments.map(
			(fileAttachment) => {
				let mimetype = "text/plain";

				const blob = fileAttachment.slice(0, 1024);
				const fileReader = new FileReader();
				fileReader.onloadend = (f) => {
					if (f.target && f.target.result) {
						const bytes = new Uint8Array(
							f.target.result as ArrayBuffer,
						);
						const fileinfo = filetypeinfo(bytes)[0];
						if (fileinfo && fileinfo.mime) mimetype = fileinfo.mime;
					}
				};
				fileReader.readAsArrayBuffer(blob);

				return {
					filename: fileAttachment.name,
					mime_type: mimetype,
					byte_length: fileAttachment.size,
				};
			},
		);

		const result = await send_message({
			content: message_content,
			receiver_id: params["id"]!,
			attachments: attachments,
		});

		if (selectedAttachments.length > 0 && result.message_id) {
			upload_files(selectedAttachments, result.message_id);
		}

		setSendMessageContent("");
		setSelectedAttachments([]);
	};
	const editMessage = async () => {
		setEditingMessage(undefined);
		setSendMessageContent("");
		await patch_message(editingMessage!.id, {
			content: sendMessageContent,
		});
	};

	const [recording, setRecording] = useState<number | undefined>(undefined);

	const mediaRecorder = useRef<MediaRecorder>();
	const chunks = useRef<Blob[]>([]);
	const time_interval = useRef<NodeJS.Timeout>();
	const recordAudio = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});
			mediaRecorder.current = new MediaRecorder(stream);
			mediaRecorder.current.onstart = () => {
				time_interval.current = setInterval(
					() => setRecording((prev) => prev ? prev+1:1),
					1000,
				);
			};
			mediaRecorder.current.ondataavailable = (blob_event: BlobEvent) => {
				if (blob_event.data.size > 0)
					chunks.current.push(blob_event.data);
			};

			mediaRecorder.current.onstop = async () => {
				clearInterval(time_interval.current);
				setRecording(undefined);

				mediaRecorder.current = undefined;
				const audio_file = new File(chunks.current, "audio_record.weba", {type: "audio/webm"})
				const result = await send_message({
					content: "",
					attachments: [
						{
							filename: audio_file.name,
							byte_length: audio_file.size,
							mime_type: audio_file.type,
						},
					],
					receiver_id: params["id"]!,
				});
				if(result && result.message_id) {
					upload_files([audio_file], result.message_id);
				}

				chunks.current = [];

			};

			mediaRecorder.current.onerror = () => {
				setRecording(undefined);
			};

			mediaRecorder.current.start();
		} catch (err: any) {
			try {
				clearInterval(time_interval.current);
			} finally {
				setRecording(undefined);
			}
		}
	};

	useEffect(() => {
		getUser().then(() => {
			getMessages();
		});
		EVENT_EMITTER.on("updated-attachments", () => {
			if (bottomRef.current) {
				(bottomRef.current as any).scrollIntoView({
					behavior: "smooth",
				});
			}
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
						{messages.map((msg) => {
							return (
								<MessageContainer
									msg={msg}
									chat_id={params["id"]!}
									onContextMenu={(msg, pos_offset) =>
										setShowContextMenu([msg, pos_offset])
									}
								/>
							);
						})}
						<div ref={bottomRef}></div>
					</div>
				</div>
				<div className="w-100 bg-white rounded-top-0 rounded-bottom-3">
					{editingMessage ? (
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
					) : !Object.is(recording, undefined) ? (
						// recording audio input
						<div
							className="card w-100 rounded-0 gap-3 rounded-bottom-3 d-flex flex-row align-items-center justify-content-end"
							style={{ height: "60px" }}
						>
							<p className="m-0 p-0">
								{format_recording_audio_time(recording!)}
							</p>
							<button
								className="btn btn-primary h-100 d-flex align-items-center justify-content-center rounded-0 rounded-bottom-3 rounded-start-0"
								onClick={()=>mediaRecorder.current?.stop()}
								style={{ width: "60px" }}
							>
								<SendIcon />
							</button>
						</div>
					) : (
						// sending message input
						<div className="d-flex flex-row">
							<div className="form-floating w-100 rounded-0 rounded-end-0 rounded-start-3 rounded-top-0">
								<input
									className="form-control rounded-0 rounded-end-0 rounded-start-3 rounded-top-0"
									type="text"
									onChange={(event) => {
										setSendMessageContent(
											event.target.value,
										);
									}}
									onKeyDownCapture={(event) => {
										if (event.key == "Enter") {
											sendMessage();
										}
									}}
									value={sendMessageContent}
								/>
								<label>
									Message
									{selectedAttachments.length > 0 &&
										` + ${selectedAttachments.map((at) => at.name).join(" + ")}`}
								</label>
							</div>

							{/* upload file button */}
							<button
								className="btn btn-primary rounded-0 rounded-top-0 rounded-end"
								onClick={() =>
									(
										filePickerRef.current! as HTMLElement
									).click()
								}
							>
								<AttachFileIcon />
							</button>

							{/* record audio file button */}
							<button
								className="btn btn-primary rounded-0 rounded-top-0 rounded-end"
								onClick={() => recordAudio()}
							>
								<MicIcon />
							</button>
						</div>
					)}
				</div>
			</div>

			<input
				className="d-none"
				ref={filePickerRef}
				type="file"
				onChange={(event) =>
					setSelectedAttachments(
						event.target.files
							? Array.from(event.target.files)
							: [],
					)
				}
				multiple={true}
			/>

			{showMessageDeletePopup && (
				<Modal show={true}>
					<Modal.Header>
						<Modal.Title>Aviso!!</Modal.Title>
						<input
							type="button"
							className="btn btn-close"
							onClick={() => setShowMessageDeletePopup(undefined)}
						/>
					</Modal.Header>
					<Modal.Body>
						Você <b>realmente</b> deseja apagar esta mensagem?
					</Modal.Body>
					<Modal.Footer>
						<button
							className="btn btn-primary"
							onClick={() => setShowMessageDeletePopup(undefined)}
						>
							Cancelar
						</button>
						<button
							className="btn btn-secondary"
							onClick={() => {
								delete_message(showMessageDeletePopup.id);
								setShowMessageDeletePopup(undefined);
							}}
						>
							Confirmar
						</button>
					</Modal.Footer>
				</Modal>
			)}

			{showMessageInfoPopup && (
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
							<small className="mw-100">
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
						{showMessageInfoPopup.seen_date && (
							<div>
								<h6 className="m-0">Visualizado em</h6>
								<small>
									{DATETIME_FORMATTER.format(
										showMessageInfoPopup?.seen_date,
									)}
								</small>
							</div>
						)}
					</Modal.Body>
				</Modal>
			)}
			{showContextMenu && (
				<MessageContextMenu
					msg={showContextMenu![0]}
					chat_id={params["id"]!}
					onShowInfo={(msg) => {
						setShowMessageInfoPopup(msg);
						setShowContextMenu(undefined);
					}}
					onDelete={(msg) => {
						setShowMessageDeletePopup(msg);
						setShowContextMenu(undefined);
					}}
					onFocusExit={() => setShowContextMenu(undefined)}
					onEdit={(msg) => {
						setEditingMessage(msg);
						setSendMessageContent(msg.content);
						setShowContextMenu(undefined);
					}}
					position_offset={showContextMenu[1]}
				/>
			)}
		</div>
	);
}

export default Chat;
