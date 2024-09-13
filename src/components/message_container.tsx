import "react";
import { Message } from "../utils/types";
import { EVENT_EMITTER, SHORT_DATETIME_FORMATTER } from "../utils/constants";
import MessageContextMenu from "./message_context_menu";
import { delete_message } from "../utils/functions/chat";

interface IProps {
	showContextMenu: boolean;
	msg: Message;
	chat_id: string;
	onEdit: (msg: Message)=>void;
	onContextMenu: () => void;
	closeContextMenu?: () => void;
}

async function onAction(event: string, msg: Message, onEdit?: (msg: Message)=>void, closeContextMenu?: ()=>void){

	EVENT_EMITTER.emit('close-context-menu');

	if(closeContextMenu)
		closeContextMenu();
	switch(event){
		case "edit":
			onEdit!(msg);
			break;
		case "delete":
			// delete message
			console.log("deleted");
			await delete_message(msg.id);
			break;
		default:
			// show message info
			break;
	}
}

function MessageContainer({ msg, chat_id, onEdit, onContextMenu, showContextMenu, closeContextMenu}: IProps) {

	return (
		<div className={`w-100 d-flex flex-column`}>
			<div
				className={`card d-flex flex-column justify-content-between p-0 px-3 py-3 gap-1 ${chat_id === msg.sender_id ? "align-self-start" : "align-self-end"}`}
				style={{
					minHeight: "50px",
					minWidth: "150px",
					maxWidth: "100%",
				}}
				onContextMenu={(event) => {
					event.preventDefault();
					onContextMenu();
				}}
			>
				{msg.content}
				<p className="m-0 align-self-end" style={{ fontSize: "10px" }}>
					{SHORT_DATETIME_FORMATTER.format(msg.creation_date)}
				</p>
			</div>

			<MessageContextMenu
				visible={showContextMenu}
				msg={msg}
				chat_id={chat_id}
				onAction={(_event, _msg, _on_edit) => onAction(_event,_msg,_on_edit, closeContextMenu)}
				onFocusExit={()=>closeContextMenu && closeContextMenu()}
				onEdit={onEdit}
			/>
		</div>
	);
}

export default MessageContainer;
