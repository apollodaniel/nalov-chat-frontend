import { Message } from "../utils/types";

interface IProps {
	msg: Message;
	chat_id: string;
	visible: boolean;
	onFocusExit: () => void;
	onAction: (event: string, msg: Message, onEdit?: (msg: Message) => void) => void;
	onEdit: (msg: Message) => void;
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
	visible,
	onFocusExit,
	onAction,
	onEdit
}: IProps) {
	return (
		<ul
			className={`card position-absolute list-group ${visible ? "d-block" : "d-none"}`} // ${chat_id === msg.sender_id ? "align-self-start mx-3" : "align-self-end mx-3"}`}
			onBlur={() => onFocusExit()}
			onMouseDown={(event) => {
				event.preventDefault();
				event.stopPropagation();
			}}
			style={
				chat_id !== msg.sender_id
					? {
						minWidth: "120px",

						zIndex: "10",
						right: "40px",
					}
					: {
						minWidth: "120px",

						zIndex: "10",
						left: "40px",
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
