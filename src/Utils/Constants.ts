import { EventEmitter2 } from 'eventemitter2';

export const EVENT_EMITTER = new EventEmitter2({});
export const EVENT_ERROR_EMITTER = new EventEmitter2({});

export const DATETIME_FORMATTER = Intl.DateTimeFormat('pt-BR', {
	dateStyle: 'medium',
	timeStyle: 'short',
});
export const SHORT_DATETIME_FORMATTER = Intl.DateTimeFormat('pt-BR', {
	dateStyle: 'short',
	timeStyle: 'medium',
});
export const SHORT_TIME_FORMATTER = Intl.DateTimeFormat('pt-BR', {
	timeStyle: 'short',
});
export const AUDIO_RECORDING_TIME_FORMATTER = Intl.DateTimeFormat('pt-BR', {
	timeStyle: 'medium',
});

export const TEMPLATE_DATE = new Date(Date.now());
export const MAXIMUM_TRIES = 4;
export const RETRY_CONNECTION_TIMEOUT = 3000;

export const FIELD_PATTERNS = {
	username: /(^[a-zA-Z0-9]+([_ -]?[a-zA-Z0-9])*.{4,})$/,
	name: /^[A-Z][a-z]+ [A-Z][a-z]+$/,
	password: /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,})/,
};

// modal messages

export const AllErrors: Record<
	string,
	{
		code: string;
		message: { ptBr: string; enUs: string };
		statusCode: number;
	}
