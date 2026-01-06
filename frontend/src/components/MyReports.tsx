import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/MyReports.css';
import FloatingDecorations from './FloatingDecorations';
import GradualBlur from './GradualBlur';

interface Report {
  id: number;
  title: string;
  type: string;
  date: string;
  status: string;
  anonymous: boolean;
  ai_summary?: string;
}

const MyReports: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  const handleNewReport = () => {
    const isLoggedIn = !!localStorage.getItem('user');
    if (!isLoggedIn) {
      alert('Please log in to create a new report');
      navigate('/login');
    } else {
      navigate('/incident-report');
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch(`/api/my-reports`, { credentials: 'include' });
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateLegalReport = async (id: number) => {
    setGeneratingId(id);
    try {
      const res = await fetch(`/api/reports/${id}/generate_legal`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setReports(prev => prev.map(r =>
          r.id === id ? { ...r, ai_summary: data.legal_report } : r
        ));
      } else {
        alert('Failed to generate legal document: ' + data.error);
      }
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Error generating legal document');
    } finally {
      setGeneratingId(null);
    }
  };

  const downloadLegalReport = (id: number) => {
    window.open(`/api/reports/${id}/download_legal`, '_blank');
  };

  const deleteReport = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      await fetch(`/api/reports/${id}`, { method: 'DELETE', credentials: 'include' });
      fetchReports();
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  // Glassmorphism button style (matching Dock aesthetic)
  const glassButton = {
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 248, 245, 0.98) 100%)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
    border: 'none',
    borderRadius: '1rem',
    padding: '12px 24px',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#2d1b69'
  };

  const primaryButton = {
    ...glassButton,
    background: 'linear-gradient(135deg, #c9a961 0%, #d4af37 100%)',
    color: 'white',
    boxShadow: '0 4px 16px rgba(201, 169, 97, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
  };

  const dangerButton = {
    ...glassButton,
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.2)'
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px 20px',
      background: 'linear-gradient(180deg, #fbeff6 0%, #fff8f4 100%)',
      overflowY: 'auto'
    }}>
      <FloatingDecorations />
      <GradualBlur position="bottom" height="11.475rem" strength={2.5} divCount={6} curve="ease-out" target="page" animated="scroll" />

      <div style={{
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {/* Header Container */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}>
          <div>
            <h1 style={{
              margin: '0 0 4px 0',
              fontSize: '32px',
              color: '#2d1b69',
              fontWeight: 800,
              letterSpacing: '-0.02em'
            }}>
              📝 My Reports
            </h1>
            <p style={{
              margin: 0,
              color: '#6b5b8d',
              fontSize: '14px'
            }}>
              Generate legal documents for authorities
            </p>
          </div>

          <button
            onClick={handleNewReport}
            style={{
              ...primaryButton,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              fontSize: '13px'
            }}
          >
            <span>➕</span> New Report
          </button>
        </div>

        {/* Reports List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b5b8d', fontSize: '16px' }}>
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '72px', marginBottom: '20px' }}>📭</div>
            <h3 style={{ margin: '0 0 12px', color: '#2d1b69', fontSize: '22px', fontWeight: 700 }}>No reports yet</h3>
            <p style={{ margin: 0, color: '#6b5b8d', fontSize: '15px' }}>Your incident reports will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reports.map((report) => (
              <div
                key={report.id}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '28px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                  border: '1px solid rgba(240, 230, 246, 0.5)'
                }}
              >
                {/* Report Summary */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '20px',
                      color: '#2d1b69',
                      fontWeight: 700,
                      letterSpacing: '-0.01em'
                    }}>
                      {report.title || 'Incident Report'}
                    </h3>
                    <span style={{
                      fontSize: '11px',
                      padding: '6px 14px',
                      borderRadius: '12px',
                      background: report.status === 'submitted' ? 'rgba(201, 169, 97, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: report.status === 'submitted' ? '#c9a961' : '#059669',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {report.status}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '14px',
                    color: '#9ca3af',
                    display: 'flex',
                    gap: '16px',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      📅 {report.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      🏷️ {report.type}
                    </span>
                    {report.anonymous && (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#c9a961',
                        fontWeight: 600
                      }}>
                        🔒 Anonymous
                      </span>
                    )}
                  </div>
                </div>

                {/* Legal Document Section */}
                <div style={{
                  padding: '24px',
                  background: 'linear-gradient(180deg, rgba(251, 239, 246, 0.3) 0%, rgba(255, 248, 244, 0.5) 100%)',
                  borderRadius: '16px',
                  border: '1px solid rgba(201, 169, 97, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '16px'
                  }}>
                    <span style={{ fontSize: '24px' }}>⚖️</span>
                    <h4 style={{
                      margin: 0,
                      fontSize: '17px',
                      color: '#2d1b69',
                      fontWeight: 700,
                      letterSpacing: '-0.01em'
                    }}>
                      Legal Complaint / FIR Draft
                    </h4>
                  </div>

                  {report.ai_summary ? (
                    <div>
                      <p style={{
                        fontSize: '14px',
                        color: '#059669',
                        marginBottom: '16px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span style={{ fontSize: '16px' }}>✓</span> Legal document generated successfully
                      </p>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => downloadLegalReport(report.id)}
                          style={{
                            ...primaryButton,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span>📥</span> Download Document
                        </button>
                        <button
                          onClick={() => generateLegalReport(report.id)}
                          disabled={generatingId === report.id}
                          style={{
                            ...glassButton,
                            opacity: generatingId === report.id ? 0.6 : 1,
                            cursor: generatingId === report.id ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span>🔄</span> Regenerate
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        marginBottom: '20px',
                        lineHeight: '1.6'
                      }}>
                        Generate a formal <strong style={{ color: '#2d1b69' }}>Complaint / FIR Draft</strong> in accordance with Indian legal standards.
                        This AI-generated document includes proper structure with complainant details, incident description,
                        and requests suitable for submission to police authorities.
                      </p>
                      <button
                        onClick={() => generateLegalReport(report.id)}
                        disabled={generatingId === report.id}
                        style={{
                          ...primaryButton,
                          opacity: generatingId === report.id ? 0.7 : 1,
                          cursor: generatingId === report.id ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        {generatingId === report.id ? (
                          <>
                            <span>⚙️</span> Generating...
                          </>
                        ) : (
                          <>
                            <span>✨</span> Generate Legal Document
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Delete Action */}
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => deleteReport(report.id)}
                    style={{
                      ...dangerButton,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>🗑️</span> Delete Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReports;
