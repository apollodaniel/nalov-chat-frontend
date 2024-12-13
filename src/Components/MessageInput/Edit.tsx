import { Button, Input } from '@nextui-org/react';
import SendMessageIcon from '@mui/icons-material/Send';
import ClearMessageIcon from '@mui/icons-material/Close';
import { useRef } from 'react';
import { Message } from '../../Utils/Types';

interface IProps {
	inputMessageContent: string;
	setInputMessageContent: (content: string) => void;
	setEditingMessage: (msg: Message | undefined) => void;
	sendEditedMessage: () => void;
}

export default function EditMessageInput({
	setInputMessageContent,
	inputMessageContent,
	setEditingMessage,
	sendEditedMessage,
}: IProps) {
	const oldMessageContent = useRef(inputMessageContent);
	return (
		<div className="flex flex-row gap-1 h-full">
			<Input
				type="text"
				onChange={(event) => {
					setInputMessageContent(event.target.value);
				}}
				onKeyDownCapture={(event) => {
					if (event.key == 'Enter') {
						sendEditedMessage();
					}
				}}
				value={inputMessageContent}
				label={`Editing message: ${oldMessageContent.current}`}
				classNames={{
					label: 'text-ellipsis w-full whitespace-nowrap',
				}}
			/>
			<div className="h-full max-sm:h-[80%] flex flex-row aspect-[2/1] w-auto self-center gap-1">
				<Button
					className="rounded-lg aspect-square h-full w-auto"
					onClick={() => {
						setEditingMessage(undefined);
						setInputMessageContent('');
					}}
					isIconOnly
					color="default"
					variant="flat"
				>
					<ClearMessageIcon />
				</Button>
				<Button
					className="rounded-lg aspect-square h-full w-auto "
					onClick={() => sendEditedMessage()}
					isIconOnly
					color="default"
					variant="flat"
				>
					<SendMessageIcon />
				</Button>
			</div>
		</div>
	);
}
