import React from 'react';

export interface ComingSoonProps {
    title?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ title }) => {
    return (
        <div className="flex-1 min-h-[calc(100vh-64px)] flex items-center justify-center bg-white p-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {title ? `${title} - Coming Soon` : 'Coming Soon'}
                </h1>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                    Feature In Development
                </p>
            </div>
        </div>
    );
};

export default ComingSoon;
