export const sanitizeTemplateFields = (
  rawFields: Record<string, unknown>
): Record<string, unknown> => {
  const fields = { ...rawFields };

  // Remove disallowed or metadata fields
  delete fields.id;
  delete fields.userId;
  delete fields.createdAt;
  delete fields.updatedAt;
  delete fields.marginTop;
  delete fields.marginBottom;
  delete fields.marginLeft;
  delete fields.marginRight;
  delete fields.logoFile;
  delete fields.logo;
  delete fields.logoPreview;

  // Handle margins
  if (typeof fields.margins === "string") {
    try {
      fields.margins = JSON.parse(fields.margins);
    } catch {
      delete fields.margins;
    }
  }

  // Handle tableColumnSettings
  if (typeof fields.tableColumnSettings === "string") {
    try {
      fields.tableColumnSettings = JSON.parse(fields.tableColumnSettings);
    } catch {
      delete fields.tableColumnSettings;
    }
  }

  // Nullable numbers
  const nullableIntFields = ["headerHeight", "footerHeight"];
  for (const k of nullableIntFields) {
    if (k in fields) {
      const val = fields[k];
      if (val === "" || val === null || val === undefined) {
        fields[k] = null;
      } else {
        const parsed = parseInt(String(val), 10);
        fields[k] = isNaN(parsed) ? null : parsed;
      }
    }
  }

  // Non-nullable integers
  const intFields = [
    "padding",
    "fontSize",
    "headingFontSize",
    "subheadingFontSize",
    "labelFontSize",
    "tableFontSize",
    "logoWidth",
    "logoHeight",
    "logoMarginTop",
    "logoMarginBottom",
    "borderWidth",
    "sectionSpacing",
    "fieldSpacing",
    "headerFontSize",
    "footerFontSize",
    "billToNameFontSize",
    "billToAddressFontSize",
    "invoiceDetailLabelFontSize",
    "invoiceDetailValueFontSize",
  ];
  for (const k of intFields) {
    if (k in fields) {
      const val = fields[k];
      if (val === "" || val === null || val === undefined) {
        delete fields[k];
      } else {
        const parsed = parseInt(String(val), 10);
        if (isNaN(parsed)) {
          delete fields[k];
        } else {
          fields[k] = parsed;
        }
      }
    }
  }

  // Float numbers
  const floatFields = ["lineHeight", "letterSpacing"];
  for (const k of floatFields) {
    if (k in fields) {
      const val = fields[k];
      if (val === "" || val === null || val === undefined) {
        delete fields[k];
      } else {
        const parsed = parseFloat(String(val));
        if (isNaN(parsed)) {
          delete fields[k];
        } else {
          fields[k] = parsed;
        }
      }
    }
  }

  // Nullable strings
  const nullableStringFields = [
    "headerText",
    "headerBackgroundColor",
    "footerText",
    "footerBackgroundColor",
    "logoUrl",
  ];
  for (const k of nullableStringFields) {
    if (k in fields) {
      const val = fields[k];
      if (val === "" || val === undefined) {
        fields[k] = null;
      }
    }
  }

  // Booleans
  const boolFields = [
    "isDefault",
    "showLogo",
    "showTableBorders",
    "showTableHeader",
    "alternateRowColors",
    "showInvoiceNumber",
    "showInvoiceDate",
    "showDueDate",
    "showCustomerEmail",
    "showCustomerPhone",
    "showCustomerAddress",
    "showItemDescription",
    "showItemUnit",
    "showSubtotal",
    "showTax",
    "showDiscount",
    "showShipping",
    "showNotes",
    "showPreviousDue",
    "showHeader",
    "showFooter",
    "showPageNumbers",
    "includePaymentStub",
  ];
  for (const k of boolFields) {
    if (k in fields) {
      const val = fields[k];
      fields[k] = val === true || val === "true" || val === 1 || val === "1";
    }
  }

  return fields;
};
