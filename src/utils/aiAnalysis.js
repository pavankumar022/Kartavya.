import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

let model = null;

// Initialize TensorFlow.js and the AI model
export const initializeAI = async () => {
  try {
    if (!model) {
      console.log('Initializing TensorFlow.js...');
      await tf.ready();
      console.log('TensorFlow.js ready. Loading COCO-SSD model...');
      model = await cocoSsd.load({
        base: 'mobilenet_v2' // Use MobileNet v2 for better accuracy
      });
      console.log('AI model loaded successfully');
    }
    return model;
  } catch (error) {
    console.error('Failed to load AI model:', error);
    return null;
  }
};

// Advanced image processing utilities
const createCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const getImageData = (imageElement) => {
  const canvas = createCanvas(imageElement.width || imageElement.naturalWidth, 
                             imageElement.height || imageElement.naturalHeight);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageElement, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

// Edge detection for pothole analysis (future enhancement)
// const detectEdges = (imageData) => { ... }

// Legacy color analysis (replaced by analyzeColorsAdvanced)
// const analyzeColors = (imageData) => { ... }

// RGB to HSV conversion
const rgbToHsv = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  if (diff !== 0) {
    if (max === r) h = ((g - b) / diff) % 6;
    else if (max === g) h = (b - r) / diff + 2;
    else h = (r - g) / diff + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  
  const s = max === 0 ? 0 : diff / max;
  const v = max;
  
  return { h, s, v };
};

// TensorFlow.js edge detection
const detectEdgesWithTF = async (imageTensor) => {
  // Convert to grayscale and ensure float32 type
  const grayscale = tf.image.rgbToGrayscale(imageTensor).cast('float32');
  
  // Apply Sobel edge detection with float32 kernels
  const sobelX = tf.tensor2d([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], [3, 3], 'float32').expandDims(2).expandDims(3);
  const sobelY = tf.tensor2d([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], [3, 3], 'float32').expandDims(2).expandDims(3);
  
  const edgesX = tf.conv2d(grayscale.expandDims(0), sobelX, 1, 'same');
  const edgesY = tf.conv2d(grayscale.expandDims(0), sobelY, 1, 'same');
  
  // Calculate magnitude
  const magnitude = tf.sqrt(tf.add(tf.square(edgesX), tf.square(edgesY)));
  
  // Calculate edge intensity (average magnitude)
  const edgeIntensity = await magnitude.mean().data();
  
  // Clean up intermediate tensors
  grayscale.dispose();
  sobelX.dispose();
  sobelY.dispose();
  edgesX.dispose();
  edgesY.dispose();
  
  return {
    tensor: magnitude,
    edgeIntensity: edgeIntensity[0] / 255 // Normalize to 0-1
  };
};

// Advanced garbage analysis with volume estimation and waste classification
const analyzeGarbageComposition = (imageData) => {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  const wasteTypes = {
    plastic: { pixels: 0, regions: [], volume: 0 },
    organic: { pixels: 0, regions: [], volume: 0 },
    metal: { pixels: 0, regions: [], volume: 0 },
    paper: { pixels: 0, regions: [], volume: 0 },
    glass: { pixels: 0, regions: [], volume: 0 },
    textile: { pixels: 0, regions: [], volume: 0 },
    electronic: { pixels: 0, regions: [], volume: 0 },
    mixed: { pixels: 0, regions: [], volume: 0 }
  };
  
  let totalGarbagePixels = 0;
  const garbageMap = new Array(width * height).fill(null);
  
  // First pass: Classify each pixel by waste type
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const alpha = data[idx + 3];
      
      if (alpha < 128) continue;
      
      const hsv = rgbToHsv(r, g, b);
      const brightness = (r + g + b) / 3;
      const colorVariance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
      
      let wasteType = null;
      
      // Enhanced waste classification
      if (hsv.s > 0.8 && hsv.v > 0.6 && colorVariance > 100) {
        // Bright, saturated colors = plastic bottles, bags, containers
        wasteType = 'plastic';
      } else if (brightness < 50 && hsv.s < 0.2 && colorVariance < 20) {
        // Very dark, low saturation, low variance = likely black plastic bags
        wasteType = 'plastic';
      } else if (hsv.h >= 15 && hsv.h <= 45 && hsv.s > 0.4) {
        // Brown/orange tones = organic waste, food scraps
        wasteType = 'organic';
      } else if (hsv.h >= 60 && hsv.h <= 120 && hsv.s > 0.3) {
        // Green tones = organic waste, vegetables
        wasteType = 'organic';
      } else if (brightness < 60 && hsv.s < 0.2 && colorVariance < 30) {
        // Dark, low saturation, uniform = metal cans, containers
        wasteType = 'metal';
      } else if (brightness > 200 && hsv.s < 0.15 && colorVariance < 40) {
        // Very light, low saturation = paper, cardboard
        wasteType = 'paper';
      } else if (hsv.s < 0.1 && brightness > 150 && colorVariance < 20) {
        // Transparent/reflective = glass
        wasteType = 'glass';
      } else if (hsv.s > 0.3 && brightness > 80 && brightness < 180) {
        // Moderate saturation and brightness = textiles, fabric
        wasteType = 'textile';
      } else if ((r > 100 && g > 100 && b > 100) && colorVariance > 50) {
        // Mixed colors, moderate brightness = electronic waste
        wasteType = 'electronic';
      } else if (colorVariance > 60 || brightness < 40) {
        // High variance or very dark = mixed waste
        wasteType = 'mixed';
      }
      
      if (wasteType) {
        wasteTypes[wasteType].pixels++;
        garbageMap[y * width + x] = wasteType;
        totalGarbagePixels++;
      }
    }
  }
  
  // Second pass: Analyze regions and estimate volume
  const visited = new Array(width * height).fill(false);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const wasteType = garbageMap[idx];
      
      if (wasteType && !visited[idx]) {
        const region = analyzeGarbageRegion(garbageMap, visited, width, height, x, y, wasteType);
        if (region.size > 5) { // Minimum size threshold
          wasteTypes[wasteType].regions.push(region);
          // Estimate volume based on region size and apparent density
          const estimatedVolume = estimateWasteVolume(region, wasteType);
          wasteTypes[wasteType].volume += estimatedVolume;
        }
      }
    }
  }
  
  // Calculate percentages and metrics
  const totalPixels = width * height;
  const garbageCoverage = totalGarbagePixels / totalPixels;
  
  const composition = {};
  const volumeDistribution = {};
  let totalVolume = 0;
  
  for (const [type, data] of Object.entries(wasteTypes)) {
    const percentage = totalGarbagePixels > 0 ? (data.pixels / totalGarbagePixels) * 100 : 0;
    composition[type] = {
      percentage: Math.round(percentage * 10) / 10,
      pixelCount: data.pixels,
      regionCount: data.regions.length,
      volume: data.volume
    };
    totalVolume += data.volume;
  }
  
  // Calculate volume distribution
  for (const [type, data] of Object.entries(composition)) {
    volumeDistribution[type] = totalVolume > 0 ? Math.round((data.volume / totalVolume) * 1000) / 10 : 0;
  }
  
  return {
    totalGarbagePixels,
    garbageCoverage,
    composition,
    volumeDistribution,
    totalVolume,
    dominantWasteType: getDominantWasteType(composition),
    wasteComplexity: calculateWasteComplexity(composition),
    estimatedWeight: estimateWasteWeight(composition, totalVolume)
  };
};

