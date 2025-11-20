import { useEffect, useState } from 'react';
import { PipelineStage } from '../models/types';
import { fetchPipeline } from '../services/api';

export function RecruitmentPage() {
  const [stages, setStages] = useState<PipelineStage[]>([]);

  useEffect(() => {
    fetchPipeline().then(setStages);
  }, []);

  return (
    <div className="card-grid">
      {stages.map((stage) => (
        <div key={stage.id} className="card">
          <div className="section-title">{stage.title}</div>
          {stage.candidates.map((candidate, idx) => (
            <div key={idx} className="card" style={{ background: '#f8fafc' }}>
              <div style={{ fontWeight: 700 }}>{candidate.name}</div>
              <div style={{ color: '#475569' }}>{candidate.role}</div>
              <div className="badge">{candidate.status}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
