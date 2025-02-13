import { Message, PositionOffset } from '../Utils/Types';
import { SHORT_DATETIME_FORMATTER } from '../Utils/Constants';
import AttachmentContainer from './AttachmentContainer';
import { LazyLoadComponent } from 'react-lazy-load-image-component';
import {
	Card,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Skeleton,
} from '@nextui-org/react';
import { useRef, useState } from 'react';
import { getOffsetTop } from '@mui/material';
import AttachmentGroup from './AttachmentGroup';

interface IProps {
	msg: Message;
	chatId: string;
	onEdit: (msg: Message) => void;
	onDelete: (msg: Message) => void;
	onShowInfo: (msg: Message) => void;
	onDownloadAttachment: (msg: Message) => void;
}

function MessageContainer({
	msg,
	chatId: chatId,
	onEdit,
	onDelete,
	onShowInfo,
	onDownloadAttachment,
}: IProps) {
	const [contextMenuOpened, setContextMenuOpened] = useState(false);

	const messageRef = useRef<HTMLDivElement>(null);
	const isCompactedView =
		msg.attachments.filter(
			(att) =>
				att.mimeType.startsWith('video') ||
				att.mimeType.startsWith('image'),
		).length > 3;
	return (
		<LazyLoadComponent
			style={{
				alignSelf: chatId === msg.senderId ? 'start' : 'end',
				minHeight: '40px',
				minWidth: '150px',
				maxWidth: '100%',
			}}
		>
			<Dropdown
				className="dark"
				backdrop="blur"
				isOpen={contextMenuOpened}
				onClick={() => setContextMenuOpened(false)}
			>
				<DropdownTrigger>
					<div
						className={`flex flex-column justify-center max-w-[80%] max-md:max-w-full h-auto p-0 ${chatId === msg.senderId ? 'self-start' : 'self-end'} `}
					>
						<Card
							className={`min-h-[48px] max-w-full  ${chatId === msg.senderId ? 'align-items-start' : 'align-items-end'}`}
							ref={messageRef}
							onContextMenu={(event) => {
								event.preventDefault();

								if (messageRef.current) {
									console.log(messageRef.current.offsetTop);
									console.log(
										Math.floor(
											messageRef.current.offsetTop +
												messageRef.current.getBoundingClientRect()
													.height /
													2,
										),
									);
									const messageElementSize =
										messageRef.current.getBoundingClientRect()
											.height;
									const elementPos =
										messageElementSize +
										messageRef.current.offsetTop;
									const scrollableContainer =
										document.getElementsByClassName(
											'chat-scrollable-container',
										)[0];
									const chatContainer =
										document.getElementsByClassName(
											'chat-container',
										)[0];
									scrollableContainer.scrollTo({
										behavior: 'instant',
										top:
											Math.floor(elementPos) -
											chatContainer.getBoundingClientRect()
												.height /
												2,
									});
									setContextMenuOpened(true);
								}
							}}
						>
							<div className={`flex flex-col gap-2 p-2`}>
								{isCompactedView && (
									<AttachmentGroup
										attachments={msg.attachments.filter(
											(att) =>
												att.mimeType.startsWith(
													'video',
												) ||
												att.mimeType.startsWith(
													'image',
												) ||
												att.mimeType.startsWith(
													'application/pdf',
												),
										)}
									/>
								)}
								{isCompactedView
									? msg.attachments
											.filter(
												(att) =>
													!att.mimeType.startsWith(
														'video',
													) &&
													!att.mimeType.startsWith(
														'image',
													) &&
													!att.mimeType.startsWith(
														'application/pdf',
													),
											)
											.map((attachment) => (
												<AttachmentContainer
													key={attachment.id!}
													attachment={attachment}
												/>
											))
									: msg.attachments
											.sort((att) => {
												if (
													att.mimeType.startsWith(
														'video',
													) ||
													att.mimeType.startsWith(
														'image',
													) ||
													att.mimeType.startsWith(
														'application/pdf',
													)
												) {
													return -1;
												}
												return 1;
											})
											.map((attachment) => (
												<AttachmentContainer
													key={attachment.id!}
													attachment={attachment}
												/>
											))}
							</div>
							<p
								className={`m-0 max-w-full h-full px-3 ${msg.lastModifiedDate === msg.creationDate ? 'pb-3' : 'pb-0'} ${chatId === msg.senderId ? 'align-self-start' : 'align-self-end'} `}
								style={{
									textAlign:
										chatId === msg.senderId
											? 'start'
											: 'end',
									overflowWrap: 'break-word',
								}}
							>
								{msg.content}
							</p>
							{msg.creationDate != msg.lastModifiedDate && (
								<p
									className={`m-0 mx-3 text-[13px]  ${chatId === msg.senderId ? 'align-self-start' : 'align-self-end'} mb-1 `}
								>
									Edited
								</p>
							)}
						</Card>

						<p
							className={`m-0 mx-3 text-[12px] max-lg:text-[10px] ${chatId === msg.senderId ? 'align-self-start' : 'align-self-end'}`}
						>
							{SHORT_DATETIME_FORMATTER.format(msg.creationDate)}
						</p>
					</div>
				</DropdownTrigger>
				<DropdownMenu
					aria-label="Message Actions"
					onAction={(key) => {
						switch (key) {
							case 'edit':
								onEdit(msg);
								break;
							case 'delete':
								onDelete(msg);
								break;
							case 'info':
								onShowInfo(msg);
								break;
							case 'download':
								onDownloadAttachment(msg);
								break;
						}
						setContextMenuOpened(false);
					}}
				>
					<DropdownItem
						key="edit"
						isDisabled={msg.senderId == chatId}
					>
						Editar mensagem
					</DropdownItem>
					<DropdownItem key="info">Mais informações</DropdownItem>
					<DropdownItem
						key="download"
						isDisabled={msg.attachments.length == 0}
					>
						Baixar anexos
					</DropdownItem>
					<DropdownItem
						key="delete"
						isDisabled={msg.senderId == chatId}
						className="text-danger"
						color="danger"
					>
						Deletar mensagem
					</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		</LazyLoadComponent>
	);
}

export default MessageContainer;
