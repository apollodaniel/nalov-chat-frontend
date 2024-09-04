
export const DATETIME_FORMATTER = Intl.DateTimeFormat('pt-BR', {dateStyle: "medium", timeStyle: "short"});
export const SHORT_DATETIME_FORMATTER = Intl.DateTimeFormat('pt-BR', {dateStyle: "short", timeStyle: "medium"});

export const field_errors = {
	invalid_password: "A Senha deve ter pelo menos 8 caracteres, letras minúsculas, maiúsculas, números e um caractere especial.",
	invalid_email: "Por favor, forneça um email válido.",
	invalid_username: "Forneça um nome de usuário válido.",
	invalid_firstname_and_lastname:	"Nome e sobrenome inválido. Use apenas letras, espaços",
	password_mismatch: "Senhas não coincidem.",
	username_exists: "Nome de usuário já existe. Escolha outro.",
	wrong_password: "Senha incorreta. Tente novamente!",
	unknown_username: "Nome de usuário desconhecido.",
};

export const modal_errors = {
	register: {
		title: "Ocorreu um erro ao tentar se registrar"
	},
	login: {
		title: "Ocorreu um erro ao tentar entrar na sua conta"
	},
	home: {
		title: "Ocorreu um erro ao buscar pela lista de chats"
	}
}

export const confirmation_modals = {
	logout: {
		title: "Aviso!",
		content: "Você realmente deseja sair da sua conta?"
	}
}

export const field_patterns = {
	username: /(^[a-zA-Z0-9]+([_ -]?[a-zA-Z0-9])*.{4,})$/,
	name: /^[A-Z][a-z]+ [A-Z][a-z]+$/,
	password: /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,})/
}
