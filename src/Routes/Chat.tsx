import { useEffect, useRef, useState } from 'react';
import { Message, User } from '../Utils/Types';
import LoadingBar from '../Components/LoadingBar';
import { getUser } from '../Utils/Functions/User';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import {
	deleteMessage,
	getMessages,
	listenMessages,
	patchMessage,
	sendMessage,
} from '../Utils/Functions/Chat';
import {
	AllErrors,
	DATETIME_FORMATTER,
	EVENT_EMITTER,
	EVENT_ERROR_EMITTER,
} from '../Utils/Constants';
import {
	convertAudio,
	getCurrentHost,
	uploadFiles,
} from '../Utils/Functions/Functions';
import MessageContainer from '../Components/MessageContainer';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	User as UserWrapper,
} from '@nextui-org/react';
import NormalMessageInput from '../Components/MessageInput/Normal';
import RecordAudioInput from '../Components/MessageInput/RecordAudio';
import EditMessageInput from '../Components/MessageInput/Edit';
import AttachmentDownloadPopup from '../Components/AttachmentDownload';

function Chat() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [user, setUser] = useState<User | undefined>(undefined);
	const [sendMessageContent, setSendMessageContent] = useState<string>('');
	const [editingMessage, setEditingMessage] = useState<Message | undefined>(
		undefined,
	);

	const [showBottomArrowButton, setShowBottomArrowButton] = useState(false);

	const bottomRef = useRef<HTMLDivElement>(null);
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
	const [
		showMessageAttachmentDownloadPopup,
		setShowMessageAttachmentDownloadPopup,
	] = useState<Message | undefined>(undefined);

	const getChatMessages = async () => {
		try {
			const messages = await getMessages(params['id']!);
			setMessages(messages);

			await listenMessages(params['id']!, (messages: Message[]) => {
				setMessages(messages);
			});
		} catch (err: any) {
			navigate(location.pathname);
		}
	};
	const getChatUser = async () => {
		try {
			const user = await getUser(params['id'] || '');
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

	const sendChatMessage = async () => {
		const message_content = sendMessageContent;

		let attachments: File[] = Array.from(selectedAttachments);

		const result = await sendMessage({
			content: message_content,
			receiverId: params['id']!,
			attachments: attachments.map((fileAttachment) => {
				let mimetype = 'text/plain';

				return {
					filename: fileAttachment.name,
					mimeType: mimetype,
					byteLength: fileAttachment.size,
				};
			}),
		});

		if (attachments.length > 0 && result.id) {
			console.log('Sending attachments');
			uploadFiles(attachments, result.id);
		}

		setSendMessageContent('');
		setSelectedAttachments([]);
	};
	const sendEditedMessage = async () => {
		setEditingMessage(undefined);
		setSendMessageContent('');
		await patchMessage(editingMessage!.id, {
			content: sendMessageContent,
		});
	};

	const [recording, setRecording] = useState<number | undefined>(undefined);

	const mediaRecorder = useRef<MediaRecorder>();
	const cancelAudio = useRef(false);
	const chunks = useRef<Blob[]>([]);
	const time_interval = useRef<NodeJS.Timeout>();
	//const recordedAudioMimeType = useRef<string | undefined>(undefined);
	const recordAudio = async () => {
		const mimeType = 'audio/wav';
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
				//if (!recordedAudioMimeType.current) {
				//	recordedAudioMimeType.current = blob_event.data.type;
				//}
				chunks.current.push(blob_event.data);
			};

			mediaRecorder.current.onstop = async () => {
				clearInterval(time_interval.current);
				setRecording(undefined);

				if (cancelAudio.current) {
					chunks.current = [];
					cancelAudio.current = false;
					//recordedAudioMimeType.current = undefined;
					mediaRecorder.current = undefined;
					return;
				}

				let audio_file = new File(
					chunks.current,
					`${new Date(Date.now()).toLocaleDateString(navigator.languages[0])}.weba`,
					{
						type: mediaRecorder.current?.mimeType,
					},
				);
				convertAudio(
					audio_file,
					async (file) => {
						const result = await sendMessage({
							content: '',
							attachments: [
								{
									filename: file.name,
									byteLength: file.size,
									mimeType: file.type,
								},
							],
							receiverId: params['id']!,
						});

						if (result && result.id) {
							await uploadFiles([file], result.id);
						}
					},

					() => {
						EVENT_ERROR_EMITTER.emit(
							'add-error',
							AllErrors['CANNOT_SEND_AUDIO_ERROR'].message.ptBr,
						);
					},
				);

				chunks.current = [];
				//recordedAudioMimeType.current = undefined;
				mediaRecorder.current = undefined;
			};

			mediaRecorder.current.onerror = () => {
				setRecording(undefined);
			};

			mediaRecorder.current.start();
		} catch (err: any) {
			console.log(err.message);
			try {
				clearInterval(time_interval.current);
			} finally {
				setRecording(undefined);
			}
		}
	};

	const firstTime = useRef(true);
	useEffect(() => {
		getChatUser().then(() => {
			getChatMessages().then(() => {
				setTimeout(() => {
					if (bottomRef.current) {
						(bottomRef.current as any).scrollIntoView({
							behavior: 'smooth',
						});
					}
					firstTime.current = false;
				}, 500);
			});
		});
		EVENT_EMITTER.on('updated-attachments', () => {
			bottomRef.current?.scrollIntoView({
				behavior: 'smooth',
			});
		});
	}, []);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({
			behavior: 'smooth',
		});
	}, [messages]);

	return !user ? (
		<LoadingBar />
	) : (
		<div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center">
			<div
				className="w-100 h-100 flex flex-col gap-3"
				style={{ maxHeight: '90vh', maxWidth: '800px' }}
			>
				<div className="rounded-0 w-100 flex flex-row gap-5 max-sm:gap-2 max-h-[100px] items-center justify-start rounded-top-3">
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
						className="h-full m-0"
						avatarProps={{
							src: getCurrentHost(user.profilePicture),
							alt: `${user.name} profile picture`,
							className:
								'h-[70px] aspect-square max-sm:h-[50px] w-auto m-0',
						}}
						name={user.name}
						description={user.username}
						classNames={{
							name: 'text-xl max-sm:text-medium m-0',
							description: 'text-sm max-sm:text-xs m-0',
						}}
					/>
				</div>
				<div className="w-full h-full rounded-2xl border bg-background bg-opacity-25 overflow-hidden chat-container">
					<div
						className="h-full w-full flex flex-col-reverse chat-scrollable-container"
						style={{
							overflowY: 'auto',
						}}
						onScroll={(event) => {
							if (Math.abs(event.currentTarget.scrollTop) > 500)
								setShowBottomArrowButton(true);
							else setShowBottomArrowButton(false);
						}}
					>
						<div className="flex flex-col gap-2 p-4 ">
							{[
								...messages.map((msg) => {
									return (
										<MessageContainer
											key={msg.id}
											msg={msg}
											chatId={params['id']!}
											onShowInfo={(msg) => {
												setShowMessageInfoPopup(msg);
											}}
											onDelete={(msg) => {
												setShowMessageDeletePopup(msg);
											}}
											onDownloadAttachment={(msg) => {
												setShowMessageAttachmentDownloadPopup(
													msg,
												);
											}}
											onEdit={(msg) => {
												setEditingMessage(msg);
												setSendMessageContent(
													msg.content,
												);
											}}
										/>
									);
								}),

								<div
									key="bottom-ref"
									className="h-[8px] w-full"
									ref={bottomRef}
								></div>,
							]}
						</div>
					</div>
				</div>
				{showBottomArrowButton && (
					<Button
						className="absolute size-[60px] left-0 right-0 mx-auto rounded-full z-50 "
						color="default"
						variant="solid"
						style={{
							bottom: '20%',
						}}
						onClick={() => {
							(bottomRef.current as any).scrollIntoView({
								behavior: 'smooth',
							});
						}}
						isIconOnly
					>
						<ArrowDownwardIcon />
					</Button>
				)}
				<div className="w-full">
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
							sendMessage={sendChatMessage}
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

			<Modal
				isOpen={!!showMessageDeletePopup}
				onOpenChange={(open) =>
					setShowMessageDeletePopup(
						open ? showMessageDeletePopup : undefined,
					)
				}
				className="dark"
			>
				<ModalContent>
					<ModalHeader>
						<h1>Aviso!</h1>
					</ModalHeader>
					<ModalBody className="inline">
						Você <b>realmente</b> deseja apagar esta mensagem?
					</ModalBody>
					{showMessageDeletePopup && (
						<ModalFooter>
							<Button
								color="default"
								onClick={() =>
									setShowMessageDeletePopup(undefined)
								}
							>
								Cancelar
							</Button>
							<div></div>
							<Button
								color="danger"
								onClick={() => {
									deleteMessage(showMessageDeletePopup!.id);
									setShowMessageDeletePopup(undefined);
								}}
							>
								Confirmar
							</Button>
						</ModalFooter>
					)}
				</ModalContent>
			</Modal>

			<AttachmentDownloadPopup
				attachments={
					showMessageAttachmentDownloadPopup
						? showMessageAttachmentDownloadPopup.attachments
						: []
				}
				isOpen={
					!Object.is(showMessageAttachmentDownloadPopup, undefined)
				}
				onOpenChange={(open) =>
					!open && setShowMessageAttachmentDownloadPopup(undefined)
				}
			/>
			<Modal
				isOpen={!!showMessageInfoPopup}
				className="dark"
				onOpenChange={(open) =>
					setShowMessageInfoPopup(
						open ? showMessageInfoPopup : undefined,
					)
				}
			>
				<ModalContent>
					<ModalHeader>
						<h2>informações da mensagem</h2>
					</ModalHeader>

					{showMessageInfoPopup && (
						<ModalBody
							className="flex flex-col gap-3 text-nowrap overflow-hidden"
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
								<h5 className="m-0">Conteúdo</h5>
								<small className="mw-100">
									{showMessageInfoPopup?.content.length == 0
										? 'Sem conteúdo'
										: showMessageInfoPopup?.content}
								</small>
								<h5 className="m-0">Arquivos</h5>
								<small className="mw-100">
									{showMessageInfoPopup!.attachments.length ==
									0
										? 'Nenhum anexo enviado'
										: showMessageInfoPopup?.attachments
												.map((at) => at.filename)
												.join(', ')}
								</small>
							</div>
							<div className="d-flex flex-row gap-1 align-items-center">
								<h6 className="m-0 me-1">
									Enviado{' '}
									{showMessageInfoPopup!.senderId != user.id
										? 'para'
										: 'por'}{' '}
									{user.username}
								</h6>
							</div>
							{showMessageInfoPopup!.creationDate <
							showMessageInfoPopup!.lastModifiedDate ? (
								<div>
									<h6 className="m-0">
										Modificado por ultimo
									</h6>
									<small>
										{DATETIME_FORMATTER.format(
											showMessageInfoPopup?.lastModifiedDate,
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
										showMessageInfoPopup?.creationDate,
									)}
								</small>
							</div>
							{showMessageInfoPopup!.seenDate && (
								<div>
									<h6 className="m-0">Visualizado em</h6>
									<small>
										{DATETIME_FORMATTER.format(
											showMessageInfoPopup?.seenDate,
										)}
									</small>
								</div>
							)}
						</ModalBody>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
}

export default Chat;
