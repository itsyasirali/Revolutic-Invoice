"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { swrFetcher, SWR_KEYS } from "@/lib/swr";
import type {
  Template,
  TemplateListItem,
  UseTemplatesListReturn,
} from "@/types/template";

type TemplatesApiResponse = {
  templates?: Template[];
};

const useTemplatesList = (
  initialTemplates?: TemplateListItem[],
): UseTemplatesListReturn => {
  const searchParams = useSearchParams();
  const urlSearch = searchParams?.get("search") || "";
  const [searchTerm, setSearchTerm] = useState<string>(urlSearch);

  useEffect(() => {
    setSearchTerm(urlSearch);
  }, [urlSearch]);

  const {
    data,
    error: swrError,
    isLoading,
    mutate,
  } = useSWR<TemplatesApiResponse | Template[]>(SWR_KEYS.templates, swrFetcher, {
    fallbackData: initialTemplates
      ? initialTemplates.map((t) => t.raw || t)
      : undefined,
    revalidateOnFocus: true,
    revalidateOnMount: true,
  });

  const templates: TemplateListItem[] = useMemo(() => {
    if (!data) return initialTemplates || [];
    const rawData = data;
    const templatesData: Template[] = Array.isArray(rawData)
      ? rawData
      : Array.isArray((rawData as any)?.templates)
        ? (rawData as any).templates
        : [];

    return templatesData.map((template) => ({
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
  }, [data, initialTemplates]);

  const filteredTemplates = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) {
      return templates;
    }
    return templates.filter(
      (template) =>
        template.name.toLowerCase().includes(query) ||
        (template.paperSize || "").toLowerCase().includes(query) ||
        (template.orientation || "").toLowerCase().includes(query),
    );
  }, [templates, searchTerm]);

  const error =
    swrError?.response?.status === 404
      ? null
      : swrError
        ? swrError.response?.data?.message ||
          swrError.message ||
          "Failed to fetch templates"
        : null;

  return {
    templates,
    loading: isLoading,
    error,
    refetch: async () => {
      await mutate();
    },
    searchTerm,
    setSearchTerm,
    filteredTemplates,
  };
};

export default useTemplatesList;