// Analyze individual garbage regions
const analyzeGarbageRegion = (garbageMap, visited, width, height, startX, startY, wasteType) => {
  const stack = [[startX, startY]];
  const region = { 
    size: 0, 
    minX: startX, maxX: startX, 
    minY: startY, maxY: startY,
    density: 0,
    shape: 'irregular'
  };
  
  while (stack.length > 0) {
    const [x, y] = stack.pop();
    const idx = y * width + x;
    
    if (x < 0 || x >= width || y < 0 || y >= height || 
        visited[idx] || garbageMap[idx] !== wasteType) {
      continue;
    }
    
    visited[idx] = true;
    region.size++;
    region.minX = Math.min(region.minX, x);
    region.maxX = Math.max(region.maxX, x);
    region.minY = Math.min(region.minY, y);
    region.maxY = Math.max(region.maxY, y);
    
    // Add neighbors
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  
  // Calculate region properties
  region.width = region.maxX - region.minX + 1;
  region.height = region.maxY - region.minY + 1;
  region.density = region.size / (region.width * region.height);
  
  // Determine shape
  const aspectRatio = region.width / region.height;
  if (aspectRatio > 2 || aspectRatio < 0.5) {
    region.shape = 'elongated';
  } else if (region.density > 0.8) {
    region.shape = 'compact';
  } else {
    region.shape = 'scattered';
  }
  
  return region;
};

// Estimate volume based on region and waste type
const estimateWasteVolume = (region, wasteType) => {
  const baseVolume = region.size; // Base on pixel area
  
  // Volume multipliers based on waste type (3D estimation)
  const volumeMultipliers = {
    plastic: 1.5,    // Bottles, containers have volume
    organic: 0.8,    // Food waste is often flat
    metal: 1.2,      // Cans have volume but are compact
    paper: 0.5,      // Paper is usually flat
    glass: 1.3,      // Bottles, jars have volume
    textile: 2.0,    // Clothes, fabric are bulky
    electronic: 1.8, // Electronics have significant volume
    mixed: 1.0       // Average volume
  };
  
  // Shape multipliers
  const shapeMultipliers = {
    compact: 1.5,    // Dense objects likely have more volume
    elongated: 1.0,  // Linear objects
    scattered: 0.7   // Spread out objects
  };
  
  const typeMultiplier = volumeMultipliers[wasteType] || 1.0;
  const shapeMultiplier = shapeMultipliers[region.shape] || 1.0;
  const densityMultiplier = Math.max(region.density, 0.3);
  
  return baseVolume * typeMultiplier * shapeMultiplier * densityMultiplier;
};

// Get dominant waste type
const getDominantWasteType = (composition) => {
  let maxPercentage = 0;
  let dominantType = 'mixed';
  
  for (const [type, data] of Object.entries(composition)) {
    if (data.percentage > maxPercentage) {
      maxPercentage = data.percentage;
      dominantType = type;
    }
  }
  
  return { type: dominantType, percentage: maxPercentage };
};

// Calculate waste complexity (how mixed the waste is)
const calculateWasteComplexity = (composition) => {
  const nonZeroTypes = Object.values(composition).filter(data => data.percentage > 5).length;
  
  if (nonZeroTypes <= 1) return 'simple';
  if (nonZeroTypes <= 3) return 'moderate';
  return 'complex';
};

// Estimate total weight based on composition and volume
const estimateWasteWeight = (composition, totalVolume) => {
  // Density estimates (kg per volume unit)
  const densities = {
    plastic: 0.3,
    organic: 0.8,
    metal: 2.5,
    paper: 0.4,
    glass: 1.2,
    textile: 0.2,
    electronic: 1.5,
    mixed: 0.6
  };
  
  let totalWeight = 0;
  for (const [type, data] of Object.entries(composition)) {
    const density = densities[type] || 0.6;
    totalWeight += data.volume * density;
  }
  
  return Math.round(totalWeight * 100) / 100; // Round to 2 decimal places
};

// TensorFlow.js object analysis (future enhancement)
// const analyzeObjectsWithTF = async (imageTensor, predictions) => { ... }

// Advanced pothole analysis with depth, width, and area measurement
const analyzePotholeGeometry = (imageData) => {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  let roadPixels = 0;
  let potholePixels = 0;
  let crackPixels = 0;
  let garbagePixels = 0;
  // Analysis arrays for future use
  // let potholeRegions = [];
  // let crackLines = [];
  
  // Create binary maps for different features
  const roadMap = new Array(width * height).fill(false);
  const potholeMap = new Array(width * height).fill(false);
  const crackMap = new Array(width * height).fill(false);
  const garbageMap = new Array(width * height).fill(false);
  
  // First pass: Identify different surface types
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const gray = (r + g + b) / 3;
      
      // Road surface detection (grayish, uniform colors)
      const colorVariance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
      const isRoadLike = colorVariance < 50 && gray > 40 && gray < 180;
      
      if (isRoadLike) {
        roadMap[y * width + x] = true;
        roadPixels++;
        
        // Pothole detection (dark depressions in road)
        if (gray < 70) {
          // Check if this is part of a depression (darker than surroundings)
          let surroundingBrightness = 0;
          let surroundingCount = 0;
          
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const ny = y + dy;
              const nx = x + dx;
              if (ny >= 0 && ny < height && nx >= 0 && nx < width && (dx !== 0 || dy !== 0)) {
                const nIdx = (ny * width + nx) * 4;
                const nGray = (data[nIdx] + data[nIdx + 1] + data[nIdx + 2]) / 3;
                surroundingBrightness += nGray;
                surroundingCount++;
              }
            }
          }
          
          const avgSurrounding = surroundingBrightness / surroundingCount;
          if (gray < avgSurrounding - 25) { // Significantly darker than surroundings
            potholeMap[y * width + x] = true;
            potholePixels++;
          }
        }
        
        // Crack detection (linear dark features)
        if (gray < 100) {
          // Check for linear patterns
          const isLinear = checkLinearPattern(data, width, height, x, y);
          if (isLinear) {
            crackMap[y * width + x] = true;
            crackPixels++;
          }
        }
      } else {
        // Non-road pixels might be garbage/debris
        const isGarbageLike = (
          (colorVariance > 80) || // Colorful objects
          (r > 150 && g < 100 && b < 100) || // Red objects
          (g > 150 && r < 100 && b < 100) || // Green objects
          (b > 150 && r < 100 && g < 100) || // Blue objects
          (r > 200 && g > 200 && b > 200) || // White objects
          (r < 50 && g < 50 && b < 50) // Very dark objects
        );
        
        if (isGarbageLike) {
          garbageMap[y * width + x] = true;
          garbagePixels++;
        }
      }
    }
  }
  
  // Analyze pothole regions (connected components)
  const potholeAnalysis = analyzePotholeRegions(potholeMap, width, height);
  
  // Calculate measurements
  const totalPixels = width * height;
  const roadCoverage = roadPixels / totalPixels;
  const potholeAreaRatio = potholePixels / Math.max(roadPixels, 1);
  const crackDensity = crackPixels / Math.max(roadPixels, 1);
  const garbagePresence = garbagePixels / totalPixels;
  
  return {
    roadCoverage,
    potholeAreaRatio,
    crackDensity,
    garbagePresence,
    potholeCount: potholeAnalysis.count,
    averagePotholeSize: potholeAnalysis.averageSize,
    largestPotholeSize: potholeAnalysis.largestSize,
    potholeDepthIndicator: potholeAnalysis.averageDepth,
    totalDamagedArea: (potholePixels + crackPixels) / Math.max(roadPixels, 1),
    surfaceQuality: calculateSurfaceQuality(roadMap, data, width, height)
  };
};

