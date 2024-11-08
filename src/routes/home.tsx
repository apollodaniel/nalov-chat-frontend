import { useEffect, useRef, useState } from 'react';
import { get_user_chats, listen_chats } from '../utils/functions/chat';
import { ChatType, User } from '../utils/types';
import { get_available_users } from '../utils/functions/user';
import { useNavigate } from 'react-router-dom';

import HomeTreeDotsPopup from '../components/home_three_dots_popup';
import '../css/home.css';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import debounce from 'lodash.debounce';
import { Button, Card, Input } from '@nextui-org/react';
import ChatList from '../components/chat_list';
import UserList from '../components/user_list';

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
			className="flex flex-column my-5 gap-3 p-3 "
			onClick={(event) => {
				if ((event.target as Element).id === 'home-container')
					setFocusedSearch(false);
			}}
		>
			<div className="flex sm:flex-row gap-3 items-center justify-end max-sm:flex-col-reverse">
				{focusedSearch && (
					<Input
						type="search"
						className="max-sm:h-[48px]"
						label="Nome de usuário"
						variant="bordered"
						onChange={(event) => {
							// setup timeout if it not exists
							setSearch(event.target.value);
						}}
					/>
				)}
				<div className="flex flex-row gap-3 max-sm:w-full justify-end">
					{focusedSearch ? (
						<Button
							className="p-[28px] max-sm:p-[16px] bg-background bg-opacity-25 "
							onClick={() => {
								setFocusedSearch(false);
								setSearch('');
							}}
							isIconOnly
							color="default"
							variant="ghost"
						>
							<CloseIcon className="max-sm:!text-[20px]" />
						</Button>
					) : (
						<Button
							className="aspect-square p-[28px] bg-background bg-opacity-25 "
							onClick={() => setFocusedSearch(true)}
							color="default"
							variant="ghost"
							isIconOnly
						>
							<PersonAddIcon className="max-sm:!text-[20px]" />
						</Button>
					)}
					<Button
						onClick={() => setMoreActionsPopupVisible(true)}
						id="more-actions-Button"
						className={`aspect-square p-[28px]  bg-background bg-opacity-25 ${focusedSearch ? 'max-sm:p-[16px]' : ''}`}
						color="default"
						variant="ghost"
						isIconOnly
					>
						<MenuIcon className="max-sm:!text-[20px]" />
					</Button>
				</div>
			</div>
			{!focusedSearch ? (
				chats.length === 0 ? (
					<h2 className="self-center my-auto lg:text-2xl md:text-xl max-sm:text-md">
						<b>Nenhum</b> chat iniciado.
					</h2>
				) : (
					<div className="w-full h-full bg-background bg-opacity-20 border rounded px-1 py-2  ">
						<ChatList chats={chats} navigate={navigate} />
					</div>
				) // users
			) : users.length === 0 ? (
				<h2 className="self-center my-auto lg:text-2xl md:text-xl max-sm:text-md">
					<b>Nenhum</b> usuário encontrado!
				</h2>
			) : (
				<div className="w-full h-full px-1 py-2   border rounded ">
					<UserList users={users} navigate={navigate} />
				</div>
			)}
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
