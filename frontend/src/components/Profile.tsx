import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = React.useState<{ username: string; email: string } | null>(null);

    React.useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
        } else {
            setUser(JSON.parse(storedUser));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        // Optional: Call backend logout endpoint if session based
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, #faf8f5 0%, #f5f1ed 100%)',
            padding: '40px 24px 120px 24px'
        }}>
            <div style={{
                textAlign: 'center',
                maxWidth: '500px'
            }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #c9a961 0%, #d4af37 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    color: 'white',
                    fontWeight: 'bold',
                    margin: '0 auto 24px',
                    boxShadow: '0 8px 24px rgba(201, 169, 97, 0.3)'
                }}>
                    {user.username.charAt(0).toUpperCase()}
                </div>

                <h1 style={{ fontSize: '32px', color: '#3d3d3d', marginBottom: '8px' }}>
                    {user.username}
                </h1>
                <p style={{ fontSize: '16px', color: '#8b8b8b', marginBottom: '32px' }}>
                    {user.email}
                </p>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <Link to="/" style={{
                        display: 'inline-block',
                        padding: '12px 32px',
                        background: 'white',
                        color: '#3d3d3d',
                        textDecoration: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '600',
                        border: '1px solid #e0e0e0',
                        transition: 'all 0.3s'
                    }}>
                        Home
                    </Link>

                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '12px 32px',
                            background: '#ff6b6b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
                            transition: 'all 0.3s'
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
