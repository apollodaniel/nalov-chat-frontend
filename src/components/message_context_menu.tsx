import { MutableRefObject, useEffect, useRef } from "react";
import { Message, PositionOffset } from "../utils/types";

interface IProps {
	msg: Message;
	chat_id: string;
	onFocusExit: () => void;
	onAction: (event: string, msg: Message, onEdit?: (msg: Message) => void) => void;
	onEdit: (msg: Message) => void;
	position_offset?: PositionOffset
}

interface ContextMenuItemProps {
	name: string;
	event_callback: () => void;
}

function ContextMenuItem({ name, event_callback }: ContextMenuItemProps) {
	return (
		<li
			className="list-group-item list-group-item-action rounded-bottom-0"
			style={{
				cursor: "pointer"
			}}
			onClick={() => event_callback()}
		>
			{name}
		</li>
	);
}

function MessageContextMenu({
	msg,
	chat_id,
	onFocusExit,
	onAction,
	onEdit,
	position_offset
}: IProps) {
	return (
		<ul
			className="card  w-100 position-absolute list-group" // ${chat_id === msg.sender_id ? "align-self-start mx-3" : "align-self-end mx-3"}`}
			onBlur={() => onFocusExit()}
			onMouseDown={(event) => {
				event.preventDefault();
				event.stopPropagation();
			}}
			style={

				{
					maxWidth: "250px",
					zIndex: "10",
					top: `${position_offset?.offset_top || 0}px`,
					left: `${position_offset?.offset_left|| 0}px`
				}
			}
		>
			{msg.sender_id != chat_id && (
				<div>
					<ContextMenuItem
						name="Edit"
						event_callback={() => onAction("edit", msg, onEdit)}
					/>
					<ContextMenuItem
						name="Delete"
						event_callback={() => onAction("delete", msg)}
					/>
				</div>
			)}
			<ContextMenuItem
				name="Show message information"
				event_callback={() => onAction("show", msg)}
			/>
		</ul>
	);
}

export default MessageContextMenu;
