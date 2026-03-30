import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Users, Package, FileText, Receipt, DollarSign,
  Clock, BarChart3, ChevronLeft, ChevronRight,
  Layout, Table as TableIcon, Sigma, StickyNote,
  type LucideIcon
} from 'lucide-react';
import Logo from '../assets/revolutic-logo-white.svg';
import Icon from '../assets/Icon.png';
import { useTemplateFormContext, type TemplateNavItem } from '../context/TemplateFormContext';

interface SidebarProps {
  activeItem: string;
  onMenuClick: (item: string) => void;
  isCollapsed: boolean;
  onToggle: (collapsed?: boolean) => void;
}

// Template form navigation items
const TEMPLATE_NAV_ITEMS: { id: TemplateNavItem; icon: LucideIcon; label: string }[] = [
  { id: 'general', icon: Layout, label: 'General' },
  { id: 'header', icon: FileText, label: 'Header & Footer' },
  { id: 'table', icon: TableIcon, label: 'Table' },
  { id: 'total', icon: Sigma, label: 'Total' },
  { id: 'notes', icon: StickyNote, label: 'Notes & Bank' },
];

// Regular menu items
const MENU_ITEMS = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Users, label: 'Customers', path: '/customers' },
  { icon: Package, label: 'Items', path: '/items' },
  { icon: FileText, label: 'Invoices', path: '/invoices' },
  { icon: DollarSign, label: 'Payments', path: '/payments' },
  { icon: Receipt, label: 'Expenses', path: '/expenses' },
  { icon: Clock, label: 'Time Tracking', path: '/time-tracking' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  onMenuClick,
  isCollapsed,
  onToggle
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeNav, setActiveNav, isTemplateFormActive } = useTemplateFormContext();

  // Check if we're on a template form route
  const isTemplateRoute = location.pathname.startsWith('/templates/new') ||
    location.pathname.startsWith('/templates/edit');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && !isCollapsed) {
        onToggle(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed, onToggle]);

  const handleClick = (item: string, path: string) => {
    onMenuClick(item);
    navigate(path);
  };

  const handleTemplateNavClick = (navId: TemplateNavItem) => {
    setActiveNav(navId);
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-slate-900 transition-all duration-300 ease-in-out z-40
        ${isCollapsed ? 'w-16' : 'w-56'}
        md:sticky md:top-0 md:h-screen
      `}
    >
      <div className="flex flex-col h-full">
        {/* Header Section - Logo Only */}
        <div className="flex items-center justify-center p-3 border-b border-slate-800">
          {!isCollapsed ? (
            <div className="flex items-center justify-center w-full">
              <img
                src={Logo}
                alt="Logo"
                className="h-6 w-auto object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <img
                src={Icon}
                alt="Icon"
                className="h-8 w-8 object-contain"
              />
            </div>
          )}
        </div>

        {/* Menu / Template Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-slate-700">
          {isTemplateRoute && isTemplateFormActive ? (
            // Template Form Navigation
            <>
              {!isCollapsed && (
                <div className="px-4 py-2 mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Template Settings
                  </span>
                </div>
              )}
              {TEMPLATE_NAV_ITEMS.map((item) => {
                const IconComp = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTemplateNavClick(item.id)}
                    className={`flex w-[90%] mx-auto rounded-md px-2 py-2 my-0.5 text-xs transition-all
                      ${isCollapsed ? 'flex-col justify-center items-center gap-0.5' : 'items-center gap-2'}
                      ${isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }
                    `}
                    title={item.label}
                  >
                    <IconComp size={16} className="flex-shrink-0" />
                    {!isCollapsed && <span className="text-xs truncate">{item.label}</span>}
                  </button>
                );
              })}

              {/* Back to Templates List */}
              <div className="border-t border-slate-800 mt-4 pt-4">
                <button
                  onClick={() => navigate('/templates')}
                  className={`flex w-[90%] mx-auto rounded-md px-2 py-2 text-xs transition-all
                    ${isCollapsed ? 'flex-col justify-center items-center gap-0.5' : 'items-center gap-2'}
                    text-slate-400 hover:bg-slate-700 hover:text-white
                  `}
                  title="Back to Templates"
                >
                  <ChevronLeft size={16} className="flex-shrink-0" />
                  {!isCollapsed && <span className="text-xs truncate">Back to Templates</span>}
                </button>
              </div>
            </>
          ) : (
            // Regular Menu Items
            MENU_ITEMS.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => handleClick(item.label, item.path)}
                  className={`flex w-[90%] mx-auto rounded-md px-2 py-2 my-0.5 text-xs transition-all
                    ${isCollapsed ? 'flex-col justify-center items-center gap-0.5' : 'items-center gap-2'}
                    ${(location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)))
                      ? 'bg-primary text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }
                  `}
                  title={item.label}
                >
                  <IconComp size={16} className="flex-shrink-0" />
                  {!isCollapsed && <span className="text-xs truncate">{item.label}</span>}
                </button>
              );
            })
          )}
        </nav>

        {/* Toggle Button at Bottom */}
        <div className="border-t border-slate-800 p-2">
          <button
            onClick={() => onToggle(!isCollapsed)}
            className={`w-full flex items-center justify-center p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors
              ${isCollapsed ? 'flex-col gap-1' : 'gap-2'}
            `}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {!isCollapsed ? (
              <>
                <ChevronLeft size={18} />
              </>
            ) : (
              <ChevronRight size={18} />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};