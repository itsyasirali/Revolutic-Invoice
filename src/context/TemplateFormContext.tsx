import React, { createContext, useContext, useState, type ReactNode } from 'react';

// Type for template navigation items
type TemplateNavItem = 'general' | 'header' | 'table' | 'total' | 'notes';

// Type for specific elements within sections
type TemplateElement = 'logo' | 'invoice-title' | 'bill-to' | 'dates' | 'table-header' | 'table-body' | 'subtotal' | 'balance-due' | 'notes-section' | 'footer' | '';

interface TemplateFormContextType {
    activeNav: TemplateNavItem;
    setActiveNav: (nav: TemplateNavItem) => void;
    activeElement: TemplateElement;
    setActiveElement: (element: TemplateElement) => void;
    isTemplateFormActive: boolean;
    setIsTemplateFormActive: (active: boolean) => void;
}

const TemplateFormContext = createContext<TemplateFormContextType | undefined>(undefined);

interface TemplateFormProviderProps {
    children: ReactNode;
}

export const TemplateFormProvider: React.FC<TemplateFormProviderProps> = ({ children }) => {
    const [activeNav, setActiveNav] = useState<TemplateNavItem>('general');
    const [activeElement, setActiveElement] = useState<TemplateElement>('');
    const [isTemplateFormActive, setIsTemplateFormActive] = useState(false);

    return (
        <TemplateFormContext.Provider value={{
            activeNav,
            setActiveNav,
            activeElement,
            setActiveElement,
            isTemplateFormActive,
            setIsTemplateFormActive
        }}>
            {children}
        </TemplateFormContext.Provider>
    );
};

export const useTemplateFormContext = () => {
    const context = useContext(TemplateFormContext);
    if (!context) {
        throw new Error('useTemplateFormContext must be used within a TemplateFormProvider');
    }
    return context;
};

export type { TemplateNavItem, TemplateElement };
export default TemplateFormContext;
