import { useEffect, useState } from 'react';
import { getCurrentUser, refreshUserToken } from '../Utils/Functions/User';
import { ErrorEntry, RegisterFormSubmit, User } from '../Utils/Types';
import LoadingBar from '../Components/LoadingBar';
import { getCurrentHost } from '../Utils/Functions/Functions';
import ProfilePicture from '../Components/ProfilePicture';
import { useBlocker, useNavigate } from 'react-router-dom';
import ConfirmationPopup from '../Components/ConfirmationPopup';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
	AllErrors,
	EVENT_ERROR_EMITTER,
	FIELD_PATTERNS,
} from '../Utils/Constants';
import { Button, Input } from '@nextui-org/react';
import { useForm } from 'react-hook-form';

function ProfileConfig() {
	const [user, setUser] = useState<User | undefined>();
	const [loading, setLoading] = useState(true);

	const [name, setName] = useState<string | undefined>(undefined);
	const [profilePicture, setProfilePicture] = useState<FileList | null>(null);

	const [imageLocation, setImageLocation] = useState('');

	const [changed, setChanged] = useState(false);

	let blocker = useBlocker(changed);
	let navigate = useNavigate();

	const {
		register,
		formState: { errors },
		setError,
	} = useForm<RegisterFormSubmit>({
		mode: 'onChange',
	});

	useEffect(() => {
		if (user) {
			setImageLocation(getCurrentHost(user!.profilePicture));
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
		getCurrentUser().then((result) => {
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
						action={getCurrentHost('/api/users/current')}
						method="PATCH"
						encType="multipart/form-data"
						className="w-100 px-5 d-flex flex-column gap-2"
						onSubmit={async (event) => {
							event.preventDefault();

							if (errors.name) return;
							const execRequest = () => {
								let formData = new FormData();
								if (
									profilePicture &&
									profilePicture.length !== 0
								) {
									console.log(
										'Profile Picture File:',
										profilePicture[0],
									); // Ensure it's a File object
									formData.append(
										'profilePicture',
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
									getCurrentHost(
										`/api/users/current${name ? '?name=' + name : ''}`,
									),
									true,
								);

								request.withCredentials = true;

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
											refreshUserToken()
												.then(() => {
													execRequest();
												})
												.catch(() => {
													EVENT_ERROR_EMITTER.emit(
														'add-error',
														AllErrors[
															'CONFIG_SAVE_ERROR'
														].message.ptBr,
													);
												});
										else {
											const errorsObj = JSON.parse(
												request.responseText,
											).errors;

											let containsFullname =
												errorsObj.find(
													(e: ErrorEntry) =>
														e.field?.includes(
															'fullname',
														) ||
														e.code
															.toLowerCase()
															.includes(
																'fullname',
															),
												);
											console.log(containsFullname);
											if (containsFullname)
												setError('name', {
													message:
														AllErrors[
															containsFullname
																.code
														].message.ptBr,
												});
											else
												errorsObj.forEach(
													(err: ErrorEntry) =>
														EVENT_ERROR_EMITTER.emit(
															'add-error',
															AllErrors[err.code]
																.message.ptBr,
														),
												);
										}
										setLoading(false);
									}
								};

								request.onerror = () => {
									if (request.status === 601) {
										refreshUserToken()
											.then(() => {
												execRequest();
											})
											.catch(() => {
												EVENT_ERROR_EMITTER.emit(
													'add-error',
													AllErrors[
														'CONFIG_SAVE_ERROR'
													].message.ptBr,
												);
											});
									} else {
										const errorsObj = JSON.parse(
											request.responseText,
										).errors;

										let containsFullname = errorsObj.find(
											(e: ErrorEntry) =>
												e.field?.includes('fullname') ||
												e.code
													.toLowerCase()
													.includes('fullname'),
										);
										console.log(containsFullname);
										if (containsFullname)
											setError('name', {
												message:
													AllErrors[
														containsFullname.code
													].message.ptBr,
											});
										else
											errorsObj.forEach(
												(err: ErrorEntry) =>
													EVENT_ERROR_EMITTER.emit(
														'add-error',
														AllErrors[err.code]
															.message.ptBr,
													),
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
							label="Name"
							isInvalid={!!errors.name}
							errorMessage={
								errors.name && errors.name.message
									? errors.name.message
									: AllErrors['INVALID_FULLNAME'].message.ptBr
							}
							{...register('name', {
								pattern: FIELD_PATTERNS.name,
								onChange: (event) => {
									setChanged(true);
									setName(event.target.value);
								},
							})}
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
