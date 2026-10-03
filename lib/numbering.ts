import type { Repository, ObjectLiteral } from "typeorm";

/**
 * Next organization-wide sequence number, e.g. EXP-0007. Same approach as
 * invoice numbering: parse the trailing digits of the latest record.
 */
export const nextSequenceNumber = async (
  repo: Repository<ObjectLiteral>,
  field: string,
  orgId: number,
  prefix: string,
): Promise<string> => {
  const last = await repo.findOne({
    where: { organizationId: orgId },
    order: { id: "DESC" },
  });
  let next = 1;
  const lastValue = last?.[field];
  if (lastValue) {
    const match = String(lastValue).match(/(\d+)\s*$/);
    const n = match ? parseInt(match[1], 10) : 0;
    next = (Number.isNaN(n) ? 0 : n) + 1;
  }
  return `${prefix}-${String(next).padStart(4, "0")}`;
};

export const round2 = (n: number) => Number((Number(n) || 0).toFixed(2));
