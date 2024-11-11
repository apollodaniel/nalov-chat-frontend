import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { format_recording_audio_time } from '../../utils/functions/functions';

interface IProps {
	onCancelRecording: () => void;
	onFinishRecording: () => void;
	recordingTime: number;
}

export default function RecordAudioInput({
	onCancelRecording,
	onFinishRecording,
	recordingTime,
}: IProps) {
	return (
		<div
			className="w-100 rounded-0 gap-1 rounded-bottom-3 d-flex flex-row align-items-center justify-content-end m-1"
			style={{ height: '60px' }}
		>
			<p className="m-0 p-0 me-2">
				{format_recording_audio_time(recordingTime!)}
			</p>
			<button
				className="btn btn-primary h-100 d-flex align-items-center justify-content-center rounded-3 my-1"
				onClick={onCancelRecording}
				style={{ width: '60px' }}
			>
				<CloseIcon />
			</button>
			<button
				className="btn btn-primary h-100 d-flex align-items-center justify-content-center rounded-3 my-1"
				onClick={onFinishRecording}
				style={{ width: '60px' }}
			>
				<SendIcon />
			</button>
		</div>
	);
}
