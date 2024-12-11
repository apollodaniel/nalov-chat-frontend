import { EventEmitter2 } from 'eventemitter2';
import { useRef } from 'react';

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
export const ON_ERROR_CALLBACK = (reason: string) =>
	EVENT_ERROR_EMITTER.emit('add-error', reason);

export const FIELD_ERRORS = {
	INVALID_PASSWORD:
		'A Senha deve ter pelo menos 8 caracteres, letras minúsculas, maiúsculas, números e um caractere especial.',
	INVALID_EMAIL: 'Por favor, forneça um email válido.',
	INVALID_USERNAME: 'Forneça um nome de usuário válido.',
	INVALID_FULLNAME: 'Nome e sobrenome inválido. Use apenas letras, espaços',
	PASSWORD_MISMATCH: 'Senhas não coincidem.',
	USERNAME_ALREADY_EXISTS: 'Nome de usuário já existe. Escolha outro.',
	WRONG_PASSWORD: 'Senha incorreta. Tente novamente!',
	UNKNOWN_USERNAME: 'Nome de usuário desconhecido.',
};

export const TOAST_ERROR_MESSAGES = {
	CANNOT_SEND_AUDIO_ERROR:
		'Não foi possível processar seu áudio, tente novamente mais tarde!',
	SEND_MESSAGE_ERROR:
		'Não foi possível enviar sua mensagem, tente novamente mais tarde!',
	CONNECTION_INTERRUPTED:
		'A conexão com a nuvem foi interrompida, tente novamente mais tarde!',
	LISTEN_MESSAGES_ERROR:
		'Não foi possivel obter a lista de mensagens, tente novamente mais tarde.',
	LISTEN_CHATS_ERROR:
		'Não foi possivel obter a lista de chats, tente novamente mais tarde.',
	CHECK_TOKEN_ERROR:
		'Não foi possível autenticar sua sessão, tente novamente mais tarde.',
	EXPIRED_SESSION: 'Sessão expirada, por favor entre novamente.',
	REGISTER_ERROR:
		'Não foi possível criar sua conta, tente novamente mais tarde.',
	LOGIN_ERROR: 'Não foi possível fazer login, tente novamente mais tarde.',
	GET_MESSAGES_ERROR:
		'Não foi possível obter as mensagens, tente novamente mais tarde.',
	GET_CHATS_ERROR:
		'Não foi possível obter os chats, tente novamente mais tarde.',
	GET_USERS_ERROR:
		'Não foi possível obter os usuários, tente novamente mais tarde.',
	DELETE_ACCOUNT_ERROR:
		'Não foi possível realizar a remoção da sua conta, por favor tente novamente mais tarde.',
	CONFIG_SAVE_ERROR:
		'Não foi possível salvar as configurações, por favor tente novamente mais tarde.',
	UNKNOWN_ERROR: 'Ocorreu um erro desconhecido',
};

export const MAXIMUM_TRIES = 4;
export const RETRY_CONNECTION_TIMEOUT = 3000;

export const FIELD_PATTERNS = {
	username: /(^[a-zA-Z0-9]+([_ -]?[a-zA-Z0-9])*.{4,})$/,
	name: /^[A-Z][a-z]+ [A-Z][a-z]+$/,
	password: /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,})/,
};

// modal messages

export const MODAL_ERRORS = {
	register: {
		title: 'Ocorreu um erro ao tentar se registrar',
	},
	login: {
		title: 'Ocorreu um erro ao tentar entrar na sua conta',
	},
	home: {
		title: 'Ocorreu um erro ao buscar pela lista de chats',
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
