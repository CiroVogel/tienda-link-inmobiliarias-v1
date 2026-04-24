import { trpc } from "@/lib/trpc";
import {
  getPropertyById,
  getVisibleProperties,
  realEstateProfile,
  type DemoProperty,
} from "@/lib/realEstateDemo";

function canUseFallback(slug: string) {
  return slug === realEstateProfile.slug;
}

export function usePublicProperties(slug: string) {
  const query = trpc.properties.listPublic.useQuery({ slug });
  const properties =
    query.data ??
    (canUseFallback(slug) && (!query.isFetched || query.isError) ? getVisibleProperties() : []);

  return {
    ...query,
    properties,
  };
}

export function usePublicProperty(slug: string, propertyId?: string) {
  const query = trpc.properties.getPublic.useQuery(
    { slug, id: propertyId ?? "" },
    { enabled: Boolean(propertyId) },
  );

  const property: DemoProperty | null =
    query.data ??
    (canUseFallback(slug) && propertyId && (!query.isFetched || query.isError)
      ? getPropertyById(propertyId)
      : null);

  return {
    ...query,
    property,
  };
}
