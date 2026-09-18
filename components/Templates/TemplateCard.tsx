"use client";

import React, { useState, useRef, useEffect } from "react";
import { Pencil, Settings, Eye, Copy, Trash2, CheckCircle } from "lucide-react";
import type { TemplateCardProps } from "@/types/template";
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
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isSelectMode = mode === "select";

  const selectionBorderClass = selected
    ? "ring-4 ring-blue-500 ring-offset-2"
    : isSelectMode
      ? "hover:ring-2 hover:ring-blue-300 ring-offset-1 cursor-pointer"
      : "";

  const handleCardClick = () => {
    if (isSelectMode && onClick) {
      onClick(template);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Close menu when card loses hover
  useEffect(() => {
    if (!isHovered) setIsMenuOpen(false);
  }, [isHovered]);

  interface MenuItem {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    variant?: "danger";
  }

  const menuItems: MenuItem[] = [
    ...(template.isDefault
      ? []
      : [
          {
            icon: CheckCircle,
            label: "Set as Default",
            onClick: () => onSetActive(template.id),
          },
        ]),
    {
      icon: Eye,
      label: "Preview",
      onClick: () => onPreview(template),
    },
    ...(onClone
      ? [
          {
            icon: Copy,
            label: "Clone",
            onClick: () => onClone(template),
          },
        ]
      : []),
    ...(onDelete
      ? [
          {
            icon: Trash2,
            label: "Delete",
            onClick: () => onDelete(template.id),
            variant: "danger" as const,
          },
        ]
      : []),
  ];

  return (
    <div
      className={`relative bg-white rounded-md border border-slate-200/80 shadow-md cursor-pointer overflow-hidden mx-auto ${
        isHovered ? "shadow-xl" : ""
      } ${selectionBorderClass}`}
      style={{
        width: "calc(210mm * 0.35)",
        animationDelay: `${index * 100}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
                onClick={() => setIsMenuOpen((prev) => !prev)}
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
                        onClick={() => {
                          item.onClick();
                          setIsMenuOpen(false);
                          setIsHovered(false);
                        }}
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
