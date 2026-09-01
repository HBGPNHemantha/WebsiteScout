# WebsiteScout — Find Local Businesses Without Websites (MERN + Google Maps)

**WebsiteScout** is a full-stack MERN application built for web design freelancers and digital marketing agencies. It scouts local businesses in any city or niche, automatically identifies which ones **lack a website**, manages them inside an interactive sales pipeline, and provides one-click cold outreach pitch scripts (WhatsApp, Cold Call, Cold Email, SMS).

---

## 🌟 Key Features

1. **Intelligent "No Website" Detection**:
   - Queries Google Places API (`Text Search` + `Place Details` field mask: `website`).
   - Automatically classifies businesses without an official website as high-value leads.
   - Preserves businesses with websites with an optional filter toggle.
   - Built-in 30-day database caching to minimize Google Maps API billing.

2. **Synced Dual Views**:
   - **Split View**: Side-by-side Cards List and Interactive Map.
   - **List View**: Rich action cards with phone, WhatsApp, ratings, notes, and pitch generator.
   - **Table View**: Compact, sortable spreadsheet with multi-lead bulk checkboxes.
   - **Full Map View**: Large-format interactive map with live pin legend.

3. **Color-Coded Status Pins**:
   - 🔴 **Not Contacted** (`#f43f5e` Rose) — Fresh scouted leads.
   - 🔵 **Contacted** (`#3b82f6` Blue) — First message / call made.
   - 🟣 **Interested** (`#8b5cf6` Purple) — Expressed interest in website demo.
   - 🟡 **Follow-up** (`#f59e0b` Amber) — Scheduled callback with date picker.
   - 🟢 **Converted** (`#10b981` Emerald) — Closed client deal (with confetti!).
   - ⚪ **Not Interested** (`#64748b` Slate) — Disqualified.

4. **1-Click Sales Outreach Pitch Generator**:
   - **WhatsApp Pitch**: Instant `https://wa.me/...` direct chat link with pre-filled pitch.
   - **Cold Call Script**: 2-minute Hook → Bridge → Value Pitch → Close framework.
   - **Cold Email**: Subject line and email template mentioning business name, rating, and area.
   - **SMS Pitch**: Concise text message script.

5. **Agency Pipeline CRM & Analytics Dashboard**:
   - Total Leads Scouted, % Without Website, Outreach Rate, Win Rate, and Estimated Pipeline Value.
   - Visual Sales Funnel (clickable stages to filter leads).
   - Top Scouted Locations & High-Opportunity Niches rankings.
   - Recent Search History with one-click re-scouting.

6. **Lead Management & Bulk Operations**:
   - Inline notes editor.
   - Follow-up date picker with "Due Today" reminders.
   - Bulk status updater and bulk delete.
   - One-click CSV spreadsheet exporter (`RFC 4180` compliant).

7. **Zero-Friction Dual Engine Support**:
   - **Live Google Places API**: Proxied securely server-side when API keys are configured.
   - **Places Simulation Engine**: Built-in realistic data engine with geo-accurate coordinates for any city worldwide, allowing testing and development right out of the box.
   - **MongoDB Zero-Config Fallback**: Connects to `MONGODB_URI` (Atlas or Local), with automatic embedded memory DB fallback if no external MongoDB server is running.

---

## 🛠️ Architecture & Tech Stack

