import { RawData } from "ws";
import {
    EVENT_EMITTER,
    EVENT_ERROR_EMITTER,
    SHORT_TIME_FORMATTER,
    toast_error_messages,
} from "../constants";
import { Attachment, BackendError, FieldError, HttpResult } from "../types";
import { delete_message } from "./chat";
import { get_auth_token, refresh_user_token } from "./user";
import qs from "qs";

export function get_current_host(args?: string, ws: boolean = false): string {
    let location = window.location.href;
    const ports = location.match(/:([0-9]+)\//)![0];
    // .substring(0, location.lastIndexOf(":") + 1)
    if (ws) {
        location = location.replace("http", "ws");
    }
    return (
        location.substring(0, location.indexOf(ports)) +
        (ws ? ":8081" : ":8751") +
        (args || "")
    );
}

export function parse_errors(errors: BackendError[]): string {
    return errors.map((e: BackendError) => e.msg).join("\n");
}
export function verify_field_valid(
    value: string,
    error: FieldError,
    setFieldError: (error: string) => void,
    valid?: boolean,
) {
    if (
        (error.check && (value.match(error.check!) || []).length !== 0) ||
        valid
    )
        setFieldError(error.error_msg);
    else setFieldError("");
}

export function format_date_user_friendly(date: number): string {
    const UNIT = 1000; // SECOND
    const DAY_UNIT =
        UNIT *
        60 * // MINUTE
        60 * // HOUR
        24; // DAY
    const now = Date.now();
    const DAYS_DIFF = Math.floor((now - date) / DAY_UNIT);

    const WEEK_DAY_FORMATTER = Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
    });
    const MONTH_DAY_FORMATTER = Intl.DateTimeFormat("pt-BR", {
        month: "long",
        day: "numeric",
    });
    const GENERIC_DATE_FORMATTER = Intl.DateTimeFormat("pt-BR", {
        dateStyle: "medium",
    });
    const MONTH_SHORT = Intl.DateTimeFormat("pt-BR", { month: "2-digit" });
    const YEAR_SHORT = Intl.DateTimeFormat("pt-BR", { year: "numeric" });

    // today
    if (DAYS_DIFF === 0) return SHORT_TIME_FORMATTER.format(date);
    // yesterday
    else if (DAYS_DIFF === 1) return "Ontem";
    // this week
    else if (DAYS_DIFF > 1) return WEEK_DAY_FORMATTER.format(date);
    // last week
    else if (DAYS_DIFF > 7 && DAYS_DIFF < 14) return "Semana passada";
    // same month, different week
    else if (
        DAYS_DIFF > 14 &&
        MONTH_SHORT.format(date) == MONTH_SHORT.format(now)
    )
        return `${Math.floor(DAYS_DIFF / 14)} semanas atrás`;
    // same year
    else if (YEAR_SHORT.format(now) === YEAR_SHORT.format(date))
        return MONTH_DAY_FORMATTER.format(date);
    // generic formatter
    else return GENERIC_DATE_FORMATTER.format(date);
}

export const get_attachments = async (message_id: string): Promise<Attachment[]> =>
	new Promise((r,rj) => execRequest({
		endpoint: `/api/messages/${message_id}/attachments`,
		method: "GET",
		onSucess: r,
		onFail(response) {
			console.log(response.status);
		},
	}));

// export async function get_attachments(
//     message_id: string,
// ): Promise<Attachment[]> {
//     const token = await get_auth_token();
//
//     const response = await fetch(
//         get_current_host(`/api/messages/${message_id}/attachments`),
//         {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//         },
//     );
//
//     if (response.ok) return (await response.json()) as Attachment[];
//
//     throw onReqError({
//         self: get_attachments(message_id),
//         response: response,
//         errorMsg: "Unable to get attachments",
//     });
// }

