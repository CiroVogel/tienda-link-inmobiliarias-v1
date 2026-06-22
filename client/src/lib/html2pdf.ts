type Html2PdfOptions = {
  margin?: number | number[];
  enableLinks?: boolean;
  filename?: string;
  image?: {
    type?: string;
    quality?: number;
  };
  html2canvas?: {
    scale?: number;
    useCORS?: boolean;
    backgroundColor?: string;
    onclone?: (clonedDocument: Document) => void;
  };
  jsPDF?: {
    unit?: string;
    format?: string;
    orientation?: string;
  };
  pagebreak?: {
    mode?: string[];
    before?: string[];
    avoid?: string[];
  };
};

export type Html2PdfFactory = () => {
  set(options: Html2PdfOptions): {
    from(element: HTMLElement): {
      outputPdf(type?: string): Promise<Blob | string>;
      save(): Promise<void>;
    };
  };
};

declare global {
  interface Window {
    html2pdf?: Html2PdfFactory;
  }
}

const HTML2PDF_SCRIPT_ID = "html2pdf-bundle-script";
const HTML2PDF_SCRIPT_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";

// ── jsPDF UMD loader ───────────────────────────────────────────────────────────
// html2pdf.bundle.min.js only exposes window.html2pdf, NOT window.jspdf.
// jsPDF must be loaded from its own UMD bundle which exposes window.jspdf.jsPDF.

const JSPDF_SCRIPT_ID = "jspdf-umd-script";
const JSPDF_SCRIPT_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type JsPDFConstructor = new (opts: Record<string, unknown>) => any;

let jsPDFLoader: Promise<JsPDFConstructor> | null = null;

function resolveJsPDFConstructor(): JsPDFConstructor | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  const ctor: unknown = w.jspdf?.jsPDF ?? w.jsPDF;
  return typeof ctor === "function" ? (ctor as JsPDFConstructor) : null;
}

export function loadJsPDF(): Promise<JsPDFConstructor> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("jsPDF solo se puede cargar en el navegador"));
  }

  const cached = resolveJsPDFConstructor();
  if (cached) return Promise.resolve(cached);

  if (jsPDFLoader) return jsPDFLoader;

  jsPDFLoader = new Promise<JsPDFConstructor>((resolve, reject) => {
    const existing = document.getElementById(JSPDF_SCRIPT_ID) as HTMLScriptElement | null;

    const onLoad = () => {
      const ctor = resolveJsPDFConstructor();
      if (ctor) {
        resolve(ctor);
      } else {
        jsPDFLoader = null;
        reject(new Error("jsPDF no quedó disponible después de cargar el script"));
      }
    };

    if (existing) {
      existing.addEventListener("load", onLoad, { once: true });
      existing.addEventListener("error", () => {
        jsPDFLoader = null;
        reject(new Error("No se pudo cargar jsPDF"));
      }, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = JSPDF_SCRIPT_ID;
    script.src = JSPDF_SCRIPT_URL;
    script.async = true;

    const timeout = window.setTimeout(() => {
      jsPDFLoader = null;
      reject(new Error("La carga de jsPDF excedió el tiempo esperado"));
    }, 15000);

    script.onload = () => {
      window.clearTimeout(timeout);
      onLoad();
    };

    script.onerror = () => {
      window.clearTimeout(timeout);
      jsPDFLoader = null;
      reject(new Error("No se pudo cargar jsPDF desde CDN"));
    };

    document.head.appendChild(script);
  });

  return jsPDFLoader;
}

const loaderPromises = new WeakMap<Window, Promise<Html2PdfFactory>>();

export function loadHtml2Pdf(targetWindow: Window = window): Promise<Html2PdfFactory> {
  if (typeof window === "undefined" || !targetWindow.document) {
    return Promise.reject(new Error("html2pdf solo se puede cargar en el navegador"));
  }

  if (targetWindow.html2pdf) {
    return Promise.resolve(targetWindow.html2pdf);
  }

  const existingPromise = loaderPromises.get(targetWindow);
  if (existingPromise) {
    return existingPromise;
  }

  const loaderPromise = new Promise<Html2PdfFactory>((resolve, reject) => {
    const targetDocument = targetWindow.document;
    const existingScript = targetDocument.getElementById(
      HTML2PDF_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (targetWindow.html2pdf) {
          resolve(targetWindow.html2pdf);
          return;
        }

        reject(new Error("html2pdf no quedo disponible despues de cargar el script"));
      });

      existingScript.addEventListener("error", () => {
        reject(new Error("No se pudo cargar html2pdf"));
      });

      return;
    }

    const script = targetDocument.createElement("script");
    script.id = HTML2PDF_SCRIPT_ID;
    script.src = HTML2PDF_SCRIPT_URL;
    script.async = true;

    const timeout = targetWindow.setTimeout(() => {
      loaderPromises.delete(targetWindow);
      reject(new Error("La carga de html2pdf excedio el tiempo esperado"));
    }, 15000);

    script.onload = () => {
      targetWindow.clearTimeout(timeout);

      if (!targetWindow.html2pdf) {
        loaderPromises.delete(targetWindow);
        reject(new Error("html2pdf no quedo disponible despues de cargar el script"));
        return;
      }

      resolve(targetWindow.html2pdf);
    };

    script.onerror = () => {
      targetWindow.clearTimeout(timeout);
      loaderPromises.delete(targetWindow);
      reject(new Error("No se pudo cargar html2pdf"));
    };

    targetDocument.head.appendChild(script);
  });

  loaderPromises.set(targetWindow, loaderPromise);
  return loaderPromise;
}
