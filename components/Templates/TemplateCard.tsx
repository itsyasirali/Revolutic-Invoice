"use client";

import React from "react";
import { Settings, CheckCircle, ChevronDown } from "lucide-react";
import type { TemplateCardProps } from "@/types/template";
import useTemplateCard from "@/hooks/templates/useTemplateCard";
import TemplatePreview from "./TemplatePreview";
import { Badge } from "@/components/ui";

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  index,
  onEdit,
  onSetActive,
  onPreview,
  onClone,
  onDelete,
  mode = "manage",
  selected = false,
  onClick,
}) => {
  const {
    isHovered,
    isMenuOpen,
    menuRef,
    selectionBorderClass,
    handleCardClick,
    handleMouseEnter,
    handleMouseLeave,
    toggleMenu,
    menuItems,
    handleMenuItemClick,
  } = useTemplateCard({
    template,
    mode,
    selected,
    onClick,
    onSetActive,
    onPreview,
    onClone,
    onDelete,
  });

  return (
    <div
      style={{ width: "calc(210mm * 0.45)", animationDelay: `${index * 100}ms` }}
    >
      <div
        className={`relative bg-white rounded-md border border-slate-200 cursor-pointer overflow-hidden transition-shadow ${
          isHovered ? "shadow-lg border-slate-300" : "shadow-sm"
        } ${selectionBorderClass}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
      >
        <div
          className="relative overflow-hidden bg-white"
          style={{
            width: "calc(210mm * 0.45)",
            height: "calc(297mm * 0.45)",
          }}
        >
          <div
            className="transform origin-top-left bg-white"
            style={{
              width: "210mm",
              height: "297mm",
              transform: "scale(0.45)",
              pointerEvents: "none",
            }}
          >
            <TemplatePreview data={template.raw || template} />
          </div>

          {/* Bottom action bar on hover: Edit + options dropdown */}
          {mode === "manage" && isHovered && (
            <div
              className="absolute inset-x-0 bottom-0 h-16 bg-slate-700 flex items-center justify-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => onEdit(template.id)}
                className="px-4 h-9 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 cursor-pointer"
              >
                Edit
              </button>

              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={toggleMenu}
                  title="Template Options"
                  className="flex items-center gap-1 px-3 h-9 rounded-md bg-white text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <Settings size={16} />
                  <ChevronDown size={12} />
                </button>

                {isMenuOpen && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-44 bg-white rounded-md shadow-xl border border-slate-100 py-1 z-50">
                    {menuItems.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={i}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer ${
                            item.variant === "danger"
                              ? "text-red-500 hover:bg-red-50"
                              : "text-slate-700"
                          }`}
                          onClick={() => handleMenuItemClick(item)}
                        >
                          <Icon size={15} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {selected && (
          <div className="absolute top-3 right-3 bg-primary/90 text-white rounded-md p-1 shadow-md">
            <CheckCircle size={16} />
          </div>
        )}
      </div>

      {/* Name sits below the card, like the gallery layout */}
      <div className="mt-2 h-7 flex items-center gap-2 px-0.5">
        <h3
          className={`text-sm text-slate-700 truncate ${selected ? "text-primary font-semibold" : ""}`}
        >
          {template.name}
        </h3>
        {template.isDefault && (
          <Badge variant="primary" size="sm">
            Default
          </Badge>
        )}
      </div>
    </div>
  );
};

export default TemplateCard;
