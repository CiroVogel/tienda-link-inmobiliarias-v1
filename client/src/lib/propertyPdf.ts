import { loadHtml2Pdf } from "@/lib/html2pdf";
import {
  getOperationLabel,
  getStatusLabel,
  type PropertyOperation,
  type PropertyStatus,
} from "@/lib/realEstateDemo";

type PdfProperty = {
  id: string;
  title: string;
  operation: PropertyOperation;
  status: PropertyStatus;
  price: string;
  location: string;
  address: string;
  propertyType: string;
  rooms?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  garages?: number | null;
  ageYears?: number | null;
  expenses?: string | null;
  coveredAreaM2?: number | null;
  uncoveredAreaM2?: number | null;
  areaM2?: number | null;
  disposition?: string | null;
  orientation?: string | null;
  detailedFeatures?: string[];
  features: string[];
  description: string;
  images: string[];
};

type PdfBusinessProfile = {
  slug?: string | null;
  businessName?: string | null;
  logoUrl?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  primaryColor?: string | null;
};

const WRAP_TEXT_STYLES: Partial<CSSStyleDeclaration> = {
  whiteSpace: "normal",
  wordBreak: "break-word",
  overflowWrap: "anywhere",
};

const KEEP_TOGETHER_STYLES: Partial<CSSStyleDeclaration> = {
  breakInside: "avoid",
  pageBreakInside: "avoid",
};

const SECTION_TITLE_STYLES: Partial<CSSStyleDeclaration> = {
  breakAfter: "avoid",
  pageBreakAfter: "avoid",
};

const PDF_TEXT_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bmas\b/gi, "más"],
  [/\bimagenes\b/gi, "imágenes"],
  [/\bdescripcion\b/gi, "descripción"],
  [/\bcaracteristicas\b/gi, "características"],
  [/\bbanos\b/gi, "baños"],
  [/\bbano\b/gi, "baño"],
  [/\bjardin\b/gi, "jardín"],
  [/\bdeposito\b/gi, "depósito"],
  [/\bgalpon\b/gi, "galpón"],
  [/\bbalcon\b/gi, "balcón"],
  [/\bmetalica\b/gi, "metálica"],
  [/\bmatricula\b/gi, "matrícula"],
  [/\binformacion\b/gi, "información"],
  [/\bcredito\b/gi, "crédito"],
  [/\bpublica\b/gi, "pública"],
  [/\bexposicion\b/gi, "exposición"],
  [/\bcirculacion\b/gi, "circulación"],
  [/\bcercania\b/gi, "cercanía"],
  [/\btransito\b/gi, "tránsito"],
  [/\brecepcion\b/gi, "recepción"],
  [/\bubicacion\b/gi, "ubicación"],
  [/\bestrategica\b/gi, "estratégica"],
  [/\bpractica\b/gi, "práctica"],
  [/\binversion\b/gi, "inversión"],
  [/\brio\b/gi, "río"],
  [/\bopcion\b/gi, "opción"],
  [/\bcomoda\b/gi, "cómoda"],
  [/\bdistribucion\b/gi, "distribución"],
  [/\bcaracter\b/gi, "carácter"],
];

function normalizePdfText(value: string) {
  return PDF_TEXT_REPLACEMENTS.reduce(
    (currentValue, [pattern, replacement]) => currentValue.replace(pattern, replacement),
    value,
  );
}

function formatAreaM2(value?: number | null) {
  return value != null ? `${value} m²` : null;
}

function formatNumberDetail(value?: number | null) {
  return value != null ? String(value) : null;
}

function formatAgeDetail(value?: number | null) {
  if (value == null) return null;
  return value === 0 ? "A estrenar" : `${value} año${value === 1 ? "" : "s"}`;
}

function formatTextDetail(value?: string | null) {
  return value?.trim() || null;
}

function hasPdfDetailValue(item: { label: string; value: string | null }): item is {
  label: string;
  value: string;
} {
  return Boolean(item.value);
}

