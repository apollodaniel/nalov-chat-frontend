import { useState } from 'react';
import { get_current_host } from '../utils/functions/functions';
import { Attachment } from '../utils/types';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Card } from '@nextui-org/react';
import AudioPlayer from './audio_player';
import Skeleton from './Skeleton';
import VideoPlayer from './video_player';

interface IProps {
	attachment: Attachment;
	isPreviewOnly?: boolean;
}

export default function AttachmentContainer({
	attachment,
	isPreviewOnly = false,
}: IProps) {
	const [retry, setRetry] = useState(0);
	function FilenameElement({ loaded = false }: { loaded?: boolean }) {
		return (
			<small
				style={{ fontSize: '12px' }}
				className={`ms-auto ${loaded ? 'd-none' : 'd-inline-block mt-1 me-2'}`}
			>
				{' '}
				{attachment.filename}
			</small>
		);
	}
	const _get_current_host = (path: string) => {
		return `${get_current_host(path)}?retry=${retry}`; // Cache-busting query parameter
	};
	let element = <FilenameElement />;
	const [hovering, setHovering] = useState(false);
	const [loaded, setLoaded] = useState(false);

	if (attachment.mime_type.startsWith('image')) {
		element = (
			<Skeleton className="w-100 flex flex-col" isLoaded={loaded}>
				<LazyLoadImage
					className={`w-full h-full aspect-square ${isPreviewOnly ? 'rounded-none' : 'rounded-2xl'}`}
					onLoad={() => setLoaded(true)}
					onError={(event) => {
						if (retry > 5) {
							setLoaded(false);
						} else {
							setTimeout(() => {
								setRetry((prev) => prev + 1); // Increment retry to trigger re-render
							}, 2000);
						}
					}}
					loading="lazy"
					style={{ objectFit: 'cover' }}
					src={_get_current_host(attachment.path!)}
					alt=""
				/>
				{!isPreviewOnly && <FilenameElement />}
			</Skeleton>
		);
	} else if (attachment.mime_type.startsWith('video')) {
		element = (
			<Skeleton isLoaded={loaded} className="w-full flex flex-col">
				<VideoPlayer
					attachment={attachment}
					onReady={() => setLoaded(true)}
					isPreviewOnly={isPreviewOnly}
				/>
				{!isPreviewOnly && <FilenameElement />}
			</Skeleton>
		);
	} else if (attachment.mime_type.startsWith('audio')) {
		//element = (
		//	<audio
		//		className="w-full"
		//		src={_get_current_host(attachment.path!)} // Update src with retry value
		//		onError={(event) => {
		//			if (retry > 5) {
		//				setLoaded(false);
		//			} else {
		//				setTimeout(() => {
		//					setRetry((prev) => prev + 1); // Increment retry to trigger re-render
		//					event.currentTarget.load(); // Reload the audio after 2 seconds
		//				}, 2000);
		//			}
		//		}}
		//		onLoad={() => setLoaded(true)}
		//		controls
		//	/>
		//);
		element = (
			<AudioPlayer
				attachment={attachment}
				onReady={() => setLoaded(true)}
			/>
		);
	} else if (attachment.preview_path) {
		element = (
			<Skeleton className="w-100 flex flex-col" isLoaded={loaded}>
				<LazyLoadImage
					className={`w-full h-full aspect-square ${isPreviewOnly ? 'rounded-none' : 'rounded-2xl'}`}
					onLoad={() => setLoaded(true)}
					onError={(event) => {
						if (retry > 5) {
							setLoaded(false);
						} else {
							setTimeout(() => {
								setRetry((prev) => prev + 1); // Increment retry to trigger re-render
							}, 2000);
						}
					}}
					loading="lazy"
					style={{ objectFit: 'cover' }}
					src={_get_current_host(attachment.preview_path!)}
					alt=""
				/>
				<FilenameElement />
			</Skeleton>
		);
	}

	return (
		<div
			className={`w-[300px] h-auto ${isPreviewOnly ? 'pointer-events-none' : ''}`}
		>
			{element}
		</div>
	);
}
