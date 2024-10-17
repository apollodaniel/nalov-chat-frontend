import { useEffect, useRef, useState } from 'react';
import { get_user_chats, listen_chats } from '../utils/functions/chat';
import { ChatType, User } from '../utils/types';
import { get_available_users, get_user } from '../utils/functions/user';
import { useNavigate } from 'react-router-dom';

import HomeTreeDotsPopup from '../components/home_three_dots_popup';
import ChatListItem from '../components/chat_list_item';
import UserListItem from '../components/user_list_item';
import '../css/home.css';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import debounce from 'lodash.debounce';

function Home() {
	// main page
	const [chats, setChats] = useState<ChatType[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [search, setSearch] = useState<string>('');
	const [focusedSearch, setFocusedSearch] = useState(false);
	const [moreActionsPopupVisible, setMoreActionsPopupVisible] =
		useState(false);

	const navigate = useNavigate();

	const get_users = useRef(
		debounce(
			(query: string) => {
				const args =
					query.trim().length === 0
						? ''
						: `?filter_field=username&filter_value=${query.toLowerCase()}`;
				get_available_users(args).then((users) => setUsers(users));
			},
			250,
			{
				trailing: true,
			},
		),
	).current;

	const get_chats = useRef(async () => {
		const chat_result = await get_user_chats();
		setChats(chat_result);

		listen_chats((chats: ChatType[]) => setChats(chats));
	}).current;

	useEffect(() => {
		get_chats().then(() => {
			get_users('');
		});
	}, []);

	useEffect(() => {
		get_users(search);
	}, [search]);

	return (
		<div
			id="home-container"
			className="d-flex flex-column my-5 gap-3 p-3"
			onClick={(event) => {
				if ((event.target as Element).id === 'home-container')
					setFocusedSearch(false);
			}}
		>
			<div
				className="d-flex flex-row gap-3 align-items-center justify-content-end"
				style={{
					height: '60px',
				}}
			>
				{focusedSearch ? (
					<div className="d-flex flex-row align-items-center justify-content-end w-100 h-100 gap-3">
						<div className="w-100 h-100">
							<input
								type="search"
								className="form-control h-100"
								placeholder="Nome de usuário"
								onChange={(event) => {
									// setup timeout if it not exists
									setSearch(event.target.value);
								}}
							/>
						</div>
						<button
							className="btn btn-primary h-100"
							onClick={() => {
								setFocusedSearch(false);
								setSearch('');
							}}
						>
							<CloseIcon />
						</button>
					</div>
				) : (
					<button
						className="btn btn-primary h-100"
						onClick={() => setFocusedSearch(true)}
					>
						<PersonAddIcon />
					</button>
				)}
				<button
					onClick={() => setMoreActionsPopupVisible(true)}
					id="more-actions-button"
					className="btn btn-primary h-100"
				>
					<MenuIcon />
				</button>
			</div>
			<ul className="list-group border-0 rounded-3">
				{!focusedSearch ? (
					chats.length === 0 ? (
						<span className="align-self-center mt-5 fs-5">
							<b>Nenhum</b> chat iniciado.
						</span>
					) : (
						// chats
						chats.map((c) => (
							<ChatListItem
								key={c.user.id}
								navigate={navigate}
								chat={c}
							/>
						))
					) // users
				) : users.length === 0 ? (
					<span className="align-self-center mt-5 fs-5">
						<b>Nenhum</b> usuário encontrado!
					</span>
				) : (
					users.map((u) => (
						<UserListItem key={u.id} navigate={navigate} user={u} />
					))
				)}
			</ul>
			{moreActionsPopupVisible && (
				<HomeTreeDotsPopup
					onCancel={() => setMoreActionsPopupVisible(false)}
					show={moreActionsPopupVisible}
					navigate={navigate}
				/>
			)}
		</div>
	);
}

export default Home;
