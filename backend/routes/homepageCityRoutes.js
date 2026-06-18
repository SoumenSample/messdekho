// ============================================
// HOMEPAGE CITY ROUTES
// ============================================

const express = require('express');
const router = express.Router();

const homepageCityController = require('../controllers/homepageCityController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

router.get('/', homepageCityController.getHomepageCities);
router.post('/', protect, authorize('admin'), homepageCityController.createHomepageCity);
router.put('/:id', protect, authorize('admin'), homepageCityController.updateHomepageCity);
router.delete('/:id', protect, authorize('admin'), homepageCityController.deleteHomepageCity);

module.exports = router;
