const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
    totalFound: {
      type: Number,
      default: 0,
    },
    noWebsiteCount: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    searchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

SearchHistorySchema.index({ searchedAt: -1 });

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);
