import 'react';
import { NavigateFunction } from 'react-router-dom';
import { ChatType } from '../utils/types';
import {
	format_date_user_friendly,
	get_current_host,
} from '../utils/functions/functions';
import { ListboxItem, Avatar, Listbox } from '@nextui-org/react';

interface IProps {
	navigate: NavigateFunction;
	chats: ChatType[];
}

export default function ChatList({ chats, navigate }: IProps) {
	return (
		<Listbox
			classNames={{
				base: 'max-w-full  ',
				list: 'max-h-full overflow-scroll ',
			}}
			items={chats}
			selectionMode="none"
			variant="flat"
		>
			{(c: ChatType) => (
				<ListboxItem
					key={c.user.id}
					textValue={c.user.name}
					onClick={() => {
						navigate(`/chat/${c.user.id}`);
					}}
				>
					<div className="flex gap-3 max-md:gap-2 items-center max-xsm:flex-col">
						<Avatar
							alt={c.user.name}
							className="flex-shrink-0 max-md:size-12"
							size="lg"
							src={get_current_host(c.user.profile_picture)}
						/>
						<div className="flex flex-col">
							<span className="md:text-xl max-md:text-lg m-0">
								{c.user.name}
							</span>
							<span className=" max-md:text-[16px] m-0 text-zinc-400">
								{c.user.username}
							</span>
						</div>
					</div>
				</ListboxItem>
			)}
		</Listbox>
	);
}
