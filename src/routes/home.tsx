import { useEffect, useState } from "react";
import { get_user_chats, listen_chats } from "../utils/functions/chat";
import { isAxiosError } from "axios";
import { ChatType, User } from "../utils/types";
import { get_available_users } from "../utils/functions/user";
import { useNavigate } from "react-router-dom";

import HomeTreeDotsPopup from "../components/home_three_dots_popup";
import ChatListItem from "../components/chat_list_item";
import UserListItem from "../components/user_list_item";
import { EVENT_ERROR_EMITTER } from "../utils/constants";

function Home() {
	// main page
	const [chats, setChats] = useState<ChatType[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [search, setSearch] = useState<string>("");
	const [focusedSearch, setFocusedSearch] = useState(false);
	const [moreActionsPopupVisible, setMoreActionsPopupVisible] = useState(false);

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


			await listen_chats((chats: ChatType[]) => {
				setChats(chats);
			},
				(reason: string) => EVENT_ERROR_EMITTER.emit('add-error', reason));
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
			<div
				className="d-flex flex-row gap-3 align-items-center justify-content-center"
				style={{
					height: "60px"
				}}
			>
				<div className="form-floating w-100 h-100">
					<input
						type="search"
						className="form-control h-100"
						onFocus={()=>setFocusedSearch(true)}
						onBlur={()=>setFocusedSearch(false)}
						onChange={(event) => {
							setSearch(event.target.value);
						}}
					/>
					<label>Search</label>
				</div>
				<button onClick={()=> setMoreActionsPopupVisible(true)} className="btn btn-primary h-100">More actions</button>
			</div>
			<ul className="list-group rounded-5">
				{!focusedSearch && search.length === 0
					? // chats
						chats.map((c) => <ChatListItem key={c.user.id} navigate={navigate} chat={c} />)
					: // users
						users.map((u) => <UserListItem key={u.id} navigate={navigate} user={u} />)}
			</ul>
			<HomeTreeDotsPopup
				onCancel={()=>setMoreActionsPopupVisible(false)}
				show={moreActionsPopupVisible}
				navigate={navigate}
			/>
		</div>
	);
}

export default Home;
