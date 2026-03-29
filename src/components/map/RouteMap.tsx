import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet icon default sorununu çöz
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Location {
  name: string;
  code: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
}

interface RouteSegment {
  type: string;
  origin: string;
  destination: string;
}

interface RouteMapProps {
  segments: RouteSegment[];
  locations: Location[];  // Artık gerçek koordinatlar buradan geliyor
  onClose: () => void;
}

const RouteMap = ({ segments, locations, onClose }: RouteMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylinesRef = useRef<L.Polyline[]>([]);

  // Location code'a göre koordinat bul (gerçek locations'dan)
const getLocationCoordinates = (code: string): { lat: number; lng: number; name: string } | null => {
    const location = locations.find(l => l.code === code);
    if (location && location.lat && location.lng) {
      return { lat: location.lat, lng: location.lng, name: location.name };
    }
    console.warn(`Coordinates not found for location: ${code}`);
    return null;
  };

  // Renk seçimi
  const getColorByType = (type: string): string => {
    switch (type) {
      case 'FLIGHT':
        return '#007bff';
      case 'BUS':
        return '#28a745';
      case 'SUBWAY':
        return '#17a2b8';
      case 'UBER':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  // Haritayı oluştur
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    leafletMapRef.current = L.map(mapRef.current).setView([41.0082, 28.9784], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(leafletMapRef.current);

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Rota çizgilerini ve marker'ları çiz
  useEffect(() => {
    if (!leafletMapRef.current || !segments || segments.length === 0) return;

    // Eski çizgileri ve marker'ları temizle
    polylinesRef.current.forEach(line => line.remove());
    markersRef.current.forEach(marker => marker.remove());
    polylinesRef.current = [];
    markersRef.current = [];

    const points: { lat: number; lng: number; name: string; code: string; type: string }[] = [];
    const routePoints: { lat: number; lng: number }[] = [];
    let hasValidCoordinates = true;

    // Her segment için noktaları topla
    segments.forEach((segment, idx) => {
      const originCoord = getLocationCoordinates(segment.origin);
      const destCoord = getLocationCoordinates(segment.destination);

      if (!originCoord || !destCoord) {
        hasValidCoordinates = false;
        return;
      }

      if (idx === 0) {
        points.push({
          lat: originCoord.lat,
          lng: originCoord.lng,
          name: originCoord.name,
          code: segment.origin,
          type: 'origin'
        });
      }

      points.push({
        lat: destCoord.lat,
        lng: destCoord.lng,
        name: destCoord.name,
        code: segment.destination,
        type: idx === segments.length - 1 ? 'destination' : 'transfer'
      });

      routePoints.push({ lat: originCoord.lat, lng: originCoord.lng });
      routePoints.push({ lat: destCoord.lat, lng: destCoord.lng });

      // Segment çizgisini ekle
      const color = getColorByType(segment.type);
      const polyline = L.polyline(
        [
          [originCoord.lat, originCoord.lng],
          [destCoord.lat, destCoord.lng]
        ],
        {
          color: color,
          weight: 4,
          opacity: 0.7,
          dashArray: segment.type === 'FLIGHT' ? '10, 10' : undefined
        }
      ).addTo(leafletMapRef.current!);
      
      polylinesRef.current.push(polyline);

      polyline.bindPopup(`
        <b>${segment.type}</b><br/>
        ${originCoord.name} → ${destCoord.name}
      `);
    });

    if (!hasValidCoordinates) {
      console.warn('Some locations missing coordinates');
    }

    // Marker'ları ekle
    points.forEach((point) => {
      const marker = L.marker([point.lat, point.lng])
        .addTo(leafletMapRef.current!)
        .bindPopup(`
          <b>${point.name}</b><br/>
          Code: ${point.code}<br/>
          ${point.type === 'origin' ? '🚩 Departure Point' : point.type === 'destination' ? '🏁 Destination' : '🔄 Transfer Point'}
        `);
      
      markersRef.current.push(marker);
    });

    // Haritayı tüm rotayı gösterecek şekilde ayarla
    if (routePoints.length > 0) {
      const bounds = L.latLngBounds(routePoints.map(p => [p.lat, p.lng]));
      leafletMapRef.current!.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [segments, locations]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '500px' }} />
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '8px 12px',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          fontWeight: 'bold'
        }}
      >
        ✕ Close Map
      </button>
    </div>
  );
};

export default RouteMap;