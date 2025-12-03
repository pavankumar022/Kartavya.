import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

let model = null;

// Initialize the model
export const loadModel = async () => {
  if (!model) {
    try {
      model = await mobilenet.load();
      console.log('✅ AI Model loaded successfully');
    } catch (error) {
      console.error('❌ Error loading model:', error);
    }
  }
  return model;
};

// Severity keywords for civic issues
const severityKeywords = {
  high: [
    'fire', 'flood', 'accident', 'crash', 'emergency', 'danger', 'hazard',
    'broken', 'damaged', 'collapsed', 'leak', 'explosion', 'smoke',
    'debris', 'destruction', 'severe', 'critical', 'unsafe'
  ],
  medium: [
    'pothole', 'crack', 'hole', 'road', 'street', 'traffic', 'light',
    'sign', 'pole', 'wire', 'garbage', 'waste', 'dirt', 'graffiti',
    'fence', 'wall', 'sidewalk', 'pavement'
  ],
  low: [
    'grass', 'tree', 'plant', 'park', 'bench', 'paint', 'minor',
    'small', 'cosmetic', 'maintenance', 'cleaning', 'trim'
  ]
};

// Analyze image and determine severity
export const analyzeImage = async (imageElement) => {
  try {
    // Load model if not already loaded
    const loadedModel = await loadModel();
    if (!loadedModel) {
      throw new Error('Model not loaded');
    }

    // Get predictions from the model
    const predictions = await loadedModel.classify(imageElement);
    console.log('🔍 AI Predictions:', predictions);

    // Analyze predictions for severity
    const severity = determineSeverity(predictions);
    
    // Calculate confidence (average of top 3 predictions)
    const confidence = predictions.slice(0, 3).reduce((sum, pred) => sum + pred.probability, 0) / 3;
    const accuracy = Math.round(confidence * 100);

    return {
      severity,
      accuracy,
      predictions: predictions.slice(0, 3), // Top 3 predictions
      analysis: generateAnalysis(predictions, severity)
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    return {
      severity: 'medium',
      accuracy: 50,
      predictions: [],
      analysis: 'Unable to analyze image. Default severity assigned.',
      error: error.message
    };
  }
};

// Determine severity based on predictions
const determineSeverity = (predictions) => {
  let highScore = 0;
  let mediumScore = 0;
  let lowScore = 0;

  predictions.forEach(pred => {
    const label = pred.className.toLowerCase();
    const probability = pred.probability;

    // Check against severity keywords
    severityKeywords.high.forEach(keyword => {
      if (label.includes(keyword)) highScore += probability * 2;
    });

    severityKeywords.medium.forEach(keyword => {
      if (label.includes(keyword)) mediumScore += probability * 1.5;
    });

    severityKeywords.low.forEach(keyword => {
      if (label.includes(keyword)) lowScore += probability;
    });
  });

  // Additional heuristics based on image characteristics
  // Dark/damaged objects tend to be more severe
  const topPrediction = predictions[0].className.toLowerCase();
  if (topPrediction.includes('damaged') || topPrediction.includes('broken')) {
    highScore += 0.5;
  }

  // Determine final severity
  if (highScore > mediumScore && highScore > lowScore) {
    return 'high';
  } else if (mediumScore > lowScore) {
    return 'medium';
  } else if (highScore === 0 && mediumScore === 0 && lowScore === 0) {
    // No keywords matched, use probability threshold
    if (predictions[0].probability > 0.7) {
      return 'medium';
    }
    return 'low';
  } else {
    return 'low';
  }
};

// Generate human-readable analysis
const generateAnalysis = (predictions, severity) => {
  const topPred = predictions[0];
  const severityText = {
    high: 'URGENT - Requires immediate attention',
    medium: 'MODERATE - Should be addressed soon',
    low: 'LOW PRIORITY - Can be scheduled for routine maintenance'
  };

  return `AI detected: ${topPred.className} (${Math.round(topPred.probability * 100)}% confidence). ${severityText[severity]}.`;
};

// Convert image file to base64 for storage
export const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Create image element from file for analysis
export const createImageElement = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
};
