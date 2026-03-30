import React, { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
    label: string;
    currentFile?: string;
    onFileSelect: (file: File) => void;
    onFileRemove?: () => void;
    accept?: string;
    maxSize?: number; // in MB
}

const FileUpload: React.FC<FileUploadProps> = ({
    label,
    currentFile,
    onFileSelect,
    onFileRemove,
    accept = 'image/*',
    maxSize = 5,
}) => {
    const [preview, setPreview] = useState<string | null>(currentFile || null);
    const [error, setError] = useState<string>('');
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (file: File | null) => {
        if (!file) return;

        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
            setError(`File size must be less than ${maxSize}MB`);
            return;
        }

        // Validate file type
        if (accept && !file.type.match(accept.replace('*', '.*'))) {
            setError('Invalid file type');
            return;
        }

        setError('');
        onFileSelect(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileChange(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleRemove = () => {
        setPreview(null);
        setError('');
        if (onFileRemove) onFileRemove();
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>

            {preview ? (
                <div className="relative w-full p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-24 h-24 object-contain border border-gray-300 rounded"
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-600">Logo uploaded</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                        }`}
                >
                    <input
                        type="file"
                        accept={accept}
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-gray-100 rounded-full">
                            <ImageIcon size={24} className="text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">
                                Drop your logo here, or <span className="text-blue-600">browse</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Max size: {maxSize}MB. Supports: JPG, PNG, GIF, WEBP
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
    );
};

export default FileUpload;
