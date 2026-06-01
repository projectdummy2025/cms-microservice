export type LocaleJson = { en?: string; id?: string; [key: string]: string | undefined };

export type ImageRow = {
  id: number;
  articleId: number;
  path: string;
  description: LocaleJson | null;
  sort: number | null;
  createdAt: Date | null;
};

export type TagRow = {
  id: number;
  name: LocaleJson;
  isActive: boolean | null;
  createdAt: Date | null;
};

export function pickLocale(value: LocaleJson | null | undefined): string {
  if (!value) return '';
  return value.en || value.id || '';
}

export function extractIdFromSlug(slug: string): string | null {
  // Slug pattern: {slugified-title}-{id}
  const parts = slug.split('-');
  const last = parts[parts.length - 1];
  const numeric = /^\d+$/.test(last);
  return numeric ? last : null;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
