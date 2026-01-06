import React, { useState, useEffect } from 'react';
import '../styles/EmergencyContacts.css';
import FloatingDecorations from './FloatingDecorations';
import GradualBlur from './GradualBlur';

interface Contact {
  id: number;
  name: string;
  phone: string;
  relationship: string;
}

const EmergencyContacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/emergency-contacts');
      const data = await res.json();
      if (data.success) {
        setContacts(data.contacts || []);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await fetch(`/api/emergency-contacts/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/emergency-contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      setFormData({ name: '', phone: '', relationship: '' });
      setEditingId(null);
      setShowForm(false);
      fetchContacts();
    } catch (err) {
      console.error('Failed to save contact:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contact: Contact) => {
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship
    });
    setEditingId(contact.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await fetch(`/api/emergency-contacts/${id}`, { method: 'DELETE' });
        fetchContacts();
      } catch (err) {
        console.error('Failed to delete contact:', err);
      }
    }
  };

  return (
    <div className="emergency-contacts-container sylvie-landing">
      <FloatingDecorations />
      <GradualBlur position="bottom" height="11.475rem" strength={2.5} divCount={6} curve="ease-out" target="page" animated="scroll" />
      <div className="contacts-hero">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 className="contacts-title">🚨 Emergency Contacts</h1>
            <p className="contacts-subtitle">
              Add trusted people who will be alerted when you activate SOS
            </p>
          </div>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              setFormData({ name: '', phone: '', relationship: '' });
              setEditingId(null);
              setShowForm(true);
            }}
          >
            ➕ Add Contact
          </button>
        </div>
      </div>

      {/* Contact Form */}
      {showForm && (
        <div className="contacts-form-container">
          <div className="card form-card">
            <h3 className="form-title">{editingId ? 'Edit Contact' : 'Add New Contact'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Mom, Sister, Best Friend"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Phone Number (with country code) *</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., +919876543210 or 9876543210"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Relationship *</label>
                <select
                  className="form-select"
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select relationship</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Sister">Sister</option>
                  <option value="Brother">Brother</option>
                  <option value="Friend">Friend</option>
                  <option value="Partner">Partner</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Contact'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contacts List */}
      <div className="contacts-list">
        {contacts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No emergency contacts yet</h3>
            <p>Add at least 3 trusted contacts who will be alerted when you need help</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setFormData({ name: '', phone: '', relationship: '' });
                setEditingId(null);
                setShowForm(true);
              }}
            >
              Add First Contact
            </button>
          </div>
        ) : (
          <div className="contacts-grid">
            {contacts.map((contact) => (
              <div key={contact.id} className="contact-card">
                <div className="contact-header">
                  <div className="contact-info">
                    <h4 className="contact-name">{contact.name}</h4>
                    <p className="contact-relationship">{contact.relationship}</p>
                  </div>
                  <div className="contact-actions">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEdit(contact)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(contact.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="contact-body">
                  <a href={`tel:${contact.phone}`} className="contact-phone">
                    📱 {contact.phone}
                  </a>
                  <a href={`sms:${contact.phone}`} className="btn btn-sm btn-outline-success mt-2">
                    Send SMS
                  </a>
                  <a href={`https://wa.me/${contact.phone}`} className="btn btn-sm btn-outline-info mt-2 ms-2">
                    WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="help-section">
        <h3>💡 Tips for Emergency Contacts</h3>
        <ul>
          <li>Add at least 3 trusted people (family, close friends)</li>
          <li>Use full international phone numbers for better reliability</li>
          <li>Keep numbers up to date</li>
          <li>Make sure contacts know they'll receive alerts</li>
          <li>Include people in different time zones if possible</li>
        </ul>
      </div>
    </div>
  );
};

export default EmergencyContacts;
