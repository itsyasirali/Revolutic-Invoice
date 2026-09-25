"use client";

import React, { useMemo } from "react";
import { Mail, Phone, Info, X } from "lucide-react";
import type { ContactsSectionProps, Contact } from "@/types/customer";
import { useContacts } from "@/hooks/customers/useContacts";
import { Input, Button, Tooltip } from "@/components/ui";
import { validateEmail, validatePhone, sanitizePhoneInput } from "@/lib/validation/contact";

const ContactsSection: React.FC<ContactsSectionProps> = ({ initial = [] }) => {
  const { contacts, addContact, removeContact, updateContact } =
    useContacts(initial);

  // Serialize the current contacts state into the form as JSON so it is
  // reliably included in the submitted payload regardless of how the
  // per-field bracket-named inputs are parsed on the server.
  const contactsJson = useMemo(() => JSON.stringify(contacts), [contacts]);

  return (
    <div className="w-full">
      <input type="hidden" name="contacts" value={contactsJson} readOnly />
      <div className="flex xs:flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Contacts
          </h2>
          <Tooltip content="Add additional people associated with this customer, such as billing or purchasing contacts.">
            <Info className="w-4 h-4 text-slate-400" />
          </Tooltip>
        </div>
        <Button
          type="button"
          onClick={addContact}
          variant="primary"
          size="sm"
          className="font-medium shadow-xs"
        >
          Add Contact
        </Button>
      </div>

      <div className="space-y-4">
        {contacts.map((row: Contact, idx: number) => (
          <div
            key={idx}
            className="p-5 sm:p-6 border border-slate-200/90 rounded-lg bg-white shadow-xs"
          >
            {contacts.length > 1 && (
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Contact #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeContact(idx)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50/80 hover:bg-red-100/80 border border-red-200/70 rounded-md transition-colors cursor-pointer"
                  title="Remove Contact"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                type="text"
                name={`contacts[${idx}].firstName`}
                placeholder="First name"
                value={row.firstName || ""}
                onChange={(e) =>
                  updateContact(idx, "firstName", e.target.value)
                }
                label="First Name"
                fullWidth
              />

              <Input
                type="text"
                name={`contacts[${idx}].lastName`}
                placeholder="Last name"
                value={row.lastName || ""}
                onChange={(e) => updateContact(idx, "lastName", e.target.value)}
                label="Last Name"
                fullWidth
              />

              <Input
                type="email"
                name={`contacts[${idx}].email`}
                placeholder="Email address"
                value={row.email || ""}
                onChange={(e) => updateContact(idx, "email", e.target.value)}
                label="Email"
                leftIcon={Mail}
                error={validateEmail(row.email) || undefined}
                fullWidth
              />

              <Input
                type="text"
                name={`contacts[${idx}].contact`}
                placeholder="Phone number"
                value={row.contact || ""}
                onChange={(e) =>
                  updateContact(
                    idx,
                    "contact",
                    sanitizePhoneInput(e.target.value),
                  )
                }
                label="Phone"
                leftIcon={Phone}
                error={validatePhone(row.contact) || undefined}
                fullWidth
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactsSection;
