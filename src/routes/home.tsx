import { useEffect, useState } from "react";
import { get_user_chats } from "../utils/functions/chat";
import { isAxiosError } from "axios";
import { ChatType, User } from "../utils/types";
import { confirmation_modals, DATETIME_FORMATTER } from "../utils/constants";
import { get_available_users, logout_user } from "../utils/functions/user";
import { useNavigate } from "react-router-dom";
import ConfirmationPopup from "../components/confirmation_popup";

function Home() {
	// main page

	const [chats, setChats] = useState<ChatType[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [search, setSearch] = useState<string>("");

	const [logoutPopupVisible, setLogoutPopupVisible] = useState(false);

	const navigate = useNavigate();

	const get_users = async () => {
		try {
			const users = await get_available_users();
			setUsers(users);
		} catch (err: any) {
			if (isAxiosError(err) && err.response && err.response.data) {
				// backend error
				// const parsed_error = parse_errors(
				// 	err.response.data.errors as BackendError[],
				// );
			}
		}
	};

	const get_chats = async () => {
		try {
			const chat_result = await get_user_chats();
			setChats(chat_result.chats);
		} catch (err: any) {
			if (isAxiosError(err) && err.response && err.response.data) {
				// backend error
				// const parsed_error = parse_errors(
				// 	err.response.data.errors as BackendError[],
				// );
			}
			if (isAxiosError(err) && err.response && err.response.status != 401) {
				setTimeout(()=>get_chats(),1000);
			}
		}
	};

	useEffect(() => {
		get_chats().then(()=>{
			get_users()
		});
	}, []);

	return (
		<div
			className="card w-100 d-flex flex-column my-5 gap-3 p-3"
			style={{ maxWidth: "1200px", height: "90vh" }}
		>
			<div className="d-flex flex-row gap-3">
				<div className="form-floating w-75">
					<input
						type="search"
						className="form-control"
						onChange={(event) => {
							setSearch(event.target.value);
						}}
					/>
					<label>Search</label>
				</div>
				<button onClick={()=> setLogoutPopupVisible(true)} className="btn btn-danger w-25">Logout</button>
			</div>
			<ul className="list-group">
				{search.length === 0
					? // chats
						chats.map((c) => (
							<li
								className="list-group-item list-group-item-action d-flex flex-column"
								onClick={() => {
									navigate(`/chat/${c.user.id}`);
								}}
							>
								<div className="d-flex flex-row justify-content-between">
									<div className="fw-bold h4">
										{c.user.name}
									</div>
									<p>{c.user.username}</p>
								</div>
								<div className="d-flex flex-row justify-content-between">
									<p>
										{c.last_message.content.length > 15
											? c.last_message.content.substring(
													0,
													15,
												)
											: c.last_message.content}
									</p>
									<p>
										{DATETIME_FORMATTER.format(
											c.last_message.date,
										)}
									</p>
								</div>
							</li>
						))
					: // users
						users.map((u) => (
							<li
								className="list-group-item list-group-item-action"
								onClick={() => {
									navigate(`/chat/${u.id}`);
								}}
							>
								<div className="fw-bold h4">{u.username}</div>
								{u.name}
							</li>
						))}
			</ul>
			<ConfirmationPopup
				title={confirmation_modals.logout.title}
				content={confirmation_modals.logout.content}
				visible={logoutPopupVisible}
				onConfirm={async ()=>{
					setLogoutPopupVisible(false);
					await logout_user(navigate);
				}}
				onCancel={()=>setLogoutPopupVisible(false)}
			/>
		</div>
	);
}

export default Home;
