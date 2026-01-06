import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GradualBlur from './GradualBlur';
import FloatingDecorations from './FloatingDecorations';
import '../styles/Landing.css';

// Gradual blur fix - blur stays visible to reveal content on scroll

const Landing: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [direction, setDirection] = useState(0);
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const slides = [
    {
      id: 1,
      title: "Safety Tips for Night Travel",
      description: "Stay safe with our comprehensive night travel guidelines and real-time safety alerts",
      videoUrl: "/videos/video1.mp4",
      gradient: "linear-gradient(135deg, #ffd4d4 0%, #ffb8b8 100%)"
    },
    {
      id: 2,
      title: "How to Use SOS Features",
      description: "Quick access to emergency services with one-touch SOS activation and GPS tracking",
      videoUrl: "/videos/video2.mp4",
      gradient: "linear-gradient(135deg, #ffe4cc 0%, #ffd4b8 100%)"
    },
    {
      id: 3,
      title: "Community Support Guide",
      description: "Connect with others, share experiences, and build a safer community together",
      videoUrl: "/videos/video3.mp4",
      gradient: "linear-gradient(135deg, #e4d4ff 0%, #d4b8ff 100%)"
    }
  ];

  const supportItems = [
    { to: '/safety-tips', icon: '✦', title: 'Safety Tips', desc: 'Quick guidance to stay safer on the go.' },
    { to: '/emergency-contacts', icon: '☎', title: 'Emergency Contacts', desc: 'Reach help fast with curated contacts.' },
    { to: '/safe-routes', icon: '⌖', title: 'Safe Maps', desc: 'Navigate using safer, well-lit paths.' },
    { to: '/fake-call-ai', icon: '◉', title: 'Fake Call', desc: 'Trigger a believable call for cover.' },
    { to: '/sos-tips', icon: '⚡', title: 'SOS Tips', desc: 'Know what to do when seconds matter.' },
    { to: '/community-support', icon: '∞', title: 'Community Support', desc: 'Share and learn with the community.' }
  ];

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  // Auto-rotate slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // Play video when slide changes
  useEffect(() => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented, try again on next interaction
          const playOnInteraction = () => {
            if (videoRef.current) {
              videoRef.current.play();
              document.removeEventListener('touchstart', playOnInteraction);
              document.removeEventListener('click', playOnInteraction);
            }
          };
          document.addEventListener('touchstart', playOnInteraction, { once: true });
          document.addEventListener('click', playOnInteraction, { once: true });
        });
      }
    }
  }, [currentSlide]);

  const maxTilt = 19; // Increased by 30% for more prominent movement
  const handleCardMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0 to 1
    const y = (e.clientY - rect.top) / rect.height; // 0 to 1
    const rotateY = (x - 0.5) * maxTilt;
    const rotateX = (0.5 - y) * maxTilt;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)';
  };

  const handleCardEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget;
    card.style.transition = 'transform 0.18s ease';
  };

  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleProfileClick = () => {
    if (user) {
      setSidebarOpen(!sidebarOpen);
    } else {
      navigate('/login');
    }
  };

  const swipeConfidenceThreshold = 5000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    if (newDirection > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  };

  return (
    <div className="sylvie-landing">
      <FloatingDecorations />
      <GradualBlur position="bottom" height="11.475rem" strength={2.5} divCount={6} curve="ease-out" target="page" animated="scroll" />

      {/* Profile Button - Top Right */}
      <button
        className={`profile-button-fixed ${user ? 'user-logged-in' : ''}`}
        onClick={handleProfileClick}
        style={user ? {
          background: 'linear-gradient(135deg, #c9a961 0%, #d4af37 100%)',
          color: 'white',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          border: 'none',
          boxShadow: '0 4px 12px rgba(201, 169, 97, 0.4)'
        } : {}}
      >
        {user ? (
          user.username.charAt(0).toUpperCase()
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <div className={`profile-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/profile" className="sidebar-item" onClick={() => setSidebarOpen(false)}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
            <span>Profile</span>
          </Link>
          <Link to="/settings" className="sidebar-item" onClick={() => setSidebarOpen(false)}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
            <span>Settings</span>
          </Link>
          <Link to="/my-reports" className="sidebar-item" onClick={() => setSidebarOpen(false)}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
            <span>My Reports</span>
          </Link>

        </nav>
      </div>

      {/* Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Logo Section */}
      <div className="sylvie-logo-section">
        <img
          src="/sylvie-logo.png"
          alt="Sylvie"
          className="sylvie-logo-image"
          onError={(e) => {
            // Fallback to text if image doesn't load
            e.currentTarget.style.display = 'none';
            const fallback = document.createElement('h1');
            fallback.className = 'sylvie-title';
            fallback.textContent = 'Sylvie';
            e.currentTarget.parentElement?.appendChild(fallback);
          }}
        />
      </div>

      {/* Carousel Section */}
      <div className="carousel-section">
        <div className="section-header section-header-center">
          <h2>Our vision of women empowerment</h2>
          <div className="nav-arrows">
            <span onClick={prevSlide}>‹</span>
            <span onClick={nextSlide}>›</span>
          </div>
        </div>
        <div className="carousel-container">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={{
                enter: (direction: number) => ({
                  x: direction > 0 ? 1000 : -1000,
                  opacity: 0
                }),
                center: {
                  zIndex: 1,
                  x: 0,
                  opacity: 1
                },
                exit: (direction: number) => ({
                  zIndex: 0,
                  x: direction < 0 ? 1000 : -1000,
                  opacity: 0
                })
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "tween", duration: 0.3, ease: "easeInOut" },
                opacity: { duration: 0.2 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              dragTransition={{ bounceStiffness: 800, bounceDamping: 40 }}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);

                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="carousel-slide"
            >
              <div className="slide-content">
                <video
                  ref={videoRef}
                  className="slide-video"
                  src={slides[currentSlide].videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  key={slides[currentSlide].id}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="carousel-dots">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            ></span>
          ))}
        </div>
      </div>

      {/* How We Support You Section */}
      <div className="support-section">
        <div className="section-header">
          <h2 className="section-title-center">How we support you</h2>
        </div>
        <div className="support-grid">
          {supportItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="support-card"
              style={{ textDecoration: 'none' }}
              onMouseMove={handleCardMove}
              onMouseLeave={handleCardLeave}
              onMouseEnter={handleCardEnter}
            >
              <div className="support-icon" aria-hidden="true">{item.icon}</div>
              <h3>{item.title}</h3>
              <p className="support-desc">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;
