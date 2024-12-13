import { useEffect, useRef, useState } from 'react';
import { getUserChats, listenChats } from '../Utils/Functions/Chat';
import { ChatType, User } from '../Utils/Types';
import { getAvailableUsers } from '../Utils/Functions/User';
import { useNavigate } from 'react-router-dom';

import HomeTreeDotsPopup from '../Components/HomePopup';
import '../Css/Home.css';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import debounce from 'lodash.debounce';
import { Button, Card, Input } from '@nextui-org/react';
import ChatList from '../Components/ChatList';
import UserList from '../Components/UserList';

function Home() {
	// main page
	const [chats, setChats] = useState<ChatType[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [search, setSearch] = useState<string>('');
	const [focusedSearch, setFocusedSearch] = useState(false);
	const [moreActionsPopupVisible, setMoreActionsPopupVisible] =
		useState(false);

	const navigate = useNavigate();

	const getUsers = useRef(
		debounce(
			(query: string) => {
				const args =
					query.trim().length === 0
						? ''
						: `?username=${query.toLowerCase()}`;
				getAvailableUsers(args).then((users) => setUsers(users));
			},
			250,
			{
				trailing: true,
			},
		),
	).current;

	const getChats = useRef(async () => {
		const chatResult = await getUserChats();
		setChats(chatResult);

		listenChats((chats: ChatType[]) => setChats(chats));
	}).current;

	useEffect(() => {
		getChats().then(() => {
			getUsers('');
		});
	}, []);

	useEffect(() => {
		getUsers(search);
	}, [search]);

	return (
		<div
			id="home-container"
			className="flex flex-column my-5 gap-3 p-3 max-sm:p-0"
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
				<div className="w-full h-full bg-background bg-opacity-20 border rounded-2xl px-1 py-2">
					<ChatList chats={chats} navigate={navigate} />
				</div>
			) : (
				// users
				<div className="w-full h-full px-1 py-2   border rounded-2xl ">
					<UserList users={users} navigate={navigate} />
				</div>
			)}
			<HomeTreeDotsPopup
				onCancel={() => setMoreActionsPopupVisible(false)}
				show={moreActionsPopupVisible}
				navigate={navigate}
			/>
		</div>
	);
}

export default Home;
