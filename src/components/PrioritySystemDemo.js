import React, { useState } from 'react';
import { Hospital, School, MessageCircle, Building, MapPin, Users } from 'lucide-react';

const PrioritySystemDemo = () => {
  const [selectedExample, setSelectedExample] = useState(null);

  const examples = [
    {
      id: 1,
      title: "Pothole near City Hospital",
      tier: 1,
      tierName: "CRITICAL INFRASTRUCTURE",
      location: "Main Road, 500m from City Hospital",
      reason: "Within 5km of hospital - blocks ambulance access",
      priority: "IMMEDIATE ACTION",
      responseTime: "1-2 hours",
      icon: <Hospital className="w-6 h-6 text-red-500" />,
      color: "border-red-500 bg-red-500/5"
    },
    {
      id: 2,
      title: "Garbage pile with 150 likes, 75 comments",
      tier: 2,
      tierName: "HIGH COMMUNITY ENGAGEMENT",
      location: "Market Street, City Center",
      reason: "High social engagement - community demanding action",
      priority: "HIGH PRIORITY",
      responseTime: "4-8 hours",
      icon: <MessageCircle className="w-6 h-6 text-orange-500" />,
      color: "border-orange-500 bg-orange-500/5"
    },
    {
      id: 3,
      title: "Street light issue in urban area",
      tier: 3,
      tierName: "URBAN INFRASTRUCTURE",
      location: "Residential Area, High Population Density",
      reason: "Located in populated urban area with good infrastructure",
      priority: "STANDARD PRIORITY",
      responseTime: "1-3 days",
      icon: <Building className="w-6 h-6 text-yellow-500" />,
      color: "border-yellow-500 bg-yellow-500/5"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">🎯 Priority System Demonstration</h1>
        <p className="text-gray-400">See how issues are automatically prioritized for government action</p>
      </div>

      {/* Priority Hierarchy Explanation */}
      <div className="mb-8 bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">📋 3-Tier Priority System</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 border-l-4 border-red-500 bg-red-500/5">
            <Hospital className="w-6 h-6 text-red-500 mt-1" />
            <div>
              <h3 className="font-semibold text-red-400">TIER 1: CRITICAL INFRASTRUCTURE</h3>
              <p className="text-gray-300 text-sm">Issues within 5km of hospitals, schools, colleges, emergency services</p>
              <p className="text-red-300 text-xs mt-1">⚡ ALWAYS FIRST PRIORITY - Response: 1-2 hours</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 border-l-4 border-orange-500 bg-orange-500/5">
            <MessageCircle className="w-6 h-6 text-orange-500 mt-1" />
            <div>
              <h3 className="font-semibold text-orange-400">TIER 2: HIGH COMMUNITY ENGAGEMENT</h3>
              <p className="text-gray-300 text-sm">Issues with 50+ likes/comments showing strong public concern</p>
              <p className="text-orange-300 text-xs mt-1">📢 SECOND PRIORITY - Response: 4-8 hours</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 p-4 border-l-4 border-yellow-500 bg-yellow-500/5">
            <Building className="w-6 h-6 text-yellow-500 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-400">TIER 3: URBAN INFRASTRUCTURE</h3>
              <p className="text-gray-300 text-sm">Issues in high-density urban areas with good infrastructure</p>
              <p className="text-yellow-300 text-xs mt-1">🏙️ THIRD PRIORITY - Response: 1-3 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Example Issues */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">📝 Example Issues</h2>
        {examples.map((example) => (
          <div
            key={example.id}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02] ${example.color} ${
              selectedExample === example.id ? 'ring-2 ring-blue-400' : ''
            }`}
            onClick={() => setSelectedExample(selectedExample === example.id ? null : example.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                {example.icon}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{example.title}</h3>
                    <span className="px-2 py-1 bg-gray-700 text-xs font-medium rounded">
                      TIER {example.tier}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {example.location}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{example.reason}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">{example.priority}</div>
                <div className="text-sm text-gray-400">{example.responseTime}</div>
              </div>
            </div>

            {selectedExample === example.id && (
              <div className="mt-4 pt-4 border-t border-gray-600">
                <h4 className="font-medium text-white mb-2">🔍 Detailed Analysis:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-gray-300">Priority Tier:</strong>
                    <p className="text-gray-400">{example.tierName}</p>
                  </div>
                  <div>
                    <strong className="text-gray-300">Government Action:</strong>
                    <p className="text-gray-400">
                      {example.tier === 1 && "Emergency team dispatch, coordinate with facility management"}
                      {example.tier === 2 && "Fast-track processing, prepare public updates"}
                      {example.tier === 3 && "Standard processing, regular monitoring"}
                    </p>
                  </div>
                  <div>
                    <strong className="text-gray-300">Department:</strong>
                    <p className="text-gray-400">
                      {example.title.includes('Pothole') && "Public Works Department (PWD)"}
                      {example.title.includes('Garbage') && "Sanitation Department"}
                      {example.title.includes('light') && "Electrical Department"}
                    </p>
                  </div>
                  <div>
                    <strong className="text-gray-300">Escalation:</strong>
                    <p className="text-gray-400">
                      {example.tier === 1 && "District Collector → Emergency Services"}
                      {example.tier === 2 && "Municipal Commissioner → PR Office"}
                      {example.tier === 3 && "Department Head → Municipal Corp"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Analysis Note */}
      <div className="mt-8 p-6 bg-blue-900/20 rounded-lg border border-blue-500/30">
        <h3 className="text-lg font-semibold text-blue-300 mb-2">🤖 AI-Enhanced Analysis</h3>
        <p className="text-gray-300 text-sm mb-3">
          All issues are also analyzed by AI for additional context:
        </p>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• <strong>Image Analysis:</strong> TensorFlow.js identifies objects, severity, and safety concerns</li>
          <li>• <strong>Smart Detection:</strong> Recognizes potholes, garbage types, people, vehicles</li>
          <li>• <strong>Confidence Scoring:</strong> Provides reliability metrics for government decision-making</li>
          <li>• <strong>Context Awareness:</strong> Considers time of day, weather, and environmental factors</li>
        </ul>
      </div>
    </div>
  );
};

export default PrioritySystemDemo;