import type { EmptyStateProps } from '../../types/common';
import Button from './Button';

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, message, action }) => {
    return (
        <div className="p-10 text-center border border-slate-200/80 bg-white rounded-xl shadow-sm">
            <div className="p-4 bg-slate-100/80 text-slate-400 rounded-full w-fit mx-auto mb-4">
                <Icon className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">{message}</p>
            {action && (
                <Button onClick={action.onClick} variant="primary" size="md">
                    {action.label}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
