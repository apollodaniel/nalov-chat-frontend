import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	Input,
} from '@nextui-org/react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendMessageIcon from '@mui/icons-material/Send';
import ClearMessageIcon from '@mui/icons-material/Close';
import MoreHorz from '@mui/icons-material/MoreHoriz';
import MicIcon from '@mui/icons-material/Mic';

interface IProps {
	selectedAttachments: File[];
	setSelectedAttachments: (attachments: File[]) => void;
	sendMessage: () => void;
	inputMessageContent: string;
	setInputMessageContent: (content: string) => void;
	recordAudio: () => void;
	filePicker: HTMLElement;
}

export default function NormalMessageInput({
	setInputMessageContent,
	inputMessageContent,
	selectedAttachments,
	setSelectedAttachments,
	sendMessage,
	filePicker,
	recordAudio,
}: IProps) {
	const ThreeDotsButton = () => (
		<div
			className={`${inputMessageContent.length > 0 ? 'max-xsm:hidden' : ''} `}
		>
			<Dropdown>
				<DropdownTrigger>
					<Button
						className="rounded-lg h-full w-auto aspect-square"
						isIconOnly
						color="default"
						variant="flat"
					>
						<MoreHorz />
					</Button>
				</DropdownTrigger>
				<DropdownMenu
					onAction={(action) => {
						switch (action) {
							case 'record':
								recordAudio();
								break;
							case 'file':
								filePicker.click();
								break;
							case 'clear':
								setInputMessageContent('');
								setSelectedAttachments([]);
								break;
						}
					}}
				>
					<DropdownItem key="record" startContent={<MicIcon />}>
						Gravar Audio
					</DropdownItem>
					<DropdownItem key="file" startContent={<AttachFileIcon />}>
						Anexar arquivo
					</DropdownItem>
					<DropdownItem
						key="clear"
						className={
							inputMessageContent.length == 0 &&
							selectedAttachments.length == 0
								? 'hidden'
								: ''
						}
						startContent={<ClearMessageIcon />}
					>
						Limpar
					</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		</div>
	);
	return (
		<div className="flex flex-row gap-1 h-full">
			<Input
				type="text"
				onChange={(event) => {
					setInputMessageContent(event.target.value);
				}}
				classNames={{
					label: 'text-ellipsis w-full whitespace-nowrap',
				}}
				label={
					'Message ' +
					(selectedAttachments.length > 0
						? ` + ${selectedAttachments.map((at) => at.name).join(' + ')}`
						: '')
				}
				onKeyDown={(event) => {
					if (event.key == 'Enter') {
						sendMessage();
					}
				}}
				value={inputMessageContent}
			/>

			{/*large screen view*/}
			<div className="hidden flex-row gap-1 aspect-[19/9] max-sm:hidden">
				{/* upload file button */}
				<Dropdown>
					<DropdownTrigger>
						<Button
							className="rounded-lg h-full w-full"
							isIconOnly
							color="default"
							variant="flat"
						>
							<MoreHorz />
						</Button>
					</DropdownTrigger>
					<DropdownMenu
						onAction={(action) => {
							switch (action) {
								case 'record':
									recordAudio();
									break;
								case 'file':
									filePicker.click();
									break;
								case 'clear':
									setInputMessageContent('');
									setSelectedAttachments([]);
									break;
							}
						}}
					>
						<DropdownItem key="record" startContent={<MicIcon />}>
							Gravar Audio
						</DropdownItem>
						<DropdownItem
							key="file"
							startContent={<AttachFileIcon />}
						>
							Anexar arquivo
						</DropdownItem>
						<DropdownItem
							key="clear"
							isDisabled={
								inputMessageContent.length == 0 &&
								selectedAttachments.length == 0
							}
							startContent={<ClearMessageIcon />}
						>
							Limpar
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
				{inputMessageContent.length > 0
					? [
							<Button
								key={'clear-message'}
								className="rounded-lg h-full w-full"
								onClick={() => setInputMessageContent('')}
								isIconOnly
								color="default"
								variant="flat"
							>
								<ClearMessageIcon />
							</Button>,
							<Button
								key={'send-message'}
								className="rounded-lg h-full w-full "
								onClick={() => sendMessage()}
								isIconOnly
								color="default"
								variant="flat"
							>
								<SendMessageIcon />
							</Button>,
						]
					: [
							<Button
								key={'pick-file'}
								className="rounded-lg h-full w-full"
								onClick={() => filePicker.click()}
								isIconOnly
								color="default"
								variant="flat"
							>
								<AttachFileIcon />
							</Button>,
							<Button
								key={'record-audio'}
								className="rounded-lg h-full w-full"
								onClick={recordAudio}
								isIconOnly
								color="default"
								variant="flat"
							>
								<MicIcon />
							</Button>,
						]}
			</div>

			{/*small screen view*/}
			<div
				className={`flex flex-row max-sm:gap-3 gap-5 ${inputMessageContent.length > 0 ? 'aspect-[8/4] max-xsm:aspect-square' : 'aspect-square'} max-sm:h-[80%] h-full max-sm:flex self-center`}
			>
				<ThreeDotsButton />
				{inputMessageContent.length > 0 && (
					<Button
						className="rounded-lg h-full w-auto aspect-square"
						onClick={() => sendMessage()}
						isIconOnly
						color="default"
						variant="flat"
					>
						<SendMessageIcon />
					</Button>
				)}
			</div>
		</div>
	);
}
