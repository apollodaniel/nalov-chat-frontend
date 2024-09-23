import { useEffect, useState } from "react";
import { get_attachment, get_current_host } from "../utils/functions/functions";
import { Attachment } from "../utils/types";
import { EVENT_EMITTER, MAXIMUM_TRIES } from "../utils/constants";
import { Document, Page } from "react-pdf";

interface IProps {
    attachment: Attachment;
}

export default function AttachmentContainer({ attachment }: IProps) {
    const [element, setElement] = useState(<p>{attachment.filename}</p>);
    const [hovering, setHovering] = useState(false);

    useEffect(() => {
        if (attachment.mime_type.startsWith("image")) {
            setElement(
                <div>
                    <img
                        className="mw-100 rounded-2"
                        style={{ minHeight: "100%" }}
                        onLoad={() => EVENT_EMITTER.emit("updated-attachments")}
                        src={get_current_host(attachment.path)}
                        alt=""
                    />
                </div>,
            );
        } else if (attachment.mime_type.startsWith("video")) {
            setElement(
                <video
                    className="rounded-2 mw-100"
                    src={get_current_host(attachment.path)}
                    controls={hovering}
                ></video>,
            );
        } else if (attachment.mime_type.startsWith("audio")) {
            setElement(
                <audio
                    className="mw-100"
                    src={get_current_host(attachment.path)}
                    controls
                ></audio>,
            );
        } else if (
            attachment.mime_type === "application/pdf" &&
            attachment.byte_length < 1024 * 1024 * 3
        ) {
            get_attachment(attachment.path!).then((file) => {
                setElement(
                    <div className="overflow-hidden mw-100" style={{maxHeight: "120px"}}>
                        <Document file={file}>
                            <Page width={300}  pageNumber={1}></Page>
                        </Document>

                    </div>
                );
            });
        }
    }, []);

    // const get_url = async (tries: number) => {
    //     if (attachmentUrl === "") {
    //         console.log("Trying");
    //         const url = await get_attachment(attachment.path!);
    //         if (url) {
    //             setAttachmentUrl(url);
    //         } else if (tries > 0) {
    //             await new Promise((r) => setTimeout(() => r, 2000));
    //             await get_url(tries - 1);
    //         }
    //     }
    // };
    //
    //      <source src={get_current_host(attachment.path)} type={attachment.mime_type} />
    // if (
    //     attachment.mime_type.startsWith("image") ||
    //     attachment.mime_type.startsWith("video")
    // )
    //     get_url(MAXIMUM_TRIES);
    //
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
