import { useState, useEffect } from 'react';
import { routeService } from '../services/routeservice';
import { locationService } from '../services/locationService';
import type { Location, Route, RouteSegment, TransportationType } from '../types';
import RouteMap from '../components/map/RouteMap';

const RoutesPage = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [showMap, setShowMap] = useState(false);

  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    date: ''
  });
/*
  // Mock coordinates for demo (gerçek uygulamada backend'den gelmeli)
  // Mock coordinates for demo (gerçek uygulamada backend'den gelmeli)
  const mockLocationsWithCoords = [
    { name: 'Istanbul Airport', code: 'IST', lat: 41.2606, lng: 28.7424, city: 'Istanbul', country: 'Turkey' },
    { name: 'Sabiha Gokcen Airport', code: 'SAW', lat: 40.9061, lng: 29.3154, city: 'Istanbul', country: 'Turkey' },
    { name: 'Taksim Square', code: 'TAKSIM', lat: 41.0370, lng: 28.9850, city: 'Istanbul', country: 'Turkey' },
    { name: 'London Heathrow', code: 'LHR', lat: 51.4700, lng: -0.4543, city: 'London', country: 'UK' },
    { name: 'London Gatwick', code: 'LGW', lat: 51.1483, lng: -0.1903, city: 'London', country: 'UK' },
    { name: 'Paris CDG', code: 'CDG', lat: 49.0097, lng: 2.5479, city: 'Paris', country: 'France' },
    { name: 'Frankfurt Airport', code: 'FRA', lat: 50.0379, lng: 8.5622, city: 'Frankfurt', country: 'Germany' },
    { name: 'Amsterdam Schiphol', code: 'AMS', lat: 52.3086, lng: 4.7639, city: 'Amsterdam', country: 'Netherlands' },
  ]; */

  const getLocationByCode = (code: string): Location | undefined => {
    return locations.find(loc => loc.code === code);
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await locationService.getAll();
      setLocations(data);
    } catch (err: any) {
      console.error('Error loading locations:', err);
      setError('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchParams.origin || !searchParams.destination || !searchParams.date) {
      alert('Please fill all fields');
      return;
    }

    if (searchParams.origin === searchParams.destination) {
      alert('Origin and destination cannot be the same');
      return;
    }

    try {
      setSearching(true);
      setError('');
      setSelectedRoute(null);
      setShowMap(false);

      const results = await routeService.searchRoutes(
        searchParams.origin,
        searchParams.destination,
        searchParams.date
      );

      setRoutes(results);

      if (results.length === 0) {
        setError('No routes found for the selected criteria');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || 'Failed to search routes');
      setRoutes([]);
    } finally {
      setSearching(false);
    }
  };

  const getTypeBadgeClass = (type: TransportationType): string => {
    switch (type) {
      case 'FLIGHT':
        return 'bg-primary';
      case 'BUS':
        return 'bg-success';
      case 'SUBWAY':
        return 'bg-info';
      case 'UBER':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  const getTypeIcon = (type: TransportationType): string => {
    switch (type) {
      case 'FLIGHT':
        return '✈️';
      case 'BUS':
        return '🚌';
      case 'SUBWAY':
        return '🚇';
      case 'UBER':
        return '🚗';
      default:
        return '🚀';
    }
  };

  const showRouteDetails = (route: Route) => {
    setSelectedRoute(route);
    setShowMap(false);
  };

  const openMap = () => {
    if (selectedRoute) {
      setShowMap(true);
    }
  };

  const closeMap = () => {
    setShowMap(false);
  };

  const formatDate = (date: string): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const hasFlight = (segments: RouteSegment[]): boolean => {
    return segments.some(s => s.type === 'FLIGHT');
  };

  const getTransferCount = (segments: RouteSegment[]): number => {
    return segments.length - 1;
  };

  return (
    <div>
      <h2 className="mb-4">Route Search</h2>

      {/* Search Form */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">From</label>
                <select
                  className="form-select"
                  value={searchParams.origin}
                  onChange={(e) => setSearchParams({ ...searchParams, origin: e.target.value })}
                  required
                  disabled={loading}
                >
                  <option value="">Select origin...</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.code}>
                      {loc.name} ({loc.code}) - {loc.city}, {loc.country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">To</label>
                <select
                  className="form-select"
                  value={searchParams.destination}
                  onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
                  required
                  disabled={loading}
                >
                  <option value="">Select destination...</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.code}>
                      {loc.name} ({loc.code}) - {loc.city}, {loc.country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={searchParams.date}
                  onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="col-md-12 d-flex align-items-end">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={searching || loading}
                >
                  {searching ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" />
                      Search
                    </>
                  ) : (
                    'Search'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Loading */}
      {searching && (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Searching routes...</span>
          </div>
          <p className="mt-2 text-muted">Finding the best routes for you...</p>
        </div>
      )}

      {/* Routes List */}
      {!searching && routes.length > 0 && (
        <div className="row">
          <div className={selectedRoute && !showMap ? 'col-md-6' : 'col-md-12'}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">
                Available Routes ({routes.length})
                <small className="text-muted ms-2">
                  for {formatDate(searchParams.date)}
                </small>
              </h5>
              {selectedRoute && !showMap && (
                <button className="btn btn-outline-primary btn-sm" onClick={openMap}>
                  🗺️ View on Map
                </button>
              )}
            </div>

            <div className="list-group">
              {routes.map((route) => {
                if (!route || !route.segments) {
                  return null;
                }

                const hasFlightSegment = hasFlight(route.segments);
                const transferCount = getTransferCount(route.segments);

                return (
                  <button
                    key={route.id}
                    className={`list-group-item list-group-item-action ${selectedRoute?.id === route.id && !showMap ? 'active' : ''}`}
                    onClick={() => showRouteDetails(route)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2 flex-wrap">
                          {route.segments.map((segment, idx) => (
                            <div key={idx} className="d-flex align-items-center">
                              <span className={`badge ${getTypeBadgeClass(segment.type)} me-1`}>
                                {getTypeIcon(segment.type)} {segment.type}
                              </span>
                              {idx < route.segments.length - 1 && (
                                <span className="mx-1 text-muted">→</span>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="small text-muted">
                          {route.segments.length} segment(s) •
                          {hasFlightSegment ? ' ✈️ Includes flight' : ' No flight'} •
                          {transferCount === 0 ? ' Direct' : `${transferCount} transfer(s)`}
                        </div>
                      </div>
                      <div className="ms-3">
                        <i className="bi bi-chevron-right"></i>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Route Details Panel */}
          {selectedRoute && selectedRoute.segments && !showMap && (
            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Route Details</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setSelectedRoute(null)}
                  ></button>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <strong>Date:</strong> {formatDate(searchParams.date)}
                  </div>

                  <div className="timeline">
                    {selectedRoute.segments.map((segment, idx) => {
                      const originLoc = getLocationByCode(segment.origin);
                      const destLoc = getLocationByCode(segment.destination);
                      const isFlight = segment.type === 'FLIGHT';

                      return (
                        <div key={idx} className={`mb-4 ${idx > 0 ? 'mt-3' : ''}`}>
                          {idx > 0 && (
                            <div className="text-center text-muted mb-2">
                              <i className="bi bi-arrow-down"></i>
                              <div className="small">Transfer</div>
                            </div>
                          )}

                          <div className={`card ${isFlight ? 'border-primary' : 'border-secondary'}`}>
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <span className={`badge ${getTypeBadgeClass(segment.type)}`}>
                                    {getTypeIcon(segment.type)} {segment.type}
                                  </span>
                                </div>
                                {isFlight && (
                                  <span className="badge bg-primary">
                                    Main Flight
                                  </span>
                                )}
                              </div>

                              <div className="row mt-3">
                                <div className="col-5 text-end">
                                  <strong>{originLoc?.name || segment.origin}</strong>
                                  <div className="small text-muted">{segment.origin}</div>
                                  <div className="small text-muted">{originLoc?.city || '-'}</div>
                                </div>
                                <div className="col-2 text-center">
                                  <i className="bi bi-arrow-right-circle fs-4 text-primary"></i>
                                </div>
                                <div className="col-5">
                                  <strong>{destLoc?.name || segment.destination}</strong>
                                  <div className="small text-muted">{segment.destination}</div>
                                  <div className="small text-muted">{destLoc?.city || '-'}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="alert alert-info mt-3">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Route Summary:</strong><br />
                    • Total segments: {selectedRoute.segments.length}<br />
                    • Valid for: {formatDate(searchParams.date)}<br />
                    • Route type: {hasFlight(selectedRoute.segments) ? 'Includes flight' : 'No flight'}<br />
                    • Transfers: {getTransferCount(selectedRoute.segments)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Map View */}
          {showMap && selectedRoute && selectedRoute.segments && (
            <div className="col-md-12">
              <div className="card">
                <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">🗺️ Route Map - {searchParams.origin} → {searchParams.destination}</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closeMap}
                  ></button>
                </div>
                <div className="card-body p-0">
                  <div style={{ height: '600px' }}>
                    <RouteMap
                      segments={selectedRoute.segments}
                      locations={locations.map(loc => ({
                        name: loc.name,
                        code: loc.code,
                        lat: loc.latitude || 0,
                        lng: loc.longitude || 0,
                        city: loc.city,
                        country: loc.country
                      }))}
                      onClose={closeMap}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {!searching && !error && routes.length === 0 && searchParams.origin && (
        <div className="text-center text-muted mt-5">
          <i className="bi bi-map fs-1"></i>
          <p className="mt-2">No routes found. Try different locations or date.</p>
        </div>
      )}

      {/* Initial State */}
      {!searching && !error && routes.length === 0 && !searchParams.origin && (
        <div className="text-center text-muted mt-5">
          <i className="bi bi-search fs-1"></i>
          <p className="mt-2">Select origin, destination and date to search for routes.</p>
        </div>
      )}
    </div>
  );
};

export default RoutesPage;