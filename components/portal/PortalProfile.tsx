"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import usePortalProfile, { type PortalMessage } from "@/hooks/portal/usePortalProfile";
import { PageTitle, PCard, PageLoading, ErrorNote, fieldClass, primaryBtn, outlineBtn } from "./PortalUI";


const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="text-[13px] font-medium text-slate-700">{label}</span>
    <div className="mt-1.5">{children}</div>
  </label>
);

const PasswordInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={show ? "text" : "password"} className={`${fieldClass} pr-10`} />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

const PortalProfile: React.FC = () => {
  const {
    me, loading, name, setName, companyName, setCompanyName, address, setAddress,
    contacts, setContacts, updateContact, saving, message, setMessage,
    current, setCurrent, next, setNext, pwBusy, pwMessage, setPwMessage, save, changePassword,
  } = usePortalProfile();

  if (loading || !me) return <PageLoading />;
  const editable = me.settings.canEditProfile;

  const note = (m: PortalMessage) =>
    m &&
    (m.type === "error" ? (
      <ErrorNote message={m.text} />
    ) : (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-700">{m.text}</div>
    ));

  return (
    <>
      <PageTitle title="My profile" subtitle="Your account and contact details." />

      <form onSubmit={save} onChange={() => setMessage(null)} className="space-y-4">
        <PCard title="Account">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Your name">
              <input className={fieldClass} value={name} disabled={!editable} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Email (sign-in)">
              <input className={`${fieldClass} bg-slate-50`} value={me.user.email} disabled />
            </Field>
          </div>
        </PCard>

        <PCard title="Company & billing address">
          <div className="grid gap-4">
            <Field label="Customer">
              <input className={`${fieldClass} bg-slate-50`} value={me.customer.displayName} disabled />
            </Field>
            <Field label="Company name">
              <input className={fieldClass} value={companyName} disabled={!editable} onChange={(e) => setCompanyName(e.target.value)} />
            </Field>
            <Field label="Address">
              <textarea
                className={`${fieldClass} h-24 py-2`}
                value={address}
                disabled={!editable}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Field>
          </div>
        </PCard>

        <PCard
          title="Contacts"
          actions={
            editable ? (
              <button type="button" className={outlineBtn} onClick={() => setContacts((c) => [...c, {}])}>
                <Plus className="w-4 h-4" />
                Add contact
              </button>
            ) : undefined
          }
        >
          {contacts.length === 0 && <p className="text-[14px] text-slate-500">No contacts on file.</p>}
          <div className="space-y-4">
            {contacts.map((c, i) => (
              <div key={i} className="grid sm:grid-cols-[1fr_1fr_1.4fr_1fr_auto] gap-3 items-end">
                <Field label="First name">
                  <input className={fieldClass} value={c.firstName || ""} disabled={!editable} onChange={(e) => updateContact(i, { firstName: e.target.value })} />
                </Field>
                <Field label="Last name">
                  <input className={fieldClass} value={c.lastName || ""} disabled={!editable} onChange={(e) => updateContact(i, { lastName: e.target.value })} />
                </Field>
                <Field label="Email">
                  <input type="email" className={fieldClass} value={c.email || ""} disabled={!editable} onChange={(e) => updateContact(i, { email: e.target.value })} />
                </Field>
                <Field label="Phone">
                  <input className={fieldClass} value={c.contact || ""} disabled={!editable} onChange={(e) => updateContact(i, { contact: e.target.value })} />
                </Field>
                {editable && (
                  <button
                    type="button"
                    className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-rose-600 cursor-pointer"
                    onClick={() => setContacts((list) => list.filter((_, idx) => idx !== i))}
                    aria-label="Remove contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </PCard>

        {note(message)}
        {editable ? (
          <button type="submit" disabled={saving} className={primaryBtn}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        ) : (
          <p className="text-[13px] text-slate-500">
            Profile editing is turned off. Contact {me.organization.name} to change your details.
          </p>
        )}
      </form>

      <form onSubmit={changePassword} className="mt-4">
        <PCard title="Password">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Current password">
              <PasswordInput required autoComplete="current-password" value={current} onChange={(e) => { setCurrent(e.target.value); setPwMessage(null); }} />
            </Field>
            <Field label="New password (min. 8 characters)">
              <PasswordInput required minLength={8} autoComplete="new-password" value={next} onChange={(e) => { setNext(e.target.value); setPwMessage(null); }} />
            </Field>
          </div>
          <div className="mt-4 space-y-3">
            {note(pwMessage)}
            <button type="submit" disabled={pwBusy} className={outlineBtn}>
              {pwBusy ? "Updating..." : "Update password"}
            </button>
          </div>
        </PCard>
      </form>
    </>
  );
};

export default PortalProfile;
