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
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaM2?: number | null;
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

function buildPdfFilename(title: string) {
  const fileSlug =
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
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
    labelColor = "#6b7280",
    valueColor = "#111827",
  }: { labelColor?: string; valueColor?: string } = {},
) {
  const wrapper = createElement("div", {
    attrs: {
      class: "pdf-avoid-break pdf-card",
    },
    styles: {
      border: "1px solid #e5e7eb",
      padding: "14px",
      boxSizing: "border-box",
      ...KEEP_TOGETHER_STYLES,
    },
  });

  wrapper.appendChild(
    createElement("p", {
      text: label,
      styles: {
        margin: "0",
        fontSize: "11px",
        fontWeight: "800",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: labelColor,
      },
    }),
  );

  wrapper.appendChild(
    createElement("p", {
      text: value,
      styles: {
        margin: "8px 0 0",
        fontSize: "15px",
        lineHeight: "1.45",
        fontWeight: "800",
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
      : "#111827";
  const logoUrl = profile.logoUrl?.trim() || "";
  const secondaryImages = property.images.slice(1, 4);
  const summaryFeatures = property.features.slice(0, 2);
  const city = profile.address?.split(",").pop()?.trim() || property.location;
  const contactLine = [
    profile.phone || profile.whatsapp ? `WhatsApp ${profile.phone || profile.whatsapp}` : "",
    profile.email ? `Email ${profile.email}` : "",
    city,
  ].filter(Boolean);

  const root = createElement("div", {
    styles: {
      position: "fixed",
      left: "-200vw",
      top: "0",
      zIndex: "-1",
      width: "794px",
      backgroundColor: "#ffffff",
      padding: "32px",
      color: "#111827",
      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      boxSizing: "border-box",
    },
  });

  const page = createElement("div", {
    styles: {
      minHeight: "1080px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      backgroundColor: "#ffffff",
    },
  });

  root.appendChild(page);

  const header = createElement("header", {
    attrs: {
      class: "pdf-avoid-break",
    },
    styles: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "20px",
      borderBottom: `1px solid ${safePrimaryColor}22`,
      paddingBottom: "20px",
      ...KEEP_TOGETHER_STYLES,
    },
  });

  const branding = createElement("div", {
    styles: {
      flex: "1 1 auto",
      minWidth: "0",
      maxWidth: "58%",
    },
  });

  if (logoUrl) {
    const logo = createElement("img", {
      attrs: {
        src: logoUrl,
        alt: businessName,
        crossorigin: "anonymous",
      },
      styles: {
        height: "56px",
        width: "auto",
        objectFit: "contain",
        display: "block",
      },
    });
    header.appendChild(branding);
    branding.appendChild(logo);
  } else {
    branding.appendChild(
      createElement("p", {
        text: businessName,
        styles: {
          margin: "0",
          fontSize: "22px",
          fontWeight: "900",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#111827",
          ...WRAP_TEXT_STYLES,
        },
      }),
    );
    header.appendChild(branding);
  }

  branding.appendChild(
    createElement("p", {
      text: "Ficha comercial de propiedad",
      styles: {
        margin: "16px 0 0",
        fontSize: "12px",
        fontWeight: "800",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#6b7280",
        ...WRAP_TEXT_STYLES,
      },
    }),
  );

  const contactBlock = createElement("div", {
    styles: {
      flex: "0 0 34%",
      maxWidth: "34%",
      minWidth: "0",
      textAlign: "right",
    },
  });

  contactLine.forEach((item) => {
    contactBlock.appendChild(
      createElement("p", {
        text: item,
        styles: {
          margin: "0",
          fontSize: "13px",
          lineHeight: "1.6",
          color: "#4b5563",
          ...WRAP_TEXT_STYLES,
        },
      }),
    );
  });

  header.appendChild(contactBlock);
  page.appendChild(header);

  const hero = createElement("img", {
    attrs: {
      src: property.images[0],
      alt: property.title,
      crossorigin: "anonymous",
      class: "pdf-avoid-break",
    },
    styles: {
      width: "100%",
      height: "328px",
      borderRadius: "4px",
      objectFit: "cover",
      display: "block",
    },
  });
  page.appendChild(hero);

  const introGrid = createElement("section", {
    attrs: {
      class: "pdf-avoid-break",
    },
    styles: {
      display: "flex",
      flexDirection: "column",
      gap: "18px",
      ...KEEP_TOGETHER_STYLES,
    },
  });
  const introMain = createElement("div");
  introMain.appendChild(
    createElement("p", {
      text: `${property.address}, ${property.location}`,
      styles: {
        margin: "0",
        fontSize: "12px",
        fontWeight: "800",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#6b7280",
        ...WRAP_TEXT_STYLES,
      },
    }),
  );
  introMain.appendChild(
    createElement("h1", {
      text: property.title,
      styles: {
        margin: "12px 0 0",
        fontSize: "40px",
        lineHeight: "1.02",
        fontWeight: "900",
        letterSpacing: "-0.025em",
        color: "#111827",
        ...WRAP_TEXT_STYLES,
      },
    }),
  );
  introMain.appendChild(
    createElement("p", {
      text: property.price,
      styles: {
        margin: "14px 0 0",
        fontSize: "30px",
        fontWeight: "900",
        color: "#111827",
        ...WRAP_TEXT_STYLES,
      },
    }),
  );
  introGrid.appendChild(introMain);

  const introSide = createElement("div", {
    attrs: {
      class: "pdf-avoid-break pdf-card",
    },
    styles: {
      borderRadius: "4px",
      border: "1px solid #e5e7eb",
      padding: "18px",
      boxSizing: "border-box",
      ...KEEP_TOGETHER_STYLES,
    },
  });

  const badgeRow = createElement("div", {
    styles: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
    },
  });
  badgeRow.appendChild(
    createElement("span", {
      text: getOperationLabel(property.operation),
      styles: {
        padding: "7px 10px",
        fontSize: "11px",
        fontWeight: "900",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#ffffff",
        backgroundColor: safePrimaryColor,
      },
    }),
  );
  badgeRow.appendChild(
    createElement("span", {
      text: getStatusLabel(property.status),
      styles: {
        padding: "7px 10px",
        fontSize: "11px",
        fontWeight: "900",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#374151",
        backgroundColor: "#f3f4f6",
      },
    }),
  );
  introSide.appendChild(badgeRow);
  introSide.appendChild(
    createElement("p", {
      text: "Propiedad presentada para compartir por WhatsApp o email con informacion clave, imagenes y contacto directo de la inmobiliaria.",
      styles: {
        margin: "14px 0 0",
        fontSize: "13px",
        lineHeight: "1.65",
        color: "#4b5563",
        ...WRAP_TEXT_STYLES,
      },
    }),
  );
  introGrid.appendChild(introSide);
  page.appendChild(introGrid);

  const contentGrid = createElement("section", {
    styles: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
  });

  const descriptionBlock = createElement("div", {
    styles: {
      ...KEEP_TOGETHER_STYLES,
    },
    attrs: {
      class: "pdf-avoid-break",
    },
  });
  descriptionBlock.appendChild(
    createElement("h2", {
      text: "Descripcion",
      styles: {
        margin: "0",
        fontSize: "14px",
        fontWeight: "900",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#111827",
        ...SECTION_TITLE_STYLES,
      },
    }),
  );
  descriptionBlock.appendChild(
    createElement("p", {
      text: property.description,
      styles: {
        margin: "14px 0 0",
        fontSize: "13px",
        lineHeight: "1.72",
        color: "#374151",
        ...WRAP_TEXT_STYLES,
      },
    }),
  );
  contentGrid.appendChild(descriptionBlock);

  const featuresBlock = createElement("div", {
    styles: {
      ...KEEP_TOGETHER_STYLES,
    },
    attrs: {
      class: "pdf-avoid-break",
    },
  });
  featuresBlock.appendChild(
    createElement("h2", {
      text: "Caracteristicas principales",
      styles: {
        margin: "0",
        fontSize: "14px",
        fontWeight: "900",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#111827",
        ...SECTION_TITLE_STYLES,
      },
    }),
  );

  const dataGrid = createElement("div", {
    styles: {
      marginTop: "14px",
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "12px",
    },
  });

  appendTextBlock(dataGrid, "Tipo", property.propertyType);
  appendTextBlock(dataGrid, "Superficie", property.areaM2 ? `${property.areaM2} m2` : "A consultar");
  appendTextBlock(
    dataGrid,
    "Dormitorios",
    property.bedrooms != null ? String(property.bedrooms) : "No aplica",
  );
  appendTextBlock(
    dataGrid,
    "Banos",
    property.bathrooms != null ? String(property.bathrooms) : "A consultar",
  );
  featuresBlock.appendChild(dataGrid);

  if (summaryFeatures.length > 0) {
    const tagList = createElement("div", {
      styles: {
        marginTop: "14px",
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
      },
    });

    summaryFeatures.forEach((feature) => {
      tagList.appendChild(
        createElement("span", {
          text: feature,
          styles: {
            border: "1px solid #e5e7eb",
            padding: "8px 12px",
            fontSize: "12px",
            fontWeight: "600",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#4b5563",
            ...WRAP_TEXT_STYLES,
          },
        }),
      );
    });

    featuresBlock.appendChild(tagList);
  }

  contentGrid.appendChild(featuresBlock);
  page.appendChild(contentGrid);

  if (secondaryImages.length > 0) {
    const imagesSection = createElement("section", {
      styles: {
        ...KEEP_TOGETHER_STYLES,
      },
      attrs: {
        class: "pdf-avoid-break",
      },
    });
    imagesSection.appendChild(
      createElement("h2", {
        text: "Mas imagenes",
        styles: {
          margin: "0",
          fontSize: "14px",
          fontWeight: "900",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#111827",
          ...SECTION_TITLE_STYLES,
        },
      }),
    );

    const imageGrid = createElement("div", {
      styles: {
        marginTop: "14px",
        display: "grid",
        gap: "12px",
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
            height: secondaryImages.length === 1 ? "220px" : "160px",
            borderRadius: "4px",
            objectFit: "cover",
            display: "block",
          },
        }),
      );
    });

    imagesSection.appendChild(imageGrid);
    page.appendChild(imagesSection);
  }

  const contactSection = createElement("section", {
    attrs: {
      class: "pdf-avoid-break pdf-card",
    },
    styles: {
      borderRadius: "4px",
      border: `1px solid ${safePrimaryColor}22`,
      padding: "20px",
      backgroundColor: `${safePrimaryColor}08`,
      boxSizing: "border-box",
      ...KEEP_TOGETHER_STYLES,
    },
  });
  contactSection.appendChild(
    createElement("h2", {
      text: "Contacto y ficha publica",
      styles: {
        margin: "0",
        fontSize: "14px",
        fontWeight: "900",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#111827",
        ...SECTION_TITLE_STYLES,
      },
    }),
  );
  const contactItems = createElement("div", {
    styles: {
      marginTop: "14px",
      display: "grid",
      gap: "12px",
    },
  });
  contactLine.forEach((item) => {
    contactItems.appendChild(
      createElement("p", {
        text: item,
        styles: {
          margin: "0",
          fontSize: "12px",
          lineHeight: "1.65",
          color: "#374151",
          wordBreak: "break-all",
          overflowWrap: "break-word",
        },
      }),
    );
  });
  if (publicPropertyUrl) {
    contactItems.appendChild(
      createElement("p", {
        text: publicPropertyUrl,
        styles: {
          margin: "0",
          fontSize: "13px",
          lineHeight: "1.65",
          color: "#374151",
          ...WRAP_TEXT_STYLES,
        },
      }),
    );
  }
  contactSection.appendChild(contactItems);
  page.appendChild(contactSection);

  const footer = createElement("footer", {
    attrs: {
      class: "pdf-avoid-break",
    },
    styles: {
      marginTop: "auto",
      borderTop: "1px solid #e5e7eb",
      paddingTop: "20px",
      ...KEEP_TOGETHER_STYLES,
    },
  });
  const footerRow = createElement("div", {
    styles: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "16px",
      flexWrap: "wrap",
    },
  });
  const footerLeft = createElement("div", {
    styles: {
      flex: "1 1 220px",
      minWidth: "0",
    },
  });
  footerLeft.appendChild(
    createElement("p", {
      text: businessName,
      styles: {
        margin: "0",
        fontSize: "14px",
        fontWeight: "700",
        color: "#111827",
        ...WRAP_TEXT_STYLES,
      },
    }),
  );
  footerLeft.appendChild(
    createElement("p", {
      text: "Matricula: a informar",
      styles: {
        margin: "4px 0 0",
        fontSize: "12px",
        color: "#6b7280",
        ...WRAP_TEXT_STYLES,
      },
    }),
  );
  footerRow.appendChild(footerLeft);
  footerRow.appendChild(
    createElement("p", {
      text: "Ficha generada desde Tienda Link Inmobiliarias",
      styles: {
        margin: "0",
        flex: "1 1 240px",
        minWidth: "0",
        maxWidth: "260px",
        textAlign: "right",
        fontSize: "12px",
        lineHeight: "1.5",
        color: "#6b7280",
        ...WRAP_TEXT_STYLES,
      },
    }),
  );
  footer.appendChild(footerRow);
  page.appendChild(footer);

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
