import { useState, useCallback, useEffect } from 'react';
import type { Contact, UseContactsReturn } from '../../types/customer.d';

export const useContacts = (initialContacts: Contact[] = []): UseContactsReturn => {
    const [contacts, setContacts] = useState<Contact[]>([
        { firstName: '', lastName: '', email: '', contact: '' },
    ]);

    // Initialize contacts from props
    useEffect(() => {
        if (Array.isArray(initialContacts) && initialContacts.length > 0) {
            setContacts(
                initialContacts.map((c) => ({
                    firstName: c.firstName || '',
                    lastName: c.lastName || '',
                    email: c.email || '',
                    contact: c.contact || '',
                }))
            );
        }
    }, [initialContacts]);

    const addContact = useCallback(() => {
        setContacts((prev) => [
            ...prev,
            { firstName: '', lastName: '', email: '', contact: '' },
        ]);
    }, []);

    const removeContact = useCallback((idx: number) => {
        setContacts((prev) => prev.filter((_, i) => i !== idx));
    }, []);

    const updateContact = useCallback(
        (idx: number, field: keyof Contact, value: string) => {
            setContacts((prev) =>
                prev.map((contact, i) =>
                    i === idx ? { ...contact, [field]: value } : contact
                )
            );
        },
        []
    );

    return {
        contacts,
        addContact,
        removeContact,
        updateContact,
    };
};

export default useContacts;