// Check for linear crack patterns
const checkLinearPattern = (data, width, height, x, y) => {
  const directions = [
    [0, 1], [1, 0], [1, 1], [-1, 1] // horizontal, vertical, diagonal
  ];
  
  for (const [dx, dy] of directions) {
    let lineLength = 0;
    let darkPixels = 0;
    
    // Check in both directions
    for (let i = -3; i <= 3; i++) {
      const nx = x + i * dx;
      const ny = y + i * dy;
      
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const idx = (ny * width + nx) * 4;
        const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        lineLength++;
        if (gray < 100) darkPixels++;
      }
    }
    
    // If most pixels in line are dark, it's likely a crack
    if (lineLength >= 5 && darkPixels / lineLength > 0.6) {
      return true;
    }
  }
  
  return false;
};

// Analyze connected pothole regions
const analyzePotholeRegions = (potholeMap, width, height) => {
  const visited = new Array(width * height).fill(false);
  const regions = [];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (potholeMap[idx] && !visited[idx]) {
        const region = floodFill(potholeMap, visited, width, height, x, y);
        if (region.size > 10) { // Minimum size threshold
          regions.push(region);
        }
      }
    }
  }
  
  const totalSize = regions.reduce((sum, region) => sum + region.size, 0);
  const averageSize = regions.length > 0 ? totalSize / regions.length : 0;
  const largestSize = regions.length > 0 ? Math.max(...regions.map(r => r.size)) : 0;
  
  // Estimate depth based on darkness and size
  const averageDepth = regions.length > 0 
    ? regions.reduce((sum, region) => sum + region.darkness, 0) / regions.length 
    : 0;
  
  return {
    count: regions.length,
    averageSize,
    largestSize,
    averageDepth,
    regions
  };
};

