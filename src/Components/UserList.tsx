import 'react';
import { User } from '../Utils/Types';
import { NavigateFunction } from 'react-router-dom';
import { getCurrentHost } from '../Utils/Functions/Functions';
import { ListboxItem, Avatar, Listbox } from '@nextui-org/react';

interface IProps {
	users: User[];
	navigate: NavigateFunction;
}

export default function UserList({ users, navigate }: IProps) {
	return (
		<Listbox
			className="overflow-y-scroll"
			classNames={{
				base: 'max-w-full',
				list: 'max-h-full',
			}}
			items={users}
			selectionMode="none"
			variant="flat"
			emptyContent={
				<h2 className="self-center my-auto md:text-xl  max-sm:text-md">
					<b>Nenhum</b> usuário encontrado!
				</h2>
			}
		>
			{(user: User) => (
				<ListboxItem
					key={user.id}
					textValue={user.name}
					onClick={() => {
						navigate(`/chat/${user.id}`);
					}}
				>
					<div className="flex gap-3 max-md:gap-2 items-center max-xsm:flex-col">
						<Avatar
							alt={user.name}
							className="flex-shrink-0 max-md:size-12"
							size="lg"
							src={getCurrentHost(user.profilePicture)}
						/>
						<div className="flex flex-col">
							<span className="md:text-xl max-md:text-lg m-0">
								{user.name}
							</span>
							<span className=" max-md:text-[16px] m-0 text-zinc-400">
								{user.username}
							</span>
						</div>
					</div>
				</ListboxItem>
			)}
		</Listbox>
	);
}
