'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix typical Next.js Leaflet icon missing issues
const customIcon = (color: string) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapProps {
  markers: Array<{
    id: string;
    lat: number;
    lng: number;
    type: 'restaurant' | 'shelter';
    name: string;
    detail: string;
  }>;
}

export default function RescueMap({ markers }: MapProps) {
  useEffect(() => {
    // Force leaflet recalculations on mount
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }, []);

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-white/10 relative z-10">
      <MapContainer 
        center={[51.505, -0.09]} 
        zoom={13} 
        style={{ height: '100%', width: '100%', background: '#1a1a1a' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {markers.map((marker) => (
          <Marker 
            key={marker.id} 
            position={[marker.lat, marker.lng]}
            icon={customIcon(marker.type === 'restaurant' ? 'green' : 'blue')}
          >
            <Popup className="rescue-popup">
              <div className="p-1 font-heading text-black">
                <strong className="block mb-1 text-sm uppercase tracking-widest">{marker.name}</strong>
                <span className="text-xs opacity-80">{marker.detail}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