// Flood fill algorithm for connected components
const floodFill = (map, visited, width, height, startX, startY) => {
  const stack = [[startX, startY]];
  const region = { size: 0, darkness: 0, minX: startX, maxX: startX, minY: startY, maxY: startY };
  
  while (stack.length > 0) {
    const [x, y] = stack.pop();
    const idx = y * width + x;
    
    if (x < 0 || x >= width || y < 0 || y >= height || visited[idx] || !map[idx]) {
      continue;
    }
    
    visited[idx] = true;
    region.size++;
    region.minX = Math.min(region.minX, x);
    region.maxX = Math.max(region.maxX, x);
    region.minY = Math.min(region.minY, y);
    region.maxY = Math.max(region.maxY, y);
    
    // Add neighbors
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  
  // Calculate region dimensions
  region.width = region.maxX - region.minX + 1;
  region.height = region.maxY - region.minY + 1;
  region.darkness = Math.min(region.size / (region.width * region.height), 1);
  
  return region;
};

// Calculate overall surface quality
const calculateSurfaceQuality = (roadMap, data, width, height) => {
  let totalVariance = 0;
  let roadSamples = 0;
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (roadMap[idx]) {
        const centerIdx = (y * width + x) * 4;
        const centerGray = (data[centerIdx] + data[centerIdx + 1] + data[centerIdx + 2]) / 3;
        
        // Calculate local variance
        let localVariance = 0;
        let neighbors = 0;
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            const nGray = (data[nIdx] + data[nIdx + 1] + data[nIdx + 2]) / 3;
            localVariance += Math.pow(nGray - centerGray, 2);
            neighbors++;
          }
        }
        
        totalVariance += localVariance / neighbors;
        roadSamples++;
      }
    }
  }
  
  return roadSamples > 0 ? 1 - Math.min(totalVariance / roadSamples / 1000, 1) : 0;
};

