"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCircle, Eye, Copy, Trash2 } from "lucide-react";
import type {
  UseTemplateCardProps,
  UseTemplateCardReturn,
  TemplateCardMenuItem,
} from "@/types/template";

const useTemplateCard = ({
  template,
  mode = "manage",
  selected = false,
  onClick,
  onSetActive,
  onPreview,
  onClone,
  onDelete,
}: UseTemplateCardProps): UseTemplateCardReturn => {
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

  const menuItems: TemplateCardMenuItem[] = [
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

  const handleMenuItemClick = (item: TemplateCardMenuItem) => {
    item.onClick();
    setIsMenuOpen(false);
    setIsHovered(false);
  };

  return {
    isHovered,
    isMenuOpen,
    menuRef,
    isSelectMode,
    selectionBorderClass,
    handleCardClick,
    handleMouseEnter: () => setIsHovered(true),
    handleMouseLeave: () => setIsHovered(false),
    toggleMenu: () => setIsMenuOpen((prev) => !prev),
    menuItems,
    handleMenuItemClick,
  };
};

export default useTemplateCard;