> = {
	// FIELD VALIDATION ERRORS (Errors written by you)
	INVALID_PASSWORD: {
		code: 'INVALID_PASSWORD',
		message: {
			ptBr: 'A Senha deve ter pelo menos 8 caracteres, letras minúsculas, maiúsculas, números e um caractere especial.',
			enUs: 'Password must be at least 8 characters, with lowercase letters, uppercase letters, numbers, and a special character.',
		},
		statusCode: 400,
	},
	INVALID_EMAIL: {
		code: 'INVALID_EMAIL',
		message: {
			ptBr: 'Por favor, forneça um email válido.',
			enUs: 'Please provide a valid email.',
		},
		statusCode: 400,
	},
	INVALID_USERNAME: {
		code: 'INVALID_USERNAME',
		message: {
			ptBr: 'Forneça um nome de usuário válido.',
			enUs: 'Please provide a valid username.',
		},
		statusCode: 400,
	},
	INVALID_FULLNAME: {
		code: 'INVALID_FULLNAME',
		message: {
			ptBr: 'Nome e sobrenome inválido. Use apenas letras, espaços.',
			enUs: 'Invalid full name. Use only letters and spaces.',
		},
		statusCode: 400,
	},
	PASSWORD_MISMATCH: {
		code: 'PASSWORD_MISMATCH',
		message: {
			ptBr: 'Senhas não coincidem.',
			enUs: 'Passwords do not match.',
		},
		statusCode: 400,
	},
	USERNAME_ALREADY_EXISTS: {
		code: 'USERNAME_ALREADY_EXISTS',
		message: {
			ptBr: 'Nome de usuário já existe. Escolha outro.',
			enUs: 'Username already exists. Please choose another one.',
		},
		statusCode: 400,
	},
	WRONG_PASSWORD: {
		code: 'WRONG_PASSWORD',
		message: {
			ptBr: 'Senha incorreta. Tente novamente!',
			enUs: 'Incorrect password. Please try again!',
		},
		statusCode: 401,
	},
	UNKNOWN_USERNAME: {
		code: 'UNKNOWN_USERNAME',
		message: {
			ptBr: 'Nome de usuário desconhecido.',
			enUs: 'Unknown username.',
		},
		statusCode: 404,
	},

	// TOAST ERROR MESSAGES (Errors reformatted by me)
	CANNOT_SEND_AUDIO_ERROR: {
		code: 'CANNOT_SEND_AUDIO_ERROR',
		message: {
			ptBr: 'Não foi possível processar seu áudio, tente novamente mais tarde!',
			enUs: 'We couldn’t process your audio, please try again later!',
		},
		statusCode: 500,
	},
	SEND_MESSAGE_ERROR: {
		code: 'SEND_MESSAGE_ERROR',
		message: {
			ptBr: 'Não foi possível enviar sua mensagem, tente novamente mais tarde!',
			enUs: 'Unable to send your message, please try again later!',
		},
		statusCode: 500,
	},
	CONNECTION_INTERRUPTED: {
		code: 'CONNECTION_INTERRUPTED',
		message: {
			ptBr: 'A conexão com a nuvem foi interrompida, tente novamente mais tarde!',
			enUs: 'Connection to the cloud was interrupted, please try again later!',
		},
		statusCode: 500,
	},
	LISTEN_MESSAGES_ERROR: {
		code: 'LISTEN_MESSAGES_ERROR',
		message: {
			ptBr: 'Não foi possível obter a lista de mensagens, tente novamente mais tarde.',
			enUs: 'Could not retrieve the list of messages, please try again later.',
		},
		statusCode: 500,
	},
	LISTEN_CHATS_ERROR: {
		code: 'LISTEN_CHATS_ERROR',
		message: {
			ptBr: 'Não foi possível obter a lista de chats, tente novamente mais tarde.',
			enUs: 'Could not retrieve the list of chats, please try again later.',
		},
		statusCode: 500,
	},
	CHECK_TOKEN_ERROR: {
		code: 'CHECK_TOKEN_ERROR',
		message: {
			ptBr: 'Não foi possível autenticar sua sessão, tente novamente mais tarde.',
			enUs: 'Could not authenticate your session, please try again later.',
		},
		statusCode: 500,
	},
	EXPIRED_SESSION: {
		code: 'EXPIRED_SESSION',
		message: {
			ptBr: 'Sessão expirada, por favor entre novamente.',
			enUs: 'Session expired, please log in again.',
		},
		statusCode: 401,
	},
	REGISTER_ERROR: {
		code: 'REGISTER_ERROR',
		message: {
			ptBr: 'Não foi possível criar sua conta, tente novamente mais tarde.',
			enUs: 'Could not create your account, please try again later.',
		},
		statusCode: 500,
	},
	LOGIN_ERROR: {
		code: 'LOGIN_ERROR',
		message: {
			ptBr: 'Não foi possível fazer login, tente novamente mais tarde.',
			enUs: 'Could not log in, please try again later.',
		},
		statusCode: 500,
	},
	GET_MESSAGES_ERROR: {
		code: 'GET_MESSAGES_ERROR',
		message: {
			ptBr: 'Não foi possível obter as mensagens, tente novamente mais tarde.',
			enUs: 'Could not retrieve messages, please try again later.',
		},
		statusCode: 500,
	},
	GET_CHATS_ERROR: {
		code: 'GET_CHATS_ERROR',
		message: {
			ptBr: 'Não foi possível obter os chats, tente novamente mais tarde.',
			enUs: 'Could not retrieve chats, please try again later.',
		},
		statusCode: 500,
	},
	GET_USERS_ERROR: {
		code: 'GET_USERS_ERROR',
		message: {
			ptBr: 'Não foi possível obter os usuários, tente novamente mais tarde.',
			enUs: 'Could not retrieve users, please try again later.',
		},
		statusCode: 500,
	},
	DELETE_ACCOUNT_ERROR: {
		code: 'DELETE_ACCOUNT_ERROR',
		message: {
			ptBr: 'Não foi possível realizar a remoção da sua conta, por favor tente novamente mais tarde.',
			enUs: 'Could not delete your account, please try again later.',
		},
		statusCode: 500,
	},
	CONFIG_SAVE_ERROR: {
		code: 'CONFIG_SAVE_ERROR',
		message: {
			ptBr: 'Não foi possível salvar as configurações, por favor tente novamente mais tarde.',
			enUs: 'Could not save the settings, please try again later.',
		},
		statusCode: 500,
	},
	UNKNOWN_ERROR: {
		code: 'UNKNOWN_ERROR',
		message: {
			ptBr: 'Ocorreu um erro desconhecido.',
			enUs: 'An unknown error occurred.',
		},
		statusCode: 500,
	},

	// MODAL ERRORS (Errors reformatted by me)
	MODAL_REGISTER_ERROR: {
		code: 'MODAL_REGISTER_ERROR',
		message: {
			ptBr: 'Ocorreu um erro ao tentar se registrar.',
			enUs: 'An error occurred while trying to register.',
		},
		statusCode: 500,
	},
	MODAL_LOGIN_ERROR: {
		code: 'MODAL_LOGIN_ERROR',
		message: {
			ptBr: 'Ocorreu um erro ao tentar entrar na sua conta.',
			enUs: 'An error occurred while trying to log in to your account.',
		},
		statusCode: 500,
	},
	MODAL_HOME_ERROR: {
		code: 'MODAL_HOME_ERROR',
		message: {
			ptBr: 'Ocorreu um erro ao buscar pela lista de chats.',
			enUs: 'An error occurred while fetching the list of chats.',
		},
		statusCode: 500,
	},

	// login validation
	EMPTY_NAME: {
		code: 'EMPTY_NAME',
		message: {
			ptBr: 'O nome não pode estar vazio.',
			enUs: 'Name must not be empty.',
		},
		statusCode: 400,
	},
	EMPTY_USERNAME: {
		code: 'EMPTY_USERNAME',
		message: {
			ptBr: 'O nome de usuário não pode estar vazio.',
			enUs: 'Username must not be empty.',
		},
		statusCode: 400,
	},
	EMPTY_PASSWORD: {
		code: 'EMPTY_PASSWORD',
		message: {
			ptBr: 'A senha não pode estar vazia.',
			enUs: 'Password must not be empty.',
		},
		statusCode: 400,
	},
	INCORRECT_PASSWORD: {
		code: 'INCORRECT_PASSWORD',
		message: {
			ptBr: 'Senha incorreta. Por favor, tente novamente.',
			enUs: 'Incorrect password. Please try again.',
		},
		statusCode: 401,
	},

	// register validation
	INVALID_USERNAME_TYPE: {
		code: 'INVALID_USERNAME_TYPE',
		message: {
			ptBr: 'O nome de usuário deve ser uma string válida.',
			enUs: 'Username must be a valid string.',
		},
		statusCode: 400,
	},
	INVALID_USERNAME_LENGTH: {
		code: 'INVALID_USERNAME_LENGTH',
		message: {
			ptBr: 'O nome de usuário deve ter entre 4 e 12 caracteres.',
			enUs: 'Username must be between 4 and 12 characters long.',
		},
		statusCode: 400,
	},
	INVALID_USERNAME_FORMAT: {
		code: 'INVALID_USERNAME_FORMAT',
		message: {
			ptBr: 'Formato de nome de usuário inválido.',
			enUs: 'Invalid username format.',
		},
		statusCode: 400,
	},
	INVALID_NAME_TYPE: {
		code: 'INVALID_NAME_TYPE',
		message: {
			ptBr: 'O nome deve ser uma string válida.',
			enUs: 'Name must be a valid string.',
		},
		statusCode: 400,
	},
	INVALID_NAME_LENGTH: {
		code: 'INVALID_NAME_LENGTH',
		message: {
			ptBr: 'O nome deve ter entre 4 e 100 caracteres.',
			enUs: 'Name must be between 4 and 100 characters long.',
		},
		statusCode: 400,
	},
	WEAK_PASSWORD: {
		code: 'WEAK_PASSWORD',
		message: {
			ptBr: 'A senha é muito fraca. Ela deve incluir letras maiúsculas, minúsculas, números e caracteres especiais.',
			enUs: 'Password is too weak. It must include uppercase, lowercase, numbers, and special characters.',
		},
		statusCode: 400,
	},
	INVALID_PASSWORD_LENGTH: {
		code: 'INVALID_PASSWORD_LENGTH',
		message: {
			ptBr: 'A senha deve ter pelo menos 8 caracteres.',
			enUs: 'Password must be at least 8 characters long.',
		},
		statusCode: 400,
	},
};

export const CONFIRMATION_MODALS = {
	logout: {
		title: 'Aviso!',
		content: 'Você realmente deseja sair da sua conta?',
	},
};

export const MORE_ACTIONS_MODAL = {
	title: 'Outros',
	content: {
		openConfigButton: 'Configurações',
		logoutButton: 'Logout',
	},
};
