import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, AlertTriangle, Loader, Brain, CheckCircle, MapPin } from 'lucide-react';
import { addNotification } from '../utils/notifications';
import { analyzeImageForPriority, getTimeBasedPriority, adjustPriority } from '../utils/aiAnalysis';
import { calculateComprehensivePriority, getQuickPriorityAssessment } from '../utils/comprehensivePriority';
import { generateMockSocialMetrics } from '../utils/socialEngagement';
import { POINTS, getUserAchievements } from '../utils/achievements';
import LocationPicker from '../components/LocationPicker';

const ReportIssue = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    priority: 'medium'
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState(null);
  const [analyzingComprehensive, setAnalyzingComprehensive] = useState(false);
  const imageRef = useRef(null);

  const categories = [
    'Potholes',
    'Garbage',
    'Streetlights (Coming Soon)',
    'Water Leaks (Coming Soon)',
    'Traffic Issues (Coming Soon)',
    'Public Safety (Coming Soon)',
    'Other (Coming Soon)'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      // Generate mock social metrics for demonstration
      const mockSocialMetrics = generateMockSocialMetrics('low');

      const newIssue = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: locationData?.address?.formatted || formData.location,
        coordinates: locationData?.coordinates,
        locationData: locationData,
        priority: formData.priority,
        status: 'open',
        reportedBy: user.id,
        reporterName: user.name,
        reporterEmail: user.email,
        image: image,
        aiAnalysis: aiAnalysis,
        comprehensiveAnalysis: comprehensiveAnalysis,
        socialMetrics: mockSocialMetrics,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage
      const existingIssues = JSON.parse(localStorage.getItem('reportedIssues') || '[]');
      existingIssues.unshift(newIssue);
      localStorage.setItem('reportedIssues', JSON.stringify(existingIssues));

      // Check for new achievements
      const previousAchievements = getUserAchievements(user.id);
      const newAchievements = getUserAchievements(user.id);
      const unlockedAchievements = newAchievements.filter(
        newAch => !previousAchievements.some(prevAch => prevAch.id === newAch.id)
      );

      // Add success notification
      addNotification(
        'Issue Reported Successfully!',
        `Your report "${formData.title}" has been submitted. You earned ${POINTS.REPORT_SUBMITTED} points!`,
        'success'
      );

      // Add achievement notifications
      unlockedAchievements.forEach(achievement => {
        addNotification(
          `🎉 Achievement Unlocked!`,
          `${achievement.icon} ${achievement.name}: ${achievement.description}`,
          'success'
        );
      });

      // Redirect to my reports page
      navigate('/my-reports', { state: { message: 'Issue reported successfully!' } });
    } catch (error) {
      console.error('Failed to report issue:', error);
      addNotification(
        'Report Failed',
        'There was an error submitting your report. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // If category changed and image exists, re-analyze (only for supported categories)
    if (name === 'category' && image && value) {
      const cleanCategory = value.toLowerCase().replace(' (coming soon)', '');
      if (['potholes', 'garbage'].includes(cleanCategory)) {
        await analyzeImageWithAI(image);
      } else {
        // For coming soon categories, show message
        setAiAnalysis({
          priority: 'medium',
          confidence: 0.5,
          analysis: `${value} analysis is coming soon. Using default medium priority.`,
          finalPriority: 'medium'
        });
        setFormData(prev => ({ ...prev, priority: 'medium' }));
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        setImage(event.target.result);

        // Automatically start AI analysis when image is uploaded
        addNotification(
          'Image Uploaded',
          'Starting AI analysis of your image...',
          'info'
        );

        // Auto-analyze if category is selected
        if (formData.category) {
          const cleanCategory = formData.category.toLowerCase().replace(' (coming soon)', '');
          if (['potholes', 'garbage'].includes(cleanCategory)) {
            await analyzeImageWithAI(event.target.result);
          } else {
            // For coming soon categories
            setAiAnalysis({
              priority: 'medium',
              confidence: 0.5,
              analysis: `${formData.category} analysis is coming soon. Using default medium priority.`,
              finalPriority: 'medium'
            });
            setFormData(prev => ({ ...prev, priority: 'medium' }));
            addNotification(
              'Category Coming Soon',
              `AI analysis for ${formData.category} is under development. Using default priority.`,
              'info'
            );
          }
        } else {
          // If no category selected, suggest selecting one for better analysis
          addNotification(
            'Select Category for Better Analysis',
            'Choose a category to get more accurate AI analysis of your image.',
            'info'
          );

          // Try to auto-detect category based on image content
          await autoDetectCategory(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-detect category based on image analysis
  const autoDetectCategory = async (imageDataUrl) => {
    setAnalyzingImage(true);

    try {
      const img = new Image();
      img.onload = async () => {
        try {
          // Try analyzing with both categories to see which fits better
          const garbageAnalysis = await analyzeImageForPriority(img, 'garbage');
          const potholeAnalysis = await analyzeImageForPriority(img, 'potholes');

          // Determine which category is more likely based on confidence
          let suggestedCategory = 'garbage'; // default
          let bestAnalysis = garbageAnalysis;

          if (potholeAnalysis.confidence > garbageAnalysis.confidence) {
            suggestedCategory = 'potholes';
            bestAnalysis = potholeAnalysis;
          }

          // Auto-select the category if confidence is high enough
          if (bestAnalysis.confidence > 0.7) {
            const categoryName = suggestedCategory.charAt(0).toUpperCase() + suggestedCategory.slice(1);
            setFormData(prev => ({ ...prev, category: categoryName }));

            const timeAdjustment = getTimeBasedPriority(categoryName);
            const finalPriority = adjustPriority(bestAnalysis.priority, categoryName, timeAdjustment);

            const fullAnalysis = {
              ...bestAnalysis,
              finalPriority,
              timeAdjustment
            };

            setAiAnalysis(fullAnalysis);
            setFormData(prev => ({ ...prev, priority: finalPriority, category: categoryName }));

            addNotification(
              'Category Auto-Detected',
              `AI detected this as ${categoryName.toLowerCase()} with ${Math.round(bestAnalysis.confidence * 100)}% confidence. Priority set to ${finalPriority.toUpperCase()}.`,
              'success'
            );
          } else {
            // Low confidence, just show suggestion
            addNotification(
              'Category Suggestion',
              `AI suggests this might be ${suggestedCategory}. Please select the correct category for accurate analysis.`,
              'info'
            );
          }
        } catch (error) {
          console.error('Auto-detection error:', error);
          addNotification(
            'Auto-Detection Failed',
            'Could not auto-detect category. Please select one manually.',
            'warning'
          );
        } finally {
          setAnalyzingImage(false);
        }
      };
      img.src = imageDataUrl;
    } catch (error) {
      console.error('Image loading error:', error);
      setAnalyzingImage(false);
    }
  };

  const analyzeImageWithAI = async (imageDataUrl) => {
    if (!formData.category) return;

    setAnalyzingImage(true);

    try {
      // Create image element for AI analysis
      const img = new Image();
      img.onload = async () => {
        try {
          const analysis = await analyzeImageForPriority(img, formData.category);
          const timeAdjustment = getTimeBasedPriority(formData.category);
          const finalPriority = adjustPriority(analysis.priority, formData.category, timeAdjustment);

          const fullAnalysis = {
            ...analysis,
            finalPriority,
            timeAdjustment
          };

          setAiAnalysis(fullAnalysis);
          setFormData(prev => ({ ...prev, priority: finalPriority }));

          // Trigger comprehensive analysis if we have location data
          if (locationData?.coordinates) {
            await runComprehensiveAnalysis(fullAnalysis);
          }

          addNotification(
            'AI Analysis Complete',
            `Priority set to ${finalPriority.toUpperCase()} based on image analysis. ${analysis.analysis}`,
            'success'
          );
        } catch (error) {
          console.error('AI analysis error:', error);
          addNotification(
            'AI Analysis Failed',
            'Could not analyze image. Priority set to medium by default.',
            'warning'
          );
          setFormData(prev => ({ ...prev, priority: 'medium' }));
        } finally {
          setAnalyzingImage(false);
        }
      };
      img.src = imageDataUrl;
    } catch (error) {
      console.error('Image loading error:', error);
      setAnalyzingImage(false);
    }
  };

  // Run comprehensive priority analysis
  const runComprehensiveAnalysis = async (currentAiAnalysis = aiAnalysis) => {
    if (!formData.category || !locationData?.coordinates) return;

    setAnalyzingComprehensive(true);

    try {
      // Create mock issue object for analysis
      const mockSocialMetrics = generateMockSocialMetrics('low');
      const issueForAnalysis = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: locationData.address?.formatted || formData.location,
        coordinates: locationData.coordinates,
        locationData: locationData,
        image: image,
        socialMetrics: mockSocialMetrics,
        aiAnalysis: currentAiAnalysis
      };

      const comprehensive = await calculateComprehensivePriority(issueForAnalysis);
      setComprehensiveAnalysis(comprehensive);

      // Update priority based on comprehensive analysis
      setFormData(prev => ({ ...prev, priority: comprehensive.finalPriority }));

      addNotification(
        'Comprehensive Analysis Complete',
        `Final priority: ${comprehensive.finalPriority.toUpperCase()} (Score: ${comprehensive.priorityScore.toFixed(1)}/4.0)`,
        'success'
      );

      // Show government routing info
      if (comprehensive.governmentRouting) {
        addNotification(
          'Government Routing Determined',
          `Primary department: ${comprehensive.governmentRouting.primaryDepartment}. Estimated response: ${comprehensive.governmentRouting.estimatedResponseTime}`,
          'info'
        );
      }

    } catch (error) {
      console.error('Comprehensive analysis error:', error);
      addNotification(
        'Comprehensive Analysis Failed',
        'Could not complete full analysis. Using basic priority assessment.',
        'warning'
      );
    } finally {
      setAnalyzingComprehensive(false);
    }
  };

  // Handle location selection from LocationPicker
  const handleLocationSelect = async (selectedLocationData) => {
    setLocationData(selectedLocationData);
    setFormData(prev => ({
      ...prev,
      location: selectedLocationData.address?.formatted ||
        `${selectedLocationData.coordinates.lat.toFixed(6)}, ${selectedLocationData.coordinates.lng.toFixed(6)}`
    }));

    addNotification(
      'Location Updated',
      `Location set with ${selectedLocationData.accuracy ? `±${Math.round(selectedLocationData.accuracy)}m` : 'high'} accuracy`,
      'success'
    );

    // Trigger comprehensive analysis if we have AI analysis and category
    if (aiAnalysis && formData.category) {
      await runComprehensiveAnalysis();
    }
  };



  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Report an Issue</h1>
        <p className="text-gray-400">Help improve your community by reporting civic issues</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Issue Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description of the issue"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Enhanced Location Selection */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            📍 Location Selection *
          </label>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              initialLocation={locationData}
            />
          </div>
        </div>

        {/* Comprehensive Priority Assessment */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            🎯 Comprehensive Priority Assessment
          </label>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
            {/* AI Analysis Section */}
            <div className="border-b border-gray-600 pb-3">
              <h4 className="text-white font-medium mb-2 flex items-center">
                <Brain className="w-4 h-4 mr-2" />
                AI Analysis
              </h4>
              {!aiAnalysis && !image ? (
                <div className="flex items-center space-x-2 text-gray-400">
                  <span>Upload an image to get AI-powered analysis</span>
                </div>
              ) : analyzingImage ? (
                <div className="flex items-center space-x-2 text-blue-400">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Analyzing image with AI...</span>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white text-sm">
                      AI Priority: <span className={`uppercase font-bold ${aiAnalysis.finalPriority === 'high' ? 'text-red-400' :
                          aiAnalysis.finalPriority === 'medium' ? 'text-yellow-400' :
                            'text-green-400'
                        }`}>{aiAnalysis.finalPriority}</span>
                    </span>
                    <span className="text-gray-400 text-xs">
                      ({Math.round(aiAnalysis.confidence * 100)}% confidence)
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs">{aiAnalysis.analysis}</p>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-yellow-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Select category first, then upload image</span>
                </div>
              )}
            </div>

            {/* Location Analysis Section */}
            <div className="border-b border-gray-600 pb-3">
              <h4 className="text-white font-medium mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Location Details
              </h4>
              {!locationData?.coordinates ? (
                <div className="flex items-center space-x-2 text-gray-400">
                  <span>Select location to proceed</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white text-sm">Location set successfully</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    <div>{locationData.address?.formatted}</div>
                    <div>Coordinates: {locationData.coordinates.lat.toFixed(6)}, {locationData.coordinates.lng.toFixed(6)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Comprehensive Analysis Section */}
            <div>
              <h4 className="text-white font-medium mb-2 flex items-center">
                🎯 Final Assessment
              </h4>
              {analyzingComprehensive ? (
                <div className="flex items-center space-x-2 text-blue-400">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Running comprehensive analysis...</span>
                </div>
              ) : comprehensiveAnalysis ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">
                      Final Priority: <span className={`uppercase font-bold ${comprehensiveAnalysis.finalPriority === 'critical' ? 'text-red-500' :
                          comprehensiveAnalysis.finalPriority === 'high' ? 'text-red-400' :
                            comprehensiveAnalysis.finalPriority === 'medium' ? 'text-yellow-400' :
                              'text-green-400'
                        }`}>{comprehensiveAnalysis.finalPriority}</span>
                    </span>
                    <span className="text-gray-400 text-sm">
                      (Score: {comprehensiveAnalysis.priorityScore.toFixed(1)}/4.0)
                    </span>
                  </div>

                  {/* Government Routing */}
                  {comprehensiveAnalysis.governmentRouting && (
                    <div className="bg-blue-900/20 rounded-lg p-3 text-sm">
                      <h5 className="text-blue-300 font-medium mb-1">🏛️ Government Routing:</h5>
                      <div className="text-gray-300 space-y-1">
                        <div>Primary: {comprehensiveAnalysis.governmentRouting.primaryDepartment}</div>
                        <div>Response Time: {comprehensiveAnalysis.governmentRouting.estimatedResponseTime}</div>
                        {comprehensiveAnalysis.governmentRouting.specialInstructions.length > 0 && (
                          <div className="text-yellow-300 text-xs">
                            ⚠️ {comprehensiveAnalysis.governmentRouting.specialInstructions.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Key Recommendations */}
                  {comprehensiveAnalysis.recommendations.length > 0 && (
                    <div className="bg-gray-700/50 rounded-lg p-3 text-xs">
                      <h5 className="text-white font-medium mb-2">💡 Key Recommendations:</h5>
                      <ul className="text-gray-300 space-y-1">
                        {comprehensiveAnalysis.recommendations.slice(0, 3).map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-400 text-sm">
                  Complete AI analysis and location data for comprehensive assessment
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Provide more details about the issue..."
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Photo Evidence *
          </label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            {image ? (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    ref={imageRef}
                    src={image}
                    alt="Preview"
                    className="max-w-full h-48 object-cover mx-auto rounded-lg"
                  />
                  {analyzingImage && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <div className="flex items-center space-x-2 text-white">
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>AI Analyzing...</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setAiAnalysis(null);
                      setFormData(prev => ({ ...prev, priority: 'medium' }));
                    }}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove Image
                  </button>
                  {formData.category && !analyzingImage && (
                    <button
                      type="button"
                      onClick={() => analyzeImageWithAI(image)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Re-analyze with AI
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <Camera className="w-12 h-12 text-gray-400" />
                  <Brain className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 mb-2">Upload a photo for AI-powered priority assessment</p>
                  <p className="text-blue-300 text-sm mb-4">
                    Our AI will analyze the image to determine issue severity and priority
                  </p>
                  <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer inline-flex items-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      required
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Submitting...</span>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>Report Issue</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportIssue;