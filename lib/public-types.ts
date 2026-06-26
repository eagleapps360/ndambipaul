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

export type TributeImage = {
  id: string;
  url: string;
  altText: string;
  caption?: string | null;
  objectPosition: string;
  sortOrder: number;
};

export type TributeProfileImage = {
  url: string;
  objectPosition: string;
};

export type TributeSummary = {
  id: string;
  slug: string;
  category: string;
  relationship: string;
  name: string;
  location: string;
  message: string;
  createdAt?: string;
  profileImage?: TributeProfileImage | null;
  media?: TributeImage[];
  mediaCount?: number;
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
