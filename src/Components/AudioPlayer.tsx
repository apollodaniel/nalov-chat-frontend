import ReactPlayer from 'react-player/file';
import { Attachment } from '../Utils/Types';
import {
	formatAudioDuration,
	getCurrentHost,
} from '../Utils/Functions/Functions';
import { useEffect, useRef, useState } from 'react';
import { OnProgressProps } from 'react-player/base';
import { Button, Card, Slider } from '@nextui-org/react';
import PlayIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Skeleton from './Skeleton';

interface IProps {
	attachment: Attachment;
	url: string;
	onReady: () => void;
	onError: () => void;
}

export default function AudioPlayer({
	attachment,
	url,
	onReady,
	onError,
}: IProps) {
	const [playing, setPlaying] = useState(false);
	const [duration, setDuration] = useState(0);
	const [progress, setProgress] = useState<OnProgressProps>({
		playedSeconds: 0,
		played: 0,
		loaded: 0,
		loadedSeconds: 0,
	});
	const [playbackRate, setPlaybackRate] = useState(1);
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
				url={url}
				playing={playing}
				onReady={() => {
					onReady();
					setIsReady(true);
				}}
				onError={onError}
				onPlay={() => setPlaying(true)}
				onEnded={() => setPlaying(false)}
				onDuration={(duration) => setDuration(duration)}
				onProgress={(prog) => !seeking && setProgress(prog)}
				volume={1}
				playbackRate={playbackRate}
			/>

			<div className="flex flex-row gap-1 justify-between items-center">
				<p className="text-small text-ellipsis whitespace-nowrap max-w-full overflow-hidden">
					{attachment.filename}
				</p>

				<Skeleton isLoaded={isReady} className=" rounded">
					<Button
						className="h-[32px] flex flex-col justify-center items-center"
						color="primary"
						variant="flat"
						isIconOnly
						onClick={() => {
							if (playbackRate == 2) {
								setPlaybackRate(1);
							} else {
								setPlaybackRate(playbackRate + 0.5);
							}
						}}
					>
						{playbackRate}x
					</Button>
				</Skeleton>
			</div>
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
					onChangeEnd={(newPos) => {
						playerRef.current?.seekTo(
							typeof newPos == 'number' ? newPos : newPos[0],
						);
						setSeeking(false);
					}}
				/>
			</Skeleton>
			<div className="flex flex-row justify-between mt-1">
				<Skeleton isLoaded={isReady} className="h-[8px]  rounded">
					<p className="text-small">
						{formatAudioDuration(position)}
					</p>
				</Skeleton>
				<Skeleton isLoaded={isReady} className=" rounded">
					<Button
						isIconOnly
						variant="flat"
						color="primary"
						onClick={() => {
							setPlaying(!playing);
						}}
					>
						{playing ? <PauseIcon /> : <PlayIcon />}
					</Button>
				</Skeleton>
				<Skeleton isLoaded={isReady} className="h-[8px] rounded">
					<p className="text-small">
						{formatAudioDuration(duration)}
					</p>
				</Skeleton>
			</div>
		</div>
	);
}
