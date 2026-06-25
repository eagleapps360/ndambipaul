export type TeamDefinition = {
  id: string;
  name: string;
  slug: string;
  description: string;
  coordinator: string;
  capacity: number | null;
  active: boolean;
  displayOrder: number;
};

export type TributeSummary = {
  slug: string;
  category: string;
  relationship: string;
  name: string;
  location: string;
  message: string;
};

export type GalleryItemPublic = {
  id: string;
  kind: string;
  title: string;
  caption: string;
  altText?: string;
  contributor: string;
  date: string;
  posterUrl: string;
  publicUrl: string;
  albumTitle: string;
};
