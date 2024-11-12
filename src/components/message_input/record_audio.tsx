import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { format_recording_audio_time } from '../../utils/functions/functions';
import { Button } from '@nextui-org/react';

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
			className="w-full gap-1 flex flex-row items-center justify-end m-1"
			style={{ height: '60px' }}
		>
			<h3 className="me-auto text-lg font-bold max-md:hidden">
				Recording
			</h3>
			<p className="m-0 p-0 me-2">
				{format_recording_audio_time(recordingTime!)}
			</p>

			<Button
				className="rounded-lg aspect-square h-full w-auto "
				onClick={onCancelRecording}
				isIconOnly
				color="default"
				variant="flat"
			>
				<CloseIcon />
			</Button>
			<Button
				className="rounded-lg aspect-square h-full w-auto "
				onClick={onFinishRecording}
				isIconOnly
				color="default"
				variant="flat"
			>
				<SendIcon />
			</Button>
		</div>
	);
}
