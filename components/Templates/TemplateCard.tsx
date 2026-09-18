"use client";

import React from "react";
import { Pencil, Settings, CheckCircle } from "lucide-react";
import type { TemplateCardProps } from "@/types/template";
import useTemplateCard from "@/hooks/templates/useTemplateCard";
import TemplatePreview from "./TemplatePreview";
import { Badge, IconButton } from "@/components/ui";

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
      className={`relative bg-white rounded-md border border-slate-200/80 shadow-md cursor-pointer overflow-hidden mx-auto ${
        isHovered ? "shadow-xl" : ""
      } ${selectionBorderClass}`}
      style={{
        width: "calc(210mm * 0.35)",
        animationDelay: `${index * 100}ms`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      <div
        className="relative overflow-hidden bg-white"
        style={{
          width: "calc(210mm * 0.35)",
          height: "calc(297mm * 0.35)",
        }}
      >
        <div
          className="transform origin-top-left bg-white"
          style={{
            width: "210mm",
            height: "297mm",
            transform: "scale(0.35)",
            pointerEvents: "none",
          }}
        >
          <TemplatePreview data={template.raw || template} />
        </div>

        {/* Overlay — shown via React state, no Tailwind transition */}
        {mode === "manage" && isHovered && (
          <div
            className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 backdrop-blur-[1px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Edit button */}
            <IconButton
              icon={Pencil}
              variant="primary"
              size="lg"
              label="Edit Template"
              onClick={() => onEdit(template.id)}
            />

            {/* Settings button + inline menu */}
            <div ref={menuRef} className="relative">
              <IconButton
                icon={Settings}
                variant="secondary"
                size="lg"
                label="Template Options"
                onClick={toggleMenu}
              />

              {isMenuOpen && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-44 bg-white rounded-md shadow-xl border border-slate-100 py-1 z-50">
                  {menuItems.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={i}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-50 ${
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

      <div className="px-3.5 py-2.5 bg-white border-t border-slate-100 flex items-center justify-between">
        <h3
          className={`font-semibold text-slate-800 text-sm truncate ${
            selected ? "text-primary" : ""
          }`}
        >
          {template.name}
        </h3>
        {template.isDefault && (
          <Badge variant="primary" size="sm">
            Default
          </Badge>
        )}
      </div>

      {selected && (
        <div className="absolute top-3 right-3 bg-primary/90 text-white rounded-md p-1 shadow-md">
          <CheckCircle size={16} />
        </div>
      )}
    </div>
  );
};

export default TemplateCard;
