import { useEffect, useState } from 'react';
import { get_current_user, refresh_user_token } from '../utils/functions/user';
import { User } from '../utils/types';
import LoadingBar from '../components/loading_bar';
import { execRequest, get_current_host } from '../utils/functions/functions';
import ProfilePicture from '../components/profile_picture';
import { useBlocker, useNavigate } from 'react-router-dom';
import ConfirmationPopup from '../components/confirmation_popup';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { EVENT_ERROR_EMITTER, toast_error_messages } from '../utils/constants';
import { Button, Input } from '@nextui-org/react';

function ProfileConfig() {
	const [user, setUser] = useState<User | undefined>();
	const [loading, setLoading] = useState(true);

	const [name, setName] = useState<string | undefined>(undefined);
	const [profilePicture, setProfilePicture] = useState<FileList | null>(null);

	const [imageLocation, setImageLocation] = useState('');

	const [changed, setChanged] = useState(false);

	let blocker = useBlocker(changed);
	let navigate = useNavigate();

	useEffect(() => {
		if (user) {
			setImageLocation(get_current_host(user!.profile_picture));
			setName(user.name);
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
			setLoading(false);
		});
	}, []);

	return (
		<div
			className="w-100 m-5 d-flex flex-column align-items-center justify-content-center"
			style={{ maxWidth: '600px', minHeight: '400px' }}
		>
			<Button
				className="flex items-center justify-center self-start mb-3 max-lg:mb-15 max-md:absolute max-md:top-[5vh]"
				style={{ height: '50px', width: '50px' }}
				onClick={() => navigate('/config')}
				isIconOnly
				variant="ghost"
			>
				<ArrowBackIcon />
			</Button>
			{loading ? (
				<LoadingBar />
			) : (
				<div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center pb-5">
					<ProfilePicture
						url={imageLocation}
						onClick={() => {
							document.getElementById('file-picker')?.click();
						}}
					/>
					<form
						id="profile-config-form"
						action={get_current_host('/api/users/current')}
						method="PATCH"
						encType="multipart/form-data"
						className="w-100 px-5 d-flex flex-column gap-2"
						onSubmit={async (event) => {
							event.preventDefault();

							const execRequest = () => {
								let formData = new FormData();
								formData.append('userName', name!);

								if (
									profilePicture &&
									profilePicture.length !== 0
								) {
									console.log(
										'Profile Picture File:',
										profilePicture[0],
									); // Ensure it's a File object
									formData.append(
										'profile_picture',
										profilePicture[0],
									);
								}

								setLoading(true);

								// Log formData entries
								for (let [key, value] of formData.entries()) {
									console.log(key, value);
								}

								const request = new XMLHttpRequest();

								request.open(
									'PATCH',
									get_current_host('/api/users/current'),
									true,
								);

								request.withCredentials = true;
								// Set authorization header, but do not set content-type for formData
								// request.setRequestHeader(
								// 	'Authorization',
								// 	`Bearer ${auth_token}`,
								// );

								request.onreadystatechange = () => {
									if (request.readyState === 4) {
										if (request.status === 200) {
											console.log(
												'Success:',
												request.responseText,
											);

											if (blocker.proceed)
												blocker.proceed();

											window.open(
												'/config/profile',
												'_self',
											);
										} else if (request.status === 601)
											refresh_user_token()
												.then(() => {
													execRequest();
												})
												.catch(() => {
													EVENT_ERROR_EMITTER.emit(
														'add-error',
														toast_error_messages.config_save_error,
													);
												});
										else
											console.error(
												'Upload failed:',
												request.status,
												request.statusText,
											);
										setLoading(false);
									}
								};

								request.onerror = () => {
									if (request.status === 601) {
										refresh_user_token()
											.then(() => {
												execRequest();
											})
											.catch(() => {
												EVENT_ERROR_EMITTER.emit(
													'add-error',
													toast_error_messages.config_save_error,
												);
											});
									} else {
										EVENT_ERROR_EMITTER.emit(
											'add-error',
											toast_error_messages.config_save_error,
										);
									}
								};
								// Send the formData (automatically sets the proper content-type for multipart data)
								request.send(formData);
							};
							execRequest();
						}}
					>
						<div>
							<input
								id="file-picker"
								type="file"
								accept="image/*"
								style={{ display: 'none' }}
								onChange={(event) => {
									setChanged(true);
									setProfilePicture(event.target.files);
								}}
							/>
						</div>

						<Input
							type="text"
							value={user!.username}
							isDisabled={true}
							label="Username"
						/>
						<Input
							type="text"
							value={name!}
							maxLength={100}
							onChange={(event) => {
								setChanged(true);
								setName(event.target.value);
							}}
							label="Name"
						/>
						<Button
							className="mt-3"
							isDisabled={!changed}
							type="submit"
							color={!changed ? 'default' : 'primary'}
						>
							Salvar
						</Button>
					</form>

					{/* Unsaved changes popup */}
					<ConfirmationPopup
						visible={blocker.state === 'blocked'}
						title="Aviso"
						content={
							'Você tem certeza que deseja deixar a página? Existem configurações não salvas!'
						}
						onCancel={() => blocker.reset && blocker.reset()}
						onConfirm={() => blocker.proceed && blocker.proceed()}
					/>
				</div>
			)}
		</div>
	);
}

export default ProfileConfig;
