import type { NextApiRequest, NextApiResponse } from "next";
import app, { ensureBootstrapped } from "../../../server/src/index";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await ensureBootstrapped();
  } catch (err) {
    console.error("[API Bootstrap Error]", err);
  }
  return (app as unknown as (req: NextApiRequest, res: NextApiResponse) => void)(req, res);
}
