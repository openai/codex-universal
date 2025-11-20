import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useGeoValidation } from '../hooks/useGeoValidation';
import { useSelfieValidation } from '../hooks/useSelfieValidation';
import { ClockEvent } from '../models/types';
import { fetchClockEvents, recordClockEvent } from '../services/api';

export function ClockPage() {
  const { user } = useAuth();
  const geo = useGeoValidation();
  const selfie = useSelfieValidation();
  const [events, setEvents] = useState<ClockEvent[]>([]);
  const [type, setType] = useState<'in' | 'out'>('in');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClockEvents(user?.id).then(setEvents);
  }, [user?.id]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const event = await recordClockEvent({
      userId: user.id,
      timestamp: new Date().toISOString(),
      type,
      lat: geo.lat,
      lng: geo.lng,
      selfieUrl: selfie.selfieUrl,
      validated: Boolean(geo.lat && geo.lng && selfie.selfieUrl),
    });
    setEvents([event, ...events]);
    setSaving(false);
    setNotes('');
  }

  return (
    <div className="card-grid">
      <div className="card">
        <div className="section-title">Mobile-first clock</div>
        <form onSubmit={submit}>
          <div className="form-control">
            <label>Action</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <button type="button" className="btn" onClick={() => setType('in')} disabled={type === 'in'}>
                Clock in
              </button>
              <button type="button" className="btn secondary" onClick={() => setType('out')} disabled={type === 'out'}>
                Clock out
              </button>
            </div>
          </div>

          <div className="form-control">
            <label>GPS validation</label>
            <div className="status-pill">
              {geo.loading ? 'Fetching...' : geo.error ? geo.error : `${geo.lat?.toFixed(3)}, ${geo.lng?.toFixed(3)}`}
            </div>
          </div>

          <div className="form-control">
            <label>Selfie verification</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button type="button" className="btn" onClick={() => selfie.captureSelfie()} style={{ width: 'auto' }}>
                Capture selfie
              </button>
              {selfie.selfieUrl && (
                <img src={selfie.selfieUrl} alt="Selfie placeholder" style={{ width: 64, height: 64, borderRadius: '0.75rem' }} />
              )}
            </div>
          </div>

          <div className="form-control">
            <label>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional context for supervisors" />
          </div>

          <button className="btn" type="submit" disabled={saving || !user}>
            {saving ? 'Saving...' : `Confirm clock-${type}`}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="section-title">Latest activity</div>
        {events.length === 0 && <div>No entries yet.</div>}
        {events.map((event) => (
          <div key={event.id} className="card" style={{ background: '#f8fafc' }}>
            <div className="status-pill">
              {event.type === 'in' ? '⬆' : '⬇'} {new Date(event.timestamp).toLocaleString()}
            </div>
            <div style={{ marginTop: '0.35rem' }}>
              GPS: {event.lat?.toFixed(4)}, {event.lng?.toFixed(4)}
            </div>
            {event.selfieUrl && <div className="badge">Selfie captured</div>}
            {event.validated && <div className="badge">Validated</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
