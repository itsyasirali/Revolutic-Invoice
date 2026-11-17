"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { usePortalMe, portalSend, errorText } from "@/lib/portalApi";

export type PortalContact = { firstName?: string; lastName?: string; email?: string; contact?: string };
export type PortalMessage = { type: "ok" | "error"; text: string } | null;

const MESSAGE_MS = 5000;

export const usePortalProfile = () => {
  const { me, loading, refresh } = usePortalMe();
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [contacts, setContacts] = useState<PortalContact[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<PortalMessage>(null);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMessage, setPwMessage] = useState<PortalMessage>(null);

  // Success messages are transient: clear them after a few seconds.
  useEffect(() => {
    if (message?.type !== "ok") return;
    const t = setTimeout(() => setMessage(null), MESSAGE_MS);
    return () => clearTimeout(t);
  }, [message]);
  useEffect(() => {
    if (pwMessage?.type !== "ok") return;
    const t = setTimeout(() => setPwMessage(null), MESSAGE_MS);
    return () => clearTimeout(t);
  }, [pwMessage]);

  useEffect(() => {
    if (!me) return;
    setName(me.user.name || "");
    setCompanyName(me.customer.companyName || "");
    setAddress(me.customer.address || "");
    setContacts(me.customer.contacts?.length ? me.customer.contacts : []);
  }, [me]);

  const updateContact = (i: number, patch: PortalContact) =>
    setContacts((list) => list.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await portalSend("PUT", "/profile", { name, companyName, address, contacts });
      await refresh();
      setMessage({ type: "ok", text: "Your details have been saved." });
    } catch (err) {
      setMessage({ type: "error", text: errorText(err, "Failed to save changes") });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwBusy(true);
    setPwMessage(null);
    try {
      await portalSend("POST", "/auth/password", { currentPassword: current, newPassword: next });
      setCurrent("");
      setNext("");
      setPwMessage({ type: "ok", text: "Password updated." });
    } catch (err) {
      setPwMessage({ type: "error", text: errorText(err, "Failed to update password") });
    } finally {
      setPwBusy(false);
    }
  };

  return {
    me,
    loading,
    name,
    setName,
    companyName,
    setCompanyName,
    address,
    setAddress,
    contacts,
    setContacts,
    updateContact,
    saving,
    message,
    setMessage,
    current,
    setCurrent,
    next,
    setNext,
    pwBusy,
    pwMessage,
    setPwMessage,
    save,
    changePassword,
  };
};

export default usePortalProfile;
