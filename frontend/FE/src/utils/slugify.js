// slugify.js - Vietnamese URL Slug Helper

export const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
};

export const getSlugWithId = (title, id) => {
  const cleanSlug = slugify(title);
  if (!cleanSlug) return String(id);
  return `${cleanSlug}-${id}`;
};

export const extractIdFromSlug = (slug) => {
  if (!slug) return null;
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  if (!isNaN(lastPart)) {
    return Number(lastPart);
  }
  return slug;
};
