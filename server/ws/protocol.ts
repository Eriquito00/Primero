import { ClientMessage, ServerMessage } from "./types";

export class ClientFailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClientFailError";
  }
}

type ParseOk = { ok: true; msg: ClientMessage };
type ParseFail = { ok: false; response: ServerMessage };

export function parseClientMessage(raw: string): ParseOk | ParseFail {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      response: {
        status: "fail",
        data: { reason: "JSON inválido" },
      },
    };
  }

  if (!parsed || typeof parsed !== "object") {
    return {
      ok: false,
      response: {
        status: "fail",
        data: { reason: "El mensaje debe ser un objeto JSON" },
      },
    };
  }

  const maybe = parsed as Partial<ClientMessage>;

  if (typeof maybe.type !== "string" || maybe.type.trim() === "") {
    return {
      ok: false,
      response: {
        status: "fail",
        id: maybe.id,
        data: { reason: "Campo 'type' requerido y no vacío" },
      },
    };
  }

  return { ok: true, msg: maybe as ClientMessage };
}

export function success(
  type: string,
  id: string | undefined,
  data: unknown,
): ServerMessage {
  return { status: "success", type, id, data };
}

export function fail(
  type: string | undefined,
  id: string | undefined,
  reason: string,
): ServerMessage {
  return { status: "fail", type, id, data: { reason } };
}

export function error(
  type: string | undefined,
  id: string | undefined,
  message: string,
): ServerMessage {
  return { status: "error", type, id, message };
}
