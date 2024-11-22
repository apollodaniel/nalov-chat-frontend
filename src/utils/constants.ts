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

export const field_errors = {
	invalid_password:
		'A Senha deve ter pelo menos 8 caracteres, letras minúsculas, maiúsculas, números e um caractere especial.',
	invalid_email: 'Por favor, forneça um email válido.',
	invalid_username: 'Forneça um nome de usuário válido.',
	invalid_firstname_and_lastname:
		'Nome e sobrenome inválido. Use apenas letras, espaços',
	password_mismatch: 'Senhas não coincidem.',
	username_exists: 'Nome de usuário já existe. Escolha outro.',
	wrong_password: 'Senha incorreta. Tente novamente!',
	unknown_username: 'Nome de usuário desconhecido.',
};

export const toast_error_messages = {
	cannot_send_audio_error:
		'Não foi possível processar seu áudio, tente novamente mais tarde!',
	send_message_error:
		'Não foi possível enviar sua mensagem, tente novamente mais tarde!',
	connection_interrupted:
		'A conexão com a nuvem foi interrompida, tente novamente mais tarde!',
	listen_messages_error:
		'Não foi possivel obter a lista de mensagens, tente novamente mais tarde.',
	listen_chats_error:
		'Não foi possivel obter a lista de chats, tente novamente mais tarde.',
	check_token_error:
		'Não foi possível autenticar sua sessão, tente novamente mais tarde.',
	expired_session: 'Sessão expirada, por favor entre novamente.',
	register_error:
		'Não foi possível criar sua conta, tente novamente mais tarde.',
	login_error: 'Não foi possível fazer login, tente novamente mais tarde.',
	get_messages_error:
		'Não foi possível obter as mensagens, tente novamente mais tarde.',
	get_chats_error:
		'Não foi possível obter os chats, tente novamente mais tarde.',
	get_users_error:
		'Não foi possível obter os usuários, tente novamente mais tarde.',
	delete_account_error:
		'Não foi possível realizar a remoção da sua conta, por favor tente novamente mais tarde.',
	config_save_error:
		'Não foi possível salvar as configurações, por favor tente novamente mais tarde.',
};

export const MAXIMUM_TRIES = 4;
export const RETRY_CONNECTION_TIMEOUT = 3000;

export const field_patterns = {
	username: /(^[a-zA-Z0-9]+([_ -]?[a-zA-Z0-9])*.{4,})$/,
	name: /^[A-Z][a-z]+ [A-Z][a-z]+$/,
	password: /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,})/,
};

// modal messages

export const modal_errors = {
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

export const confirmation_modals = {
	logout: {
		title: 'Aviso!',
		content: 'Você realmente deseja sair da sua conta?',
	},
};

export const more_actions_modal = {
	title: 'Outros',
	content: {
		open_config_button: 'Configurações',
		logout_button: 'Logout',
	},
};
