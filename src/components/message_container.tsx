import { Message, PositionOffset } from '../utils/types';
import { SHORT_DATETIME_FORMATTER } from '../utils/constants';
import AttachmentContainer from './attachment_container';
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

interface IProps {
	msg: Message;
	chat_id: string;
	onEdit: (msg: Message) => void;
	onDelete: (msg: Message) => void;
	onShowInfo: (msg: Message) => void;
}

function MessageContainer({
	msg,
	chat_id,
	onEdit,
	onDelete,
	onShowInfo,
}: IProps) {
	const [contextMenuOpened, setContextMenuOpened] = useState(false);

	const messageRef = useRef(null);
	return (
		<LazyLoadComponent
			style={{
				alignSelf: chat_id === msg.sender_id ? 'start' : 'end',

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
						className={`flex flex-column justify-center max-w-[80%] max-md:max-w-full h-auto p-0 ${chat_id === msg.sender_id ? 'self-start' : 'self-end'} `}
					>
						<Card
							className={`gap-1 min-h-[50px] px-3  max-w-full ${chat_id === msg.sender_id ? 'align-items-start' : 'align-items-end'}`}
							onContextMenu={(event) => {
								event.preventDefault();

								if (messageRef.current) {
									(
										messageRef.current as Element
									).scrollIntoView({ behavior: 'instant' });
									setContextMenuOpened(true);
								}
							}}
						>
							<div className="flex flex-col gap-2">
								{msg.attachments.map((attachment) => (
									<AttachmentContainer
										key={attachment.id!}
										attachment={attachment}
									/>
								))}
							</div>
							<p
								className={`m-0 max-w-full h-auto mt-auto ${msg.last_modified_date === msg.creation_date ? (msg.attachments.length === 0 ? 'mb-auto' : 'mb-1') : 'mb-0'} ${chat_id === msg.sender_id ? 'align-self-start' : 'align-self-end'} `}
								style={{
									textAlign:
										chat_id === msg.sender_id
											? 'start'
											: 'end',
									overflowWrap: 'break-word',
								}}
							>
								{msg.content}
							</p>
							{msg.creation_date != msg.last_modified_date && (
								<p
									className={`m-0 mx-1 text-[13px] ${chat_id === msg.sender_id ? 'align-self-start' : 'align-self-end'} `}
								>
									Edited
								</p>
							)}
						</Card>

						<p
							className={`m-0 mx-3 text-[12px] max-lg:text-[10px] ${chat_id === msg.sender_id ? 'align-self-start' : 'align-self-end'}`}
						>
							{SHORT_DATETIME_FORMATTER.format(msg.creation_date)}
						</p>
						<div ref={messageRef}></div>
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
						}
						setContextMenuOpened(false);
					}}
				>
					<DropdownItem key="edit">Editar mensagem</DropdownItem>
					<DropdownItem key="info">Mais informações</DropdownItem>
					<DropdownItem
						key="delete"
						isDisabled={msg.sender_id == chat_id}
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
