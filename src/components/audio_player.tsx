import ReactPlayer from 'react-player/file';
import { Attachment } from '../utils/types';
import {
	format_audio_duration,
	get_current_host,
} from '../utils/functions/functions';
import { useEffect, useRef, useState } from 'react';
import { OnProgressProps } from 'react-player/base';
import { Button, Card, Slider } from '@nextui-org/react';
import PlayIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Skeleton from './Skeleton';

interface IProps {
	attachment: Attachment;
	onReady: () => void;
}

export default function AudioPlayer({ attachment, onReady }: IProps) {
	const [playing, setPlaying] = useState(false);
	const [duration, setDuration] = useState(0);
	const [progress, setProgress] = useState<OnProgressProps>({
		playedSeconds: 0,
		played: 0,
		loaded: 0,
		loadedSeconds: 0,
	});
	const playerRef = useRef<ReactPlayer | null>(null);
	const [position, setPosition] = useState(0);
	const [isReady, setIsReady] = useState(false);

	const [seeking, setSeeking] = useState(false);
	useEffect(() => setPosition(progress.playedSeconds), [progress]);
	return (
		<div className="p-2 max-h-full">
			<ReactPlayer
				ref={playerRef}
				height={0}
				url={get_current_host(attachment.path)}
				playing={playing}
				onReady={() => {
					onReady();
					setIsReady(true);
				}}
				onPlay={() => setPlaying(true)}
				onEnded={() => setPlaying(false)}
				onDuration={(duration) => setDuration(duration)}
				onProgress={(prog) => !seeking && setProgress(prog)}
				volume={1}
			/>

			<p className="text-small text-ellipsis whitespace-nowrap max-w-full overflow-hidden">
				{attachment.filename}
			</p>
			<Skeleton isLoaded={isReady} className="rounded mt-1">
				<Slider
					size="sm"
					defaultValue={0}
					value={position}
					maxValue={duration}
					onChange={(value) => {
						setPosition(
							typeof value == 'number' ? value : value[0],
						);
						if (!seeking) setSeeking(true);
					}}
					onChangeEnd={(new_pos) => {
						playerRef.current?.seekTo(
							typeof new_pos == 'number' ? new_pos : new_pos[0],
						);
						setSeeking(false);
					}}
				/>
			</Skeleton>
			<div className="flex flex-row justify-between">
				<Skeleton isLoaded={isReady} className="h-[8px] mt-1 rounded">
					<p className="text-small">
						{format_audio_duration(position)}
					</p>
				</Skeleton>
				<Skeleton isLoaded={isReady} className="mt-1 rounded">
					<Button
						isIconOnly
						variant="solid"
						color="primary"
						onClick={() => {
							setPlaying(!playing);
						}}
					>
						{playing ? <PauseIcon /> : <PlayIcon />}
					</Button>
				</Skeleton>
				<Skeleton isLoaded={isReady} className="h-[8px] mt-1 rounded">
					<p className="text-small">
						{format_audio_duration(duration)}
					</p>
				</Skeleton>
			</div>
		</div>
	);
}
