const DEFAULT_PG_IMAGE =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80";

export const getPGImageUrl = (pg, fallback = DEFAULT_PG_IMAGE) => {
  const images = Array.isArray(pg?.images) ? pg.images : [];
  return images[0] || pg?.image || fallback;
};

export const getPGImages = (pg, fallback = DEFAULT_PG_IMAGE) => {
  const images = Array.isArray(pg?.images) ? pg.images.filter(Boolean) : [];
  if (images.length > 0) return images;
  if (pg?.image) return [pg.image];
  return [fallback];
};

export default DEFAULT_PG_IMAGE;