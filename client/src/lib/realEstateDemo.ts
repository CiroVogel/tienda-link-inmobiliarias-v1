export type PropertyOperation = "sale" | "rent";

export type PropertyStatus = "available" | "reserved" | "sold" | "rented" | "hidden";

export type DemoProperty = {
  id: string;
  title: string;
  operation: PropertyOperation;
  status: PropertyStatus;
  price: string;
  location: string;
  address: string;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  areaM2?: number;
  features: string[];
  description: string;
  images: string[];
  featured?: boolean;
};

export type DemoRealEstateProfile = {
  slug: string;
  name: string;
  city: string;
  tagline: string;
  description: string;
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  instagram: string;
};

export const realEstateProfile: DemoRealEstateProfile = {
  slug: "clave-urbana-propiedades",
  name: "Clave Urbana Propiedades",
  city: "Rosario",
  tagline: "Propiedades urbanas para comprar, alquilar y visitar con claridad.",
  description:
    "Una inmobiliaria cercana para encontrar departamentos, casas y espacios comerciales en Rosario y alrededores.",
  whatsapp: "5493415550184",
  phone: "+54 341 555 0184",
  email: "hola@claveurbana.com.ar",
  address: "Corrientes 842, Rosario",
  instagram: "https://instagram.com/claveurbanapropiedades",
};

