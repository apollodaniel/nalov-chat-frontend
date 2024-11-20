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
			className="overflow-y-scroll"
			classNames={{
				base: 'max-w-full',
			}}
			items={chats}
			selectionMode="none"
			variant="flat"
			emptyContent={
				<h2 className="self-center my-auto md:text-xl max-sm:text-md">
					<b>Nenhum</b> chat iniciado.
				</h2>
			}
		>
			{(c: ChatType) => (
				<ListboxItem
					key={c.user.id}
					onClick={() => {
						navigate(`/chat/${c.user.id}`);
					}}
					classNames={{
						title: 'text-ellipsis overflow-hidden whitespace-nowrap md:text-xl max-md:text-lg m-0',
						description:
							'text-ellipsis overflow-hidden whitespace-nowrap md:text-[18px] max-md:text-[16px] m-0 text-zinc-400',
						wrapper: 'max-w-full min-w-0',
					}}
					startContent={
						<Avatar
							alt={c.user.name}
							className="flex-shrink-0 max-md:size-12"
							size="lg"
							src={get_current_host(c.user.profile_picture)}
						/>
					}
					endContent={
						<div className="flex flex-col flex-1 items-end">
							<span className="max-md:text-[16px] m-0 min-w-0 whitespace-nowrap ">
								{c.user.username}
							</span>
							<span className="max-md:text-[16px] m-0 text-zinc-400 min-w-0 whitespace-nowrap">
								{format_date_user_friendly(
									c.last_message.last_modified_date,
								)}
							</span>
						</div>
					}
					title={c.user.name}
					description={`${c.last_message.sender_id != c.user.id ? 'Você: ' : ''}${c.last_message.content}${(c.last_message.attachments.length > 0 ? ' ' : '') + c.last_message.attachments.map((att) => `"${att.filename}"`).join(', ')}`}
				/>
			)}
		</Listbox>
	);
}
