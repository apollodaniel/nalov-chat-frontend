import "react";
import { Message, PositionOffset } from "../utils/types";
import { SHORT_DATETIME_FORMATTER } from "../utils/constants";

interface IProps {
	msg: Message;
	chat_id: string;
	onContextMenu: (msg: Message, position_offset: PositionOffset) => void;
}

var cumulativeOffset = function(element: HTMLElement): PositionOffset {
	var top = 0, left = 0;
	do {
		top += element.offsetTop || 0;
		left += element.offsetLeft || 0;
		element = element.parentElement!;
	} while (element);

	return {
		offset_top: top,
		offset_left: left
	};
};

function MessageContainer({
	msg,
	chat_id,
	onContextMenu,
}: IProps) {
	return (
		<div className={`w-100 d-flex flex-column`}>
			<div
				className={`card d-flex flex-column justify-content-between p-0 gap-1 ${chat_id === msg.sender_id ? "align-self-start" : "align-self-end"}`}
				style={{
					minHeight: "50px",
					minWidth: "150px",
					maxWidth: "100%",
				}}
				onContextMenu={(event) => {
					event.preventDefault();
					const element = event.currentTarget;
					const rect = element.getBoundingClientRect();

					const offset_top = rect.top + element.clientHeight;
					// calcs the ideal position based on window heigth and message position,
					// if message is on left it receives left offset, but if not it receives
					// left offset minus the value of the message container + left space on chat container
					//
					// on the height it checks if it would overflow the current viewport, if yes it put a fixed value
					// if not it just let happen
					// value 135 is based on fixed value of context menu popup
					onContextMenu(msg, { offset_top: chat_id === msg.sender_id ? offset_top : offset_top + 125 > window.innerHeight ? window.innerHeight - 135 : offset_top, offset_left: chat_id === msg.sender_id ? rect.left : rect.left + rect.width - 250 });
				}}
			>
				<p className={`m-0 mx-3 ${msg.last_modified_date != msg.creation_date ? "mt-3 mb-1" : "my-3"}`}>{msg.content}</p>
				{msg.creation_date != msg.last_modified_date && (
					<p
						className="m-0 mx-2 align-self-end"
						style={{ fontSize: "10px" }}
					>
						Edited
					</p>
				)}
			</div>

			<p className={`m-0 px-1 ${chat_id === msg.sender_id ? "align-self-start" : "align-self-end"}`} style={{ fontSize: "10px" }}>
				{SHORT_DATETIME_FORMATTER.format(msg.creation_date)}
			</p>

		</div>
	);
}


// <MessageContextMenu
// 	visible={showContextMenu}
// 	msg={msg}
// 	chat_id={chat_id}
// 	onAction={(_event, _msg, _onEditContextMenu) =>
// 		onAction(
// 			_event,
// 			_msg,
// 			onShowMessageInfo,
// 			_onEditContextMenu,
// 			closeContextMenu,
// 		)
// 	}
// 	onFocusExit={() => closeContextMenu && closeContextMenu()}
// 	onEdit={onEdit}
// />

export default MessageContainer;
