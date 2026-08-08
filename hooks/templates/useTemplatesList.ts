"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "@/lib/axios";
import type {
  Template,
  TemplateListItem,
  UseTemplatesListReturn,
} from "@/types/template";

const useTemplatesList = (): UseTemplatesListReturn => {
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/templates`);

      const templatesData: Template[] = response.data;

      const listItems: TemplateListItem[] = templatesData.map((template) => ({
        id: template.id.toString(),
        name: template.templateName,
        paperSize: template.paperSize,
        orientation: template.orientation,
        isDefault: template.isDefault,
        createdAt: new Date(template.createdAt || "").toLocaleDateString(),
        raw: template,
      }));

      setTemplates(listItems);
    } catch (err: any) {
      console.error("Error fetching templates:", err);
      setError(err.response?.data?.message || "Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const filteredTemplates = useMemo(() => {
    if (!searchTerm.trim()) {
      return templates;
    }
    return templates.filter((template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [templates, searchTerm]);

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
    searchTerm,
    setSearchTerm,
    filteredTemplates,
  };
};

export default useTemplatesList;
