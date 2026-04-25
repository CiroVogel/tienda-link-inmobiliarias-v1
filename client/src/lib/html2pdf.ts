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