// Analyze image and determine priority based on detected objects and severity
export const analyzeImageForPriority = async (imageElement, category) => {
  try {
    await initializeAI();
    
    if (!model) {
      return { priority: 'medium', confidence: 0, analysis: 'AI model not available - using default priority' };
    }

    // Check if category is supported
    const cleanCategory = category.toLowerCase().replace(' (coming soon)', '');
    
    if (!['potholes', 'garbage'].includes(cleanCategory)) {
      return { 
        priority: 'medium', 
        confidence: 0.5, 
        analysis: `${category} analysis is coming soon. Using default medium priority.` 
      };
    }

    console.log(`Starting AI analysis for category: ${cleanCategory}`);
    
    // Get object detections with higher confidence threshold
    const predictions = await model.detect(imageElement, 20); // Detect up to 20 objects
    console.log('Object detections:', predictions);
    
    // Convert image to tensor for advanced analysis
    let imageTensor = null;
    let advancedAnalysis = {};
    
    try {
      imageTensor = tf.browser.fromPixels(imageElement).cast('float32');
      
      // Get image data for pixel-level analysis
      const imageData = getImageData(imageElement);
      
      // Perform category-specific advanced analysis
      switch (cleanCategory) {
        case 'potholes':
          advancedAnalysis = await analyzePotholesAdvanced(imageData, predictions, imageTensor);
          break;
        case 'garbage':
          advancedAnalysis = await analyzeGarbageAdvanced(imageData, predictions, imageTensor);
          break;
        default:
          advancedAnalysis = {
            priority: 'medium',
            confidence: 0.5,
            analysis: `Analysis for ${category} is coming soon.`,
            detectedObjects: predictions.filter(p => p.score > 0.3)
          };
      }
    } catch (tensorError) {
      console.warn('Tensor analysis failed, using basic analysis:', tensorError);
      // Fallback to basic analysis without tensor operations
      advancedAnalysis = {
        priority: 'medium',
        confidence: 0.4,
        analysis: `Basic analysis completed. Advanced tensor analysis failed: ${tensorError.message}`,
        detectedObjects: predictions.filter(p => p.score > 0.3)
      };
    } finally {
      // Clean up tensor
      if (imageTensor) {
        imageTensor.dispose();
      }
    }
    
    return advancedAnalysis;
  } catch (error) {
    console.error('Error analyzing image:', error);
    return { 
      priority: 'medium', 
      confidence: 0, 
      analysis: `Analysis failed: ${error.message}. Using default priority.` 
    };
  }
};

