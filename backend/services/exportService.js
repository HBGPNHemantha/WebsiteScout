/**
 * Helper to escape CSV cell contents
 */
function escapeCsv(field) {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Converts an array of Business documents to a CSV string
 */
function generateBusinessesCsv(businesses) {
  const headers = [
    'Business Name',
    'Category',
    'Search Area',
    'Has Website',
    'Website URL',
    'Phone',
    'Address',
    'Rating',
    'Total Reviews',
    'Lead Status',
    'Notes',
    'Contacted Date',
    'Follow-up Date',
    'Latitude',
    'Longitude',
    'Place ID'
  ];

  const rows = businesses.map(b => [
    escapeCsv(b.name),
    escapeCsv(b.category),
    escapeCsv(b.searchArea),
    escapeCsv(b.hasWebsite ? 'YES' : 'NO (LEAD)'),
    escapeCsv(b.websiteUrl || ''),
    escapeCsv(b.phone || ''),
    escapeCsv(b.address || ''),
    escapeCsv(b.rating || 0),
    escapeCsv(b.totalRatings || 0),
    escapeCsv(b.status || 'not_contacted'),
    escapeCsv(b.notes || ''),
    escapeCsv(b.contactedAt ? new Date(b.contactedAt).toISOString().split('T')[0] : ''),
    escapeCsv(b.followUpDate ? new Date(b.followUpDate).toISOString().split('T')[0] : ''),
    escapeCsv(b.location?.lat || ''),
    escapeCsv(b.location?.lng || ''),
    escapeCsv(b.placeId)
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

module.exports = { generateBusinessesCsv };
