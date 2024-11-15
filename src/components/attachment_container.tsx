import { useState } from 'react';
import { get_current_host } from '../utils/functions/functions';
import { Attachment } from '../utils/types';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Card } from '@nextui-org/react';
import AudioPlayer from './audio_player';
import Skeleton from './Skeleton';

interface IProps {
	attachment: Attachment;
}

export default function AttachmentContainer({ attachment }: IProps) {
	const [retry, setRetry] = useState(0);
	function FilenameElement(obj: { loaded?: boolean }) {
		return (
			<small
				style={{ fontSize: '12px' }}
				className={`ms-auto ${obj.loaded ? 'd-none' : 'd-inline-block mt-1 me-2'}`}
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
			<Skeleton isLoaded={loaded}>
				<LazyLoadImage
					className="w-full h-full aspect-square rounded-2xl"
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
			</Skeleton>
		);
	} else if (attachment.mime_type.startsWith('video')) {
		element = (
			<Skeleton isLoaded={loaded}>
				<video
					className="w-full h-full aspect-square rounded-2xl"
					src={_get_current_host(attachment.path!)}
					controls={hovering}
					onCanPlay={() => setLoaded(true)}
					onError={(event) => {
						if (retry > 5) {
							setLoaded(false);
						} else {
							setTimeout(() => {
								setRetry((prev) => prev + 1); // Increment retry to trigger re-render
								event.currentTarget.load(); // Reload the audio after 2 seconds
							}, 2000);
						}
					}}
				></video>
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
			<Skeleton className="w-100 flex" isLoaded={loaded}>
				<LazyLoadImage
					className={`mw-100 rounded-2xl mt-2  ${loaded ? 'd-inline-block' : 'd-none'}`}
					loading="lazy"
					onError={() => {
						if (retry > 5) {
							setLoaded(false);
						} else {
							setTimeout(() => {
								setRetry((prev) => prev + 1); // Increment retry to trigger re-render
							}, 2000);
						}
					}}
					style={{
						objectFit: 'cover',
						objectPosition: '0% 0%',
						maxHeight: '150px',
						minWidth: '240px',
					}}
					onLoad={() => setLoaded(true)}
					src={_get_current_host(attachment.preview_path)}
					alt=""
				/>
				<FilenameElement loaded={loaded} />
			</Skeleton>
		);
	}

	return (
		<div
			className="w-[300px] h-auto"
			onMouseOver={() => setHovering(true)}
			onMouseLeave={() => setHovering(false)}
		>
			{element}
		</div>
	);
}
