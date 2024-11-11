import CloseIcon from '@mui/icons-material/Close';
import { Message } from '../../utils/types';

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
	return (
		<div className="w-100 rounded-bottom d-flex flex-row gap-1 m-0">
			<div className="form-floating w-100 h-100 my-1 rounded-3">
				<input
					className="form-control h-100 h-100 m-0"
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
				/>
				<label>Editing message</label>
			</div>
			<button
				className="btn btn-primary w-auto rounded-3 my-1"
				onClick={() => {
					setEditingMessage(undefined);
					setInputMessageContent('');
				}}
				style={{
					textWrap: 'nowrap',
				}}
			>
				<CloseIcon />
			</button>
		</div>
	);
}
