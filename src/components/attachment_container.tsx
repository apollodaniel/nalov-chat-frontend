import { useState } from 'react';
import { get_current_host } from '../utils/functions/functions';
import { Attachment } from '../utils/types';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';

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

	const [loaded, setLoaded] = useState(true);

	if (attachment.mime_type.startsWith('image')) {
		element = (
			<LazyLoadImage
				effect="blur"
				className="mw-100 mh-100 rounded-2 mt-2"
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
		);
	} else if (attachment.mime_type.startsWith('video')) {
		element = (
			<video
				className="rounded-2 mw-100 mt-2"
				src={_get_current_host(attachment.path!)}
				controls={hovering}
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
		);
	} else if (attachment.mime_type.startsWith('audio')) {
		element = (
			<audio
				className="mw-100 mt-2"
				src={_get_current_host(attachment.path!)} // Update src with retry value
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
				controls
			/>
		);
	} else if (attachment.preview_path) {
		element = (
			<div className="w-100 d-flex">
				<LazyLoadImage
					effect="blur"
					className={`mw-100 rounded-2 mt-2  ${loaded ? 'd-inline-block' : 'd-none'}`}
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
					// onLoad={() => EVENT_EMITTER.emit("updated-attachments")}
					src={_get_current_host(attachment.preview_path)}
					alt=""
				/>
				<FilenameElement loaded={loaded} />
			</div>
		);
	}

	return (
		<div
			className="list-group-item p-2 pt-0 pb-0 d-flex"
			onMouseOver={() => setHovering(true)}
			onMouseLeave={() => setHovering(false)}
			style={{ maxWidth: '300px' }}
		>
			{element}
		</div>
	);
}