function buildPdfFilename(title: string) {
  const fileSlug =
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "propiedad";

  return `${fileSlug}.pdf`;
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  options?: {
    text?: string;
    styles?: Partial<CSSStyleDeclaration>;
    attrs?: Record<string, string>;
  },
) {
  const node = document.createElement(tagName);

  if (options?.text) {
    node.textContent = options.text;
  }

  if (options?.styles) {
    Object.assign(node.style, options.styles);
  }

  if (options?.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      node.setAttribute(key, value);
    });
  }

  return node;
}

async function waitForImages(container: HTMLElement) {
  const images = Array.from(container.querySelectorAll("img"));

  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  );
}

function cleanupHtml2PdfArtifacts() {
  document
    .querySelectorAll(".html2pdf__overlay, .html2pdf__container, iframe.html2canvas-container")
    .forEach((node) => node.remove());
}

function getObjectTag(value: unknown) {
  return Object.prototype.toString.call(value);
}

function isArrayBufferLike(value: unknown): value is ArrayBuffer {
  return getObjectTag(value) === "[object ArrayBuffer]";
}

function isBlobLike(value: unknown): value is Blob {
  return getObjectTag(value) === "[object Blob]";
}

function triggerDownload(blob: Blob, filename: string) {
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl);
  }, 1000);
}

function appendTextBlock(
  parent: HTMLElement,
  label: string,
  value: string,
  {
    labelColor = "#465153",
    valueColor = "#172124",
  }: { labelColor?: string; valueColor?: string } = {},
) {
  const wrapper = createElement("div", {
    attrs: {
      class: "pdf-avoid-break pdf-card",
    },
    styles: {
      border: "1px solid #ded8cc",
      borderRadius: "4px",
      padding: "12px",
      backgroundColor: "#f7f5ef",
      boxSizing: "border-box",
      ...KEEP_TOGETHER_STYLES,
    },
  });

  wrapper.appendChild(
    createElement("p", {
      text: label,
      styles: {
        margin: "0",
        fontSize: "10px",
        fontWeight: "600",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: labelColor,
      },
    }),
  );

  wrapper.appendChild(
    createElement("p", {
      text: value,
      styles: {
        margin: "5px 0 0",
        fontSize: "13px",
        lineHeight: "1.4",
        fontWeight: "500",
        color: valueColor,
        ...WRAP_TEXT_STYLES,
      },
    }),
  );

  parent.appendChild(wrapper);
}

