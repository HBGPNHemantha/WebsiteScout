const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema(
  {
    placeId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    searchArea: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    address: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    hasWebsite: {
      type: Boolean,
      default: false,
      index: true,
    },
    websiteUrl: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    businessStatus: {
      type: String,
      default: 'OPERATIONAL',
    },
    status: {
      type: String,
      enum: ['not_contacted', 'contacted', 'interested', 'not_interested', 'follow_up', 'converted'],
      default: 'not_contacted',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    contactedAt: {
      type: Date,
      default: null,
    },
    lastFetchedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast filtering and composite querying
BusinessSchema.index({ searchArea: 1, category: 1 });
BusinessSchema.index({ status: 1, hasWebsite: 1 });
BusinessSchema.index({ name: 'text', address: 'text', notes: 'text' });

module.exports = mongoose.model('Business', BusinessSchema);
