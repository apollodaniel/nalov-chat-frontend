import "react";
import { NavigateFunction } from "react-router-dom";
import { ChatType } from "../utils/types";
import {
	format_date_user_friendly,
	get_current_host,
} from "../utils/functions/functions";

interface IProps {
	navigate: NavigateFunction;
	chat: ChatType;
}

function ChatListItem({ chat, navigate }: IProps) {
	return (
		<li
			className="list-group-item list-group-item-action d-flex flex-row justify-content-start align-items-center gap-3 py-2 px-4"
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
			<div
				className="h-100 m-0 d-flex flex-column justify-content-between align-items-start gap-1 text-nowrap"
				style={{
					overflow: "hidden",
					whiteSpace: "nowrap",
					maxWidth: "80%"
				}}
			>
				<div className="d-flex flex-column m-0">
					<div className="fw-bold h4 m-0">{chat.user.name}</div>
					<small className="m-0" style={{ fontSize: "12px" }}>
						{chat.user.username}
					</small>
				</div>
				<p
					className="m-0 mw-100"
					style={{
						textOverflow: "ellipsis",
						overflow: "hidden",
					}}
				>
					{`${chat.user.id !== chat.last_message.sender_id ? "Você: " : ""}${chat.last_message.content}`}
				</p>
			</div>
			<div className="ms-auto h-100 d-flex flex-column justify-content-between align-items-end align-self-end">
				<small style={{ fontSize: "13px" }}>
					{format_date_user_friendly(
						chat.last_message.last_modified_date,
					)}
				</small>
				{chat.unseen_message_count > 0 && (
					<p className="m-0 px-1 bg-primary rounded-3">
						{chat.unseen_message_count}
					</p>
				)}
			</div>
		</li>
	);
}

export default ChatListItem;