// Advanced pothole analysis with depth, width, area, and garbage detection
const analyzePotholesAdvanced = async (imageData, predictions, imageTensor) => {
  console.log('Analyzing potholes with geometric measurements...');
  
  // Analyze pothole geometry (depth, width, area)
  const geometry = analyzePotholeGeometry(imageData);
  
  // Use TensorFlow.js for edge detection with fallback
  let edges = { edgeIntensity: 0.5 };
  try {
    edges = await detectEdgesWithTF(imageTensor);
  } catch (edgeError) {
    console.warn('Edge detection failed, using default:', edgeError);
  }
  
  // Extract detected objects with confidence filtering
  const detectedObjects = predictions.filter(p => p.score > 0.3);
  const vehicles = detectedObjects.filter(obj => 
    ['car', 'truck', 'bus', 'motorcycle', 'bicycle'].includes(obj.class)
  );
  const people = detectedObjects.filter(obj => obj.class === 'person');
  
  // Check for garbage/debris in potholes or on road
  // Check for garbage/debris in potholes or on road (excluding backpack to avoid confusion with garbage bags)
  const roadDebris = detectedObjects.filter(obj => 
    ['bottle', 'cup', 'bowl', 'banana', 'apple', 'book', 'cell phone'].includes(obj.class)
  );
  
  // Check for potential garbage bags misclassified as personal items
  const potentialGarbageBags = detectedObjects.filter(obj => 
    ['backpack', 'suitcase', 'handbag', 'umbrella'].includes(obj.class)
  );
  
  let priority = 'low';
  let confidence = 0.5;
  let analysis = '';
  let severityLevel = 'minimal';
  let severityScore = 0;
  
  console.log('Pothole geometry analysis:', geometry);
  
  // Check if image actually shows road surface
  if (geometry.roadCoverage < 0.25) {
    priority = 'low';
    analysis = `Image does not clearly show road surface (${(geometry.roadCoverage * 100).toFixed(1)}% road coverage). `;
    confidence = 0.3;
    severityLevel = 'unclear';
  } else {
    // Detailed pothole severity assessment
    let severityScore = 0;
    const measurements = [];
    
    // Pothole count and size analysis
    if (geometry.potholeCount > 0) {
      measurements.push(`${geometry.potholeCount} pothole(s) detected`);
      
      // Size-based scoring
      if (geometry.largestPotholeSize > 500) {
        severityScore += 4; // Large potholes
        measurements.push(`largest: ${Math.round(geometry.largestPotholeSize)} pixels`);
      } else if (geometry.largestPotholeSize > 200) {
        severityScore += 3; // Medium potholes
        measurements.push(`largest: ${Math.round(geometry.largestPotholeSize)} pixels`);
      } else if (geometry.largestPotholeSize > 50) {
        severityScore += 2; // Small potholes
        measurements.push(`largest: ${Math.round(geometry.largestPotholeSize)} pixels`);
      } else {
        severityScore += 1; // Very small potholes
      }
      
      // Depth estimation (based on darkness)
      if (geometry.potholeDepthIndicator > 0.7) {
        severityScore += 3; // Deep potholes
        measurements.push('depth: deep');
      } else if (geometry.potholeDepthIndicator > 0.4) {
        severityScore += 2; // Medium depth
        measurements.push('depth: medium');
      } else {
        severityScore += 1; // Shallow
        measurements.push('depth: shallow');
      }
      
      // Area coverage
      if (geometry.potholeAreaRatio > 0.15) {
        severityScore += 3; // Large area affected
        measurements.push(`area coverage: ${(geometry.potholeAreaRatio * 100).toFixed(1)}%`);
      } else if (geometry.potholeAreaRatio > 0.05) {
        severityScore += 2; // Moderate area
        measurements.push(`area coverage: ${(geometry.potholeAreaRatio * 100).toFixed(1)}%`);
      } else {
        severityScore += 1; // Small area
        measurements.push(`area coverage: ${(geometry.potholeAreaRatio * 100).toFixed(1)}%`);
      }
    }
    
    // Crack density analysis
    if (geometry.crackDensity > 0.1) {
      severityScore += 2;
      measurements.push(`extensive cracking (${(geometry.crackDensity * 100).toFixed(1)}%)`);
    } else if (geometry.crackDensity > 0.03) {
      severityScore += 1;
      measurements.push(`moderate cracking (${(geometry.crackDensity * 100).toFixed(1)}%)`);
    }
    
    // Overall surface quality
    if (geometry.surfaceQuality < 0.3) {
      severityScore += 2;
      measurements.push('poor surface quality');
    } else if (geometry.surfaceQuality < 0.6) {
      severityScore += 1;
      measurements.push('fair surface quality');
    } else {
      measurements.push('good surface quality');
    }
    
    // Determine severity level and priority
    if (severityScore >= 10) {
      priority = 'critical';
      severityLevel = 'severe';
      analysis = `SEVERE road damage: ${measurements.join(', ')}. Immediate repair required. `;
      confidence = 0.9;
    } else if (severityScore >= 7) {
      priority = 'high';
      severityLevel = 'major';
      analysis = `Major road damage: ${measurements.join(', ')}. Urgent repair needed. `;
      confidence = 0.85;
    } else if (severityScore >= 4) {
      priority = 'medium';
      severityLevel = 'moderate';
      analysis = `Moderate road damage: ${measurements.join(', ')}. Repair recommended. `;
      confidence = 0.75;
    } else if (severityScore >= 2) {
      priority = 'low';
      severityLevel = 'minor';
      analysis = `Minor road issues: ${measurements.join(', ')}. Monitoring advised. `;
      confidence = 0.65;
    } else {
      priority = 'low';
      severityLevel = 'minimal';
      analysis = `Road surface in acceptable condition. ${measurements.join(', ')}. `;
      confidence = 0.6;
    }
    
    // Garbage/debris analysis
    if (geometry.garbagePresence > 0.05 || roadDebris.length > 0) {
      const garbageAnalysis = analyzeGarbageComposition(imageData);
      const dominantWaste = garbageAnalysis.dominantWasteType;
      
      if (priority === 'low') priority = 'medium';
      analysis += `Garbage/debris present: ${dominantWaste.type} (${dominantWaste.percentage.toFixed(1)}%), `;
      analysis += `total coverage ${(garbageAnalysis.garbageCoverage * 100).toFixed(1)}%. `;
      
      // List waste types with percentages
      const wasteTypes = Object.entries(garbageAnalysis.composition)
        .filter(([type, data]) => data.percentage > 5)
        .map(([type, data]) => `${type} ${data.percentage.toFixed(1)}%`)
        .join(', ');
      
      if (wasteTypes) {
        analysis += `Waste breakdown: ${wasteTypes}. `;
      }
      
      confidence += 0.1;
    }
  
    // Warn about potential misclassification if many \"bags\" are seen
    if (potentialGarbageBags.length > 1) {
      analysis += `Note: Detected objects resembling bags/debris (${potentialGarbageBags.length} items). Might be garbage accumulation. `;
    }
  }
  
  // Traffic safety assessment
  if (vehicles.length >= 2 || (vehicles.length >= 1 && people.length >= 1)) {
    if (priority === 'low') priority = 'medium';
    else if (priority === 'medium') priority = 'high';
    else if (priority === 'high') priority = 'critical';
    analysis += `High traffic area (${vehicles.length} vehicles, ${people.length} people) - safety critical. `;
    confidence += 0.05;
  }
  
  // Add technical measurements
  analysis += `Technical: Road ${(geometry.roadCoverage * 100).toFixed(1)}%, `;
  analysis += `damaged area ${(geometry.totalDamagedArea * 100).toFixed(1)}%, `;
  analysis += `surface quality ${(geometry.surfaceQuality * 100).toFixed(1)}%. `;
  
  // Object detection summary
  const highConfidenceObjects = detectedObjects.filter(obj => obj.score > 0.6);
  if (highConfidenceObjects.length > 0) {
    const objectNames = highConfidenceObjects.map(obj => 
      `${obj.class} (${Math.round(obj.score * 100)}%)`
    ).join(', ');
    analysis += `Detected: ${objectNames}. `;
  }
  
  // Cap confidence
  confidence = Math.min(confidence, 0.95);
  
  // Clean up tensors
  edges.tensor.dispose();
  
  return { 
    priority, 
    confidence, 
    analysis, 
    severityLevel,
    detectedObjects: detectedObjects.filter(obj => obj.score > 0.4),
    advancedMetrics: { 
      ...geometry,
      edgeIntensity: edges.edgeIntensity,
      severityScore: severityScore || 0,
      roadDebris: roadDebris.length,
      measurements: {
        potholeCount: geometry.potholeCount,
        averageSize: Math.round(geometry.averagePotholeSize),
        largestSize: Math.round(geometry.largestPotholeSize),
        depthIndicator: Math.round(geometry.potholeDepthIndicator * 100),
        areaCoverage: Math.round(geometry.potholeAreaRatio * 1000) / 10,
        crackDensity: Math.round(geometry.crackDensity * 1000) / 10,
        surfaceQuality: Math.round(geometry.surfaceQuality * 100)
      }
    }
  };
};

