import { useEffect, useState } from "react";
import { ChatType, Message, User } from "../utils/types";
import LoadingBar from "../components/loading_bar";
import { get_user } from "../utils/functions/user";
import { useNavigate, useParams } from "react-router-dom";
import { AxiosError, isAxiosError } from "axios";
import { get_messages, listen_messages } from "../utils/functions/chat";
import { get_current_host } from "../utils/functions/functions";
import { EventSourcePolyfill } from "event-source-polyfill";
import { DATETIME_FORMATTER, SHORT_DATETIME_FORMATTER } from "../utils/constants";

function Chat() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [user, setUser] = useState<User | undefined>(undefined);

	const params = useParams();
	const navigate = useNavigate();

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

	useEffect(() => {
		getUser().then(() => {
			getMessages();
		});
	}, []);

	return !user ? (
		<LoadingBar />
	) : (
		<div
			className="card w-100 d-flex flex-column gap-3"
			style={{ height: "90vh", maxWidth: "800px" }}
		>
			<div
				className="card rounded-0 w-100 p-3"
				style={{ height: "100px" }}
			>
				<div className="fs-5 fw-bold">{user.name}</div>
				{user.username}
			</div>
			<div className="h-100 w-100 d-flex flex-column gap-3 p-4">
				{messages.map((msg) => (
					<div
						className={`card d-flex flex-column justify-content-between p-0 px-3 py-2 gap-1 ${params["id"]! === msg.sender_id ? "align-self-start":"align-self-end"}`}
						style={{minHeight: "50px", minWidth: "150px"}}
					>
						{msg.content}
						<p className="m-0 align-self-end" style={{fontSize: "10px"}}>{SHORT_DATETIME_FORMATTER.format(msg.date)}</p>
					</div>
				))}
			</div>
			<div className="w-100 bg-white ">
				<div className="form-floating">
					<input className="form-control rounded-0" type="text" />
					<label>Message</label>
				</div>
			</div>
		</div>
	);
}

export default Chat;
