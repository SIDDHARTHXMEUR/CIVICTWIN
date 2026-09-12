import React, { useState } from 'react';
import { Camera, MapPin, Send, AlertTriangle, CheckCircle, Sparkles, Image as ImageIcon } from 'lucide-react';
import { submitReport } from '../services/api';

const QUICK_TAGS = [
  { label: 'Drainage Overflow', icon: '🌊', text: 'Water drain blockage overflowing near road' },
  { label: 'Pothole Hazard', icon: '🕳️', text: 'Deep crater pothole causing road traffic hazard' },
  { label: 'Garbage Waste', icon: '🗑️', text: 'Uncollected garbage pile overflowing bin' },
  { label: 'Water Pipe Leak', icon: '🚰', text: 'High pressure water main leakage' },
  { label: 'Dark Streetlight', icon: '💡', text: 'Non-functional streetlight on main pathway' }
];

const SAMPLE_PHOTOS = [
  { label: 'Drainage Flood', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80' },
  { label: 'Road Pothole', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&q=80' },
  { label: 'Garbage Heap', url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80' }
];

export default function ReportForm({ onReportSubmitted }) {
  const [rawText, setRawText] = useState('');
  const [photoUrls, setPhotoUrls] = useState([]);
  // Default to NIT Delhi coordinates (28.8427, 77.1048)
  const [latitude, setLatitude] = useState(28.8427);
  const [longitude, setLongitude] = useState(77.1048);
  const [locStatus, setLocStatus] = useState('Default (NIT Delhi)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGetCurrentLocation = () => {
    setLocStatus('Detecting GPS location...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setLocStatus(`GPS Captured (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        },
        (err) => {
          console.warn(err);
          setLocStatus('Using NIT Delhi Campus coordinates');
        },
        { timeout: 8000 }
      );
    } else {
      setLocStatus('GPS unavailable. Using default coordinates.');
    }
  };

  const handleQuickTagClick = (tag) => {
    setRawText((prev) => prev ? `${prev}. ${tag.text}` : tag.text);
  };

  const handleAddPhoto = (url) => {
    if (!photoUrls.includes(url) && photoUrls.length < 3) {
      setPhotoUrls([...photoUrls, url]);
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotoUrls(photoUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rawText.trim()) {
      setError('Please enter a short description of the issue.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await submitReport({
        raw_text: rawText,
        photo_urls: photoUrls,
        latitude,
        longitude
      });
      onReportSubmitted(result);
      setRawText('');
      setPhotoUrls([]);
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '20px', margin: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Sparkles size={20} color="#06B6D4" />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
          Report a Civic Issue
        </h2>
      </div>

      {/* Quick Category Tags */}
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '8px' }}>Select Quick Issue Template:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {QUICK_TAGS.map((tag, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickTagClick(tag)}
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#F8FAFC',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <span>{tag.icon}</span> {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text Area Description */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
          Issue Description
        </label>
        <textarea
          rows={3}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Describe the issue in plain language (e.g. Broken water pipe leaking near main gate)..."
          style={{
            width: '100%',
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '12px',
            color: '#FFF',
            fontSize: '0.9rem',
            outline: 'none',
            resize: 'none'
          }}
        />
      </div>

      {/* Photo Attachments */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CBD5E1' }}>
            Photos ({photoUrls.length}/3)
          </label>
          <span style={{ fontSize: '0.75rem', color: '#06B6D4' }}>Camera & Gallery</span>
        </div>

        {/* Selected Photos Preview */}
        {photoUrls.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            {photoUrls.map((url, i) => (
              <div key={i} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #06B6D4' }}>
                <img src={url} alt="Attached" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(i)}
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '10px',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Quick Sample Photo Picker */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {SAMPLE_PHOTOS.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAddPhoto(p.url)}
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px dashed rgba(255,255,255,0.2)',
                borderRadius: '10px',
                padding: '8px 12px',
                color: '#94A3B8',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Camera size={14} color="#06B6D4" /> + {p.label} Photo
            </button>
          ))}
        </div>
      </div>

      {/* Geolocation Selector */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.6)',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={18} color="#06B6D4" />
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F8FAFC' }}>Incident Location</p>
            <p style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{locStatus}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          style={{
            background: 'rgba(6, 182, 212, 0.2)',
            border: '1px solid #06B6D4',
            color: '#06B6D4',
            padding: '6px 10px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Auto GPS
        </button>
      </div>

      {error && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '10px',
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.4)',
          color: '#F43F5E',
          fontSize: '0.8rem',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Submit Button */}
      <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
        {loading ? (
          <span>Processing Report via AI...</span>
        ) : (
          <>
            <Send size={18} /> Submit Incident Report
          </>
        )}
      </button>
    </form>
  );
}