// Advanced garbage analysis with volume estimation and detailed waste classification
const analyzeGarbageAdvanced = async (imageData, predictions, imageTensor) => {
  console.log('Analyzing garbage with volume and composition analysis...');
  
  // Comprehensive garbage composition analysis
  const composition = analyzeGarbageComposition(imageData);
  
  // Extract detected objects with confidence filtering
  const detectedObjects = predictions.filter(p => p.score > 0.3);
  
  // Object detection for context (objects are already analyzed in composition)
  // const plasticItems = detectedObjects.filter(obj => 
  //   ['bottle', 'cup', 'cell phone', 'laptop', 'mouse', 'keyboard', 'remote', 'toothbrush'].includes(obj.class)
  // );
  
  // const organicItems = detectedObjects.filter(obj => 
  //   ['banana', 'apple', 'orange', 'broccoli', 'carrot', 'sandwich', 'pizza', 'donut', 'cake', 'hot dog'].includes(obj.class)
  // );
  
  const animals = detectedObjects.filter(obj => 
    ['bird', 'cat', 'dog', 'mouse', 'cow', 'sheep'].includes(obj.class)
  );
  
  // Common misclassifications for garbage bags (black bags often look like backpacks/suitcases to COCO-SSD)
  const potentialGarbageBags = detectedObjects.filter(obj => 
    ['backpack', 'suitcase', 'handbag', 'umbrella'].includes(obj.class)
  );
  
  const people = detectedObjects.filter(obj => obj.class === 'person');
  
  let priority = 'low';
  let confidence = 0.5;
  let analysis = '';
  let severityLevel = 'minimal';
  let severityScore = 0;
  
  console.log('Garbage composition analysis:', composition);
  
  // Check if image actually contains significant garbage
  if (composition.garbageCoverage < 0.02 && composition.totalVolume < 10) {
    priority = 'low';
    analysis = `Area appears clean with minimal waste (${(composition.garbageCoverage * 100).toFixed(2)}% coverage). `;
    confidence = 0.7;
    severityLevel = 'clean';
  } else {
    // Detailed garbage severity assessment
    let severityScore = 0;
    const measurements = [];
    
    // Area coverage assessment (more reliable than volume)
    if (composition.garbageCoverage > 0.3) {
      severityScore += 4;
      measurements.push(`large accumulation (${(composition.garbageCoverage * 100).toFixed(1)}% coverage)`);
    } else if (composition.garbageCoverage > 0.15) {
      severityScore += 3;
      measurements.push(`moderate accumulation (${(composition.garbageCoverage * 100).toFixed(1)}% coverage)`);
    } else if (composition.garbageCoverage > 0.05) {
      severityScore += 2;
      measurements.push(`small accumulation (${(composition.garbageCoverage * 100).toFixed(1)}% coverage)`);
    } else {
      severityScore += 1;
      measurements.push(`minimal waste (${(composition.garbageCoverage * 100).toFixed(1)}% coverage)`);
    }
    
    // Remove duplicate area coverage assessment - already handled above
    
    // Waste complexity assessment
    if (composition.wasteComplexity === 'complex') {
      severityScore += 2;
      measurements.push('mixed waste types');
    } else if (composition.wasteComplexity === 'moderate') {
      severityScore += 1;
      measurements.push('few waste types');
    }
    
    // Health hazard assessment
    if (animals.length > 0) {
      severityScore += 5; // Critical health hazard
      measurements.push(`${animals.length} animal(s) present - health hazard`);
    }
    
    // Remove weight estimation - unreliable from 2D images
    
    // Determine severity level and priority
    if (severityScore >= 10 || animals.length > 0 || potentialGarbageBags.length >= 3) {
      priority = 'critical';
      severityLevel = 'severe';
      analysis = `SEVERE garbage accumulation: ${measurements.join(', ')}. Immediate cleanup required. `;
      confidence = 0.9;
    } else if (severityScore >= 7) {
      priority = 'high';
      severityLevel = 'major';
      analysis = `Major garbage accumulation: ${measurements.join(', ')}. Urgent cleanup needed. `;
      confidence = 0.85;
    } else if (severityScore >= 4) {
      priority = 'medium';
      severityLevel = 'moderate';
      analysis = `Moderate garbage accumulation: ${measurements.join(', ')}. Cleanup recommended. `;
      confidence = 0.75;
    } else if (severityScore >= 2) {
      priority = 'low';
      severityLevel = 'minor';
      analysis = `Minor garbage accumulation: ${measurements.join(', ')}. Routine cleanup advised. `;
      confidence = 0.65;
    } else {
      priority = 'low';
      severityLevel = 'minimal';
      analysis = `Minimal waste detected: ${measurements.join(', ')}. `;
      confidence = 0.6;
    }
    
    // Detailed waste type breakdown
    const wasteBreakdown = [];
    for (const [type, data] of Object.entries(composition.composition)) {
      if (data.percentage > 2) { // Only include significant percentages
        wasteBreakdown.push(`${type}: ${data.percentage}% (${data.regionCount} regions)`);
      }
    }
    
    if (wasteBreakdown.length > 0) {
      analysis += `Waste composition: ${wasteBreakdown.join(', ')}. `;
    }
    
    // Remove volume distribution - focus on area percentages instead
    
    // Dominant waste type
    const dominant = composition.dominantWasteType;
    if (dominant.percentage > 30) {
      analysis += `Predominantly ${dominant.type} waste (${dominant.percentage}%). `;
    }
  }
  
  // Public health and safety considerations
  if (people.length >= 5) {
    if (priority === 'low') priority = 'medium';
    else if (priority === 'medium') priority = 'high';
    analysis += `High public exposure (${people.length} people) - health priority increased. `;
    confidence += 0.05;
  }
  
  // Add technical measurements (simplified and more accurate)
  analysis += `Technical: Coverage ${(composition.garbageCoverage * 100).toFixed(1)}%, `;
  analysis += `waste complexity: ${composition.wasteComplexity}, `;
  analysis += `${Object.values(composition.composition).filter(data => data.regionCount > 0).length} waste types detected. `;
  
  // Object detection summary
  const highConfidenceObjects = detectedObjects.filter(obj => obj.score > 0.6);
  if (highConfidenceObjects.length > 0) {
    const objectNames = highConfidenceObjects.map(obj => 
      `${obj.class} (${Math.round(obj.score * 100)}%)`
    ).join(', ');
    analysis += `Detected objects: ${objectNames}. `;
  }
  
  // Add specific note about garbage bags if detected
  if (potentialGarbageBags.length > 0) {
    analysis += `AI recognized ${potentialGarbageBags.length} object(s) likely to be garbage bags. `;
    confidence += 0.15; // Boost confidence as we handled the misclassification
  }
  
  // Cap confidence
  confidence = Math.min(confidence, 0.95);
  
  return { 
    priority, 
    confidence, 
    analysis, 
    severityLevel,
    detectedObjects: detectedObjects.filter(obj => obj.score > 0.4),
    advancedMetrics: { 
      ...composition,
      severityScore: severityScore || 0,
      healthHazards: animals.length,
      publicExposure: people.length,
      measurements: {
        areaCoverage: Math.round(composition.garbageCoverage * 1000) / 10,
        wasteComplexity: composition.wasteComplexity,
        dominantType: composition.dominantWasteType.type,
        dominantPercentage: Math.round(composition.dominantWasteType.percentage * 10) / 10,
        wasteTypeCount: Object.values(composition.composition).filter(data => data.regionCount > 0).length
      }
    }
  };
};