export async function upload_files(files: File[], message_id: string) {
    const _onError = () => delete_message(message_id);

    try {
        const token = await get_auth_token();
        let form_data = new FormData();

        const attachments = await get_attachments(message_id);

        for (const attachment of attachments) {
            const file = files.find(
                (file) =>
                    file.name == attachment.filename &&
                    file.size == attachment.byte_length,
            );
            if (!file)
                throw new Error(
                    "Unable to find file that matches attachments info",
                );

            form_data.append(attachment.id!, file);
        }

        let request = new XMLHttpRequest();

        const url = get_current_host(`/api/upload?message_id=${message_id}`);
        console.log(url);
        request.open("POST", url);

        request.setRequestHeader("Authorization", `Bearer ${token}`);
        request.send(form_data);

        request.addEventListener("error", () =>
            onReqError({
                self: upload_files(files, message_id),
                response: request.response,
                errorMsg: `Could not send your attachment file.`,
                callback: _onError,
            }),
        );
    } catch (err) {
        onReqError({
            self: upload_files(files, message_id),
            errorMsg: `Could not send your attachment file.`,
            callback: _onError,
        });
    }
}

export async function execRequest<Result>(obj: {
    endpoint: string;
    method: "POST" | "DELETE" | "PATCH" | "GET" | "PUT";
    errorMessage?: string;
    onSucess: (data: Result) => void;
    options?: { content?: any; headers?: any };
    onFail?: (response: Response) => void;
}): Promise<void> {
    const { endpoint, method, errorMessage, options, onSucess, onFail } = obj;

    let url = get_current_host(endpoint);
    const token = await get_auth_token();

    let request_options: { body?: string; headers: any } = {
        headers: {
            ...options?.headers,
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    };

    if (options && options.content && method !== "GET") {
        // stringify obj
        request_options = {
            ...request_options,
            body: JSON.stringify(options.content),
        };
    } else if (options && options.content) {
        url = url.endsWith("/")
            ? `${url}?${qs.stringify(options.content)}`
            : `${url}/?${qs.stringify(options.content)}`;
    }

    const response = await fetch(url, {
        method: method,
        ...request_options,
    });

    if (response.status >= 200 && response.status < 300) {
        const data = await response.json();
        return onSucess(data);
    } else if (response.status === 601) {
        // expired token
        await refresh_user_token();
        return execRequest(obj);
    } else {
        if (errorMessage) EVENT_ERROR_EMITTER.emit("add-error", errorMessage);
        if (onFail) onFail(response);
    }

    if (response.status === 401) {
        // reload session in case unauthorized
        if (onFail) onFail(response);
        if (errorMessage) EVENT_ERROR_EMITTER.emit("add-error", errorMessage);
        // window.localStorage.clear();
        // window.sessionStorage.clear();
        // setTimeout(() => window.open(window.location.href, "_self"), 3000);
    }
}

export async function listenEvents(obj: {
    endpoint: string;
    args?: string;
    onData: (data: any) => void;
    tries: number;
    errorMessage?: string;
    onError?: (reason: number | string) => void;
}) {
    const { onData, endpoint, onError, errorMessage, tries, args } = obj;

    const token = await get_auth_token();
    let socket = new WebSocket(
        get_current_host(`${endpoint}?token=${token}${`&${args}` || ""}`, true),
    );

    EVENT_EMITTER.on("close-stream", () => {
        console.log("Close socket");
		socket.close();
    });

    socket.onmessage = (evt: MessageEvent) => {
        const msg: string = evt.data;
        if (msg === "expired token") {
            refresh_user_token().then(() => {
                listenEvents(obj);
            });
        } else if (msg === "invalid token") {
            if (onError) onError("invalid token");
            if (errorMessage) EVENT_EMITTER.emit("add-error", errorMessage);
        } else {
            // valid data and ok response
            onData(JSON.parse(msg));
        }
    };

    socket.onerror = () => {
        // retry
        if (tries > 0) {
            listenEvents({ ...obj, tries: tries - 1 });
        } else {
            if (errorMessage) EVENT_EMITTER.emit("add-error", errorMessage);
        }
    };

    socket.onclose = () => {
        EVENT_EMITTER.removeAllListeners("close-stream");
    };
}

export function onReqError({
    self,
    response,
    errorMsg,
    callback,
}: {
    self: any;
    response?: Response;
    errorMsg?: string;
    callback?: () => void;
}) {
    if (response && response.status === 601) self();
    if (errorMsg) EVENT_ERROR_EMITTER.emit("add-error", errorMsg);
    if (callback) callback();
}
