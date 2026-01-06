import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GradualBlur from './GradualBlur';
import FloatingDecorations from './FloatingDecorations';

interface SOSVideo {
    id: number;
    trigger_time: string;
    video_url: string;
    location: string;
    battery_level: number;
}

const SOSVideos: React.FC = () => {
    const navigate = useNavigate();
    const [videos, setVideos] = useState<SOSVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await fetch('/api/sos-videos', {
                    credentials: 'include'
                });
                const data = await response.json();

                if (data.success) {
                    setVideos(data.videos);
                    if (!data.videos?.length && data.message) {
                        setError(data.message);
                    }
                } else {
                    setError(data.error || 'Failed to fetch videos');
                }
            } catch (err) {
                setError('Network error. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #faf8f5 0%, #f5f1ed 100%)',
            position: 'relative',
            overflow: 'hidden',
            paddingBottom: '80px'
        }}>
            <FloatingDecorations />
            <GradualBlur position="top" height="120px" strength={1.5} divCount={4} target="page" />

            {/* Header */}
            <div style={{
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                zIndex: 10
            }}>
                <button
                    onClick={() => navigate('/profile')}
                    style={{
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        marginRight: '16px'
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3d3d3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#3d3d3d',
                    margin: 0
                }}>
                    SOS Recordings
                </h1>
            </div>

            {/* Content */}
            <div style={{ padding: '0 24px', position: 'relative', zIndex: 5 }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#8b8b8b' }}>
                        Loading videos...
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#ff6b6b' }}>
                        {error}
                    </div>
                ) : videos.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#8b8b8b',
                        background: 'rgba(255,255,255,0.6)',
                        borderRadius: '24px',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.8)'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📹</div>
                        <h3 style={{ margin: '0 0 8px 0', color: '#3d3d3d' }}>No Recordings Yet</h3>
                        <p style={{ margin: 0 }}>Videos recorded during SOS alerts will appear here.</p>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '20px'
                    }}>
                        {videos.map((video) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                                    border: '1px solid rgba(0,0,0,0.03)'
                                }}
                            >
                                <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
                                    <video
                                        controls
                                        playsInline
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    >
                                        <source
                                            src={video.video_url}
                                            type={video.video_url.endsWith('.mp4') ? "video/mp4" : "video/webm"}
                                        />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                                <div style={{ padding: '16px' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '8px'
                                    }}>
                                        <span style={{
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: '#ff6b6b',
                                            background: 'rgba(255, 107, 107, 0.1)',
                                            padding: '4px 8px',
                                            borderRadius: '8px'
                                        }}>
                                            SOS ALERT
                                        </span>
                                        <span style={{ fontSize: '12px', color: '#8b8b8b' }}>
                                            {new Date(video.trigger_time).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#3d3d3d',
                                        margin: '0 0 8px 0'
                                    }}>
                                        {new Date(video.trigger_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '13px' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {video.location}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SOSVideos;
