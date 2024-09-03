
export const DATETIME_FORMATTER = Intl.DateTimeFormat('pt-BR', {dateStyle: "medium", timeStyle: "short"});
export const SHORT_DATETIME_FORMATTER = Intl.DateTimeFormat('pt-BR', {dateStyle: "short", timeStyle: "short"});

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
		title: "A error occurred when trying to register in"
	},
	login: {
		title: "A error occurred when trying to login"
	},
	home: {
		title: "A error occurred when trying to get chats"
	}
}

export const field_patterns = {
	username: /(^[a-zA-Z0-9]+([_ -]?[a-zA-Z0-9])*.{4,})$/,
	name: /^[A-Z][a-z]+ [A-Z][a-z]+$/,
	password: /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,})/
}
