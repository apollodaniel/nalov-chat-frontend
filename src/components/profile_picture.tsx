import React, { useRef } from "react";
import { get_current_host } from "../utils/functions/functions";
import "./profile_picture.css";

interface IProps{
	url: string,
	onClick: () => void
}

function ProfilePicture({url, onClick}: IProps) {


	return (
		<div
			className="position-relative rounded-circle mt-5 mb-4 d-flex align-items-center justify-content-center"
			style={{ width: "150px", height: "150px" }}
			id="profile-picture"
			onClick={(event)=>onClick()}
		>
			<img
				className="position-absolute rounded-circle"
				src={url}
				style={{
					objectFit: "cover",
					width: "150px",
					height: "150px"
				}}
				alt="profile picture"
				id="profile-image"
			/>
			<img
				src="../../public/edit_icon.png"
				style={{
					width: "30px",
					height: "30px"
				}}
				alt="edit-icon"
				className="position-absolute"
				id="edit-icon"
			/>
		</div>
	);
}

export default ProfilePicture;
