import { useState } from 'react';
import axios from '../../Service/axios';

interface UseLogoutReturn {
    logout: () => Promise<void>;
    loading: boolean;
    error: string | null;
}

export const useLogout = (): UseLogoutReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const logout = async () => {
        try {
            setLoading(true);
            setError(null);

            await axios.post(`/auth/logout`, {});
        } catch (err: any) {
            console.error('Logout failed:', err);
            setError(err.response?.data?.message || 'Logout failed');
        } finally {
            localStorage.clear();
            sessionStorage.clear();
            setLoading(false);
            window.location.href = '/login';
        }
    };

    return {
        logout,
        loading,
        error,
    };
};
