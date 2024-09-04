import { useEffect, useRef, useState } from "react";
import { ChatType, Message, User } from "../utils/types";
import LoadingBar from "../components/loading_bar";
import { get_user } from "../utils/functions/user";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AxiosError, isAxiosError } from "axios";
import {
	get_messages,
	listen_messages,
	send_message,
} from "../utils/functions/chat";
import { get_current_host } from "../utils/functions/functions";
import { EventSourcePolyfill } from "event-source-polyfill";
import {
	DATETIME_FORMATTER,
	SHORT_DATETIME_FORMATTER,
} from "../utils/constants";

function Chat() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [user, setUser] = useState<User | undefined>(undefined);
	const [sendMessageContent, setSendMessageContent] = useState<string>("");
	const bottomRef = useRef(null);

	const params = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const getMessages = async () => {
		try {
			const messages = await get_messages(params["id"]!);
			setMessages(messages);

			listen_messages(params["id"]!, (messages: Message[]) => {
				setMessages(messages);
			});
		} catch (err: any) {
			if (isAxiosError(err) && err.response) {
				// errors
				console.log(err.response.data);
			}
			navigate(location.pathname);
		}
	};
	const getUser = async () => {
		try {
			console.log(params["id"]);
			const user = await get_user(params["id"] || "");
			setUser(user);
		} catch (err: any) {
			if (isAxiosError(err) && err.response) {
				// erro na response
				if (!err.status || (err.status && err.status === 404)) {
					navigate("/");
				}
			}
		}
	};

	const sendMessage = async () => {
		const message_content = sendMessageContent;
		try {
			await send_message({
				content: message_content,
				receiver_id: params["id"]!,
			});
			setSendMessageContent("");
		} catch (err: any) {
			console.log(err.message);
		}
	};

	useEffect(() => {
		getUser().then(() => {
			getMessages();
		});
	}, []);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return !user ? (
		<LoadingBar />
	) : (
		<div
			className="card w-100 h-100 d-flex flex-column "
			style={{ maxHeight: "90vh", maxWidth: "800px" }}
		>
			<div
				className="card rounded-0 w-100 p-3"
				style={{ height: "100px" }}
			>
				<div className="fs-5 fw-bold">{user.name}</div>
				{user.username}
			</div>
			<div
				className="card w-100 h-100 d-flex flex-column gap-3 p-4"
				style={{
					overflowY: "auto"
				}}
			>
				<div className="card-body d-flex flex-column align-items-start gap-2">
					{messages.map((msg) => (
						<div
							className={`card d-flex flex-column justify-content-between p-0 px-3 py-3 gap-1 ${params["id"]! === msg.sender_id ? "align-self-start" : "align-self-end"}`}
							style={{
								minHeight: "50px",
								minWidth: "150px",
								maxWidth: "100%"
							}}
						>
							{msg.content}
							<p
								className="m-0 align-self-end"
								style={{ fontSize: "10px" }}
							>
								{SHORT_DATETIME_FORMATTER.format(msg.date)}
							</p>
						</div>
					))}

				<div ref={bottomRef}></div>
				</div>
			</div>
			<div className="w-100 bg-white">
				<div className="form-floating">
					<input
						className="form-control rounded-0"
						type="text"
						onChange={(event) => {
							setSendMessageContent(event.target.value);
						}}
						onKeyDownCapture={(event) => {
							if (event.key == "Enter") {
								sendMessage();
							}
						}}
						value={sendMessageContent}
					/>
					<label>Message</label>
				</div>
			</div>
		</div>
	);
}

export default Chat;
