import { useEffect, useState } from "react";
import { get_user_chats, listen_chats } from "../utils/functions/chat";
import { isAxiosError } from "axios";
import { ChatType, User } from "../utils/types";
import { confirmation_modals, DATETIME_FORMATTER } from "../utils/constants";
import { get_available_users, get_current_user, logout_user } from "../utils/functions/user";
import { useNavigate } from "react-router-dom";
import ConfirmationPopup from "../components/confirmation_popup";
import HomeTreeDotsPopup from "../components/home_three_dots_popup";
import ChatListItem from "../components/chat_list_item";
import UserListItem from "../components/user_list_item";
import { Toast } from "react-bootstrap";

function Home() {
	// main page
	const [chats, setChats] = useState<ChatType[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [search, setSearch] = useState<string>("");
	const [focusedSearch, setFocusedSearch] = useState(false);
	const [errorMessages, setErrorMessages] = useState<string[][]>([]); // errors
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
				(reason: string) => {
					// unable to listen
					setErrorMessages((prev) => {
						const id = Date.now();
						setTimeout(() => setErrorMessages((prev) => prev.filter((msg) => msg[1] != id.toString())), 10000);
						return [...prev, [reason, id.toString()]];
					});
				});
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
			<ul className="list-group">
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
			<div
				className="position-absolute d-flex flex-column gap-2"
				style={{
					top: "16px",
					right: "16px"
				}}
			>
				{
					errorMessages.map((msg) => (
						<Toast key={msg[1]} bg="danger" show={true} onClose={() => setErrorMessages((prev) => prev.filter((m) => m[1] != msg[1]))}>
							<Toast.Header className="d-flex flex-row justify-content">
								<div className="h6 fw-bold m-0 me-auto">Sistema</div>
								<small>{Intl.DateTimeFormat('pt-BR', { timeStyle: "medium" }).format(parseInt(msg[1]))}</small>
							</Toast.Header>
							<Toast.Body>{msg[0]}</Toast.Body>
						</Toast>
					))
				}
			</div>
		</div>
	);
}

export default Home;
