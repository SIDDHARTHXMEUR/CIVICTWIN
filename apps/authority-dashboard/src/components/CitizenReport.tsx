import React, { useState } from 'react';
import { MapPin, Send, CheckCircle2, Search } from 'lucide-react';
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { LocationResult, searchLocations, submitCitizenReport } from '../services/api';

export function CitizenReport({ onSubmitted }: { onSubmitted: () => void }) {
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [lat, setLat] = useState(28.8427);
  const [lng, setLng] = useState(77.1048);
  const [locationQuery, setLocationQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [searching, setSearching] = useState(false);
  const useGps = () => {
    if (!navigator.geolocation) return setMessage('GPS is not supported by this browser. Please choose the point on the map.');
    setMessage('Requesting GPS location…');
    navigator.geolocation.getCurrentPosition(
      p => { setLat(p.coords.latitude); setLng(p.coords.longitude); setMessage('GPS location captured. You can still adjust the pin on the map.'); },
      () => setMessage('We could not access GPS. Please choose the exact point on the map.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
  const findLocation = async () => {
    if (locationQuery.trim().length < 3) return setMessage('Enter at least 3 characters to search for a location.');
    setSearching(true); setMessage('');
    try { setResults(await searchLocations(locationQuery.trim())); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Location search failed.'); }
    finally { setSearching(false); }
  };
  const selectLocation = (result: LocationResult) => {
    setLat(result.latitude); setLng(result.longitude); setResults([]); setLocationQuery(result.name); setMessage('Location selected. You can fine-tune the pin on the map.');
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return setMessage('Please describe the issue first.');
    setLoading(true); setMessage('');
    try { await submitCitizenReport({ raw_text: text, latitude: lat, longitude: lng }); setText(''); setMessage('Report submitted. The AI pipeline is processing it; the Command Center will update shortly.'); onSubmitted(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to submit report.'); }
    finally { setLoading(false); }
  };
  return <main style={{ maxWidth: 760, width: 'calc(100% - 40px)', margin: '0 auto 32px' }}>
    <form onSubmit={submit} className="glass-card" style={{ padding: 28 }}>
      <p style={{ color: '#67E8F9', fontWeight: 800, fontSize: '.8rem', letterSpacing: '.08em', textTransform: 'uppercase' }}>Citizen portal</p>
      <h2 style={{ margin: '8px 0 10px', fontSize: '1.65rem' }}>Report a city issue</h2>
      <p style={{ color: '#94A3B8', marginBottom: 22 }}>Your report is analysed, linked to nearby reports, and appears in the Command Center.</p>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={5} placeholder="Example: Water is overflowing from a blocked drain outside the main gate." style={{ width: '100%', background: '#0F172A', border: '1px solid #334155', color: '#fff', borderRadius: 10, padding: 14, fontSize: '.95rem', resize: 'vertical' }} />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '16px 0 10px', color: '#94A3B8', fontSize: '.85rem' }}><MapPin size={17} color="#06B6D4" /> Selected location: <strong style={{ color: '#E2E8F0' }}>{lat.toFixed(5)}, {lng.toFixed(5)}</strong> <button type="button" onClick={useGps} style={{ marginLeft: 'auto', background: 'transparent', color: '#67E8F9', border: '1px solid #155e75', borderRadius: 7, padding: '6px 9px', cursor: 'pointer' }}>Use GPS</button></div>
      <p style={{ color: '#94A3B8', fontSize: '.78rem', marginBottom: 8 }}>Search for a landmark, road, neighbourhood, or address — or click the map to place the pin exactly.</p>
      <div style={{ position: 'relative', display: 'flex', gap: 8, marginBottom: 10 }}>
        <input value={locationQuery} onChange={e => setLocationQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); findLocation(); } }} placeholder="Search location, e.g. Narela Railway Station" style={{ flex: 1, background: '#0F172A', border: '1px solid #334155', borderRadius: 8, color: '#fff', padding: '10px 12px', fontSize: '.82rem' }} />
        <button type="button" onClick={() => findLocation()} disabled={searching} style={{ border: 0, borderRadius: 8, background: '#164e63', color: '#CFFAFE', padding: '0 14px', cursor: 'pointer', fontWeight: 700 }}>{searching ? 'Searching…' : <><Search size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />Search</>}</button>
      </div>
      {results.length > 0 && <div style={{ marginBottom: 10, border: '1px solid #334155', borderRadius: 9, overflow: 'hidden', background: '#111C2E' }}>{results.map(result => <button type="button" key={`${result.latitude}-${result.longitude}`} onClick={() => selectLocation(result)} style={{ display: 'block', width: '100%', textAlign: 'left', border: 0, borderBottom: '1px solid #243149', background: 'transparent', color: '#CBD5E1', padding: '10px 12px', cursor: 'pointer', fontSize: '.78rem' }}><MapPin size={13} color="#06B6D4" style={{ verticalAlign: 'middle', marginRight: 7 }} />{result.name}</button>)}</div>}
      <div style={{ height: 290, overflow: 'hidden', borderRadius: 10, border: '1px solid #334155', marginBottom: 18 }}>
        <MapContainer center={[lat, lng]} zoom={16} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationPicker lat={lat} lng={lng} onChange={(nextLat, nextLng) => { setLat(nextLat); setLng(nextLng); setMessage('Location pin updated from the map.'); }} />
        </MapContainer>
      </div>
      <button disabled={loading} type="submit" style={{ width: '100%', padding: 13, border: 0, borderRadius: 9, cursor: 'pointer', background: '#06B6D4', color: '#06101a', fontWeight: 800 }}>{loading ? 'Submitting…' : <><Send size={16} style={{ verticalAlign: 'middle', marginRight: 7 }} />Submit report</>}</button>
      {message && <p style={{ marginTop: 16, color: message.startsWith('Report') || message.startsWith('GPS') ? '#6EE7B7' : '#FCA5A5', fontSize: '.85rem' }}><CheckCircle2 size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />{message}</p>}
    </form>
  </main>;
}

function LocationPicker({ lat, lng, onChange }: { lat: number; lng: number; onChange: (lat: number, lng: number) => void }) {
  const map = useMap();
  useMapEvents({ click: event => onChange(event.latlng.lat, event.latlng.lng) });
  React.useEffect(() => { map.flyTo([lat, lng], Math.max(map.getZoom(), 16), { animate: true }); }, [lat, lng, map]);
  return <CircleMarker center={[lat, lng]} radius={11} pathOptions={{ color: '#fff', weight: 3, fillColor: '#06B6D4', fillOpacity: 1 }} />;
}
