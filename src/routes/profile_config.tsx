import { useEffect, useState } from "react";
import { get_current_user } from "../utils/functions/user";

function ProfileConfig(){

	const [name, setName] = useState("");

	useEffect(()=>{
		get_current_user().then((user)=>{
			setName(user.name.split(" ")[0]);
		});
	}, []);

	return (
		<div className="card w-100 m-5" style={{maxWidth: "800px"}}>
			<h3 className="my-5 text-center">Olá{name.length === 0 ? "": ` Apollo`}!</h3>
		</div>
	)
}


export default ProfileConfig;
