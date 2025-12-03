#!/usr/bin/env python3
"""
Script to apply AI accuracy improvements to aiAnalysis.js
This script makes targeted edits to handle object misclassifications.
"""

import re

def apply_improvements():
    file_path = 'src/utils/aiAnalysis.js'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Improvement 1: Add black plastic bag detection in analyzeGarbageComposition
    # Find the line with "Bright, saturated colors = plastic bottles, bags, containers"
    # and add the black bag detection after it
    pattern1 = r"(if \(hsv\.s > 0\.8 && hsv\.v > 0\.6 && colorVariance > 100\) \{\s+// Bright, saturated colors = plastic bottles, bags, containers\s+wasteType = 'plastic';)"
    replacement1 = r"\1\n      } else if (brightness < 50 && hsv.s < 0.2 && colorVariance < 20) {\n        // Very dark, low saturation, low variance = likely black plastic bags\n        wasteType = 'plastic';"
    
    content = re.sub(pattern1, replacement1, content)
    
    # Improvement 2: Update analyzePotholesAdvanced - change roadDebris filter
    pattern2 = r"const roadDebris = detectedObjects\.filter\(obj => \s+\['bottle', 'cup', 'bowl', 'banana', 'apple', 'book', 'cell phone', 'backpack'\]\.includes\(obj\.class\)\s+\);"
    replacement2 = """// Check for garbage/debris in potholes or on road (excluding backpack to avoid confusion with garbage bags)
  const roadDebris = detectedObjects.filter(obj => 
    ['bottle', 'cup', 'bowl', 'banana', 'apple', 'book', 'cell phone'].includes(obj.class)
  );
  
  // Check for potential garbage bags misclassified as personal items
  const potentialGarbageBags = detectedObjects.filter(obj => 
    ['backpack', 'suitcase', 'handbag', 'umbrella'].includes(obj.class)
  );"""
    
    content = re.sub(pattern2, replacement2, content, flags=re.DOTALL)
    
    # Improvement 3: Add warning in analyzePotholesAdvanced after garbage/debris analysis
    pattern3 = r"(confidence \+= 0\.1;\s+}\s+)(}\s+// Traffic safety assessment)"
    replacement3 = r"\1\n    // Warn about potential misclassification if many \"bags\" are seen\n    if (potentialGarbageBags.length > 1) {\n      analysis += `Note: Detected objects resembling bags/debris (${potentialGarbageBags.length} items). Might be garbage accumulation. `;\n    }\n  \2"
    
    content = re.sub(pattern3, replacement3, content)
    
    # Improvement 4: Update analyzeGarbageAdvanced - add potentialGarbageBags filter
    pattern4 = r"(const animals = detectedObjects\.filter\(obj => \s+\['bird', 'cat', 'dog', 'mouse', 'cow', 'sheep'\]\.includes\(obj\.class\)\s+\);)\s+(const people = detectedObjects\.filter\(obj => obj\.class === 'person'\);)"
    replacement4 = r"\1\n  \n  // Common misclassifications for garbage bags (black bags often look like backpacks/suitcases to COCO-SSD)\n  const potentialGarbageBags = detectedObjects.filter(obj => \n    ['backpack', 'suitcase', 'handbag', 'umbrella'].includes(obj.class)\n  );\n  \n  \2"
    
    content = re.sub(pattern4, replacement4, content, flags=re.DOTALL)
    
    # Improvement 5: Update severity condition in analyzeGarbageAdvanced
    pattern5 = r"if \(severityScore >= 10 \|\| animals\.length > 0\) \{"
    replacement5 = "if (severityScore >= 10 || animals.length > 0 || potentialGarbageBags.length >= 3) {"
    
    content = re.sub(pattern5, replacement5, content)
    
    # Improvement 6: Add garbage bag note in analyzeGarbageAdvanced
    pattern6 = r"(analysis \+= `Detected objects: \$\{objectNames\}\. `;)\s+(}\s+// Cap confidence)"
    replacement6 = r"\1\n  }\n  \n  // Add specific note about garbage bags if detected\n  if (potentialGarbageBags.length > 0) {\n    analysis += `AI recognized ${potentialGarbageBags.length} object(s) likely to be garbage bags. `;\n    confidence += 0.15; // Boost confidence as we handled the misclassification\n  \2"
    
    content = re.sub(pattern6, replacement6, content)
    
    # Write the modified content back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✓ Successfully applied AI accuracy improvements to aiAnalysis.js")
    print("Changes made:")
    print("  1. Added black plastic bag detection in color analysis")
    print("  2. Updated pothole analysis to handle misclassified garbage bags")
    print("  3. Updated garbage analysis to recognize and boost confidence for misclassified bags")

if __name__ == '__main__':
    apply_improvements()