export const demoProperties: DemoProperty[] = [
  {
    id: "departamento-2-dormitorios-centro",
    title: "Departamento 2 dormitorios en Centro",
    operation: "sale",
    status: "available",
    price: "USD 118.000",
    location: "Centro, Rosario",
    address: "Entre Rios al 900",
    propertyType: "Departamento",
    bedrooms: 2,
    bathrooms: 1,
    areaM2: 72,
    features: ["Balcon al frente", "Cocina separada", "Luminoso", "Apto credito"],
    description:
      "Departamento amplio y bien distribuido en una zona practica del Centro. Living comedor con salida al balcon, cocina separada y dos dormitorios con placares. Ideal para vivienda propia o inversion urbana.",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=82",
    ],
    featured: true,
  },
  {
    id: "monoambiente-pichincha",
    title: "Monoambiente en Pichincha",
    operation: "rent",
    status: "available",
    price: "$ 290.000 / mes",
    location: "Pichincha, Rosario",
    address: "Jujuy al 2400",
    propertyType: "Monoambiente",
    bathrooms: 1,
    areaM2: 34,
    features: ["Moderno", "Amenities", "Bajas expensas", "Cerca del rio"],
    description:
      "Unidad moderna en edificio joven, con ambiente unico bien aprovechado y excelente ingreso de luz. Una opcion comoda para vivir cerca de bares, facultades y espacios verdes.",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1400&q=82",
    ],
    featured: true,
  },
  {
    id: "casa-3-dormitorios-fisherton",
    title: "Casa 3 dormitorios en Fisherton",
    operation: "sale",
    status: "reserved",
    price: "USD 245.000",
    location: "Fisherton, Rosario",
    address: "Wilde al 700 bis",
    propertyType: "Casa",
    bedrooms: 3,
    bathrooms: 2,
    areaM2: 190,
    features: ["Jardin", "Pileta", "Cochera doble", "Parrillero"],
    description:
      "Casa familiar con ambientes generosos, verde propio y una distribucion pensada para la vida diaria. Actualmente se encuentra reservada, visible como referencia comercial.",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=82",
    ],
    featured: true,
  },
  {
    id: "ph-reciclado-echesortu",
    title: "PH reciclado en Echesortu",
    operation: "sale",
    status: "available",
    price: "USD 92.000",
    location: "Echesortu, Rosario",
    address: "San Luis al 3900",
    propertyType: "PH",
    bedrooms: 2,
    bathrooms: 1,
    areaM2: 68,
    features: ["Patio", "Reciclado", "Sin expensas", "Ingreso independiente"],
    description:
      "PH con caracter urbano, reciclado con buen gusto y patio propio. Una propiedad practica para quien busca independencia, escala barrial y buen acceso al transporte.",
    images: [
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=1400&q=82",
    ],
  },
  {
    id: "departamento-1-dormitorio-barrio-martin",
    title: "Departamento 1 dormitorio en Barrio Martin",
    operation: "rent",
    status: "rented",
    price: "$ 360.000 / mes",
    location: "Barrio Martin, Rosario",
    address: "Mendoza al 300",
    propertyType: "Departamento",
    bedrooms: 1,
    bathrooms: 1,
    areaM2: 45,
    features: ["Vista abierta", "Balcon", "Cocina integrada", "Excelente zona"],
    description:
      "Departamento con vista abierta y ubicacion privilegiada, a metros del Monumento y parques. Ya fue alquilado y queda publicado como referencia de operaciones recientes.",
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=82",
    ],
  },
  {
    id: "oficina-microcentro",
    title: "Oficina en Microcentro",
    operation: "rent",
    status: "available",
    price: "$ 420.000 / mes",
    location: "Microcentro, Rosario",
    address: "Santa Fe al 1100",
    propertyType: "Oficina",
    bathrooms: 1,
    areaM2: 62,
    features: ["Recepcion", "Privado", "Ascensor", "Zona bancaria"],
    description:
      "Oficina funcional para estudio profesional o equipo chico. Planta flexible, buena luz natural y ubicacion estrategica en el circuito comercial del Microcentro.",
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=82",
    ],
  },
  {
    id: "duplex-funes",
    title: "Duplex en Funes",
    operation: "sale",
    status: "available",
    price: "USD 168.000",
    location: "Funes, Santa Fe",
    address: "Garita 15",
    propertyType: "Duplex",
    bedrooms: 3,
    bathrooms: 2,
    areaM2: 128,
    features: ["Cochera", "Patio verde", "Parrillero", "A estrenar"],
    description:
      "Duplex a estrenar en sector residencial de Funes, con espacios integrados y patio privado. Una alternativa equilibrada para vivir cerca de Rosario con mas aire.",
    images: [
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=82",
    ],
  },
  {
    id: "local-comercial-abasto",
    title: "Local comercial en Abasto",
    operation: "rent",
    status: "available",
    price: "$ 510.000 / mes",
    location: "Abasto, Rosario",
    address: "Italia al 2100",
    propertyType: "Local",
    bathrooms: 1,
    areaM2: 58,
    features: ["Vidriera", "Persiana metalica", "Deposito", "Alto transito"],
    description:
      "Local con buena exposicion a la calle y circulacion constante. Planta libre, vidriera ancha y deposito posterior para marcas de cercania o servicios profesionales.",
    images: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=1400&q=82",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=82",
    ],
  },
];

export const propertyImageFallback =
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=82";

export function getVisibleProperties() {
  return demoProperties.filter((property) => property.status !== "hidden");
}

export function getFeaturedProperties() {
  return getVisibleProperties().filter((property) => property.featured).slice(0, 3);
}

export function getPropertyById(id?: string) {
  if (!id) return null;
  return getVisibleProperties().find((property) => property.id === id) ?? null;
}

export function getPropertyGalleryImages(property?: Pick<DemoProperty, "images"> | null) {
  return property?.images?.length ? property.images : [propertyImageFallback];
}

export function getPropertyCoverImage(property?: Pick<DemoProperty, "images"> | null) {
  return getPropertyGalleryImages(property)[0];
}

export function isPropertyRequestable(property: DemoProperty) {
  return property.status === "available";
}

export function getOperationLabel(operation: PropertyOperation) {
  return operation === "sale" ? "Venta" : "Alquiler";
}

export function getStatusLabel(status: PropertyStatus) {
  const labels: Record<PropertyStatus, string> = {
    available: "Disponible",
    reserved: "Reservada",
    sold: "Vendida",
    rented: "Alquilada",
    hidden: "Oculta",
  };

  return labels[status];
}
