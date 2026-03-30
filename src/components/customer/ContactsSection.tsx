import React from 'react';
import { Mail, Phone, Info, Plus, X } from 'lucide-react';
import type { ContactsSectionProps, Contact } from '../../types/customer.d';
import { useContacts } from '../../hooks/customers/useContacts';
import Input from '../common/Input';
import Button from '../common/Button';

export const ContactsSection: React.FC<ContactsSectionProps> = ({ initial = [] }) => {
    const { contacts, addContact, removeContact, updateContact } = useContacts(initial);

    return (
        <div className="w-full">
            <div className="flex xs:flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Contacts</h2>
                    <Info className="w-4 h-4 text-gray-400" />
                </div>
                <Button
                    type="button"
                    onClick={addContact}
                    variant="ghost"
                    size="sm"
                    icon={<Plus className="w-4 h-4" />}
                    className="text-primary hover:bg-primary/5"
                >
                    Add Contact
                </Button>
            </div>

            <div className="space-y-4">
                {contacts.map((row: Contact, idx: number) => (
                    <div key={idx} className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm relative group">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Input
                                type="text"
                                name={`contacts[${idx}].firstName`}
                                placeholder="First name"
                                value={row.firstName || ''}
                                onChange={(e) => updateContact(idx, 'firstName', e.target.value)}
                                label="First Name"
                                fullWidth
                            />

                            <Input
                                type="text"
                                name={`contacts[${idx}].lastName`}
                                placeholder="Last name"
                                value={row.lastName || ''}
                                onChange={(e) => updateContact(idx, 'lastName', e.target.value)}
                                label="Last Name"
                                fullWidth
                            />

                            <Input
                                type="email"
                                name={`contacts[${idx}].email`}
                                placeholder="Email address"
                                value={row.email || ''}
                                onChange={(e) => updateContact(idx, 'email', e.target.value)}
                                label="Email"
                                leftIcon={Mail}
                                fullWidth
                            />

                            <Input
                                type="text"
                                name={`contacts[${idx}].contact`}
                                placeholder="Phone number"
                                value={row.contact || ''}
                                onChange={(e) => updateContact(idx, 'contact', e.target.value)}
                                label="Phone"
                                leftIcon={Phone}
                                fullWidth
                            />
                        </div>

                        {contacts.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeContact(idx)}
                                className="absolute -top-2 -right-2 p-1.5 bg-white border border-gray-100 text-gray-400 hover:text-red-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                title="Remove Contact"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ContactsSection;
