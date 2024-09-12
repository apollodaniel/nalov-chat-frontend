import { useEffect, useState } from "react";
import { get_auth_token, get_current_user } from "../utils/functions/user";
import { User } from "../utils/types";
import LoadingBar from "../components/loading_bar";
import { get_current_host } from "../utils/functions/functions";
import ProfilePicture from "../components/profile_picture";
import { useBlocker, useNavigate } from "react-router-dom";
import ConfirmationPopup from "../components/confirmation_popup";

function ProfileConfig() {
	const [user, setUser] = useState<User | undefined>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);

	const [name, setName] = useState<string | undefined>(undefined);
	const [profilePicture, setProfilePicture] = useState<FileList | null>(null);

	const [imageLocation, setImageLocation] = useState("");

	const [changed, setChanged] = useState(false);


	// useEffect(()=>{
	// 	window.onbeforeunload  = (e) => {
	// 		if (!name && !profilePicture) {
	// 			return undefined;
	// 		}
	// 		const message =
	// 			"Você realmente deseja sair?\nExistem mudanças que não foram salvas.";
	//
	// 		return message;
	// 	};
	// }, [name, profilePicture]);


	let blocker = useBlocker(changed);

	useEffect(() => {
		if (user) {
			setImageLocation(get_current_host(user!.profile_picture));
		}
	}, [user]);

	useEffect(() => {
		if (profilePicture) {
			const url_creator = window.URL || window.webkitURL;
			const url = url_creator.createObjectURL(profilePicture[0]);
			setImageLocation(url);
		}
	}, [profilePicture]);

	useEffect(() => {
		get_current_user().then((result) => {
			setUser(result);
			setName(result.name);
			setLoading(false);
		});
	}, []);



	return (
		<div
			className="card w-100 m-5 d-flex flex-column align-items-center justify-content-center"
			style={{ maxWidth: "800px", minHeight: "400px" }}
		>
			{loading ? (
				<LoadingBar />
			) : (
				<div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center pb-5">
					<ProfilePicture
						url={imageLocation}
						onClick={() => {
							document.getElementById("file-picker")?.click();
						}}
					/>
					<form
						id="profile-config-form"
						action={get_current_host("/api/users/current")}
						method="PATCH"
						encType="multipart/form-data"
						className="w-100 px-5 d-flex flex-column gap-2"
						onSubmit={async (event) => {
							event.preventDefault();

							let formData = new FormData();
							formData.append("name", name!);

							if (profilePicture && profilePicture.length !== 0) {
								console.log(
									"Profile Picture File:",
									profilePicture[0],
								); // Ensure it's a File object
								formData.append(
									"profile_picture",
									profilePicture[0],
								);
							}

							setLoading(true);

							// Log formData entries
							for (let [key, value] of formData.entries()) {
								console.log(key, value);
							}

							const auth_token = await get_auth_token();

							const request = new XMLHttpRequest();
							request.open(
								"PATCH",
								get_current_host("/api/users/current"),
								true,
							);

							// Set authorization header, but do not set content-type for formData
							request.setRequestHeader(
								"Authorization",
								`Bearer ${auth_token}`,
							);

							request.onreadystatechange = () => {
								if (request.readyState === 4) {
									if (request.status === 200) {
										console.log(
											"Success:",
											request.responseText,
										);

										if(blocker.proceed) blocker.proceed();

										window.open("/config/profile", "_self");
									} else {
										console.error(
											"Upload failed:",
											request.status,
											request.statusText,
										);
										setLoading(false);
									}
								}
							};

							// Send the formData (automatically sets the proper content-type for multipart data)
							request.send(formData);
						}}
					>
						<div>
							<input
								id="file-picker"
								type="file"
								accept="image/*"
								style={{ display: "none" }}
								onChange={(event) => {
									setChanged(true);
									setProfilePicture(event.target.files);
								}}
							/>
						</div>

						<div className="form-floating w-100">
							<input
								type="text"
								className="form-control"
								value={user!.username}
								disabled={true}
							/>
							<label>Username</label>
						</div>
						<div className="form-floating w-100">
							<input
								type="text"
								className="form-control"
								value={name!}
								onChange={(event) =>
									{

										setChanged(true);
										setName(event.target.value)
									}
								}
							/>
							<label htmlFor="name">Name</label>
						</div>
						<button className={"btn btn-primary mt-3 "+(changed ? "" : "disabled")} type="submit">
							Salvar
						</button>
					</form>

					<ConfirmationPopup
						visible={blocker.state === "blocked"}
						title="Aviso"
						content={"Você tem certeza que deseja deixar a página? Existem configurações não salvas"}
						onCancel={()=>blocker.reset && blocker.reset()}
						onConfirm={()=>blocker.proceed && blocker.proceed()}
					/>
				</div>
			)}
		</div>
	);
}

export default ProfileConfig;
