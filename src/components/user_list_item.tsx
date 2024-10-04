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
      onClick={(event) => {
        event.stopPropagation();
        navigate(`/chat/${user.id}`);
      }}
    >
      <img
        className="ratio-1x1 rounded-circle"
        src={get_current_host("/" + user.profile_picture)}
        style={{
          height: "50px",
          aspectRatio: 1 / 1,
          objectFit: "cover",
        }}
        alt={`${user.name} profile picture`}
      />
      <div className="d-flex flex-column justify-content-start align-items-start ellipsis-text-parent">
        <div className="fw-bold h4 ellipsis-text">{user.name}</div>
        <p className="m-0 ellipsis-text">{user.username}</p>
      </div>
    </li>
  );
}

export default UserListItem;
