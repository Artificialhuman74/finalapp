import React from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingDecorations from './FloatingDecorations';
import GradualBlur from './GradualBlur';
import '../App.css'; // Ensure global styles are available

const ComingSoon: React.FC<{ title: string; description: string }> = ({ title, description }) => {
    const navigate = useNavigate();

    return (
        <div className="sylvie-landing" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
            <FloatingDecorations />
            <GradualBlur position="bottom" height="11.475rem" strength={2.5} divCount={6} curve="ease-out" target="page" animated="scroll" />

            <div style={{ zIndex: 10, background: 'rgba(255,255,255,0.8)', padding: '40px', borderRadius: '24px', backdropFilter: 'blur(10px)', maxWidth: '500px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚧</div>
                <h1 style={{ color: '#3d3d3d', marginBottom: '16px' }}>{title}</h1>
                <p style={{ color: '#666', marginBottom: '32px', lineHeight: '1.6' }}>{description}</p>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #9b6b6b 0%, #8a5a5a 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(155, 107, 107, 0.3)',
                        transition: 'transform 0.2s'
                    }}
                >
                    Return Home
                </button>
            </div>
        </div>
    );
};

export default ComingSoon;
