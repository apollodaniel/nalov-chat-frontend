import { useState } from 'react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Skeleton from './Skeleton';
import { Attachment } from '../Utils/Types';
import { getCurrentHost } from '../Utils/Functions/Functions';
import { Image } from '@nextui-org/react';
import VideoPlayer from './VideoPlayer';
import AudioPlayer from './AudioPlayer';

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
	const _getCurrentHost = (path: string) => {
		return `${getCurrentHost(path)}?retry=${retry}`; // Cache-busting query parameter
	};
	let element = <FilenameElement />;
	const [loaded, setLoaded] = useState(false);

	if (attachment.mimeType.startsWith('image')) {
		element = (
			<Skeleton className="w-100 flex flex-col" isLoaded={loaded}>
				<Image
					className={`w-full h-full aspect-square ${isPreviewOnly ? 'rounded-none' : 'rounded-2xl'}`}
					onLoad={() => setLoaded(true)}
					style={{ objectFit: 'cover' }}
					src={_getCurrentHost(attachment.path!)}
					alt=""
				/>
				{!isPreviewOnly && <FilenameElement />}
			</Skeleton>
		);
	} else if (attachment.mimeType.startsWith('video')) {
		element = (
			<Skeleton isLoaded={loaded} className="w-full flex flex-col">
				<VideoPlayer
					attachment={attachment}
					url={_getCurrentHost(attachment.path!)}
					onReady={() => setLoaded(true)}
					onError={() => {
						if (retry > 5) {
							setLoaded(false);
						} else {
							setTimeout(() => {
								setRetry((prev) => prev + 1); // Increment retry to trigger re-render
							}, 2000);
						}
					}}
					isPreviewOnly={isPreviewOnly}
				/>
				{!isPreviewOnly && <FilenameElement />}
			</Skeleton>
		);
	} else if (attachment.mimeType.startsWith('audio')) {
		element = (
			<AudioPlayer
				attachment={attachment}
				url={_getCurrentHost(attachment.path!)}
				onReady={() => setLoaded(true)}
				onError={() => {
					if (retry > 5) {
						setLoaded(false);
					} else {
						setTimeout(() => {
							setRetry((prev) => prev + 1); // Increment retry to trigger re-render
						}, 2000);
					}
				}}
			/>
		);
	} else if (attachment.previewPath) {
		element = (
			<Skeleton className="w-100 flex flex-col" isLoaded={loaded}>
				<Image
					className={`w-full h-full aspect-square ${isPreviewOnly ? 'rounded-none' : 'rounded-2xl'}`}
					onLoad={() => setLoaded(true)}
					loading="lazy"
					style={{ objectFit: 'cover' }}
					src={_getCurrentHost(attachment.previewPath!)}
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
