import { app } from "@/lib/api";

const handler = (req: Request) => app.fetch(req);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
