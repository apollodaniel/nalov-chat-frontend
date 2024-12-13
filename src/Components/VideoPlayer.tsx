import ReactPlayer from 'react-player/file';
import { Attachment } from '../Utils/Types';
import {
	formatAudioDuration,
	getCurrentHost,
} from '../Utils/Functions/Functions';
import { useEffect, useRef, useState } from 'react';
import { OnProgressProps } from 'react-player/base';
import { Button, Card, CardFooter, Slider } from '@nextui-org/react';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import PauseIcon from '@mui/icons-material/Pause';
import PlayIcon from '@mui/icons-material/PlayArrow';
import Skeleton from './Skeleton';
import Replay5 from '@mui/icons-material/Replay5';
import Forward5 from '@mui/icons-material/Forward5';

interface IProps {
	attachment: Attachment;
	url: string;
	onReady: () => void;
	onError: () => void;
	isPreviewOnly?: boolean;
}

export default function VideoPlayer({
	attachment,
	url,
	onReady,
	onError,
	isPreviewOnly = false,
}: IProps) {
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
	const [playbackRate, setPlaybackRate] = useState(1);

	const playerWrapperRef = useRef<HTMLDivElement>(null);

	const handleFullscreen = () => {
		if (playerWrapperRef.current) {
			if (playerWrapperRef.current.requestFullscreen) {
				if (document.fullscreen) document.exitFullscreen();
				else playerWrapperRef.current.requestFullscreen();
			}
		}
	};

	return (
		<Card
			ref={playerWrapperRef}
			className={`p-0 max-h-full ${isPreviewOnly ? 'rounded-none' : 'rounded-2xl'} [&>.overlay]:hover:opacity-100 [&>.overlay]:opacity-0 bg-background`}
			isFooterBlurred
		>
			<div className="w-full h-full aspect-square *:*:!rounded">
				<ReactPlayer
					ref={playerRef}
					url={url}
					playing={playing}
					onReady={() => {
						onReady();
						setIsReady(true);
					}}
					onError={onError}
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
					playbackRate={playbackRate}
				/>
			</div>

			<CardFooter
				className={`overlay ${isPreviewOnly ? 'hidden' : 'flex flex-col'}  absolute z-10 bottom-0 gap-1 p-0 py-1 px-2 bg-background bg-opacity-75 transition ease-in-out`}
				onClick={(event) => {
					event.preventDefault();
					event.stopPropagation();
				}}
			>
				<div className="flex flex-row justify-between gap-1 w-full">
					<Skeleton isLoaded={isReady} className="h-[8px]  rounded">
						<p className="text-xs">
							{formatAudioDuration(position)}
						</p>
					</Skeleton>

					<Skeleton isLoaded={isReady} className="rounded w-full">
						<Slider
							size="sm"
							hideThumb
							value={position}
							defaultValue={0}
							className="w-full"
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
							{formatAudioDuration(duration)}
						</p>
					</Skeleton>
				</div>
				<div className="w-full flex flex-row justify-center justify-between">
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
					<div className="flex flex-row gap-2">
						<Skeleton isLoaded={isReady} className="rounded">
							<Button
								isIconOnly
								size="sm"
								variant="flat"
								color="primary"
								onClick={() => {
									if (position - 5 <= 0) {
										playerRef.current?.seekTo(0);
										setPosition(0);
									} else {
										playerRef.current?.seekTo(position - 5);
										setPosition((prev) => prev - 5);
									}
								}}
							>
								<Replay5 />
							</Button>
						</Skeleton>
						<Skeleton isLoaded={isReady} className="rounded">
							<Button
								isIconOnly
								size="sm"
								variant="flat"
								color="primary"
								onClick={() => {
									setPlaying(!playing);
								}}
							>
								{playing ? <PauseIcon /> : <PlayIcon />}
							</Button>
						</Skeleton>
						<Skeleton isLoaded={isReady} className="rounded">
							<Button
								isIconOnly
								size="sm"
								variant="flat"
								color="primary"
								onClick={() => {
									if (position + 5 >= duration) {
										playerRef.current?.seekTo(duration - 1);
										setPosition(duration - 1);
									} else {
										playerRef.current?.seekTo(position + 5);
										setPosition((prev) => prev + 5);
									}
								}}
							>
								<Forward5 />
							</Button>
						</Skeleton>
					</div>

					<Skeleton isLoaded={isReady} className=" rounded">
						<Button
							isIconOnly
							size="sm"
							variant="flat"
							color="primary"
							onClick={() => {
								// should go fullscreen using a fullscreen modal
								handleFullscreen();
							}}
						>
							<FullscreenIcon />
						</Button>
					</Skeleton>
				</div>
			</CardFooter>
		</Card>
	);
}
