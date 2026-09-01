// Pipeline Status Configurations
export const PIPELINE_STATUSES = {
  not_contacted: {
    key: 'not_contacted',
    label: 'Not Contacted',
    color: '#f43f5e', // Rose
    bgLight: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    dotBg: 'bg-rose-500',
    icon: 'AlertCircle',
    description: 'Fresh lead, no outreach initiated',
  },
  contacted: {
    key: 'contacted',
    label: 'Contacted',
    color: '#3b82f6', // Blue
    bgLight: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    dotBg: 'bg-blue-500',
    icon: 'PhoneCall',
    description: 'First outreach message or call sent',
  },
  interested: {
    key: 'interested',
    label: 'Interested',
    color: '#8b5cf6', // Purple
    bgLight: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    dotBg: 'bg-purple-500',
    icon: 'Sparkles',
    description: 'Expressed interest in web design services',
  },
  follow_up: {
    key: 'follow_up',
    label: 'Follow-up',
    color: '#f59e0b', // Amber
    bgLight: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dotBg: 'bg-amber-500',
    icon: 'Calendar',
    description: 'Scheduled for follow-up conversation',
  },
  converted: {
    key: 'converted',
    label: 'Converted (Client)',
    color: '#10b981', // Emerald
    bgLight: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dotBg: 'bg-emerald-500',
    icon: 'CheckCircle2',
    description: 'Closed deal! Building website',
  },
  not_interested: {
    key: 'not_interested',
    label: 'Not Interested',
    color: '#64748b', // Slate
    bgLight: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    dotBg: 'bg-slate-500',
    icon: 'XCircle',
    description: 'Declined or not a fit at this time',
  },
};

/**
 * Format clean phone number for display & links
 */
export function formatPhone(phone) {
  if (!phone) return null;
  return phone.trim();
}

/**
 * Clean phone for tel: link
 */
export function cleanPhoneForTel(phone) {
  if (!phone) return '';
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Generate WhatsApp Direct Chat Link with custom message
 */
export function getWhatsAppUrl(phone, businessName, senderName = 'Alex', category = 'business') {
  if (!phone) return null;
  const digitsOnly = phone.replace(/[^\d]/g, '');
  if (digitsOnly.length < 7) return null;

  const text = `Hi ${businessName}! 👋 I noticed you're one of the top rated ${category}s in town, but customers can't find an official website for you when searching on Google. We build high-converting websites that bring in more daily customers. Would you be open to a quick 2-minute chat about a website demo for ${businessName}?`;
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(text)}`;
}

/**
 * Generates tailored sales pitches for cold outreach
 */
export function generatePitchTemplates(business, agencyName = 'Apex Web Studio', senderName = 'Alex') {
  const name = business.name || 'Business Owner';
  const category = business.category || 'business';
  const area = business.searchArea || 'your area';
  const rating = business.rating ? `${business.rating}★ (${business.totalRatings || 0} reviews)` : 'great reviews';

  return {
    whatsapp: {
      title: 'WhatsApp Quick Pitch',
      text: `Hi ${name} team! 👋

I noticed ${name} has fantastic ratings in ${area} (${rating}), but when potential customers search for you on Google, there's no official website listed to see your services, photos, or book directly.

I run ${agencyName}, and we specialize in building fast, beautiful websites for local ${category}s that turn Google searchers into paying customers.

I actually put together a quick preview concept of what your website could look like. Would you be open to a quick 3-minute look this week?

Best,
${senderName} | ${agencyName}`,
    },
    cold_call: {
      title: 'Cold Call Script (2-Minute Framework)',
      text: `[HOOK]
"Hi there! My name is ${senderName} with ${agencyName}. Quick question—are you the owner or the person in charge of customer outreach for ${name}?"

[BRIDGE]
"Great! I'm calling because I saw you guys have great reviews in ${area}, but I noticed when customers search for ${name} on Google Maps, you don't have an official website listed."

[VALUE PITCH]
"Most of your competitors in ${area} are capturing customers who want to see photos, pricing, and phone bookings online. We help local ${category}s build modern websites that generate an extra 15-30 customer inquiries every month."

[CALL TO ACTION / CLOSE]
"I already prepared a custom draft mockup for ${name} with zero obligation. Could I email or WhatsApp it over to you today, or what's the best email for you?"`,
    },
    cold_email: {
      title: 'Cold Email Template',
      subject: `Missing website for ${name} in ${area} (${category})`,
      text: `Hi ${name} Team,

I recently came across ${name} while scouting top ${category}s in ${area}. Congratulations on building such a strong local reputation (${rating})!

While looking you up on Google, I noticed that you don't currently have an official website linked to your Google Business Profile. In today's market, over 76% of customers check a website before calling or visiting in person.

At ${agencyName}, we help businesses like yours:
• Rank higher on Google Maps & Local Search
• Showcase your services, menu, and customer testimonials
• Capture online bookings and phone inquiries directly from mobile phones

I've put together a quick interactive mockup of what a modern website for ${name} could look like.

Would you be open to a brief 5-minute call this Thursday or Friday to check it out?

Warm regards,

${senderName}
Lead Strategist, ${agencyName}
${agencyName.toLowerCase().replace(/\s+/g, '')}.com`,
    },
    sms: {
      title: 'Short SMS / Text Pitch',
      text: `Hi ${name}! Found your ${category} in ${area} on Google. Noticed you don't have a website listed for customers to browse. We make modern websites for local businesses starting from $299. Can I send you a quick preview link for ${name}? - ${senderName} (${agencyName})`,
    },
  };
}

/**
 * Trigger CSV download from browser
 */
export function triggerCsvDownload(csvString, filename = 'leads_export.csv') {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
