import { useEffect, useState } from "react";
import { get_user_chats } from "../utils/functions/chat";
import { isAxiosError } from "axios";
import { parse_errors } from "../utils/functions/functions";
import { BackendError,  ChatType, User } from "../utils/types";
import ErrorPopup from "../components/error_modal";
import { DATETIME_FORMATTER, modal_errors } from "../utils/constants";
import { get_available_users } from "../utils/functions/user";
import { useNavigate } from "react-router-dom";

function Home(){
	// main page

	const [chats, setChats] = useState<ChatType[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [errorText, setErrorText] = useState<string | undefined>(undefined);
	const [search, setSearch] = useState<string>("");

	const navigate = useNavigate();

	const get_users = async ()=>{
		try{
			const users = await get_available_users();
			setUsers(users);
			setErrorText(undefined);
		}catch(err: any){
			if(isAxiosError(err) && err.response && err.response.data){
				// backend error
				const parsed_error = parse_errors(err.response.data.errors as BackendError[]);
				setErrorText(parsed_error);
			}
		}
	}

	const get_chats = async ()=>{
		try{
			const chat_result = await get_user_chats();
			setChats(chat_result.chats);
			setErrorText(undefined);
		}catch(err: any){
			if(isAxiosError(err) && err.response && err.response.data){
				// backend error
				const parsed_error = parse_errors(err.response.data.errors as BackendError[]);
				setErrorText(parsed_error);
			}
		}
	};

	useEffect(()=>{
		get_chats();
		get_users();
	}, []);

	return (
		<div className="card w-100 d-flex flex-column my-5 gap-3 p-3" style={{maxWidth: "1200px", height: "90vh"}}>
			<div className="form-floating">
				<input type="search" className="form-control" onChange={
					(event)=>{
						console.log(search);
						setSearch(event.target.value);
					}
				}/>
				<label>Search</label>
			</div>
				<ul className="list-group">
				{
					search.length === 0 ?
					// chats
					chats.map(c=>
						(
							<li className="list-group-item list-group-item-action d-flex flex-column" onClick={()=>{
									navigate(`/chat/${c.user.id}`);
								}}>
								<div className="d-flex flex-row justify-content-between">
									<div className="fw-bold h4">{c.user.name}</div>
									<p>{c.user.username}</p>
								</div>
								<div className="d-flex flex-row justify-content-between">
									<p>{c.last_message.content.length > 15 ? c.last_message.content.substring(0,15) : c.last_message.content}</p>
									<p>{DATETIME_FORMATTER.format(c.last_message.date)}</p>
								</div>
							</li>
						)
					)
					:
					// users
					users.map((u)=>
						(
							<li className="list-group-item list-group-item-action" onClick={()=>{
									navigate(`/chat/${u.id}`);
								}}>
								<div className="fw-bold h4">{u.username}</div>
								{u.name}
							</li>
						)
					)
				}
				</ul>
			<ErrorPopup
				visible={!Object.is(errorText, undefined)}
				title={modal_errors.home.title}
				content={(errorText && errorText) || ""}
			/>
		</div>
	)
}

export default Home;
