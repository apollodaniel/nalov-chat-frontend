import { Message, PositionOffset } from '../utils/types';
import { SHORT_DATETIME_FORMATTER } from '../utils/constants';
import AttachmentContainer from './attachment_container';
import { LazyLoadComponent } from 'react-lazy-load-image-component';

interface IProps {
	msg: Message;
	chat_id: string;
	onContextMenu: (msg: Message, position_offset: PositionOffset) => void;
}

function MessageContainer({ msg, chat_id, onContextMenu }: IProps) {
	return (
		<LazyLoadComponent
			style={{
				alignSelf: chat_id === msg.sender_id ? 'start' : 'end',

				minHeight: '40px',
				minWidth: '150px',
				maxWidth: '100%',
			}}
		>
			<div
				className={`d-flex flex-column justify-content-center p-0 ${chat_id === msg.sender_id ? 'align-self-start' : 'align-self-end'} `}
			>
				<div
					className={`card gap-1 ${chat_id === msg.sender_id ? 'align-items-start' : 'align-items-end'}`}
					style={{
						minHeight: '50px',
					}}
					onContextMenu={(event) => {
						event.preventDefault();
						const element = event.currentTarget;
						const rect = element.getBoundingClientRect();

						const offset_top = rect.top + element.clientHeight;
						// calcs the ideal position based on window heigth and message position,
						// maxHeight: 	// if message is on left it receives left offset, but if not it receives
						// left offset minus the value of the message container + left space on chat container
						//
						// on the height it checks if it would overflow the current viewport, if yes it put a fixed value
						// if not it just let happen
						// value 135 is based on fixed value of context menu popup
						onContextMenu(msg, {
							offset_top:
								chat_id === msg.sender_id
									? offset_top
									: offset_top + 125 > window.innerHeight
										? window.innerHeight - 135
										: offset_top,
							offset_left:
								chat_id === msg.sender_id
									? rect.left
									: rect.left + rect.width - 250,
						});
					}}
				>
					{msg.attachments.map((attachment) => (
						<AttachmentContainer
							key={attachment.id!}
							attachment={attachment}
						/>
					))}
					<p
						className={`m-0 mx-3 mt-auto ${msg.last_modified_date === msg.creation_date ? (msg.attachments.length === 0 ? 'mb-auto' : 'mb-1') : 'mb-0'} ${chat_id === msg.sender_id ? 'align-self-start' : 'align-self-end'} `}
						style={{
							maxWidth: '400px',
							textAlign:
								chat_id === msg.sender_id ? 'start' : 'end',
						}}
					>
						{msg.content}
					</p>
					{msg.creation_date != msg.last_modified_date && (
						<p
							className={`m-0 mx-3 ${chat_id === msg.sender_id ? 'align-self-start' : 'align-self-end'} `}
							style={{ fontSize: '10px' }}
						>
							Edited
						</p>
					)}
				</div>

				<p
					className={`m-0 px-1 ${chat_id === msg.sender_id ? 'align-self-start' : 'align-self-end'}`}
					style={{ fontSize: '10px' }}
				>
					{SHORT_DATETIME_FORMATTER.format(msg.creation_date)}
				</p>
			</div>
		</LazyLoadComponent>
	);
}

export default MessageContainer;
