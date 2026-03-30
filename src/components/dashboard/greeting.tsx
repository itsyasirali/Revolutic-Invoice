import React from 'react';
import { Smartphone } from 'lucide-react';
import { useProfile } from '../../hooks/auth/useProfile';

export const GreetingSection: React.FC = () => {
    const { user, loading } = useProfile();

    const userName = user?.name || 'User';

    return (
        <div className="flex mb-2 gap-2 px-3 w-[97%] pt-5 mx-auto">
            <div className="min-w-0 flex-1 flex flex-row gap-3">
                <div className='w-10 h-10 bg-white border border-gray-00 rounded-sm mb-2 flex items-center justify-center'>
                    <button
                        className="p-1 sm:p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Mobile"
                    >
                        <Smartphone size={24} className="sm:w-5 sm:h-5" />
                    </button>
                </div>
                <div>
                    <h1 className="text-md font-semibold text-gray-900 mb-1 truncate">
                        {loading ? 'Loading...' : `Hello, ${userName}`}
                        <p className="text-xs text-gray-500">Personal</p>
                    </h1>
                </div>
            </div>
        </div>
    );
};
