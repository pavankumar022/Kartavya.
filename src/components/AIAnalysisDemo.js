import React, { useState } from 'react';
import { Brain, Camera, Ruler, Scale, Layers, AlertTriangle } from 'lucide-react';

const AIAnalysisDemo = () => {
  const [selectedCategory, setSelectedCategory] = useState('potholes');

  const analysisFeatures = {
    potholes: {
      title: "🛣️ Advanced Pothole Analysis",
      icon: <Ruler className="w-6 h-6" />,
      measurements: [
        "Depth estimation based on shadow analysis and pixel darkness",
        "Width and area coverage calculation using connected component analysis",
        "Crack pattern detection with linear feature recognition",
        "Surface quality assessment using texture analysis",
        "Road coverage validation (ensures image shows actual road)",
        "Garbage/debris detection within potholes"
      ],
      severityLevels: [
        { level: "MINIMAL", criteria: "Good road surface, minor irregularities", score: "0-2" },
        { level: "MINOR", criteria: "Small potholes (<50px), shallow depth, <5% area", score: "2-4" },
        { level: "MODERATE", criteria: "Medium potholes (50-200px), moderate depth, 5-15% area", score: "4-7" },
        { level: "MAJOR", criteria: "Large potholes (200-500px), deep, extensive cracking", score: "7-10" },
        { level: "SEVERE", criteria: "Multiple large potholes (>500px), very deep, >15% area", score: "10+" }
      ],
      technicalDetails: [
        "Geometric analysis: Measures pothole count, average size, largest size",
        "Depth indicator: Based on darkness relative to surroundings",
        "Area coverage: Percentage of road surface affected by damage",
        "Crack density: Linear damage patterns per unit area",
        "Surface quality: Overall road smoothness assessment",
        "Traffic impact: Considers vehicles and pedestrians for safety"
      ]
    },
    garbage: {
      title: "🗑️ Comprehensive Garbage Analysis",
      icon: <Scale className="w-6 h-6" />,
      measurements: [
        "Volume estimation using 3D projection from 2D pixel analysis",
        "Waste type classification: plastic, organic, metal, paper, glass, textile, electronic",
        "Area coverage calculation with connected region analysis",
        "Weight estimation based on material density and volume",
        "Composition breakdown with percentage distribution",
        "Health hazard assessment (animals, public exposure)"
      ],
      severityLevels: [
        { level: "CLEAN", criteria: "No significant waste, <2% coverage", score: "0-1" },
        { level: "MINIMAL", criteria: "Small amount, <30 volume units, single type", score: "2-3" },
        { level: "MODERATE", criteria: "Moderate accumulation, 30-100 units, mixed types", score: "4-6" },
        { level: "MAJOR", criteria: "Large accumulation, 100-200 units, complex mix", score: "7-9" },
        { level: "SEVERE", criteria: "Extensive waste, >200 units, animals present", score: "10+" }
      ],
      technicalDetails: [
        "Volume analysis: Estimates 3D volume from 2D pixel regions",
        "Material classification: 8 waste categories with confidence scoring",
        "Composition percentages: Breakdown by waste type and volume",
        "Weight estimation: Based on material density (plastic: 0.3kg/unit, metal: 2.5kg/unit)",
        "Health assessment: Animal detection, public exposure analysis",
        "Complexity rating: Simple, moderate, or complex waste mixture"
      ]
    }
  };

  const currentAnalysis = analysisFeatures[selectedCategory];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
          <Brain className="w-8 h-8 mr-3 text-blue-400" />
          Enhanced AI Analysis System
        </h1>
        <p className="text-gray-400">Advanced computer vision with geometric measurements and detailed classification</p>
      </div>

      {/* Category Selection */}
      <div className="mb-8">
        <div className="flex space-x-4">
          {Object.entries(analysisFeatures).map(([key, feature]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                selectedCategory === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {feature.icon}
              <span className="capitalize font-medium">{key}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Measurements & Features */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Ruler className="w-5 h-5 mr-2 text-green-400" />
            Key Measurements
          </h2>
          <ul className="space-y-3">
            {currentAnalysis.measurements.map((measurement, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{measurement}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Severity Levels */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
            Severity Classification
          </h2>
          <div className="space-y-3">
            {currentAnalysis.severityLevels.map((level, index) => (
              <div key={index} className="border-l-4 border-gray-600 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium text-sm ${
                    level.level === 'SEVERE' ? 'text-red-400' :
                    level.level === 'MAJOR' ? 'text-orange-400' :
                    level.level === 'MODERATE' ? 'text-yellow-400' :
                    level.level === 'MINOR' ? 'text-blue-400' :
                    'text-green-400'
                  }`}>
                    {level.level}
                  </span>
                  <span className="text-xs text-gray-500">Score: {level.score}</span>
                </div>
                <p className="text-gray-400 text-xs">{level.criteria}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technical Implementation */}
      <div className="mt-8 bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Layers className="w-5 h-5 mr-2 text-purple-400" />
          Technical Implementation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Analysis Pipeline</h3>
            <ul className="space-y-2">
              {currentAnalysis.technicalDetails.map((detail, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-white mb-3">AI Technologies</h3>
            <div className="space-y-3">
              <div className="bg-gray-700/50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-300 mb-1">TensorFlow.js</h4>
                <p className="text-xs text-gray-400">COCO-SSD MobileNet v2 for object detection</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-green-300 mb-1">Computer Vision</h4>
                <p className="text-xs text-gray-400">Connected component analysis, edge detection</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-yellow-300 mb-1">Image Processing</h4>
                <p className="text-xs text-gray-400">HSV color analysis, texture classification</p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-purple-300 mb-1">Geometric Analysis</h4>
                <p className="text-xs text-gray-400">Flood fill algorithms, region properties</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Analysis Output */}
      <div className="mt-8 bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Camera className="w-5 h-5 mr-2 text-blue-400" />
          Sample Analysis Output
        </h2>
        
        {selectedCategory === 'potholes' ? (
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
            <div className="text-green-400 mb-2">🛣️ POTHOLE ANALYSIS COMPLETE</div>
            <div className="text-white mb-1">Priority: <span className="text-red-400 font-bold">HIGH</span> (Score: 8.2/10)</div>
            <div className="text-white mb-1">Severity: <span className="text-orange-400">MAJOR</span></div>
            <div className="text-gray-300 mb-3">
              Major road damage: 3 pothole(s) detected, largest: 347 pixels, depth: deep, 
              area coverage: 12.3%, extensive cracking (8.7%), poor surface quality.
            </div>
            <div className="text-blue-300 mb-2">📊 Technical Measurements:</div>
            <div className="text-gray-400 text-xs space-y-1">
              <div>• Road coverage: 78.5%, damaged area: 15.2%</div>
              <div>• Pothole count: 3, average size: 245px, largest: 347px</div>
              <div>• Depth indicator: 73%, crack density: 8.7%</div>
              <div>• Surface quality: 23% (poor condition)</div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
            <div className="text-green-400 mb-2">🗑️ GARBAGE ANALYSIS COMPLETE</div>
            <div className="text-white mb-1">Priority: <span className="text-orange-400 font-bold">MEDIUM</span> (Score: 5.8/10)</div>
            <div className="text-white mb-1">Severity: <span className="text-yellow-400">MODERATE</span></div>
            <div className="text-gray-300 mb-3">
              Moderate garbage accumulation: moderate volume (87 units), moderate coverage (8.3%), 
              few waste types, estimated weight: 2.4kg.
            </div>
            <div className="text-blue-300 mb-2">📊 Waste Composition:</div>
            <div className="text-gray-400 text-xs space-y-1">
              <div>• Plastic: 45.2% (3 regions), Organic: 32.1% (2 regions)</div>
              <div>• Paper: 15.7% (1 region), Metal: 7.0% (1 region)</div>
              <div>• Volume distribution: plastic 52.3%, organic 31.2%</div>
              <div>• Complexity: moderate, dominant type: plastic</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysisDemo;