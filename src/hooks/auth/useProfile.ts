import { useState, useEffect } from 'react';
import axios from '../../Service/axios';

interface User {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    companyName?: string;
}

interface UseProfileReturn {
    user: User | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useProfile = (): UseProfileReturn => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(`/auth/me`);

            if (response.data?.user) {
                setUser(response.data.user);
            }
        } catch (err: any) {
            console.error('Failed to fetch user profile:', err);
            setError(err.response?.data?.message || 'Failed to fetch user profile');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    return {
        user,
        loading,
        error,
        refetch: fetchProfile,
    };
};
