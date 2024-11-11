import { Input } from '@nextui-org/react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MicIcon from '@mui/icons-material/Mic';

interface IProps {
	selectedAttachments: File[];
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
	sendMessage,
	filePicker,
	recordAudio,
}: IProps) {
	return (
		<div className="d-flex flex-row gap-1">
			<Input
				type="text"
				onChange={(event) => {
					setInputMessageContent(event.target.value);
				}}
				label={
					'Message ' +
					(selectedAttachments.length > 0
						? ` + ${selectedAttachments.map((at) => at.name).join(' + ')}`
						: '')
				}
				onKeyDownCapture={(event) => {
					if (event.key == 'Enter') {
						sendMessage();
					}
				}}
				value={inputMessageContent}
			/>

			{/* upload file button */}
			<button
				className="btn btn-primary rounded-3 my-1"
				onClick={() => filePicker.click()}
			>
				<AttachFileIcon />
			</button>

			{/* record audio file button */}
			<button
				className="btn btn-primary rounded-3 my-1"
				onClick={() => recordAudio()}
			>
				<MicIcon />
			</button>
		</div>
	);
}
