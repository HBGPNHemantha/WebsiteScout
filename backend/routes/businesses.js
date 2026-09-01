const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const { generateBusinessesCsv } = require('../services/exportService');
const { optionalAuth } = require('../middleware/auth');

/**
 * @route   GET /api/businesses
 * @desc    Fetch stored businesses with flexible query filtering
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      area,
      category,
      status,
      hasWebsite,
      minRating,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 100,
    } = req.query;

    const query = {};

    if (area && area.trim() !== '') {
      query.searchArea = { $regex: new RegExp(area.trim(), 'i') };
    }

    if (category && category.trim() !== '') {
      query.category = { $regex: new RegExp(category.trim(), 'i') };
    }

    if (status && status.trim() !== '' && status !== 'all') {
      query.status = status;
    }

    if (hasWebsite !== undefined && hasWebsite !== '') {
      if (hasWebsite === 'false' || hasWebsite === false) {
        query.hasWebsite = false;
      } else if (hasWebsite === 'true' || hasWebsite === true) {
        query.hasWebsite = true;
      }
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    if (search && search.trim() !== '') {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { address: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } },
        { notes: { $regex: s, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [businesses, total] = await Promise.all([
      Business.find(query).sort(sortOptions).skip(skip).limit(parseInt(limit)),
      Business.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: businesses,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)) || 1,
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error('Error fetching businesses:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch businesses.' });
  }
});

/**
 * @route   GET /api/businesses/export
 * @desc    Export filtered businesses as a downloadable CSV spreadsheet
 */
router.get('/export', optionalAuth, async (req, res) => {
  try {
    const { area, category, status, hasWebsite, search } = req.query;
    const query = {};

    if (area && area.trim() !== '') {
      query.searchArea = { $regex: new RegExp(area.trim(), 'i') };
    }

    if (category && category.trim() !== '') {
      query.category = { $regex: new RegExp(category.trim(), 'i') };
    }

    if (status && status.trim() !== '' && status !== 'all') {
      query.status = status;
    }

    if (hasWebsite !== undefined && hasWebsite !== '') {
      if (hasWebsite === 'false' || hasWebsite === false) {
        query.hasWebsite = false;
      } else if (hasWebsite === 'true' || hasWebsite === true) {
        query.hasWebsite = true;
      }
    }

    if (search && search.trim() !== '') {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { address: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } },
      ];
    }

    const businesses = await Business.find(query).sort({ rating: -1, createdAt: -1 });
    const csvData = generateBusinessesCsv(businesses);

    const filename = `websitescout_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvData);
  } catch (err) {
    console.error('Error generating CSV export:', err);
    res.status(500).json({ success: false, error: 'Failed to export CSV.' });
  }
});

/**
 * @route   GET /api/businesses/:id
 * @desc    Get single business by DB id or placeId
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let business = null;
    
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      business = await Business.findById(id);
    }
    if (!business) {
      business = await Business.findOne({ placeId: id });
    }

    if (!business) {
      return res.status(404).json({ success: false, error: 'Business not found.' });
    }

    res.json({ success: true, data: business });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve business.' });
  }
});

/**
 * @route   PATCH /api/businesses/:id/status
 * @desc    Update lead pipeline status
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['not_contacted', 'contacted', 'interested', 'not_interested', 'follow_up', 'converted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updateFields = { status };
    if (status !== 'not_contacted') {
      updateFields.contactedAt = new Date();
    }

    let business = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      business = await Business.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
    }
    if (!business) {
      business = await Business.findOneAndUpdate({ placeId: id }, { $set: updateFields }, { new: true });
    }

    if (!business) {
      return res.status(404).json({ success: false, error: 'Business not found.' });
    }

    res.json({ success: true, data: business });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ success: false, error: 'Failed to update business status.' });
  }
});

/**
 * @route   PATCH /api/businesses/:id/notes
 * @desc    Update notes for a lead
 */
router.patch('/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    let business = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      business = await Business.findByIdAndUpdate(id, { $set: { notes: notes || '' } }, { new: true });
    }
    if (!business) {
      business = await Business.findOneAndUpdate({ placeId: id }, { $set: { notes: notes || '' } }, { new: true });
    }

    if (!business) {
      return res.status(404).json({ success: false, error: 'Business not found.' });
    }

    res.json({ success: true, data: business });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update notes.' });
  }
});

/**
 * @route   PATCH /api/businesses/:id/follow-up
 * @desc    Set follow-up reminder date
 */
router.patch('/:id/follow-up', async (req, res) => {
  try {
    const { id } = req.params;
    const { followUpDate } = req.body;

    let business = null;
    const update = { followUpDate: followUpDate ? new Date(followUpDate) : null };
    
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      business = await Business.findByIdAndUpdate(id, { $set: update }, { new: true });
    }
    if (!business) {
      business = await Business.findOneAndUpdate({ placeId: id }, { $set: update }, { new: true });
    }

    if (!business) {
      return res.status(404).json({ success: false, error: 'Business not found.' });
    }

    res.json({ success: true, data: business });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to set follow-up date.' });
  }
});

/**
 * @route   POST /api/businesses/bulk
 * @desc    Bulk update status or delete multiple leads
 */
router.post('/bulk', async (req, res) => {
  try {
    const { ids, action, status } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide an array of business IDs.' });
    }

    if (action === 'update_status') {
      const validStatuses = ['not_contacted', 'contacted', 'interested', 'not_interested', 'follow_up', 'converted'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status for bulk update.' });
      }

      const updateFields = { status };
      if (status !== 'not_contacted') {
        updateFields.contactedAt = new Date();
      }

      await Business.updateMany(
        { $or: [{ _id: { $in: ids } }, { placeId: { $in: ids } }] },
        { $set: updateFields }
      );

      return res.json({ success: true, message: `Successfully updated ${ids.length} businesses to ${status}.` });
    } else if (action === 'delete') {
      await Business.deleteMany({ $or: [{ _id: { $in: ids } }, { placeId: { $in: ids } }] });
      return res.json({ success: true, message: `Successfully deleted ${ids.length} businesses.` });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid bulk action.' });
    }
  } catch (err) {
    console.error('Error performing bulk action:', err);
    res.status(500).json({ success: false, error: 'Failed to perform bulk action.' });
  }
});

/**
 * @route   DELETE /api/businesses/:id
 * @desc    Remove a lead
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let result = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      result = await Business.findByIdAndDelete(id);
    }
    if (!result) {
      result = await Business.findOneAndDelete({ placeId: id });
    }

    if (!result) {
      return res.status(404).json({ success: false, error: 'Business not found.' });
    }

    res.json({ success: true, message: 'Business removed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete business.' });
  }
});

module.exports = router;
