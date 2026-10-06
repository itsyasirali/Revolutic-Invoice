export interface BankDetailsSnapshot {
  name: string;
  details: { key: string; value: string }[];
}

type BankAccountLike = {
  name?: string;
  isDefault?: boolean;
  details?: { key?: string; value?: string }[];
};

/** The template's default bank account (or its first), as a snapshot to store on an invoice. */
export const pickDefaultBankDetails = (
  template?: { showBankAccount?: boolean; bankAccounts?: BankAccountLike[] | null } | null,
): BankDetailsSnapshot | null => {
  if (!template || template.showBankAccount === false) return null;
  const accounts = Array.isArray(template.bankAccounts) ? template.bankAccounts : [];
  const account = accounts.find((a) => a?.isDefault) ?? accounts[0];
  const details = (account?.details ?? [])
    .map((d) => ({ key: String(d?.key ?? ""), value: String(d?.value ?? "") }))
    .filter((d) => d.key.trim() || d.value.trim());
  if (!account || details.length === 0) return null;
  return { name: String(account.name ?? ""), details };
};
