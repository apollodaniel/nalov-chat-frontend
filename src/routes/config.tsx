import { useEffect, useState } from "react";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { get_current_user } from "../utils/functions/user";
import ConfirmationPopup from "../components/confirmation_popup";
import { useNavigate } from "react-router-dom";

function Config(){
	const [name, setName] = useState("");
	const [showDeleteAccountPopup, setShowDeleteAccountPopup] = useState(false);
	const navigate = useNavigate();

	useEffect(()=>{
		get_current_user().then((user)=>{
			setName(user.name.split(" ")[0]);
		});
	}, []);

	return (
		<div className="card w-100 m-3 my-4 p-3" style={{maxWidth: "800px"}}>
			<h3 className="my-5 text-center">O que deseja configurar{name.length === 0 ? "": `, ${name}`}?</h3>
			<ul className="list-group rounded-4">
				<li
					className="list-group-item list-group-item-action d-flex align-items-center"
					style={{height: "60px"}}
					onClick={()=>{
						navigate("/config/profile");
					}}
				>
					Configurações do perfil
				</li>
				<li
					className="list-group-item list-group-item-danger list-group-item-action d-flex align-items-center"
					style={{height: "60px"}}
					onClick={()=>setShowDeleteAccountPopup(true)}

				>
					Apagar minha conta
				</li>
			</ul>

			<ConfirmationPopup
				visible={showDeleteAccountPopup}
				title="Aviso!"
				content="Você realmente deseja apagar sua conta? :/"
				onCancel={()=> setShowDeleteAccountPopup(false)}
				onConfirm={()=>setShowDeleteAccountPopup(false)}
			/>
		</div>
	)
}

export default Config;
