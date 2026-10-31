import "server-only";
import { db } from "@/db/client";
import { auditLog } from "@/db/schema";

type Actor = { id: string; email: string } | null;

/** Records a privileged action. Never throws: an audit failure must not block the action itself. */
export async function audit(actor: Actor, action: string, entity: string, entityId?: string | null, detail?: Record<string, unknown>) {
  try {
    await db.insert(auditLog).values({ userId: actor?.id ?? null, userEmail: actor?.email ?? null, action, entity, entityId: entityId ?? null, detail: detail ?? null });
  } catch (error) {
    console.error("audit log write failed", error);
  }
}