```
WebsiteScout/
├── backend/
│   ├── config/db.js              # MongoDB & In-Memory DB connection
│   ├── models/
│   │   ├── Business.js           # Lead schema (placeId, coordinates, website, status, notes)
│   │   ├── User.js               # Agency user schema with bcrypt
│   │   └── SearchHistory.js      # Search query logging & statistics
│   ├── routes/
│   │   ├── search.js             # POST /api/search (Places search & caching)
│   │   ├── businesses.js         # CRUD, status updates, notes, follow-up, bulk actions, CSV export
│   │   ├── analytics.js          # GET /api/analytics/dashboard (pipeline funnel & stats)
│   │   ├── auth.js               # JWT registration, login, profile
│   │   └── settings.js           # API key status & connectivity testing
│   ├── services/
│   │   ├── googlePlaces.js       # Google Places API client + Simulation Engine + 30-day cache
│   │   └── exportService.js      # CSV format generator
│   ├── middleware/auth.js        # JWT verification middleware
│   └── server.js                 # Express server entry point (:5000)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Header with tabs, engine status, auth, theme
│   │   │   ├── SearchBar.jsx         # Category autocomplete, chips, area input, cache toggle
│   │   │   ├── ViewToggle.jsx        # Split / List / Table / Map segmented switch
│   │   │   ├── LeadCard.jsx          # Rich lead card with status dropdown & quick actions
│   │   │   ├── LeadList.jsx          # List / Card feed with loading skeletons
│   │   │   ├── LeadTable.jsx         # Spreadsheet grid with sortable columns & checkboxes
│   │   │   ├── MapView.jsx           # Interactive map with custom SVG status pins & popups
│   │   │   ├── FiltersSidebar.jsx    # Status, rating, website presence, and keyword filters
│   │   │   ├── BulkActionBar.jsx     # Floating bulk status change, export, and delete bar
│   │   │   ├── PitchGeneratorModal.jsx # Cold outreach pitch generator (WhatsApp, Call, Email, SMS)
│   │   │   ├── LeadDetailsModal.jsx  # Detailed lead profile, notes history, follow-up scheduler
│   │   │   ├── DashboardView.jsx     # Pipeline CRM analytics & conversion funnel
│   │   │   ├── ApiSettingsModal.jsx  # API key tester & engine toggles
│   │   │   └── AuthModal.jsx         # JWT login, registration, and 1-click guest demo
│   │   ├── context/
│   │   │   ├── LeadContext.jsx       # Central state management for leads, filters, and map sync
│   │   │   ├── AuthContext.jsx       # User state & JWT persistence
│   │   │   └── ThemeContext.jsx      # Dark/Light mode state
│   │   ├── services/api.js           # Axios API client with token injection
│   │   └── utils/helpers.js          # Pipeline colors, WhatsApp pitch generator, CSV download
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── package.json                      # Monorepo runner scripts
```

---

## 🚀 Quick Start Guide

### 1. Installation

Clone or open the repository, then install dependencies:

```bash
# Install backend and frontend dependencies
npm run install-all
```

### 2. Configure Environment Variables (Optional)

Create or edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/websitescout   # Optional: leave blank for embedded DB
GOOGLE_MAPS_SERVER_API_KEY=your_server_key_here     # Optional: leave blank for Simulation Engine
GOOGLE_MAPS_BROWSER_API_KEY=your_browser_key_here   # Optional
JWT_SECRET=websitescout_jwt_super_secret_key_2026
USE_MOCK_FALLBACK=true
```

> **Note:** If no Google Maps API key is provided, WebsiteScout automatically activates its **Places Simulation Engine**, which generates realistic local businesses with accurate coordinates for any city in the world.

### 3. Run Development Servers

```bash
# Start backend (:5000) and frontend (:5173) concurrently:
npm run dev
```

Or run them individually:
```bash
# Start Backend
cd backend && npm run dev

# Start Frontend (in another terminal)
cd frontend && npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 📡 API Endpoint Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/search` | Body: `{ category, area, bypassCache? }`. Searches Google Places / Simulator, filters by website, caches & saves to DB. |
| `GET` | `/api/businesses` | Query params: `area`, `category`, `status`, `hasWebsite`, `minRating`, `search`, `page`, `limit`. |
| `GET` | `/api/businesses/:id` | Fetch single lead details. |
| `PATCH` | `/api/businesses/:id/status` | Body: `{ status }`. Update pipeline status (`not_contacted`, `contacted`, `interested`, `follow_up`, `converted`, `not_interested`). |
| `PATCH` | `/api/businesses/:id/notes` | Body: `{ notes }`. Update lead notes. |
| `PATCH` | `/api/businesses/:id/follow-up` | Body: `{ followUpDate }`. Set follow-up reminder date. |
| `DELETE` | `/api/businesses/:id` | Remove lead from database. |
| `POST` | `/api/businesses/bulk` | Body: `{ ids: [...], action: 'update_status' | 'delete', status?: '...' }`. |
| `GET` | `/api/businesses/export` | Download filtered leads as CSV spreadsheet. |
| `GET` | `/api/analytics/dashboard` | Aggregated metrics: total leads, % without website, win rate, pipeline stages, top areas. |
| `POST` | `/api/auth/register` | Register new agency account. |
| `POST` | `/api/auth/login` | Log in and receive JWT token. |
| `GET` | `/api/auth/me` | Fetch authenticated agency profile. |
| `GET` | `/api/settings/status` | Check Google Maps API key and engine status. |
| `POST` | `/api/settings/test-key` | Body: `{ apiKey }`. Test live Google Places API key. |

---

## 🛡️ License

MIT License. Built for modern freelance web designers and digital marketing agencies.
