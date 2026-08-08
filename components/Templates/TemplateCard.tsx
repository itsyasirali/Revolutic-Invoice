"use client";

import React from "react";
import { Pencil, Settings, Eye, Copy, Trash2, CheckCircle } from "lucide-react";
import type { TemplateListItem } from "@/types/template";
import type { DropdownMenuItem } from "@/types/common";
import TemplatePreview from "./TemplatePreview";
import { DropdownMenu, Badge, IconButton } from "@/components/ui";

interface TemplateCardProps {
  template: TemplateListItem;
  index: number;
  onEdit: (id: string) => void;
  onSetActive: (id: string) => void;
  onPreview: (template: TemplateListItem) => void;
  onClone?: (template: TemplateListItem) => void;
  onDelete?: (id: string) => void;
  mode?: "manage" | "select";
  selected?: boolean;
  onClick?: (template: TemplateListItem) => void;
}

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

  const menuItems: DropdownMenuItem[] = [
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
      className={`group relative bg-white rounded-md border border-slate-200/80 shadow-md hover:shadow-xl cursor-pointer transition-all duration-300 overflow-hidden mx-auto ${selectionBorderClass}`}
      style={{
        width: "calc(210mm * 0.35)",
        animationDelay: `${index * 100}ms`,
      }}
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

        {mode === "manage" && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[1px]">
            <IconButton
              icon={Pencil}
              variant="primary"
              size="lg"
              label="Edit Template"
              onClick={() => onEdit(template.id)}
            />
            <DropdownMenu
              items={menuItems}
              align="center"
              width="w-44"
              trigger={
                <IconButton
                  icon={Settings}
                  variant="secondary"
                  size="lg"
                  label="Template Options"
                />
              }
            />
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
