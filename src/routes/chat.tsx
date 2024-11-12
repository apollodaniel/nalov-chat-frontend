import { useEffect, useRef, useState } from 'react';
import { Message, User } from '../utils/types';
import LoadingBar from '../components/loading_bar';
import { get_user } from '../utils/functions/user';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import {
	delete_message,
	get_messages,
	listen_messages,
	patch_message,
	send_message,
} from '../utils/functions/chat';
import { DATETIME_FORMATTER, EVENT_EMITTER } from '../utils/constants';
import { get_current_host, upload_files } from '../utils/functions/functions';
import MessageContainer from '../components/message_container';
import { Modal } from 'react-bootstrap';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button, User as UserWrapper } from '@nextui-org/react';
import NormalMessageInput from '../components/message_input/normal';
import RecordAudioInput from '../components/message_input/record_audio';
import EditMessageInput from '../components/message_input/edit';

function Chat() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [user, setUser] = useState<User | undefined>(undefined);
	const [sendMessageContent, setSendMessageContent] = useState<string>('');
	const [editingMessage, setEditingMessage] = useState<Message | undefined>(
		undefined,
	);

	const [showBottomArrowButton, setShowBottomArrowButton] = useState(false);

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

	const getMessages = async () => {
		try {
			const messages = await get_messages(params['id']!);
			setMessages(messages);

			await listen_messages(params['id']!, (messages: Message[]) => {
				setMessages(messages);
			});
		} catch (err: any) {
			navigate(location.pathname);
		}
	};
	const getUser = async () => {
		try {
			const user = await get_user(params['id'] || '');
			setUser(user);
		} catch (err: any) {
			if (isAxiosError(err) && err.response) {
				// erro na response
				if (!err.status || (err.status && err.status === 404)) {
					navigate('/');
				}
			}
		}
	};

	const sendMessage = async () => {
		const message_content = sendMessageContent;

		let attachments: File[] = Array.from(selectedAttachments);

		const result = await send_message({
			content: message_content,
			receiver_id: params['id']!,
			attachments: attachments.map((fileAttachment) => {
				let mimetype = 'text/plain';

				return {
					filename: fileAttachment.name,
					mime_type: mimetype,
					byte_length: fileAttachment.size,
				};
			}),
		});

		if (attachments.length > 0 && result.message_id) {
			upload_files(attachments, result.message_id);
		}

		setSendMessageContent('');
		setSelectedAttachments([]);
	};
	const sendEditedMessage = async () => {
		setEditingMessage(undefined);
		setSendMessageContent('');
		await patch_message(editingMessage!.id, {
			content: sendMessageContent,
		});
	};

	const [recording, setRecording] = useState<number | undefined>(undefined);

	const mediaRecorder = useRef<MediaRecorder>();
	const cancelAudio = useRef(false);
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
					() => setRecording((prev) => (prev ? prev + 1 : 1)),
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

				if (cancelAudio.current) {
					chunks.current = [];
					cancelAudio.current = false;
					return;
				}

				const audio_file = new File(
					chunks.current,
					'audio_record.weba',
					{
						type: 'audio/webm',
					},
				);
				const result = await send_message({
					content: '',
					attachments: [
						{
							filename: audio_file.name,
							byte_length: audio_file.size,
							mime_type: audio_file.type,
						},
					],
					receiver_id: params['id']!,
				});

				if (result && result.message_id) {
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
		EVENT_EMITTER.on('updated-attachments', () => {
			if (bottomRef.current) {
				(bottomRef.current as any).scrollIntoView({
					behavior: 'smooth',
				});
			}
		});
	}, []);

	useEffect(() => {
		if (bottomRef.current) {
			(bottomRef.current as any).scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages]);

	return !user ? (
		<LoadingBar />
	) : (
		<div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center">
			<div
				className="w-100 h-100 d-flex flex-column "
				style={{ maxHeight: '90vh', maxWidth: '800px' }}
			>
				<div
					className="rounded-0 w-100 p-3 flex flex-row gap-5 items-center justify-start rounded-top-3"
					style={{ height: '100px' }}
				>
					<Button
						className="flex items-center justify-center"
						style={{ height: '50px', width: '50px' }}
						onClick={() => navigate('/')}
						isIconOnly
						variant="ghost"
					>
						<ArrowBackIcon />
					</Button>
					<UserWrapper
						className="h-full"
						avatarProps={{
							src: get_current_host(user.profile_picture),
							alt: `${user.name} profile picture`,
							className: 'h-full w-auto my-1 me-2',
						}}
						name={user.name}
						description={user.username}
						classNames={{
							name: 'text-xl',
							description: 'text-sm',
						}}
					/>
				</div>
				<div
					className="w-full h-full flex flex-col-reverse gap-3 p-4 rounded-2xl border bg-background bg-opacity-25"
					style={{
						overflowY: 'auto',
					}}
					onScroll={(event) => {
						console.log(event.currentTarget.scrollTop);
						if (Math.abs(event.currentTarget.scrollTop) > 700)
							setShowBottomArrowButton(true);
						else setShowBottomArrowButton(false);
					}}
				>
					<div className="card-body d-flex flex-column gap-2">
						{messages.map((msg) => {
							return (
								<MessageContainer
									msg={msg}
									chat_id={params['id']!}
									onShowInfo={(msg) => {
										setShowMessageInfoPopup(msg);
									}}
									onDelete={(msg) => {
										setShowMessageDeletePopup(msg);
									}}
									onEdit={(msg) => {
										setEditingMessage(msg);
										setSendMessageContent(msg.content);
									}}
								/>
							);
						})}
						<div ref={bottomRef}></div>
					</div>
				</div>
				{showBottomArrowButton && (
					<button
						className="btn btn-primary position-absolute rounded-circle d-flex flex-column justify-content-center align-items-center"
						style={{
							width: '60px',
							height: '60px',
							right: '50%',
							bottom: '20%',
							zIndex: '10',
						}}
						onClick={() => {
							(bottomRef.current as any).scrollIntoView({
								behavior: 'smooth',
							});
						}}
					>
						<ArrowDownwardIcon />
					</button>
				)}
				<div className="w-100 rounded-3">
					{editingMessage ? (
						// editing message input
						<EditMessageInput
							inputMessageContent={sendMessageContent}
							setInputMessageContent={setSendMessageContent}
							setEditingMessage={setEditingMessage}
							sendEditedMessage={sendEditedMessage}
						/>
					) : !Object.is(recording, undefined) ? (
						// recording audio input
						<RecordAudioInput
							onCancelRecording={() => {
								cancelAudio.current = true;
								mediaRecorder.current?.stop();
							}}
							onFinishRecording={() => {
								// sucess
								cancelAudio.current = false;
								mediaRecorder.current?.stop();
							}}
							recordingTime={recording!}
						/>
					) : (
						// sending message input
						<NormalMessageInput
							recordAudio={recordAudio}
							filePicker={filePickerRef.current! as HTMLElement}
							inputMessageContent={sendMessageContent}
							setInputMessageContent={setSendMessageContent}
							sendMessage={sendMessage}
							selectedAttachments={selectedAttachments}
							setSelectedAttachments={setSelectedAttachments}
						/>
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
							overflow: 'hidden',
							whiteSpace: 'nowrap',
						}}
					>
						<div
							className="mw-100 text-nowrap"
							style={{
								overflow: 'hidden',
								whiteSpace: 'nowrap',
								textOverflow: 'ellipsis',
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
									: 'Você'}
							</p>
							<h6 className="m-0 mx-1">para</h6>
							<p className="m-0 fw-bold">
								{showMessageInfoPopup?.receiver_id === user.id
									? user.username
									: 'Você'}
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
		</div>
	);
}

export default Chat;
