"use client";

import { useState, useEffect } from "react";
import type {
  UseCollapsibleSectionProps,
  UseCollapsibleSectionReturn,
} from "@/types/template";

const useCollapsibleSection = ({
  defaultOpen = false,
  isOpen: controlledIsOpen,
  onToggle,
}: UseCollapsibleSectionProps): UseCollapsibleSectionReturn => {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (defaultOpen) {
      setInternalIsOpen(true);
    }
  }, [defaultOpen]);

  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  return {
    isOpen,
    handleToggle,
  };
};

export default useCollapsibleSection;
