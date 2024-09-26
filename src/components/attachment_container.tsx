import { useEffect, useState } from "react";
import { get_attachment, get_current_host } from "../utils/functions/functions";
import { Attachment } from "../utils/types";
import { EVENT_EMITTER, MAXIMUM_TRIES } from "../utils/constants";
import { Document, Page } from "react-pdf";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { LazyLoadImage } from "react-lazy-load-image-component";

interface IProps {
	attachment: Attachment;
}

export default function AttachmentContainer({ attachment }: IProps) {
	let element = <p>{attachment.filename}</p>;
	const [hovering, setHovering] = useState(false);

	const [attachmentFile, setAttachmentFile] = useState<Blob | undefined>(undefined);

	if (attachment.mime_type.startsWith("image")) {
		element = (
			<div>
				<LazyLoadImage
					effect="blur"
					className="mw-100 mh-100 rounded-2"
					loading="lazy"
					style={{objectFit: "cover"}}
					// onLoad={() => EVENT_EMITTER.emit("updated-attachments")}
					src={get_current_host(attachment.path)}
					alt=""
				/>
			</div>
		);
	} else if (attachment.mime_type.startsWith("video")) {
		element = (
			<video
				className="rounded-2 mw-100"
				src={get_current_host(attachment.path)}
				controls={hovering}
			></video>
		);
	} else if (attachment.mime_type.startsWith("audio")) {
		element = (
			<audio
				className="mw-100"
				src={get_current_host(attachment.path)}
				controls
			></audio>
		);
	} else if (
		attachment.preview_path
	) {
		element = (
			<div>
				<LazyLoadImage
					effect="blur"
					className="mw-100 rounded-2"
					loading="lazy"
					style={{objectFit: "cover", objectPosition: "0% 0%", maxHeight: "150px", minHeight:"100%", minWidth: "240px"}}
					// onLoad={() => EVENT_EMITTER.emit("updated-attachments")}
					src={get_current_host(attachment.preview_path)}
					alt=""
				/>
			</div>
		);
	}
	useEffect(() => {
		get_attachment(attachment.path!).then((file) => file && setAttachmentFile(file));
	}, []);

	return (
		<div
			className="list-group-item p-2 pb-0"
			onMouseOver={() => setHovering(true)}
			onMouseLeave={() => setHovering(false)}
			style={{ maxWidth: "300px"}}
		>
			{element}
		</div>
	);
}