function buildPropertyPdfElement({
  property,
  profile,
  publicPropertyUrl,
}: {
  property: PdfProperty;
  profile: PdfBusinessProfile;
  publicPropertyUrl: string;
}) {
  const businessName = profile.businessName?.trim() || "Inmobiliaria";
  const safePrimaryColor =
    profile.primaryColor && /^#(?:[0-9a-f]{3}){1,2}$/i.test(profile.primaryColor)
      ? profile.primaryColor
      : "#12383d";
  const logoUrl = profile.logoUrl?.trim() || "";
  const secondaryImages = property.images.slice(1, 4);
  const summaryFeatures = [...property.features, ...(property.detailedFeatures ?? [])];

  // Contact lines for header and stripe
  const headerContactLines: string[] = [];
  if (profile.whatsapp?.trim()) {
    headerContactLines.push(`WhatsApp: ${profile.whatsapp.trim()}`);
  } else if (profile.phone?.trim()) {
    headerContactLines.push(`Tel: ${profile.phone.trim()}`);
  }
  if (profile.email?.trim()) headerContactLines.push(profile.email.trim());

  // Description split: cut only at a natural sentence boundary for page 1.
  // Priority: first paragraph break → last sentence end (. ! ?) → no summary (full text on page 2).
  const fullDesc = property.description ? normalizePdfText(property.description) : "";
  let summaryText = "";
  let remainingText = "";
  if (fullDesc.trim()) {
    const trimmedDesc = fullDesc.trim();
    if (trimmedDesc.length <= 480) {
      // Short enough: show entirely on page 1
      summaryText = trimmedDesc;
    } else {
      // 1. First paragraph break within 80–500 chars
      const firstPara = trimmedDesc.indexOf("\n");
      if (firstPara !== -1 && firstPara >= 80 && firstPara <= 500) {
        summaryText = trimmedDesc.slice(0, firstPara).trimEnd();
        remainingText = trimmedDesc.slice(firstPara).trimStart();
      } else {
        // 2. Last sentence end (. ! ?) in range 120–460, followed by space or end
        let cutIdx = -1;
        const searchEnd = Math.min(460, trimmedDesc.length - 1);
        for (let i = searchEnd; i >= 120; i--) {
          const ch = trimmedDesc[i];
          if (ch === "." || ch === "!" || ch === "?") {
            const next = trimmedDesc[i + 1];
            if (next === undefined || next === " " || next === "\n") {
              cutIdx = i + 1;
              break;
            }
          }
        }
        if (cutIdx > 0) {
          summaryText = trimmedDesc.slice(0, cutIdx).trimEnd();
          remainingText = trimmedDesc.slice(cutIdx).trimStart();
        } else {
          // 3. No natural cut: no summary on page 1, full description on page 2
          remainingText = trimmedDesc;
        }
      }
    }
  }

  // Quick data: up to 4 real values
  const quickData: Array<{ label: string; value: string }> = [];
  const area = property.areaM2 ?? property.coveredAreaM2;
  if (area) quickData.push({ label: "Superficie", value: `${area} m²` });
  if (property.bedrooms && property.bedrooms > 0) {
    quickData.push({
      label: property.bedrooms === 1 ? "Dormitorio" : "Dormitorios",
      value: String(property.bedrooms),
    });
  } else if (property.rooms && property.rooms > 0) {
    quickData.push({
      label: property.rooms === 1 ? "Ambiente" : "Ambientes",
      value: String(property.rooms),
    });
  }
  if (property.bathrooms && property.bathrooms > 0) {
    quickData.push({
      label: property.bathrooms === 1 ? "Baño" : "Baños",
      value: String(property.bathrooms),
    });
  }
  if (quickData.length < 4 && property.garages && property.garages > 0) {
    quickData.push({
      label: property.garages === 1 ? "Cochera" : "Cocheras",
      value: String(property.garages),
    });
  }

  // Characteristics (page 2): skip zero counts and empty values
  const propertyDetails = [
    { label: "Tipo", value: normalizePdfText(property.propertyType) },
    {
      label: "Ambientes",
      value: property.rooms && property.rooms > 0 ? String(property.rooms) : null,
    },
    {
      label: "Dormitorios",
      value: property.bedrooms && property.bedrooms > 0 ? String(property.bedrooms) : null,
    },
    {
      label: "Baños",
      value: property.bathrooms && property.bathrooms > 0 ? String(property.bathrooms) : null,
    },
    {
      label: "Cocheras",
      value: property.garages && property.garages > 0 ? String(property.garages) : null,
    },
    { label: "Antigüedad", value: formatAgeDetail(property.ageYears) },
    { label: "Expensas", value: formatTextDetail(property.expenses) },
    { label: "Sup. cubierta", value: formatAreaM2(property.coveredAreaM2) },
    { label: "Sup. descubierta", value: formatAreaM2(property.uncoveredAreaM2) },
    { label: "Sup. total", value: formatAreaM2(property.areaM2) },
    { label: "Disposición", value: formatTextDetail(property.disposition) },
    { label: "Orientación", value: formatTextDetail(property.orientation) },
  ].filter(hasPdfDetailValue);

  // ── ROOT ────────────────────────────────────────────────────────────────

  const root = createElement("div", {
    styles: {
      position: "fixed",
      left: "-200vw",
      top: "0",
      zIndex: "-1",
      width: "794px",
      backgroundColor: "#fffdf8",
      color: "#172124",
      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      boxSizing: "border-box",
    },
  });

  // ── PAGE 1 ──────────────────────────────────────────────────────────────

  // Header
  const header = createElement("header", {
    attrs: { class: "pdf-avoid-break" },
    styles: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "20px",
      padding: "22px 32px",
      borderBottom: `2px solid ${safePrimaryColor}`,
      backgroundColor: "#fffdf8",
      boxSizing: "border-box",
      ...KEEP_TOGETHER_STYLES,
    },
  });

  const branding = createElement("div", {
    styles: { flex: "1 1 auto", minWidth: "0", maxWidth: "55%" },
  });

  if (logoUrl) {
    branding.appendChild(
      createElement("img", {
        attrs: { src: logoUrl, alt: businessName, crossorigin: "anonymous" },
        styles: { height: "48px", width: "auto", objectFit: "contain", display: "block" },
      }),
    );
  } else {
    branding.appendChild(
      createElement("p", {
        text: businessName,
        styles: {
          margin: "0",
          fontSize: "18px",
          fontWeight: "700",
          letterSpacing: "0.04em",
          color: "#172124",
          ...WRAP_TEXT_STYLES,
        },
      }),
    );
  }

  branding.appendChild(
    createElement("p", {
      text: "Ficha comercial de propiedad",
      styles: {
        margin: "9px 0 0",
        fontSize: "10px",
        fontWeight: "500",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#465153",
      },
    }),
  );

  header.appendChild(branding);

  if (headerContactLines.length > 0) {
    const contactBlock = createElement("div", {
      styles: { flex: "0 0 auto", maxWidth: "38%", textAlign: "right" },
    });
    headerContactLines.forEach((line) => {
      contactBlock.appendChild(
        createElement("p", {
          text: line,
          styles: {
            margin: "0",
            fontSize: "12px",
            lineHeight: "1.65",
            color: "#465153",
            ...WRAP_TEXT_STYLES,
          },
        }),
      );
    });
    header.appendChild(contactBlock);
  }

  root.appendChild(header);

  // Hero: contain (no crop), warm background fills the fixed-height block
  const heroWrapper = createElement("div", {
    attrs: { class: "pdf-avoid-break" },
    styles: {
      position: "relative",
      width: "100%",
      height: "380px",
      backgroundColor: "#f7f5ef",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      ...KEEP_TOGETHER_STYLES,
    },
  });

  if (property.images[0]) {
    heroWrapper.appendChild(
      createElement("img", {
        attrs: {
          src: property.images[0],
          alt: property.title,
          crossorigin: "anonymous",
        },
        styles: {
          display: "block",
          maxWidth: "100%",
          maxHeight: "380px",
          objectFit: "contain",
        },
      }),
    );

    const badgesRow = createElement("div", {
      styles: {
        position: "absolute",
        top: "12px",
        left: "12px",
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
      },
    });

    badgesRow.appendChild(
      createElement("span", {
        text: getOperationLabel(property.operation),
        styles: {
          padding: "6px 14px",
          fontSize: "10px",
          fontWeight: "700",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#ffffff",
          backgroundColor: "#12383d",
          borderRadius: "3px",
        },
      }),
    );

    badgesRow.appendChild(
      createElement("span", {
        text: getStatusLabel(property.status),
        styles: {
          padding: "6px 14px",
          fontSize: "10px",
          fontWeight: "600",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#172124",
          backgroundColor: "#f0ede6",
          borderRadius: "3px",
        },
      }),
    );

    heroWrapper.appendChild(badgesRow);
  } else {
    // No image fallback
    const fallback = createElement("div", {
      styles: {
        width: "100%",
        height: "100%",
        backgroundColor: "#f7f5ef",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        boxSizing: "border-box",
      },
    });
    fallback.appendChild(
      createElement("p", {
        text: property.title,
        styles: {
          margin: "0",
          fontSize: "22px",
          fontWeight: "700",
          color: "#465153",
          textAlign: "center",
          ...WRAP_TEXT_STYLES,
        },
      }),
    );
    heroWrapper.appendChild(fallback);
  }

  root.appendChild(heroWrapper);

  // Editorial block: eyebrow + title left / price right
  const editorial = createElement("div", {
    attrs: { class: "pdf-avoid-break" },
    styles: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: "20px",
      padding: "22px 32px 18px",
      backgroundColor: "#fffdf8",
      boxSizing: "border-box",
      ...KEEP_TOGETHER_STYLES,
    },
  });

  const editorialLeft = createElement("div", {
    styles: { flex: "1 1 auto", minWidth: "0" },
  });

  const eyebrowParts = [property.propertyType, property.location].filter(Boolean);
  if (eyebrowParts.length > 0) {
    editorialLeft.appendChild(
      createElement("p", {
        text: eyebrowParts.join(" · "),
        styles: {
          margin: "0",
          fontSize: "11px",
          fontWeight: "500",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#465153",
          ...WRAP_TEXT_STYLES,
        },
      }),
    );
  }

  editorialLeft.appendChild(
    createElement("h1", {
      text: property.title,
      styles: {
        margin: eyebrowParts.length > 0 ? "10px 0 0" : "0",
        fontSize: "30px",
        lineHeight: "1.1",
        fontWeight: "900",
        letterSpacing: "-0.02em",
        color: "#172124",
        ...WRAP_TEXT_STYLES,
      },
    }),
  );

  editorial.appendChild(editorialLeft);

  if (property.price) {
    const priceBlock = createElement("div", {
      styles: { flex: "0 0 auto", textAlign: "right", minWidth: "0" },
    });
    priceBlock.appendChild(
      createElement("p", {
        text: property.operation === "sale" ? "Precio de venta" : "Precio de alquiler",
        styles: {
          margin: "0",
          fontSize: "10px",
          fontWeight: "500",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#465153",
        },
      }),
    );
    priceBlock.appendChild(
      createElement("p", {
        text: property.price,
        styles: {
          margin: "6px 0 0",
          fontSize: "24px",
          fontWeight: "900",
          color: "#172124",
          ...WRAP_TEXT_STYLES,
        },
      }),
    );
    editorial.appendChild(priceBlock);
  }

  root.appendChild(editorial);

  // Quick data row
  if (quickData.length > 0) {
    const quickSection = createElement("div", {
      attrs: { class: "pdf-avoid-break" },
      styles: {
        padding: "0 32px 20px",
        boxSizing: "border-box",
        ...KEEP_TOGETHER_STYLES,
      },
    });

    const quickRow = createElement("div", {
      styles: {
        display: "flex",
        border: "1px solid #ded8cc",
        borderRadius: "6px",
        overflow: "hidden",
        backgroundColor: "#f7f5ef",
      },
    });

    quickData.slice(0, 4).forEach((datum, idx) => {
      const cell = createElement("div", {
        styles: {
          flex: "1",
          padding: "14px 10px",
          textAlign: "center",
          borderLeft: idx > 0 ? "1px solid #ded8cc" : "none",
          boxSizing: "border-box",
        },
      });
      cell.appendChild(
        createElement("p", {
          text: datum.value,
          styles: {
            margin: "0",
            fontSize: "20px",
            fontWeight: "700",
            color: "#172124",
          },
        }),
      );
      cell.appendChild(
        createElement("p", {
          text: datum.label,
          styles: {
            margin: "3px 0 0",
            fontSize: "10px",
            fontWeight: "500",
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: "#465153",
          },
        }),
      );
      quickRow.appendChild(cell);
    });

    quickSection.appendChild(quickRow);
    root.appendChild(quickSection);
  }

  // Summary (page 1 excerpt)
  if (summaryText) {
    const summarySection = createElement("div", {
      attrs: { class: "pdf-avoid-break" },
      styles: {
        padding: "0 32px 20px",
        boxSizing: "border-box",
        ...KEEP_TOGETHER_STYLES,
      },
    });
    summarySection.appendChild(
      createElement("p", {
        text: "Descripción",
        styles: {
          margin: "0 0 8px",
          fontSize: "10px",
          fontWeight: "600",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#465153",
        },
      }),
    );
    summarySection.appendChild(
      createElement("p", {
        text: summaryText,
        styles: {
          margin: "0",
          fontSize: "13px",
          lineHeight: "1.72",
          color: "#172124",
          whiteSpace: "pre-line",
          ...WRAP_TEXT_STYLES,
        },
      }),
    );
    root.appendChild(summarySection);
  }

  // Contact stripe (page 1)
  const contactStripe = createElement("section", {
    attrs: { class: "pdf-avoid-break pdf-card" },
    styles: {
      margin: "0 32px 32px",
      padding: "16px 20px",
      border: "1px solid #ded8cc",
      borderRadius: "6px",
      backgroundColor: "#f7f5ef",
      boxSizing: "border-box",
      ...KEEP_TOGETHER_STYLES,
    },
  });

  const stripeRow = createElement("div", {
    styles: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
    },
  });

  const stripeLeft = createElement("div", { styles: { flex: "1 1 auto" } });
  stripeLeft.appendChild(
    createElement("p", {
      text: "Contactar a la inmobiliaria",
      styles: {
        margin: "0 0 5px",
        fontSize: "10px",
        fontWeight: "600",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#465153",
      },
    }),
  );

  headerContactLines.forEach((line) => {
    stripeLeft.appendChild(
      createElement("p", {
        text: line,
        styles: {
          margin: "0",
          fontSize: "13px",
          lineHeight: "1.6",
          fontWeight: "400",
          color: "#172124",
          ...WRAP_TEXT_STYLES,
        },
      }),
    );
  });

  stripeRow.appendChild(stripeLeft);

  if (publicPropertyUrl) {
    const stripeRight = createElement("div", { styles: { flex: "0 0 auto" } });
    stripeRight.appendChild(
      createElement("a", {
        text: "Ver ficha online →",
        attrs: { href: publicPropertyUrl, target: "_blank", rel: "noopener noreferrer" },
        styles: {
          fontSize: "12px",
          fontWeight: "600",
          color: safePrimaryColor,
          textDecoration: "underline",
        },
      }),
    );
    stripeRow.appendChild(stripeRight);
  }

  contactStripe.appendChild(stripeRow);
  root.appendChild(contactStripe);

  // ── PAGE 2 ──────────────────────────────────────────────────────────────

  // Mini header with forced page break
  const miniHeader = createElement("header", {
    attrs: { class: "pdf-avoid-break" },
    styles: {
      pageBreakBefore: "always",
      breakBefore: "page",
      display: "flex",
      alignItems: "center",
      gap: "14px",
      padding: "18px 32px",
      borderBottom: "1px solid #ded8cc",
      backgroundColor: "#fffdf8",
      boxSizing: "border-box",
      ...KEEP_TOGETHER_STYLES,
    },
  });

  if (logoUrl) {
    miniHeader.appendChild(
      createElement("img", {
        attrs: { src: logoUrl, alt: businessName, crossorigin: "anonymous" },
        styles: { height: "30px", width: "auto", objectFit: "contain", display: "block" },
      }),
    );
  }
  miniHeader.appendChild(
    createElement("p", {
      text: businessName,
      styles: {
        margin: "0",
        fontSize: "13px",
        fontWeight: "500",
        color: "#465153",
        ...WRAP_TEXT_STYLES,
      },
    }),
  );

  root.appendChild(miniHeader);

  // Page 2 content
  const page2 = createElement("div", {
    styles: {
      padding: "24px 32px",
      display: "flex",
      flexDirection: "column",
      gap: "22px",
      backgroundColor: "#fffdf8",
      boxSizing: "border-box",
    },
  });

  // Remaining description
  if (remainingText) {
    const descBlock = createElement("div", {
      attrs: { class: "pdf-avoid-break" },
      styles: { ...KEEP_TOGETHER_STYLES },
    });
    descBlock.appendChild(
      createElement("h2", {
        text: "Descripción",
        styles: {
          margin: "0 0 10px",
          fontSize: "11px",
          fontWeight: "600",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#465153",
          ...SECTION_TITLE_STYLES,
        },
      }),
    );
    descBlock.appendChild(
      createElement("p", {
        text: remainingText,
        styles: {
          margin: "0",
          fontSize: "13px",
          lineHeight: "1.72",
          color: "#172124",
          whiteSpace: "pre-line",
          ...WRAP_TEXT_STYLES,
        },
      }),
    );
    page2.appendChild(descBlock);
  }

  // Characteristics grid
  if (propertyDetails.length > 0) {
    const caracteristicasBlock = createElement("div", {
      attrs: { class: "pdf-avoid-break" },
      styles: { ...KEEP_TOGETHER_STYLES },
    });
    caracteristicasBlock.appendChild(
      createElement("h2", {
        text: "Características",
        styles: {
          margin: "0 0 12px",
          fontSize: "11px",
          fontWeight: "600",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#465153",
          ...SECTION_TITLE_STYLES,
        },
      }),
    );

    const dataGrid = createElement("div", {
      attrs: { class: "pdf-avoid-break" },
      styles: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "8px",
        ...KEEP_TOGETHER_STYLES,
      },
    });

    propertyDetails.forEach((detail) => {
      appendTextBlock(dataGrid, detail.label, normalizePdfText(detail.value));
    });

    caracteristicasBlock.appendChild(dataGrid);
    page2.appendChild(caracteristicasBlock);
  }

  // Tags
  if (summaryFeatures.length > 0) {
    const tagsBlock = createElement("div", {
      attrs: { class: "pdf-avoid-break" },
      styles: { ...KEEP_TOGETHER_STYLES },
    });
    tagsBlock.appendChild(
      createElement("h2", {
        text: "Características adicionales",
        styles: {
          margin: "0 0 10px",
          fontSize: "11px",
          fontWeight: "600",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#465153",
          ...SECTION_TITLE_STYLES,
        },
      }),
    );
    const tagList = createElement("div", {
      styles: {
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
      },
    });
    summaryFeatures.forEach((feature) => {
      tagList.appendChild(
        createElement("span", {
          text: normalizePdfText(feature),
          styles: {
            border: "1px solid #ded8cc",
            borderRadius: "4px",
            padding: "5px 11px",
            fontSize: "11px",
            fontWeight: "500",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#465153",
            backgroundColor: "#f7f5ef",
            ...WRAP_TEXT_STYLES,
          },
        }),
      );
    });
    tagsBlock.appendChild(tagList);
    page2.appendChild(tagsBlock);
  }

  // Gallery
  if (secondaryImages.length > 0) {
    const galleryBlock = createElement("div", {
      attrs: { class: "pdf-avoid-break" },
      styles: { ...KEEP_TOGETHER_STYLES },
    });
    galleryBlock.appendChild(
      createElement("h2", {
        text: "Imágenes adicionales",
        styles: {
          margin: "0 0 10px",
          fontSize: "11px",
          fontWeight: "600",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#465153",
          ...SECTION_TITLE_STYLES,
        },
      }),
    );

    const imageGrid = createElement("div", {
      styles: {
        display: "grid",
        gap: "8px",
        gridTemplateColumns:
          secondaryImages.length === 1
            ? "1fr"
            : secondaryImages.length === 2
              ? "repeat(2, minmax(0, 1fr))"
              : "repeat(3, minmax(0, 1fr))",
      },
    });

    secondaryImages.forEach((image, index) => {
      imageGrid.appendChild(
        createElement("img", {
          attrs: {
            src: image,
            alt: `${property.title} foto ${index + 2}`,
            crossorigin: "anonymous",
          },
          styles: {
            width: "100%",
            height: secondaryImages.length === 1 ? "240px" : "180px",
            borderRadius: "4px",
            objectFit: "cover",
            display: "block",
          },
        }),
      );
    });

    galleryBlock.appendChild(imageGrid);
    page2.appendChild(galleryBlock);
  }

  // Footer
  const footer = createElement("footer", {
    attrs: { class: "pdf-avoid-break" },
    styles: {
      paddingTop: "14px",
      borderTop: "1px solid #ded8cc",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "16px",
      flexWrap: "wrap",
      ...KEEP_TOGETHER_STYLES,
    },
  });

  footer.appendChild(
    createElement("p", {
      text: businessName,
      styles: {
        margin: "0",
        fontSize: "12px",
        fontWeight: "600",
        color: "#172124",
        ...WRAP_TEXT_STYLES,
      },
    }),
  );

  footer.appendChild(
    createElement("p", {
      text: "Tienda Link Inmobiliarias",
      styles: {
        margin: "0",
        fontSize: "11px",
        color: "#465153",
        textAlign: "right",
        ...WRAP_TEXT_STYLES,
      },
    }),
  );

  page2.appendChild(footer);
  root.appendChild(page2);

  return root;
}

