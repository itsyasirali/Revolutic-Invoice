"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@/lib/axios";
import type {
  TemplateFormData,
  UseTemplateFormReturn,
  AlertState,
  TableColumn,
  TableColumnSetting,
} from "@/types/template";
import { getNavState } from "@/lib/clientNavState";

const DEFAULT_COLUMNS: TableColumn[] = [
  { key: "index", label: "#", width: 30, align: "left", enabled: true },
  {
    key: "itemName",
    label: "Item & Description",
    width: 200,
    align: "left",
    enabled: true,
  },
  { key: "quantity", label: "Qty", width: 50, align: "center", enabled: true },
  { key: "rate", label: "Rate", width: 60, align: "right", enabled: true },
  { key: "amount", label: "Amount", width: 70, align: "right", enabled: true },
];

const DEFAULT_FORM_DATA: TemplateFormData = {
  templateName: "",
  isDefault: false,
  paperSize: "A4",
  orientation: "Portrait",
  marginTop: 0.7,
  marginBottom: 0.7,
  marginLeft: 0.55,
  marginRight: 0.4,
  padding: 10,
  primaryColor: "#1AA3FF",
  secondaryColor: "#075056",
  backgroundColor: "#ffffff",
  accentColor: "#FBBF24",
  textColor: "#1f2937",
  headerTextColor: "#1AA3FF",
  invoiceNumberColor: "#075056",
  billToColor: "#075056",
  previousDueColor: "#075056",
  borderColor: "#e5e7eb",
  balanceDueTextColor: "#EE5858",
  billToNameColor: "#075056",
  billToAddressColor: "#075056",
  billToNameFontSize: 12,
  billToAddressFontSize: 10,
  invoiceDateLabelColor: "#6b7280",
  invoiceDateValueColor: "#1f2937",
  dueDateLabelColor: "#6b7280",
  dueDateValueColor: "#1f2937",
  termsLabelColor: "#6b7280",
  termsValueColor: "#1f2937",
  invoiceDetailLabelFontSize: 10,
  invoiceDetailValueFontSize: 10,
  tableHeaderBgColor: "#1AA3FF",
  tableHeaderTextColor: "#ffffff",
  tableRowColor: "#fffbeb",
  tableAltRowColor: "#ffffff",
  tableBorderColor: "#e5e7eb",
  fontFamily: "Helvetica",
  fontSize: 10,
  headingFontSize: 20,
  subheadingFontSize: 13,
  labelFontSize: 10,
  tableFontSize: 10,
  lineHeight: 1.5,
  letterSpacing: 0,
  fontWeight: "normal",
  headingFontWeight: "bold",
  logoWidth: 180,
  logoHeight: 80,
  logoPosition: "left",
  logoMarginTop: 0,
  logoMarginBottom: 10,
  showLogo: true,
  brandName: "",
  tagline: "",
  borderStyle: "solid",
  borderWidth: 1,
  sectionSpacing: 15,
  fieldSpacing: 5,
  tableBorderStyle: "solid",
  invoiceLabel: "INVOICE",
  billToLabel: "Bill To",
  invoiceNumberLabel: "Invoice#",
  invoiceDateLabel: "Invoice Date",
  dueDateLabel: "Due Date",
  termsLabel: "Terms",
  itemsLabel: "Item & Description",
  descriptionLabel: "Description",
  quantityLabel: "Hours",
  rateLabel: "Rate",
  amountLabel: "Amount",
  subtotalLabel: "Sub Total",
  taxLabel: "Tax",
  discountLabel: "Discount",
  totalLabel: "Total",
  notesLabel: "Notes",
  previousDueLabel: "Previous Remaining",
  balanceDueLabel: "Balance Due",
  tableColumnSettings: [
    { columnName: "index", visible: true, width: "5%", alignment: "center" },
    { columnName: "itemName", visible: true, width: "40%", alignment: "left" },
    {
      columnName: "quantity",
      visible: true,
      width: "15%",
      alignment: "center",
    },
    { columnName: "rate", visible: true, width: "20%", alignment: "right" },
    { columnName: "amount", visible: true, width: "20%", alignment: "right" },
  ],
  showTableBorders: true,
  showTableHeader: true,
  tableHeaderAlignment: "left",
  alternateRowColors: true,
  showInvoiceNumber: true,
  showInvoiceDate: true,
  showDueDate: true,
  showCustomerEmail: false,
  showCustomerPhone: false,
  showCustomerAddress: true,
  showItemDescription: true,
  showItemUnit: false,
  showSubtotal: true,
  showTax: false,
  showDiscount: true,
  showShipping: false,
  showNotes: true,
  showPreviousDue: true,
  headerText: "",
  headerAlignment: "left",
  headerFontSize: 14,
  headerFontWeight: "bold",
  headerBackgroundColor: "",
  headerHeight: 0,
  showHeader: true,
  footerText: "Powered by Revolutic — Smart Invoicing",
  footerAlignment: "center",
  footerFontSize: 9,
  footerFontWeight: "normal",
  footerBackgroundColor: "#f9fafb",
  footerHeight: 72,
  showFooter: true,
  showPageNumbers: false,
  pageNumberFormat: "Page {n} of {total}",
  includePaymentStub: false,
  paymentStubPosition: "bottom",
  layoutStyle: "spacious",
  contentAlignment: "left",
};

const useTemplateForm = (id?: string): UseTemplateFormReturn => {
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] =
    useState<TemplateFormData>(DEFAULT_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "info",
    message: "",
  });

  const [branding, setBranding] = useState({
    brandName: "",
    tagline: "",
    logoPreview: "",
  });

  const [tableColumns, setTableColumns] =
    useState<TableColumn[]>(DEFAULT_COLUMNS);
  const [selectedElement, setSelectedElement] = useState<string>("");

  const paramId = params?.id as string;
  const effectiveId = id || paramId;

  useEffect(() => {
    if (!effectiveId) return;

    const navTemplate = getNavState<Record<string, unknown>>(`template:${effectiveId}`);
    if (navTemplate) {
      queueMicrotask(() => {
        const data = (navTemplate.raw || navTemplate) as Record<string, unknown>;
        setFormData((prev) => ({
          ...prev,
          ...data,
          marginTop: (data.margins as Record<string, number>)?.top || prev.marginTop,
          marginBottom: (data.margins as Record<string, number>)?.bottom || prev.marginBottom,
          marginLeft: (data.margins as Record<string, number>)?.left || prev.marginLeft,
          marginRight: (data.margins as Record<string, number>)?.right || prev.marginRight,
          tableColumnSettings:
            (data.tableColumnSettings as TableColumnSetting[]) || prev.tableColumnSettings,
        }));

        setBranding({
          brandName: (data.brandName as string) || "",
          tagline: (data.tagline as string) || "",
          logoPreview: data.logoUrl
            ? `/${(data.logoUrl as string).replace(/^\//, "")}`
            : "",
        });

        if (
          data.tableColumnSettings &&
          Array.isArray(data.tableColumnSettings) &&
          data.tableColumnSettings.length > 0
        ) {
          const settingsList = data.tableColumnSettings as TableColumnSetting[];
          const mergedColumns = DEFAULT_COLUMNS.map((defCol) => {
            const saved = settingsList.find(
              (c: TableColumnSetting) =>
                c.columnName === defCol.key || c.key === defCol.key
            );
            if (saved) {
              return {
                ...defCol,
                label: saved.label || defCol.label,
                width:
                  typeof saved.width === "string"
                    ? parseInt(saved.width) || defCol.width
                    : (saved.width as number),
                align: saved.alignment || defCol.align,
                enabled: saved.visible !== false,
              };
            }
            return { ...defCol, enabled: false };
          });

          const customColumns = settingsList
            .filter(
              (c: TableColumnSetting) =>
                !DEFAULT_COLUMNS.find(
                  (d) => d.key === c.columnName || d.key === c.key
                )
            )
            .map((c: TableColumnSetting) => ({
              key: c.columnName || (c.key as string),
              label: c.label || "Custom Column",
              width:
                typeof c.width === "string"
                  ? parseInt(c.width) || 100
                  : (c.width as number),
              align: c.alignment || "left",
              enabled: c.visible !== false,
            }));

          setTableColumns([...mergedColumns, ...customColumns]);
        }

        setLoading(false);
      });
      return;
    }

    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/templates/${effectiveId}`);
        const data = response.data;

        setFormData((prev) => ({
          ...prev,
          ...data,
          marginTop: data.margins?.top || prev.marginTop,
          marginBottom: data.margins?.bottom || prev.marginBottom,
          marginLeft: data.margins?.left || prev.marginLeft,
          marginRight: data.margins?.right || prev.marginRight,
          tableColumnSettings:
            data.tableColumnSettings || prev.tableColumnSettings,
        }));

        setBranding({
          brandName: data.brandName || "",
          tagline: data.tagline || "",
          logoPreview: data.logoUrl
            ? `/${data.logoUrl.replace(/^\//, "")}`
            : "",
        });

        if (
          data.tableColumnSettings &&
          data.tableColumnSettings.length > 0
        ) {
          const mergedColumns = DEFAULT_COLUMNS.map((defCol) => {
            const saved = data.tableColumnSettings.find(
              (c: TableColumnSetting) =>
                c.columnName === defCol.key || c.key === defCol.key
            );
            if (saved) {
              return {
                ...defCol,
                label: saved.label || defCol.label,
                width:
                  typeof saved.width === "string"
                    ? parseInt(saved.width) || defCol.width
                    : (saved.width as number),
                align: saved.alignment || defCol.align,
                enabled: saved.visible !== false,
              };
            }
            return { ...defCol, enabled: false };
          });

          const customColumns = data.tableColumnSettings
            .filter(
              (c: TableColumnSetting) =>
                !DEFAULT_COLUMNS.find(
                  (d) => d.key === c.columnName || d.key === c.key
                )
            )
            .map((c: TableColumnSetting) => ({
              key: c.columnName || (c.key as string),
              label: c.label || "Custom Column",
              width:
                typeof c.width === "string"
                  ? parseInt(c.width) || 100
                  : (c.width as number),
              align: c.alignment || "left",
              enabled: c.visible !== false,
            }));

          setTableColumns([...mergedColumns, ...customColumns]);
        }
      } catch (err: unknown) {
        console.error("Error fetching template:", err);
        setAlert({
          show: true,
          type: "error",
          message: "Failed to load template data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [effectiveId]);

  const handleChange = (
    field: keyof TemplateFormData,
    value: string | number | boolean | File | null | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setBranding((prev) => ({
        ...prev,
        logoPreview: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);

    setFormData((prev) => ({ ...prev, logoFile: file }));
  };

  const handleColumnChange = useCallback(
    (
      index: number,
      field: keyof TableColumn,
      value: string | number | boolean
    ) => {
      setTableColumns((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          [field]: value,
        } as TableColumn;
        return updated;
      });
    },
    []
  );

  const toggleColumn = useCallback((index: number) => {
    setTableColumns((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        enabled: !updated[index].enabled,
      };
      return updated;
    });
  }, []);

  const addColumn = useCallback(() => {
    const newKey = `custom_${Date.now()}`;
    setTableColumns((prev) => [
      ...prev,
      {
        key: newKey,
        label: "New Column",
        width: 80,
        align: "left",
        enabled: true,
      },
    ]);
  }, []);

  const removeColumn = useCallback((index: number) => {
    setTableColumns((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSelectElement = useCallback((elementId: string) => {
    setSelectedElement(elementId);
  }, []);

  const setBrandName = useCallback((name: string) => {
    setBranding((prev) => ({ ...prev, brandName: name }));
  }, []);

  const setTagline = useCallback((tagline: string) => {
    setBranding((prev) => ({ ...prev, tagline: tagline }));
  }, []);

  const handleSubmit = useCallback(
    async (setAsDefault = false) => {
      try {
        setLoading(true);

        const submitData = new FormData();

        Object.entries(formData).forEach(([key, value]) => {
          if (key === "logoFile") return;
          if (key === "tableColumnSettings") {
            submitData.append(key, JSON.stringify(value));
          } else {
            const safeValue =
              value === null || value === undefined
                ? ""
                : value.toString();
            submitData.append(key, safeValue);
          }
        });

        submitData.set(
          "margins",
          JSON.stringify({
            top: formData.marginTop,
            bottom: formData.marginBottom,
            left: formData.marginLeft,
            right: formData.marginRight,
          })
        );

        if (setAsDefault) {
          submitData.set("isDefault", "true");
        }

        if (formData.logoFile) {
          submitData.append("logo", formData.logoFile);
        }

        if (effectiveId) {
          await axios.put(`/templates/${effectiveId}`, submitData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        } else {
          await axios.post(`/templates`, submitData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
        }
        setAlert({
          show: true,
          type: "success",
          message: `Template ${
            effectiveId ? "updated" : "created"
          } successfully`,
        });

        setTimeout(() => {
          router.push("/templates");
        }, 1500);
      } catch (err: unknown) {
        console.error("Error submitting template:", err);
        const errorMessage = axios.isAxiosError(err)
          ? err.response?.data?.message
          : err instanceof Error
          ? err.message
          : "Failed to save template";

        setAlert({
          show: true,
          type: "error",
          message: errorMessage || "Failed to save template",
        });
      } finally {
        setLoading(false);
      }
    },
    [formData, effectiveId, router]
  );

  const dismissAlert = () => {
    setAlert({ show: false, type: "info", message: "" });
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
    setBranding({ brandName: "", tagline: "", logoPreview: "" });
    setTableColumns(DEFAULT_COLUMNS);
    setSelectedElement("");
  };

  return {
    formData,
    handleChange,
    handleLogoUpload,
    handleSubmit,
    loading,
    alert,
    dismissAlert,
    resetForm,
    branding,
    setBrandName,
    setTagline,
    tableColumns,
    handleColumnChange,
    toggleColumn,
    addColumn,
    removeColumn,
    selectedElement,
    handleSelectElement,
  };
};

export default useTemplateForm;
