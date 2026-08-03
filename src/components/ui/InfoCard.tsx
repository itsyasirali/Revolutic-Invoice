import type { InfoCardProps } from '../../types/common';

export const InfoCard: React.FC<InfoCardProps> = ({
    icon: Icon,
    label,
    value,
    variant = 'default',
    className = '',
}) => {
    const variants = {
        default: {
            bg: 'bg-slate-50/80',
            border: 'border-slate-200/70',
            iconBg: 'bg-primary/10',
            iconColor: 'text-primary',
        },
        primary: {
            bg: 'bg-sky-50/80',
            border: 'border-sky-200/70',
            iconBg: 'bg-sky-100',
            iconColor: 'text-sky-600',
        },
        success: {
            bg: 'bg-emerald-50/80',
            border: 'border-emerald-200/70',
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
        },
        warning: {
            bg: 'bg-amber-50/80',
            border: 'border-amber-200/70',
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
        },
    };

    const styles = variants[variant];

    return (
        <div className={`p-4 ${styles.bg} rounded-xl border ${styles.border} transition-all hover:shadow-sm ${className}`}>
            <div className="flex items-start gap-3.5">
                <div className={`p-2.5 ${styles.iconBg} rounded-lg shrink-0`}>
                    <Icon className={`w-5 h-5 ${styles.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-0.5 font-bold truncate">
                        {label}
                    </div>
                    <div className="text-base font-semibold text-slate-900 truncate">{value}</div>
                </div>
            </div>
        </div>
    );
};

export default InfoCard;
