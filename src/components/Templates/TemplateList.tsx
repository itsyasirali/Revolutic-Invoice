import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import useTemplatesList from '../../hooks/templates/useTemplatesList';
import useTemplateActions from '../../hooks/templates/useTemplateActions';
import useTemplatePreview from '../../hooks/templates/useTemplatePreview';
import useCloneTemplate from '../../hooks/templates/useCloneTemplate';
import Input from '../common/Input';
import ConfirmDialog from '../common/ConfirmDialog';
import LoadingSpinner from '../common/LoadingSpinner';
import TemplateCard from './TemplateCard';
import TemplatePreviewModal from './TemplatePreviewModal';

const TemplateList: React.FC = () => {
    const navigate = useNavigate();
    const { loading, error, refetch, searchTerm, setSearchTerm, filteredTemplates } = useTemplatesList();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Template actions
    const {
        handleDelete,
        handleEdit,
        handleSetDefault,
        confirmDialog,
        confirmDelete,
        hideConfirmDialog,
    } = useTemplateActions({ selectedIds, setSelectedIds, refetch });

    // Preview modal state
    const {
        isOpen: previewOpen,
        selectedTemplate: previewTemplate,
        zoomLevel,
        currentPage,
        openPreview,
        closePreview,
        zoomIn,
        zoomOut,
        setCurrentPage,
    } = useTemplatePreview();

    // Clone template
    const { cloneTemplate } = useCloneTemplate(refetch);

    // Handle delete from card
    const handleDeleteFromCard = (id: string) => {
        setSelectedIds([id]);
        handleDelete([id]);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-200 m-8">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30">
            <div className="p-8 max-w-[1800px] mx-auto">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                                PDF Templates
                            </h1>
                        </div>
                    </div>

                    <div className="w-80">
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search templates..."
                            leftIcon={Search}
                            className="bg-white/80 backdrop-blur-sm shadow-lg shadow-gray-200/50 border-gray-200/50"
                        />
                    </div>

                    {/* New Template Button */}
                    <button
                        onClick={() => navigate('/templates/new')}
                        className="group flex items-center gap-3 px-3 py-1 bg-blue-500 text-white rounded-sm font-semibold shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-300"
                    >
                        <span>New Template</span>
                    </button>
                </div>

                {/* Template Grid */}
                <div className="grid xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredTemplates.map((template, index) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            index={index}
                            onEdit={(id) => handleEdit(id, template.raw || template)}
                            onSetActive={handleSetDefault}
                            onPreview={openPreview}
                            onClone={cloneTemplate}
                            onDelete={handleDeleteFromCard}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {filteredTemplates.length === 0 && (
                    <div className="text-center py-20">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No templates found</h3>
                        <p className="text-gray-500 mb-6">Create your first template to get started</p>
                        <button
                            onClick={() => navigate('/templates/new')}
                            className="inline-flex items-center gap-2 px-3 py-1"
                        >
                            <Plus size={20} />
                            Create Template
                        </button>
                    </div>
                )}

                {/* Confirm Delete Dialog */}
                <ConfirmDialog
                    isOpen={confirmDialog.show}
                    onCancel={hideConfirmDialog}
                    onConfirm={confirmDelete}
                    title="Delete Template"
                    message={`Are you sure you want to delete this template? This action cannot be undone.`}
                    confirmText="Delete"
                    type="danger"
                />

                {/* Preview Modal */}
                <TemplatePreviewModal
                    isOpen={previewOpen}
                    template={previewTemplate}
                    zoomLevel={zoomLevel}
                    currentPage={currentPage}
                    totalPages={2}
                    onClose={closePreview}
                    onZoomIn={zoomIn}
                    onZoomOut={zoomOut}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default TemplateList;