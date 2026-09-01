import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Phone,
  MessageSquare,
  Sparkles,
  Globe,
  Star,
  ExternalLink,
  ChevronDown,
  Navigation,
  Layers,
} from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { PIPELINE_STATUSES, cleanPhoneForTel, getWhatsAppUrl } from '../utils/helpers';

/**
 * Creates custom colored SVG map pins for Leaflet markers
 */
function createCustomMarkerIcon(status, isHovered = false, hasWebsite = false) {
  const statusConfig = PIPELINE_STATUSES[status] || PIPELINE_STATUSES.not_contacted;
  const pinColor = hasWebsite ? '#64748b' : statusConfig.color;
  const size = isHovered ? 40 : 32;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="${size}" height="${size * 1.5}">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.5"/>
        </filter>
      </defs>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z" 
            fill="${pinColor}" 
            filter="url(#shadow)" 
            stroke="#ffffff" 
            stroke-width="1.5"/>
      <circle cx="12" cy="12" r="4.5" fill="#ffffff"/>
      ${!hasWebsite ? `<circle cx="12" cy="12" r="2.5" fill="${pinColor}"/>` : ''}
    </svg>
  `;

  return L.divIcon({
    className: 'custom-map-pin',
    html: svg,
    iconSize: [size, size * 1.5],
    iconAnchor: [size / 2, size * 1.5],
    popupAnchor: [0, -size * 1.3],
  });
}

/**
 * Helper component to automatically pan and zoom to fit markers or selected lead
 */
function MapController({ leads, selectedLeadId }) {
  const map = useMap();

  useEffect(() => {
    if (selectedLeadId) {
      const selected = leads.find(
        (l) => l._id === selectedLeadId || l.placeId === selectedLeadId
      );
      if (selected?.location?.lat && selected?.location?.lng) {
        map.flyTo([selected.location.lat, selected.location.lng], 16, {
          duration: 1.2,
        });
        return;
      }
    }

    if (leads && leads.length > 0) {
      const validPoints = leads
        .filter((l) => l.location?.lat && l.location?.lng)
        .map((l) => [l.location.lat, l.location.lng]);

      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }
  }, [leads, selectedLeadId, map]);

  return null;
}

export default function MapView() {
  const {
    filteredLeads,
    selectedLeadId,
    setSelectedLeadId,
    hoveredLeadId,
    changeLeadStatus,
    setPitchModalLead,
    setDetailsModalLead,
  } = useLeads();

  // Default center (Kurunegala or first lead)
  const defaultCenter = [7.4863, 80.3623];
  const center =
    filteredLeads.length > 0 && filteredLeads[0].location?.lat
      ? [filteredLeads[0].location.lat, filteredLeads[0].location.lng]
      : defaultCenter;

  return (
    <div className="w-full h-full min-h-[450px] relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      
      {/* Map Legend Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl p-2.5 shadow-xl text-[11px] space-y-1.5 hidden sm:block">
        <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-800">
          Pin Legend
        </div>
        {Object.values(PIPELINE_STATUSES).map((st) => (
          <div key={st.key} className="flex items-center space-x-2">
            <span
              className="w-2.5 h-2.5 rounded-full shadow-sm"
              style={{ backgroundColor: st.color }}
            />
            <span className="text-slate-300 font-medium">{st.label}</span>
          </div>
        ))}
      </div>

      {/* Leaflet Dark Map */}
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* CartoDB Dark Matter Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapController leads={filteredLeads} selectedLeadId={selectedLeadId} />

        {filteredLeads.map((business) => {
          if (!business.location?.lat || !business.location?.lng) return null;
          const leadId = business._id || business.placeId;
          const isHovered = hoveredLeadId === leadId;
          const statusConfig =
            PIPELINE_STATUSES[business.status] || PIPELINE_STATUSES.not_contacted;
          const whatsappLink = getWhatsAppUrl(business.phone, business.name, 'Alex', business.category);
          const telLink = cleanPhoneForTel(business.phone)
            ? `tel:${cleanPhoneForTel(business.phone)}`
            : null;

          return (
            <Marker
              key={leadId}
              position={[business.location.lat, business.location.lng]}
              icon={createCustomMarkerIcon(business.status, isHovered, business.hasWebsite)}
              eventHandlers={{
                click: () => setSelectedLeadId(leadId),
              }}
            >
              <Popup className="websitescout-map-popup">
                <div className="p-3.5 max-w-[260px] text-slate-100 bg-slate-900">
                  
                  {/* Popup Header */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-slate-100 leading-tight">
                      {business.name}
                    </h4>
                  </div>

                  {/* Rating & Category */}
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 capitalize border border-slate-700">
                      {business.category}
                    </span>
                    {business.rating > 0 && (
                      <span className="flex items-center text-[11px] text-amber-400 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                        {business.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {/* Website presence */}
                  <div className="mt-2">
                    {business.hasWebsite ? (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Has Website
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        NO WEBSITE (HOT LEAD)
                      </span>
                    )}
                  </div>

                  {/* Address & Phone */}
                  <div className="mt-2 text-[11px] text-slate-400 space-y-1">
                    <p className="line-clamp-2">{business.address}</p>
                    {business.phone && (
                      <p className="font-semibold text-slate-300">{business.phone}</p>
                    )}
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="mt-3 pt-2 border-t border-slate-800 grid grid-cols-2 gap-1.5">
                    {whatsappLink && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                          if (business.status === 'not_contacted')
                            changeLeadStatus(leadId, 'contacted');
                        }}
                        className="flex items-center justify-center space-x-1 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-[10px] font-bold rounded border border-emerald-800/60"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {telLink && (
                      <a
                        href={telLink}
                        onClick={() => {
                          if (business.status === 'not_contacted')
                            changeLeadStatus(leadId, 'contacted');
                        }}
                        className="flex items-center justify-center space-x-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded border border-slate-700"
                      >
                        <Phone className="w-3 h-3 text-blue-400" />
                        <span>Call</span>
                      </a>
                    )}

                    <button
                      onClick={() => setPitchModalLead(business)}
                      className="col-span-2 flex items-center justify-center space-x-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded shadow transition"
                    >
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                      <span>Generate Pitch Script</span>
                    </button>
                  </div>

                  {/* Quick Status Update */}
                  <div className="mt-2">
                    <select
                      value={business.status}
                      onChange={(e) => changeLeadStatus(leadId, e.target.value)}
                      className={`w-full text-[10px] font-bold py-1 px-2 rounded border bg-slate-950 ${statusConfig.bgLight}`}
                    >
                      {Object.values(PIPELINE_STATUSES).map((st) => (
                        <option
                          key={st.key}
                          value={st.key}
                          className="bg-slate-900 text-slate-200"
                        >
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

    </div>
  );
}
