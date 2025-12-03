import React, { useState, useEffect } from 'react';
import { MapPin, Camera, Send, AlertCircle, Loader, Navigation } from 'lucide-react';
import { analyzeImage, createImageElement, imageToBase64 } from '../utils/imageAnalysis';
import { addReport } from '../utils/reports';
import { getCurrentUser, updateUserStats } from '../utils/auth';
import { getCurrentPosition, getAddressFromCoordinates, formatCoordinates, getGoogleMapsLink, getOpenStreetMapLink } from '../utils/geolocation';
import { useNavigate } from 'react-router-dom';

function Report() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [geoTag, setGeoTag] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert('Please login to report an issue');
      return;
    }

    try {
      // Convert image to base64 if exists
      let imageData = null;
      if (imageFile) {
        imageData = await imageToBase64(imageFile);
      }

      // Create report
      const reportData = {
        ...formData,
        userId: currentUser.id,
        userName: currentUser.name,
        image: imageData,
        severity: aiAnalysis?.severity || 'medium',
        aiAnalysis: aiAnalysis?.analysis || 'No image analysis available',
        accuracy: aiAnalysis?.accuracy || 0,
        geoTag: geoTag || null
      };

      addReport(reportData);

      // Update user stats
      const currentStats = currentUser.stats;
      updateUserStats({
        totalReports: currentStats.totalReports + 1,
        points: currentStats.points + 20 // +20 points for reporting
      });

      alert('Issue reported successfully! +20 points earned');
      navigate('/my-reports');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    
    // Analyze image with AI
    setAnalyzing(true);
    setAiAnalysis(null);

    try {
      const imgElement = await createImageElement(file);
      const analysis = await analyzeImage(imgElement);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setAiAnalysis({
        severity: 'medium',
        accuracy: 50,
        analysis: 'Unable to analyze image automatically. Please provide details.',
        error: error.message
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGetLocation = async () => {
    setGettingLocation(true);
    setLocationError('');

    try {
      // Get current position
      const position = await getCurrentPosition();
      
      // Get address from coordinates
      const address = await getAddressFromCoordinates(
        position.latitude,
        position.longitude
      );

      // Update location field
      setFormData({
        ...formData,
        location: address.formatted
      });

      // Store geotag data
      setGeoTag({
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        formatted: address.formatted,
        coordinates: formatCoordinates(position.latitude, position.longitude),
        googleMapsLink: getGoogleMapsLink(position.latitude, position.longitude),
        osmLink: getOpenStreetMapLink(position.latitude, position.longitude),
        details: address.details,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Location error:', error);
      setLocationError(error.message);
    } finally {
      setGettingLocation(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ 
        fontSize: '28px', 
        fontWeight: '700', 
        color: '#000080',
        marginBottom: '10px'
      }}>
        Report an Issue
      </h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Help improve your community by reporting civic issues
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontWeight: '600', 
            marginBottom: '8px',
            color: '#000080'
          }}>
            Issue Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Brief description of the issue"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #E0E0E0',
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: 'Poppins, sans-serif'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontWeight: '600', 
            marginBottom: '8px',
            color: '#000080'
          }}>
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #E0E0E0',
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            <option value="">Select a category</option>
            <option value="roads">Roads & Infrastructure</option>
            <option value="water">Water Supply</option>
            <option value="electricity">Electricity</option>
            <option value="sanitation">Sanitation</option>
            <option value="safety">Public Safety</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontWeight: '600', 
            marginBottom: '8px',
            color: '#000080'
          }}>
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Provide detailed information about the issue"
            rows="5"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #E0E0E0',
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: 'Poppins, sans-serif',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontWeight: '600', 
            marginBottom: '8px',
            color: '#000080'
          }}>
            <MapPin size={18} style={{ display: 'inline', marginRight: '5px' }} />
            Location *
          </label>
          
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Enter location or use GPS"
              style={{
                width: '100%',
                padding: '12px',
                paddingRight: '120px',
                border: '2px solid #E0E0E0',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'Poppins, sans-serif'
              }}
            />
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={gettingLocation}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '8px 16px',
                backgroundColor: gettingLocation ? '#E0E0E0' : '#138808',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: gettingLocation ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'Poppins, sans-serif'
              }}
            >
              {gettingLocation ? (
                <>
                  <Loader size={16} className="spinning" />
                  Getting...
                </>
              ) : (
                <>
                  <Navigation size={16} />
                  GPS
                </>
              )}
            </button>
          </div>

          {/* GeoTag Info */}
          {geoTag && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: '#E8F5E9',
              border: '2px solid #138808',
              borderRadius: '8px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                color: '#138808',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                <MapPin size={16} />
                GeoTag Captured
              </div>
              <div style={{ fontSize: '13px', color: '#2E7D32', marginBottom: '6px' }}>
                📍 {geoTag.formatted}
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Coordinates: {geoTag.coordinates}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={geoTag.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '12px',
                    color: '#1976D2',
                    textDecoration: 'none',
                    fontWeight: '600'
                  }}
                >
                  📍 View on Google Maps
                </a>
                <span style={{ color: '#E0E0E0' }}>|</span>
                <a
                  href={geoTag.osmLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '12px',
                    color: '#1976D2',
                    textDecoration: 'none',
                    fontWeight: '600'
                  }}
                >
                  🗺️ OpenStreetMap
                </a>
              </div>
            </div>
          )}

          {/* Location Error */}
          {locationError && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: '#FFEBEE',
              border: '2px solid #D32F2F',
              borderRadius: '8px',
              color: '#D32F2F',
              fontSize: '14px'
            }}>
              ⚠️ {locationError}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ 
            display: 'block', 
            fontWeight: '600', 
            marginBottom: '8px',
            color: '#000080'
          }}>
            <Camera size={18} style={{ display: 'inline', marginRight: '5px' }} />
            Add Photo (AI Analysis Enabled)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #E0E0E0',
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: 'Poppins, sans-serif'
            }}
          />
          
          {/* Image Preview */}
          {imagePreview && (
            <div style={{
              marginTop: '15px',
              border: '2px solid #E0E0E0',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{
                  width: '100%',
                  maxHeight: '300px',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}

          {/* AI Analysis Loading */}
          {analyzing && (
            <div style={{
              marginTop: '15px',
              padding: '15px',
              backgroundColor: '#FFF3E0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#FF9933'
            }}>
              <Loader size={20} className="spinning" />
              <span style={{ fontWeight: '600' }}>AI is analyzing the image...</span>
            </div>
          )}

          {/* AI Analysis Results */}
          {aiAnalysis && !analyzing && (
            <div style={{
              marginTop: '15px',
              padding: '20px',
              backgroundColor: aiAnalysis.severity === 'high' ? '#FFEBEE' : 
                             aiAnalysis.severity === 'medium' ? '#FFF3E0' : '#E8F5E9',
              border: `2px solid ${aiAnalysis.severity === 'high' ? '#D32F2F' : 
                                   aiAnalysis.severity === 'medium' ? '#FF9933' : '#138808'}`,
              borderRadius: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px'
              }}>
                <AlertCircle size={24} color={
                  aiAnalysis.severity === 'high' ? '#D32F2F' : 
                  aiAnalysis.severity === 'medium' ? '#FF9933' : '#138808'
                } />
                <div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: aiAnalysis.severity === 'high' ? '#D32F2F' : 
                           aiAnalysis.severity === 'medium' ? '#FF9933' : '#138808',
                    textTransform: 'uppercase'
                  }}>
                    {aiAnalysis.severity} Severity
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    fontWeight: '600'
                  }}>
                    AI Confidence: {aiAnalysis.accuracy}%
                  </div>
                </div>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#333',
                lineHeight: '1.6',
                margin: 0
              }}>
                {aiAnalysis.analysis}
              </p>
              
              {aiAnalysis.predictions && aiAnalysis.predictions.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#666',
                    marginBottom: '8px'
                  }}>
                    AI Detected:
                  </div>
                  {aiAnalysis.predictions.map((pred, idx) => (
                    <div key={idx} style={{
                      fontSize: '12px',
                      color: '#666',
                      marginBottom: '4px'
                    }}>
                      • {pred.className} ({Math.round(pred.probability * 100)}%)
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#FF9933',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          <Send size={20} />
          Submit Report
        </button>
      </form>
    </div>
  );
}

export default Report;
