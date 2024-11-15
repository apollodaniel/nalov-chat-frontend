import ReactPlayer from 'react-player/file';
import { Attachment } from '../utils/types';
import {
	format_audio_duration,
	get_current_host,
} from '../utils/functions/functions';
import { useEffect, useRef, useState } from 'react';
import { OnProgressProps } from 'react-player/base';
import { Button, Card, Slider } from '@nextui-org/react';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import PauseIcon from '@mui/icons-material/Pause';
import PlayIcon from '@mui/icons-material/PlayArrow';
import Skeleton from './Skeleton';

interface IProps {
	attachment: Attachment;
	onReady: () => void;
}

export default function VideoPlayer({ attachment, onReady }: IProps) {
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

	const [showPlayPauseIcon, setShowPlayPauseIcon] = useState(false);
	useEffect(() => setPosition(progress.playedSeconds), [progress]);
	return (
		<div
			className={`p-0 max-h-full ${!showPlayPauseIcon ? '[&>main]:hover:opacity-100' : ''} [&>main]:opacity-0`}
			onClick={() => {
				setPlaying(!playing);
				if (!showPlayPauseIcon) {
					setShowPlayPauseIcon(true);
					setTimeout(() => setShowPlayPauseIcon(false), 500);
				}
			}}
		>
			<div className="w-full h-full aspect-video *:*:!rounded">
				<ReactPlayer
					ref={playerRef}
					url={get_current_host(attachment.path)}
					playing={playing}
					onReady={() => {
						onReady();
						setIsReady(true);
					}}
					height={'100%'}
					width={'100%'}
					onPlay={() => setPlaying(true)}
					onEnded={() => setPlaying(false)}
					onDuration={(duration) => setDuration(duration)}
					onProgress={(prog) => !seeking && setProgress(prog)}
					volume={1}
					config={{
						forceVideo: true,
					}}
				/>
			</div>

			<div
				className={`absolute flex flex-col justify-center items-center bg-background bg-opacity-75 top-0 right-0 left-0 bottom-0 transition ease-in-out ${showPlayPauseIcon ? 'opacity-100' : 'opacity-0'} `}
			>
				{!playing ? (
					<PauseIcon fontSize="large" />
				) : (
					<PlayIcon fontSize="large" />
				)}
			</div>
			<main
				id="floating-controls"
				className="absolute  top-0 right-0 transition ease-in-out "
				onClick={(event) => {
					event.preventDefault();
					event.stopPropagation();
				}}
			>
				<Skeleton isLoaded={isReady} className=" rounded">
					<Button
						isIconOnly
						variant="bordered"
						color="primary"
						className="bg-background bg-opacity-75 border-none rounded-none rounded-bl-2xl"
						onClick={() => {
							// should go fullscreen using a fullscreen modal
						}}
					>
						<FullscreenIcon />
					</Button>
				</Skeleton>
			</main>
			<main
				className={`absolute z-10 bottom-0 left-0 right-0 px-2 pb-1 bg-background bg-opacity-75 transition ease-in-out ${showPlayPauseIcon ? 'opacity-0' : ''}`}
				onClick={(event) => {
					event.preventDefault();
					event.stopPropagation();
				}}
			>
				<p className="text-small text-ellipsis whitespace-nowrap max-w-full overflow-hidden">
					{attachment.filename}
				</p>
				<div className="flex flex-row justify-between gap-1">
					<Skeleton isLoaded={isReady} className="h-[8px]  rounded">
						<p className="text-xs">
							{format_audio_duration(position)}
						</p>
					</Skeleton>

					<Skeleton isLoaded={isReady} className="rounded w-full">
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
									typeof new_pos == 'number'
										? new_pos
										: new_pos[0],
								);
								setSeeking(false);
							}}
						/>
					</Skeleton>
					<Skeleton isLoaded={isReady} className="h-[8px]  rounded">
						<p className="text-xs">
							{format_audio_duration(duration)}
						</p>
					</Skeleton>
				</div>
			</main>
		</div>
	);
}