// Advanced streetlight analysis (coming soon)
// const analyzeStreetlightsAdvanced = async (imageData, predictions) => { ... };

// Analyze detections and determine priority (legacy function - removed)
// const analyzeDetections = (predictions, category) => { ... };

// Legacy analysis functions (replaced by advanced versions)
// const analyzePotholes = (objects) => { ... };
// const analyzeGarbage = (objects) => { ... };
// const analyzeStreetlights = (objects) => { ... };
// const analyzeWaterLeaks = (objects) => { ... };
// const analyzeTrafficIssues = (objects) => { ... };
// const analyzeGeneral = (objects) => { ... };

// Get time-based priority adjustment for street lights
export const getTimeBasedPriority = (category) => {
  if (category.toLowerCase() === 'streetlights') {
    const hour = new Date().getHours();
    
    // Higher priority during night hours (6 PM to 6 AM)
    if (hour >= 18 || hour <= 6) {
      return { adjustment: 'increase', reason: 'Street lights are critical during night hours' };
    } else {
      return { adjustment: 'decrease', reason: 'Street lights are less critical during daylight hours' };
    }
  }
  
  return { adjustment: 'none', reason: '' };
};

// Adjust priority based on time and other factors
export const adjustPriority = (basePriority, category, timeAdjustment) => {
  let finalPriority = basePriority;
  
  if (timeAdjustment.adjustment === 'increase') {
    if (basePriority === 'low') finalPriority = 'medium';
    else if (basePriority === 'medium') finalPriority = 'high';
  } else if (timeAdjustment.adjustment === 'decrease') {
    if (basePriority === 'high') finalPriority = 'medium';
    else if (basePriority === 'medium') finalPriority = 'low';
  }
  
  return finalPriority;
};