import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapLocation } from '../types';
import { DEFAULT_LOCATION, DEFAULT_ZOOM, MAP_TILE_LAYER, MAP_ATTRIBUTION } from '../constants';
import { MapPin, Navigation } from 'lucide-react';

// Fix for default Leaflet marker icons in Webpack/React
// We'll use a custom DivIcon with Lucide icons for better styling anyway.

interface MapComponentProps {
  userLocation: Omit<MapLocation, 'title'> | null;
  locations: MapLocation[];
  selectedIndex?: number | null;
  onMarkerClick?: (location: MapLocation) => void;
}

// Component to handle map view updates
const MapController: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom || map.getZoom(), { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

// Custom Icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const UserIcon = createCustomIcon('#3b82f6'); // Blue
const PlaceIcon = createCustomIcon('#ef4444'); // Red

const MapComponent: React.FC<MapComponentProps> = ({ userLocation, locations, onMarkerClick }) => {
  
  const centerPosition: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng];

  // Determine view center: if we have locations, center on the first one, otherwise user location
  const viewCenter = locations.length > 0 
    ? [locations[0].lat, locations[0].lng] as [number, number]
    : centerPosition;

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={centerPosition} 
        zoom={DEFAULT_ZOOM} 
        scrollWheelZoom={true} 
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution={MAP_ATTRIBUTION}
          url={MAP_TILE_LAYER}
        />
        
        <MapController center={viewCenter} zoom={locations.length > 0 ? 14 : DEFAULT_ZOOM} />

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={UserIcon}>
            <Popup>
              <div className="text-sm font-semibold">You are here</div>
            </Popup>
          </Marker>
        )}

        {/* Result Markers */}
        {locations.map((loc, idx) => (
          <Marker 
            key={`${loc.lat}-${loc.lng}-${idx}`} 
            position={[loc.lat, loc.lng]} 
            icon={PlaceIcon}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(loc),
            }}
          >
            <Popup>
              <div className="min-w-[150px]">
                <h3 className="font-bold text-gray-900">{loc.title}</h3>
                {loc.address && <p className="text-gray-600 text-xs mt-1">{loc.address}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Overlay attribution or controls could go here */}
    </div>
  );
};

export default MapComponent;
