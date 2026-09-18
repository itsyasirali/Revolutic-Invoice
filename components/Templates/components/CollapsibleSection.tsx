import React from "react";
import { ChevronRight } from "lucide-react";
import type { CollapsibleSectionProps } from "@/types/template";
import useCollapsibleSection from "@/hooks/templates/useCollapsibleSection";

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
  icon,
  id,
  isSelected = false,
}) => {
  const { isOpen, handleToggle } = useCollapsibleSection({
    defaultOpen,
    isOpen: controlledIsOpen,
    onToggle,
  });

  return (
    <div
      id={id}
      className={`border-b border-gray-200 ${
        isSelected ? "bg-blue-50/50 ring-2 ring-primary/40 rounded-sm" : ""
      }`}
    >
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span
            className={`text-sm ${
              isSelected
                ? "font-semibold text-primary"
                : "font-medium text-gray-800"
            }`}
          >
            {title}
          </span>
        </div>
        <ChevronRight
          size={16}
          className={`text-gray-400 ${
            isOpen ? "rotate-90 text-primary" : ""
          }`}
        />
      </button>
      {isOpen && <div className="px-4 pb-4 space-y-4">{children}</div>}
    </div>
  );
};

export default CollapsibleSection;
