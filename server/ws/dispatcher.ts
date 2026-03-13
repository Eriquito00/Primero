import { handlers } from "./handlers";
import { HandlerContext } from "./types";

export async function dispatch(
  type: string,
  payload: unknown,
  ctx: HandlerContext,
) {
  const handler = handlers[type];
  if (!handler) {
    return { found: false as const };
  }

  const result = await handler(payload, ctx);
  return { found: true as const, result };
}
