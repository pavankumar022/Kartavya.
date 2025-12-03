import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Camera, Brain, Users, Trophy } from 'lucide-react';

function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      icon: '🏛️',
      title: 'Welcome to Kartavya',
      quote: '"Your Civic Duty, Your Voice"',
      description: 'Empowering citizens to build better communities together',
      color: '#FF9933',
      showLogo: true
    },
    {
      icon: <Camera size={80} color="#FF9933" />,
      title: 'Report Issues',
      quote: '"Every Report Makes a Difference"',
      description: 'Capture and report civic issues with just a photo',
      color: '#FF9933',
      showLogo: false
    },
    {
      icon: <Brain size={80} color="#1976D2" />,
      title: 'AI-Powered Analysis',
      quote: '"Smart Technology for Smarter Cities"',
      description: 'AI automatically detects severity and prioritizes urgent issues',
      color: '#1976D2',
      showLogo: false
    },
    {
      icon: <Trophy size={80} color="#138808" />,
      title: 'Earn & Compete',
      quote: '"Be the Change, Lead the Board"',
      description: 'Earn points, climb rankings, and inspire your community',
      color: '#138808',
      showLogo: false
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/login');
    }
  };

  const handleSkip = () => {
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #FF9933 0%, #138808 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '550px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: '50px 40px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        textAlign: 'center'
      }}>
        {/* Logo/Icon */}
        <div style={{ marginBottom: '25px' }}>
          {slides[currentSlide].showLogo ? (
            <div style={{
              fontSize: '80px',
              marginBottom: '10px',
              animation: 'fadeIn 0.5s ease-in'
            }}>
              {slides[currentSlide].icon}
            </div>
          ) : (
            <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
              {slides[currentSlide].icon}
            </div>
          )}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: slides[currentSlide].showLogo ? '36px' : '28px',
          fontWeight: '700',
          color: slides[currentSlide].color,
          marginBottom: '15px',
          animation: 'fadeIn 0.6s ease-in'
        }}>
          {slides[currentSlide].title}
        </h1>

        {/* Quote */}
        <p style={{
          fontSize: '18px',
          fontStyle: 'italic',
          color: slides[currentSlide].color,
          fontWeight: '600',
          marginBottom: '20px',
          animation: 'fadeIn 0.7s ease-in'
        }}>
          {slides[currentSlide].quote}
        </p>

        {/* Description */}
        <p style={{
          fontSize: '16px',
          color: '#666',
          lineHeight: '1.6',
          marginBottom: '40px',
          animation: 'fadeIn 0.8s ease-in'
        }}>
          {slides[currentSlide].description}
        </p>

        {/* Dots Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '30px'
        }}>
          {slides.map((slide, index) => (
            <div
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: currentSlide === index ? '30px' : '10px',
                height: '10px',
                borderRadius: '5px',
                backgroundColor: currentSlide === index ? slide.color : '#E0E0E0',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '15px'
        }}>
          <button
            onClick={handleSkip}
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: 'transparent',
              color: '#666',
              border: '2px solid #E0E0E0',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            style={{
              flex: 1,
              padding: '14px',
              backgroundColor: slides[currentSlide].color,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: 'Poppins, sans-serif',
              transition: 'all 0.3s ease'
            }}
          >
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
