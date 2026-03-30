import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { TemplateFormProvider } from '../context/TemplateFormContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('Home');

  return (
    <TemplateFormProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          activeItem={activeItem}
          onMenuClick={(item) => setActiveItem(item)}
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="max-w-[1920px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </TemplateFormProvider>
  );
};

export default MainLayout;