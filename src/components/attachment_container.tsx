import { useEffect, useState } from "react";
import { get_attachment, get_current_host } from "../utils/functions/functions";
import { Attachment } from "../utils/types";
import { EVENT_EMITTER, MAXIMUM_TRIES } from "../utils/constants";
import { Document, Page } from "react-pdf";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

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
				<img
					className="mw-100 rounded-2"
					style={{ minHeight: "100%" }}
					onLoad={() => EVENT_EMITTER.emit("updated-attachments")}
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
		attachment.mime_type === "application/pdf" &&
		attachment.byte_length < 1024 * 1024 * 3
	) {
		element = (
			<div>
				{
					attachmentFile ?
						(
							<div className="overflow-hidden mw-100" style={{ maxHeight: "120px" }} >
								<Document file={attachmentFile} onError={()=>{}}>
									<Page width={300} pageNumber={1}></Page>
								</Document>
							</div >
						) :
						element
				}
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
			style={{ maxWidth: "300px" }}
		>
			{element}
		</div>
	);
}
