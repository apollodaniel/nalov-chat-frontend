import "react";
import { DATETIME_FORMATTER } from "../utils/constants";
import { NavigateFunction } from "react-router-dom";
import { ChatType } from "../utils/types";
import { format_date_user_friendly, get_current_host } from "../utils/functions/functions";

interface IProps {
	navigate: NavigateFunction;
	chat: ChatType;
}

function ChatListItem({ chat, navigate }: IProps) {
	return (
		<li
			className="list-group-item list-group-item-action d-flex flex-row justify-content-start align-items-center gap-3"
			onClick={() => {
				navigate(`/chat/${chat.user.id}`);
			}}
		>
			<img
				className="ratio-1x1 rounded-circle"
				src={get_current_host("/" + chat.user.profile_picture)}
				style={{
					height: "60px",
					aspectRatio: 1 / 1,
					objectFit: "cover",
				}}
				alt={`${chat.user.name} profile picture`}
			/>
			<div className="d-flex flex-column justify-content-start align-items-start">
				<div className="fw-bold h4 m-0">{chat.user.name}</div>
				<small className="m-0 mb-2">{chat.user.username}</small>
				<p>
					{`${chat.user.id !== chat.last_message.sender_id ? "Você: " : ""}${chat.last_message.content.length > 15
							? chat.last_message.content.substring(0, 15)
							: chat.last_message.content
						}`}
				</p>
			</div>
			<div className="ms-auto d-flex flex-column gap-2 justify-content-end align-items-end">
				{chat.unseen_message_count > 0 && chat.unseen_message_count}
				<small style={{ fontSize: "13px" }}>
					{format_date_user_friendly(
						chat.last_message.last_modified_date,
					)}
				</small>
			</div>
		</li>
	);
}

export default ChatListItem;
