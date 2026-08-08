"use client";

import React, { useState } from 'react';
import { X, Image as ImageIcon, UploadCloud } from 'lucide-react';

export interface FileUploadProps {
    label: string;
    currentFile?: string;
    onFileSelect: (file: File) => void;
    onFileRemove?: () => void;
    accept?: string;
    maxSize?: number; // in MB
}

export const FileUpload: React.FC<FileUploadProps> = ({
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

        if (file.size > maxSize * 1024 * 1024) {
            setError(`File size must be less than ${maxSize}MB`);
            return;
        }

        if (accept && !file.type.match(accept.replace('*', '.*'))) {
            setError('Invalid file type');
            return;
        }

        setError('');
        onFileSelect(file);

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

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleRemove = () => {
        setPreview(null);
        setError('');
        if (onFileRemove) onFileRemove();
    };

    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                {label}
            </label>

            {preview ? (
                <div className="relative inline-block w-full p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                {preview.startsWith('data:image') || preview.startsWith('http') || preview.endsWith('.png') || preview.endsWith('.jpg') ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={preview} alt="Upload Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-5 h-5 text-slate-500" />
                                )}
                            </div>
                            <span className="text-xs font-medium text-slate-700 truncate">File Attached</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${isDragging
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-300 hover:border-slate-400 bg-slate-50/40 hover:bg-slate-50'
                        }`}
                >
                    <input
                        type="file"
                        accept={accept}
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                        className="hidden"
                        id={`file-upload-${label.replace(/\s+/g, '-')}`}
                    />
                    <label htmlFor={`file-upload-${label.replace(/\s+/g, '-')}`} className="cursor-pointer flex flex-col items-center gap-2">
                        <div className="p-3 bg-white shadow-sm border border-slate-200/80 rounded-full text-slate-500">
                            <UploadCloud className="w-6 h-6 text-primary" />
                        </div>
                        <div className="text-xs font-medium text-slate-700">
                            <span className="text-primary font-semibold hover:underline">Click to upload</span> or drag and drop
                        </div>
                        <p className="text-[11px] text-slate-400">Max file size {maxSize}MB</p>
                    </label>
                </div>
            )}

            {error && <p className="text-xs text-rose-500 font-medium mt-0.5">{error}</p>}
        </div>
    );
};

export default FileUpload;
