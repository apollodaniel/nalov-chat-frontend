import "react";
import { Message } from "../utils/types";
import { EVENT_EMITTER, SHORT_DATETIME_FORMATTER } from "../utils/constants";
import { useEffect, useState } from "react";
import MessageContextMenu from "./message_context_menu";
import { delete_message } from "../utils/functions/chat";

interface IProps {
	msg: Message;
	chat_id: string;
	onEdit: (msg: Message)=>void;
}

async function onAction(event: string, msg: Message, onEdit?: (msg: Message)=>void){

	EVENT_EMITTER.emit('close-context-menu');
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

function MessageContainer({ msg, chat_id, onEdit}: IProps) {

	const [showContextMenu, setShowContextMenu] = useState(false);

	useEffect(()=>{
		EVENT_EMITTER.on('close-context-menu', ()=>setShowContextMenu(false));
	}, []);

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
					setShowContextMenu(true);
				}}
			>
				{msg.content}
				<p className="m-0 align-self-end" style={{ fontSize: "10px" }}>
					{SHORT_DATETIME_FORMATTER.format(msg.date)}
				</p>
			</div>

			<MessageContextMenu
				visible={showContextMenu}
				msg={msg}
				chat_id={chat_id}
				onFocusExit={()=>setShowContextMenu(false)}
				onAction={onAction}
				onEdit={onEdit}
			/>
		</div>
	);
}

export default MessageContainer;
