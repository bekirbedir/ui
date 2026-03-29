import { useState, useEffect } from 'react';
import { transportationService } from '../services/transportationService';
import { locationService } from '../services/locationService';
import { type Transportation, type TransportationType, WEEKDAYS, type Location } from '../types';

const TransportationsPage = () => {
  const [transportations, setTransportations] = useState<Transportation[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Transportation | null>(null);
  const [formData, setFormData] = useState({
    originId: 0,
    destinationId: 0,
    type: 'FLIGHT' as TransportationType,
    operatingDays: [] as number[]
  });

  const transportationTypes: TransportationType[] = ['FLIGHT', 'BUS', 'SUBWAY', 'UBER'];

  // Verileri yükle
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [transportationsData, locationsData] = await Promise.all([
        transportationService.getAll(),
        locationService.getAll()
      ]);
      setTransportations(transportationsData);
      setLocations(locationsData);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Location adını bul (ID'ye göre)
  const getLocationName = (locationId: number): string => {
    const location = locations.find(l => l.id === locationId);
    return location ? `${location.name} (${location.code})` : `ID: ${locationId}`;
  };

  // Gün isimlerini göster
  const getOperatingDaysText = (days: number[]): string => {
    if (!days || days.length === 0) return 'No days';
    const dayNames = days.map(d => {
      const day = WEEKDAYS.find(w => w.value === d);
      return day ? day.label.substring(0, 3) : d;
    });
    return dayNames.join(', ');
  };

  // Modal aç
  const openModal = (transportation?: Transportation) => {
    if (transportation) {
      setEditing(transportation);
      setFormData({
        originId: transportation.originId,
        destinationId: transportation.destinationId,
        type: transportation.type,
        operatingDays: [...transportation.operatingDays]
      });
    } else {
      setEditing(null);
      setFormData({
        originId: 0,
        destinationId: 0,
        type: 'FLIGHT',
        operatingDays: []
      });
    }
    setShowModal(true);
  };

  // Modal kapat
  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormData({
      originId: 0,
      destinationId: 0,
      type: 'FLIGHT',
      operatingDays: []
    });
  };

  // Gün seçimi toggle
  const toggleOperatingDay = (day: number) => {
    setFormData(prev => {
      if (prev.operatingDays.includes(day)) {
        return {
          ...prev,
          operatingDays: prev.operatingDays.filter(d => d !== day)
        };
      } else {
        return {
          ...prev,
          operatingDays: [...prev.operatingDays, day].sort((a, b) => a - b)
        };
      }
    });
  };

  // Form submit - Create/Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasyon
    if (formData.originId === 0) {
      alert('Please select origin location');
      return;
    }
    if (formData.destinationId === 0) {
      alert('Please select destination location');
      return;
    }
    if (formData.originId === formData.destinationId) {
      alert('Origin and destination cannot be the same');
      return;
    }
    if (formData.operatingDays.length === 0) {
      alert('Please select at least one operating day');
      return;
    }

    try {
      if (editing) {
        // Update
        await transportationService.update(editing.id, formData);
        alert('Transportation updated successfully!');
      } else {
        // Create
        await transportationService.create(formData);
        alert('Transportation created successfully!');
      }
      closeModal();
      loadData(); // Listeyi yenile
    } catch (err: any) {
      console.error('Error saving transportation:', err);
      alert(err.response?.data?.message || 'Failed to save transportation');
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this transportation?')) {
      try {
        await transportationService.delete(id);
        alert('Transportation deleted successfully!');
        loadData(); // Listeyi yenile
      } catch (err: any) {
        console.error('Error deleting transportation:', err);
        alert(err.response?.data?.message || 'Failed to delete transportation');
      }
    }
  };

  // Type'a göre badge rengi
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

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading transportations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h5>Error</h5>
        <p>{error}</p>
        <button className="btn btn-outline-danger btn-sm" onClick={loadData}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Transportations</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Add Transportation
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Operating Days</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transportations.map((trans) => (
                  <tr key={trans.id}>
                    <td>{trans.id}</td>
                    <td>
                      <span className={`badge ${getTypeBadgeClass(trans.type)}`}>
                        {trans.type}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong>{getLocationName(trans.originId)}</strong>
                        {trans.originCode && (
                          <div className="small text-muted">Code: {trans.originCode}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>→ {getLocationName(trans.destinationId)}</strong>
                        {trans.destinationCode && (
                          <div className="small text-muted">Code: {trans.destinationCode}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-secondary">
                        {getOperatingDaysText(trans.operatingDays)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-warning me-2"
                        onClick={() => openModal(trans)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(trans.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {transportations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      No transportations found. Click "Add Transportation" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-3 text-muted small">
            Total: {transportations.length} transportation(s)
          </div>
        </div>
      </div>

      {/* Modal - Add/Edit Transportation */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editing ? 'Edit Transportation' : 'Add New Transportation'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Transportation Type */}
                  <div className="mb-3">
                    <label className="form-label">
                      Transportation Type <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as TransportationType })}
                      required
                    >
                      {transportationTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="row">
                    {/* Origin Location */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Origin Location <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={formData.originId}
                        onChange={(e) => setFormData({ ...formData, originId: parseInt(e.target.value) })}
                        required
                      >
                        <option value={0}>Select origin...</option>
                        {locations.map(loc => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name} ({loc.code}) - {loc.city}, {loc.country}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Destination Location */}
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        Destination Location <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={formData.destinationId}
                        onChange={(e) => setFormData({ ...formData, destinationId: parseInt(e.target.value) })}
                        required
                      >
                        <option value={0}>Select destination...</option>
                        {locations.map(loc => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name} ({loc.code}) - {loc.city}, {loc.country}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Operating Days */}
                  <div className="mb-3">
                    <label className="form-label">
                      Operating Days <span className="text-danger">*</span>
                    </label>
                    <div className="border rounded p-3 bg-light">
                      <div className="row">
                        {WEEKDAYS.map(day => (
                          <div className="col-md-3 col-sm-6 mb-2" key={day.value}>
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`day-${day.value}`}
                                checked={formData.operatingDays.includes(day.value)}
                                onChange={() => toggleOperatingDay(day.value)}
                              />
                              <label className="form-check-label" htmlFor={`day-${day.value}`}>
                                {day.label}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                      {formData.operatingDays.length === 0 && (
                        <div className="text-danger small mt-2">
                          Please select at least one operating day
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="alert alert-info small">
                    <strong>Note:</strong> Operating days determine when this transportation is available.
                    The selected date must match one of these days for the transportation to be considered available.
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editing ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportationsPage;