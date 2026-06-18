// ============================================
// HOMEPAGE CITY CONTROLLER
// ============================================

const HomepageCity = require('../models/HomepageCity');
const { AppError } = require('../middleware/errorHandler');
const { DEFAULT_HOMEPAGE_CITIES } = require('../utils/homepageCityDefaults');

const slugify = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizePayload = (payload = {}, existingSlug = '') => {
  const cityName = String(payload.cityName || '').trim();
  const slugSource = String(payload.slug || cityName || existingSlug).trim();
  const slug = slugify(slugSource);
  const image = String(payload.image || '').trim();
  const isActive = typeof payload.isActive === 'boolean' ? payload.isActive : payload.isActive === 'true' ? true : payload.isActive === 'false' ? false : undefined;
  const order = payload.order === '' || payload.order === null || payload.order === undefined ? undefined : Number(payload.order);

  return {
    cityName,
    slug,
    image,
    ...(typeof isActive === 'boolean' ? { isActive } : {}),
    ...(Number.isFinite(order) ? { order } : {})
  };
};

const getNextOrder = async () => {
  const latest = await HomepageCity.findOne().sort({ order: -1 }).select('order').lean();
  return (latest?.order || 0) + 1;
};

const seedDefaultCitiesIfEmpty = async () => {
  const count = await HomepageCity.countDocuments();
  if (count > 0) {
    return;
  }

  const docs = DEFAULT_HOMEPAGE_CITIES.map((city, index) => ({
    cityName: city.cityName,
    slug: city.slug,
    image: city.image,
    isActive: city.isActive !== false,
    order: Number.isFinite(city.order) ? city.order : index + 1
  }));

  await HomepageCity.insertMany(docs, { ordered: true });
};

exports.getHomepageCities = async (req, res, next) => {
  try {
    await seedDefaultCitiesIfEmpty();

    const includeInactive = String(req.query.all || req.query.includeInactive || '').toLowerCase() === 'true';
    const filter = includeInactive ? {} : { isActive: true };

    const cities = await HomepageCity.find(filter).sort({ order: 1, createdAt: 1 }).lean();

    res.status(200).json({
      success: true,
      data: { cities }
    });
  } catch (error) {
    // Final safety net: if the collection cannot be read/seeded, fall back to defaults.
    const fallbackCities = DEFAULT_HOMEPAGE_CITIES.filter((city) => city.isActive !== false);
    res.status(200).json({
      success: true,
      data: { cities: fallbackCities }
    });
  }
};

exports.createHomepageCity = async (req, res, next) => {
  try {
    const { cityName, slug, image } = req.body;
    const normalized = normalizePayload(req.body);

    if (!req.user || req.user.role !== 'admin') {
      return next(new AppError('Only admins can manage homepage cities', 403));
    }

    if (!normalized.cityName) {
      return next(new AppError('City name is required', 400));
    }

    if (!normalized.slug) {
      return next(new AppError('Slug is required', 400));
    }

    if (!normalized.image) {
      return next(new AppError('Image URL is required', 400));
    }

    const existing = await HomepageCity.findOne({ slug: normalized.slug });
    if (existing) {
      return next(new AppError('A city with this slug already exists', 400));
    }

    const order = Number.isFinite(normalized.order) && normalized.order > 0 ? normalized.order : await getNextOrder();

    const city = await HomepageCity.create({
      cityName: normalized.cityName,
      slug: normalized.slug,
      image: normalized.image,
      isActive: typeof normalized.isActive === 'boolean' ? normalized.isActive : true,
      order
    });

    res.status(201).json({
      success: true,
      message: 'Homepage city created successfully',
      data: { city }
    });
  } catch (error) {
    if (error?.code === 11000) {
      return next(new AppError('Slug must be unique', 400));
    }
    next(error);
  }
};

exports.updateHomepageCity = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return next(new AppError('Only admins can manage homepage cities', 403));
    }

    const { id } = req.params;
    const city = await HomepageCity.findById(id);

    if (!city) {
      return next(new AppError('Homepage city not found', 404));
    }

    const normalized = normalizePayload(req.body, city.slug);

    if (normalized.cityName) {
      city.cityName = normalized.cityName;
    }

    if (normalized.image) {
      city.image = normalized.image;
    }

    if (normalized.slug) {
      const duplicate = await HomepageCity.findOne({ slug: normalized.slug, _id: { $ne: city._id } });
      if (duplicate) {
        return next(new AppError('A city with this slug already exists', 400));
      }
      city.slug = normalized.slug;
    }

    if (typeof normalized.isActive === 'boolean') {
      city.isActive = normalized.isActive;
    }

    if (Number.isFinite(normalized.order)) {
      city.order = normalized.order;
    }

    await city.save();

    res.status(200).json({
      success: true,
      message: 'Homepage city updated successfully',
      data: { city }
    });
  } catch (error) {
    if (error?.code === 11000) {
      return next(new AppError('Slug must be unique', 400));
    }
    next(error);
  }
};

exports.deleteHomepageCity = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return next(new AppError('Only admins can manage homepage cities', 403));
    }

    const { id } = req.params;
    const city = await HomepageCity.findById(id);

    if (!city) {
      return next(new AppError('Homepage city not found', 404));
    }

    await HomepageCity.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Homepage city deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
