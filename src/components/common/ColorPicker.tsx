import React from 'react';

interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, error }) => {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#000000"
                />
            </div>
            {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
    );
};

export default ColorPicker;
