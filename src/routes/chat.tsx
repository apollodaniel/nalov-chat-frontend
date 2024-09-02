import { useEffect, useState } from "react";
import { ChatType, Message, User } from "../utils/types";
import LoadingBar from "../components/loading_bar";
import { get_user } from "../utils/functions/user";
import { useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";

function Chat() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [user, setUser] = useState<User | undefined>(undefined);

	const params = useParams();
	const navigate = useNavigate();

	const getMessages = async () => { };

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
			<div className="h-100 w-100 d-flex flex-column"></div>
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
