import { useState } from 'react';
import axios from '../../Service/axios';
import { useNavigate } from 'react-router-dom';

interface UseLogoutReturn {
    logout: () => Promise<void>;
    loading: boolean;
    error: string | null;
}

export const useLogout = (): UseLogoutReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const logout = async () => {
        try {
            setLoading(true);
            setError(null);

            await axios.post(`/auth/logout`, {});
            localStorage.clear();
            navigate('/login');
        } catch (err: any) {
            console.error('Logout failed:', err);
            setError(err.response?.data?.message || 'Logout failed');
        } finally {
            setLoading(false);
        }
    };

    return {
        logout,
        loading,
        error,
    };
};
