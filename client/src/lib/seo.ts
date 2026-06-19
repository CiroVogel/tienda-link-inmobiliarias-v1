import { useEffect } from "react";

function getDescriptionMeta() {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');

  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "description";
    document.head.appendChild(meta);
  }

  return meta;
}

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (cleanTitle) {
      document.title = cleanTitle;
    }

    if (cleanDescription) {
      getDescriptionMeta().content = cleanDescription;
    }
  }, [description, title]);
}
