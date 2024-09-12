import "react";
import { User } from "../utils/types";
import { NavigateFunction } from "react-router-dom";
import { get_current_host } from "../utils/functions/functions";

interface IProps {
	user: User;
	navigate: NavigateFunction;
}

function UserListItem({ user, navigate }: IProps) {
	return (
		<li
			className="list-group-item list-group-item-action d-flex flex-row justify-content-start align-items-center gap-3"
			onClick={() => {
				navigate(`/chat/${user.id}`);
			}}
		>
			<img
				className="ratio-1x1 rounded-circle"
				src={get_current_host("/" + user.profile_picture)}
				style={{
					height: "50px",
					aspectRatio: 1/1,
					objectFit: "cover"
				}}
				alt={`${user.name} profile picture`}
			/>
			<div className="d-flex flex-column justify-content-start align-items-start">
				<div className="fw-bold h4">{user.name}</div>
				{user.username}
			</div>
		</li>
	);
}

export default UserListItem;
