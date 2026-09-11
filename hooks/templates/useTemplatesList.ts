"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import type {
  Template,
  TemplateListItem,
  UseTemplatesListReturn,
} from "@/types/template";

const useTemplatesList = (
  initialTemplates?: TemplateListItem[],
): UseTemplatesListReturn => {
  const [templates, setTemplates] = useState<TemplateListItem[]>(
    initialTemplates || [],
  );
  const [loading, setLoading] = useState<boolean>(
    initialTemplates ? false : true,
  );
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const urlSearch = searchParams?.get("search") || "";
  const [searchTerm, setSearchTerm] = useState<string>(urlSearch);

  useEffect(() => {
    setSearchTerm(urlSearch);
  }, [urlSearch]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/templates`);

      const rawData = response.data;
      const templatesData: Template[] = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.templates)
          ? rawData.templates
          : [];

      const listItems: TemplateListItem[] = templatesData.map((template) => ({
        id: (template.id ?? "").toString(),
        name: template.templateName || "Untitled Template",
        paperSize: template.paperSize || "A4",
        orientation: template.orientation || "portrait",
        isDefault: Boolean(template.isDefault),
        createdAt: template.createdAt
          ? new Date(template.createdAt).toLocaleDateString()
          : "",
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
    if (initialTemplates === undefined) {
      fetchTemplates();
    }
  }, [initialTemplates]);

  const filteredTemplates = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) {
      return templates;
    }
    return templates.filter(
      (template) =>
        template.name.toLowerCase().includes(query) ||
        (template.paperSize || "").toLowerCase().includes(query) ||
        (template.orientation || "").toLowerCase().includes(query)
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
