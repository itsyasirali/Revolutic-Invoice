import { useState, useCallback } from 'react';
import axios from '../../Service/axios';
import type { Customer, MaybeFile } from '../../types/customer.d';
import { useAlert } from './useAlert';

export const useCustomerForm = (initialCustomer?: Customer | null) => {
  const [customerType, setCustomerType] = useState<string>(() => {
    return initialCustomer?.customerType || 'Business';
  });

  const [files, setFiles] = useState<FileList | null>(null);
  const [existingFiles, setExistingFiles] = useState<MaybeFile[]>([]);
  const [loading, setLoading] = useState(false);
  const { alert, showAlert, dismissAlert } = useAlert();

  const handleFileChange = (fileList: FileList | null) => {
    setFiles(fileList);
  };

  const handleSubmit = useCallback(
    async (
      e: React.FormEvent<HTMLFormElement> | Event,
      customer?: { id?: string | number },
      currentExistingFiles: MaybeFile[] = []
    ) => {
      e.preventDefault();
      setLoading(true);
      dismissAlert();

      try {
        const form = e.currentTarget as HTMLFormElement;
        const formData = new FormData(form);

        formData.set('customerType', customerType);
        formData.set('displayName', formData.get('displayName') as string);
        formData.set('companyName', formData.get('companyName') as string);
        formData.set('address', formData.get('address') as string);
        formData.set('remarks', formData.get('remarks') as string);
        formData.set('status', (formData.get('status') as string) || 'Active');

        const contacts = formData.get('contacts');
        if (contacts) {
          formData.set('contacts', contacts as string);
        }

        if (customer && customer.id) {
          const existingDocsPayload = currentExistingFiles.map((f) => {
            if (!f) return '';
            if (typeof f === 'string') return f;
            const fileObj = f as { url?: string; name?: string; path?: string };
            if (fileObj.url) return fileObj.url;
            if (fileObj.path) return fileObj.path;
            if (fileObj.name) return fileObj.name;
            return String(f);
          });
          formData.set('existingDocuments', JSON.stringify(existingDocsPayload));
        }

        if (files) {
          Array.from(files).forEach((file) => {
            formData.append('documents', file);
          });
        }

        const url =
          customer && customer.id
            ? `/customers/${customer.id}`
            : `/customers`;

        const method = customer && customer.id ? 'put' : 'post';

        const response = await axios({
          method,
          url,
          data: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.status === 200 || response.status === 201) {
          // Success alert suppressed as per user request
        }

        setFiles(null);
      } catch (err: unknown) {
        console.error('Error saving customer:', err);
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        const msg = error.response?.data?.message || error.message || 'Failed to save customer';
        showAlert('error', msg);
      } finally {
        setLoading(false);
      }
    },
    [customerType, files, showAlert, dismissAlert]
  );

  return {
    customerType,
    setCustomerType,
    handleFileChange,
    handleSubmit,
    loading,
    existingFiles,
    setExistingFiles,
    alert,
    dismissAlert,
  };
};

export default useCustomerForm;