export async function generatePropertyPdf({
  property,
  profile,
}: {
  property: PdfProperty;
  profile: PdfBusinessProfile;
}) {
  const slug = profile.slug?.trim() || "";
  const publicPropertyUrl =
    typeof window !== "undefined" && slug
      ? `${window.location.origin}/${slug}/propiedades/${property.id}`
      : "";

  const pdfElement = buildPropertyPdfElement({
    property,
    profile,
    publicPropertyUrl,
  });
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.left = "-200vw";
  iframe.style.top = "0";
  iframe.style.width = "834px";
  iframe.style.height = "1200px";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.style.background = "#ffffff";
  document.body.appendChild(iframe);

  const iframeWindow = iframe.contentWindow;
  const iframeDocument = iframe.contentDocument;

  if (!iframeWindow || !iframeDocument) {
    iframe.remove();
    throw new Error("No pudimos preparar el contenedor del PDF.");
  }

  iframeDocument.open();
  iframeDocument.write("<!doctype html><html><head><meta charset=\"utf-8\"></head><body></body></html>");
  iframeDocument.close();
  iframeDocument.body.style.margin = "0";
  iframeDocument.body.style.backgroundColor = "#ffffff";

  const iframePdfElement = iframeDocument.importNode(pdfElement, true) as HTMLElement;
  iframePdfElement.style.position = "static";
  iframePdfElement.style.left = "0";
  iframePdfElement.style.top = "0";
  iframePdfElement.style.zIndex = "auto";
  iframeDocument.body.appendChild(iframePdfElement);

  try {
    const html2pdf = await loadHtml2Pdf(iframeWindow);
    await waitForImages(iframePdfElement);
    const filename = buildPdfFilename(property.title);

    const pdfBinary = (await html2pdf()
      .set({
        margin: 0,
        enableLinks: true,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["css", "legacy"],
          avoid: ["img", ".pdf-avoid-break", ".pdf-card"],
        },
      })
      .from(iframePdfElement)
      .outputPdf("arraybuffer")) as unknown;

    let blob: Blob;
    if (isArrayBufferLike(pdfBinary)) {
      blob = new Blob([pdfBinary], { type: "application/pdf" });
    } else if (ArrayBuffer.isView(pdfBinary)) {
      const bytes = pdfBinary as Uint8Array;
      const byteCopy = new Uint8Array(bytes.byteLength);
      byteCopy.set(new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength));
      blob = new Blob([byteCopy], { type: "application/pdf" });
    } else if (isBlobLike(pdfBinary)) {
      blob = pdfBinary;
    } else {
      throw new Error("No pudimos leer el contenido binario del PDF.");
    }

    if (blob.size === 0) {
      throw new Error("El PDF no se pudo serializar correctamente.");
    }

    triggerDownload(blob, filename);
  } finally {
    cleanupHtml2PdfArtifacts();
    iframe
      .contentDocument?.querySelectorAll(
        ".html2pdf__overlay, .html2pdf__container, iframe.html2canvas-container",
      )
      .forEach((node) => node.remove());
    iframe.remove();
  }
}
