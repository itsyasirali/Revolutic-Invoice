import React, { useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
    Send,
    X,
    Plus,
    Check,
    FileText,
} from 'lucide-react';
import { usePaymentEmail } from '../../hooks/payments/usePaymentEmail';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import PageHeader from '../common/PageHeader';

const PaymentEmailCompose: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();

    // Get payment from location state
    const initialData = useMemo(() => {
        if (location.state?.payment) {
            return location.state.payment;
        }
        return null;
    }, [location.state]);

    const {
        payment,
        loading,
        sending,
        emailData,
        handleSend,

        removeEmail,
        updateMessage,
        toggleAttachPDF,
        newEmailInput,
        setNewEmailInput,
        activeField,
        setActiveField,
        handleAddEmail,
        handleKeyDown,
        navigate
    } = usePaymentEmail(id || '', initialData);


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!payment && !loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-lg shadow-sm">
                    <p className="text-red-500 text-lg mb-4">Payment not found</p>
                    <Button onClick={() => navigate(-1)} variant="secondary">Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <PageHeader
                title="Compose Email"
                showBackButton={true}
                onBack={() => navigate(-1)}
                actions={
                    <Button
                        onClick={handleSend}
                        disabled={sending}
                        variant="primary"
                        icon={sending ? <LoadingSpinner size="sm" color="white" /> : <Send className="w-4 h-4" />}
                    >
                        {sending ? 'Sending...' : 'Send'}
                    </Button>
                }
            />

            <div className="flex-1 overflow-auto">
                <div className="bg-white overflow-hidden">

                    {/* From */}
                    <div className="flex items-center px-6 py-4 border-b border-gray-100">
                        <span className="w-20 text-sm font-medium text-gray-500">From</span>
                        <span className="text-sm text-gray-900">{emailData.from}</span>
                    </div>

                    {/* To */}
                    <div className="relative flex items-start px-6 py-4 border-b border-gray-100 min-h-[64px]">
                        <span className="w-20 text-sm font-medium text-gray-500 pt-1.5">To</span>
                        <div className="flex-1 flex flex-wrap gap-2 items-center">
                            {emailData.to.map((email, idx) => (
                                <div key={idx} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                    <span className="text-sm text-gray-900">{email}</span>
                                    <button onClick={() => removeEmail('to', idx)} className="hover:text-primary/70">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}

                            {activeField === 'to' ? (
                                <div className="flex items-center gap-2 min-w-[200px]">
                                    <input
                                        autoFocus
                                        type="email"
                                        value={newEmailInput}
                                        onChange={(e) => setNewEmailInput(e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, 'to')}
                                        onBlur={() => !newEmailInput && setActiveField(null)}
                                        placeholder="Enter email..."
                                        className="flex-1 text-sm text-gray-500 outline-none bg-transparent placeholder:text-gray-600"
                                    />
                                    <button
                                        onClick={() => handleAddEmail('to')}
                                        className="p-1 hover:bg-gray-100 rounded-full text-primary"
                                    >
                                        <Check size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setActiveField('to')}
                                    className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-primary transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Cc */}
                    <div className="relative flex items-start px-6 py-4 border-b border-gray-100 min-h-[64px]">
                        <span className="w-20 text-sm font-medium text-gray-500 pt-1.5">Cc</span>
                        <div className="flex-1 flex flex-wrap gap-2 items-center">
                            {emailData.cc.map((email, idx) => (
                                <div key={idx} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                    <span>{email}</span>
                                    <button onClick={() => removeEmail('cc', idx)} className="hover:text-gray-900">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {activeField === 'cc' ? (
                                <div className="flex items-center gap-2 min-w-[200px]">
                                    <input
                                        autoFocus
                                        type="email"
                                        value={newEmailInput}
                                        onChange={(e) => setNewEmailInput(e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, 'cc')}
                                        onBlur={() => !newEmailInput && setActiveField(null)}
                                        placeholder="Enter email..."
                                        className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
                                    />
                                    <button
                                        onClick={() => handleAddEmail('cc')}
                                        className="p-1 hover:bg-gray-100 rounded-full text-primary"
                                    >
                                        <Check size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setActiveField('cc')}
                                    className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-primary transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Bcc */}
                    <div className="relative flex items-start px-6 py-4 border-b border-gray-100 min-h-[64px]">
                        <span className="w-20 text-sm font-medium text-gray-500 pt-1.5">Bcc</span>
                        <div className="flex-1 flex flex-wrap gap-2 items-center">
                            {emailData.bcc.map((email, idx) => (
                                <div key={idx} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                    <span>{email}</span>
                                    <button onClick={() => removeEmail('bcc', idx)} className="hover:text-gray-900">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {activeField === 'bcc' ? (
                                <div className="flex items-center gap-2 min-w-[200px]">
                                    <input
                                        autoFocus
                                        type="email"
                                        value={newEmailInput}
                                        onChange={(e) => setNewEmailInput(e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, 'bcc')}
                                        onBlur={() => !newEmailInput && setActiveField(null)}
                                        placeholder="Enter email..."
                                        className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
                                    />
                                    <button
                                        onClick={() => handleAddEmail('bcc')}
                                        className="p-1 hover:bg-gray-100 rounded-full text-primary"
                                    >
                                        <Check size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setActiveField('bcc')}
                                    className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-primary transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Subject */}
                    <div className="flex items-center px-6 py-4 border-b border-gray-100">
                        <span className="w-20 text-sm font-medium text-gray-500">Subject</span>
                        <input
                            type="text"
                            value={emailData.subject}
                            readOnly
                            className="flex-1 text-sm text-gray-900 outline-none bg-transparent"
                        />
                    </div>

                    {/* Message Body */}
                    <div className="px-6 py-4">
                        <label className="block text-sm font-medium text-gray-500 mb-2">Message</label>
                        <textarea
                            value={emailData.message}
                            onChange={(e) => updateMessage(e.target.value)}
                            className="w-full h-64 p-4 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                            placeholder="Type your message here..."
                        />
                    </div>

                    {/* Attachments */}
                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                        <div
                            onClick={toggleAttachPDF}
                            className="flex items-center gap-3 cursor-pointer select-none group"
                        >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${emailData.attachPDF ? 'bg-primary border-primary' : 'bg-white border-gray-300 group-hover:border-primary'}`}>
                                {emailData.attachPDF && <Check size={12} className="text-white" />}
                            </div>
                            <span className="text-sm font-medium text-gray-700">Attach Payment PDF</span>
                        </div>

                        {emailData.attachPDF && (
                            <div className="mt-3 ml-8 flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg max-w-xs">
                                <div className="p-1.5 bg-red-50 rounded">
                                    <FileText size={16} className="text-red-500" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-medium text-gray-700 truncate">Payment-{payment?.paymentNumber}.pdf</p>
                                    <p className="text-[10px] text-gray-400">PDF Document</p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div >
    );
};

export default PaymentEmailCompose;
