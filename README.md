# Kartavya - Civic Issue Reporting Platform

A modern, AI-powered civic issue reporting platform that enables citizens to report and track infrastructure problems, garbage accumulation, and other civic issues with intelligent priority assessment and real-time location tracking.

![Kartavya](public/logo.png)

## 🌟 Key Features

### 🤖 AI-Powered Analysis
- **Advanced Object Detection**: Uses TensorFlow.js and COCO-SSD (MobileNet V2) for real-time image analysis
- **Smart Classification**: Automatically detects and classifies:
  - Potholes and road damage
  - Garbage accumulation and waste types
  - Infrastructure issues
- **Intelligent Misclassification Handling**: 
  - Recognizes when garbage bags are misidentified as backpacks/suitcases
  - Black plastic bag detection using color analysis (HSV-based)
  - Context-aware priority adjustment
- **Comprehensive Waste Analysis**:
  - 8 waste type classification (plastic, organic, metal, paper, glass, textile, electronic, mixed)
  - Volume estimation and coverage analysis
  - Health hazard detection (animal presence)

### 📍 Accurate Geolocation
- **Browser Geolocation API**: High-accuracy GPS positioning
- **Interactive Maps**: Google Maps integration with satellite/hybrid views
- **Real-time Location**: Automatic address resolution and coordinate display
- **Accuracy Indicators**: Shows GPS accuracy in meters
- **Manual Adjustment**: Users can fine-tune location on map

### 🎯 Smart Priority System
- **Multi-Factor Analysis**:
  - AI-detected severity (pothole depth, garbage volume)
  - Location-based priority (traffic density, public exposure)
  - Time-based adjustments (e.g., streetlights critical at night)
  - Health and safety considerations
- **Dynamic Priority Levels**: Critical, High, Medium, Low
- **Confidence Scoring**: AI confidence metrics for transparency

### 👥 Community Features
- **Social Engagement**: Upvote, comment, and share reports
- **Leaderboard**: Gamification with points and achievements
- **Community Feed**: Real-time updates on civic issues
- **Verification System**: Community validation of reports

### 🏛️ Government Dashboard
- **Queue Management**: Automated issue prioritization
- **Status Tracking**: Real-time progress updates
- **Analytics**: Comprehensive reporting and insights
- **Authority Assignment**: Route issues to relevant departments

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Google Maps API key (for maps functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pavankumar022/Kartavya.git
   cd Kartavya/web-kartavya
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   The application will open at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## 📁 Project Structure

```
web-kartavya/
├── public/
│   ├── index.html
│   └── logo.png
├── src/
│   ├── components/
│   │   ├── Layout.js              # Main layout wrapper
│   │   ├── LocationPicker.js      # GPS location selection
│   │   ├── NotificationDropdown.js
│   │   ├── ProfileDropdown.js
│   │   └── SocialActions.js       # Upvote, comment, share
│   ├── pages/
│   │   ├── Landing.js             # Landing page
│   │   ├── Home.js                # User home
│   │   ├── ReportIssue.js         # Issue reporting with AI
│   │   ├── Dashboard.js           # User dashboard
│   │   ├── GovDashboard.js        # Government dashboard
│   │   └── ...
│   ├── utils/
│   │   ├── aiAnalysis.js          # AI analysis engine
│   │   ├── geolocation.js         # GPS utilities
│   │   ├── comprehensivePriority.js # Priority calculation
│   │   ├── reports.js             # Report management
│   │   └── ...
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## 🔧 Technical Details

### AI Analysis System

#### Image Analysis Pipeline
1. **Image Capture**: User uploads photo of civic issue
2. **TensorFlow.js Processing**: 
   - Converts image to tensor
   - Runs COCO-SSD object detection (up to 20 objects)
   - Performs pixel-level analysis for geometry/composition
3. **Category-Specific Analysis**:
   - **Potholes**: Depth estimation, crack detection, surface quality
   - **Garbage**: Waste type classification, volume estimation, health hazards
4. **Priority Calculation**: Multi-factor scoring with confidence metrics

#### Waste Classification Algorithm
```javascript
// Color-based waste type detection
- Plastic: Bright saturated colors OR very dark (black bags)
- Organic: Brown/orange/green tones
- Metal: Dark, low saturation, uniform
- Paper: Very light, low saturation
- Glass: Transparent/reflective
- Textile: Moderate saturation and brightness
- Electronic: Mixed colors, moderate brightness
```

#### Misclassification Handling
The system intelligently handles common AI misclassifications:

```javascript
// Detects objects that might be garbage bags
const potentialGarbageBags = ['backpack', 'suitcase', 'handbag', 'umbrella'];

// Adjusts analysis based on context
if (potentialGarbageBags.length >= 3) {
  priority = 'critical'; // Likely garbage accumulation
  confidence += 0.15;    // Boost confidence
}
```

### Geolocation System

#### High-Accuracy GPS
```javascript
navigator.geolocation.getCurrentPosition(
  successCallback,
  errorCallback,
  {
    enableHighAccuracy: true,  // Use GPS instead of network
    timeout: 10000,            // 10-second timeout
    maximumAge: 0              // No cached positions
  }
);
```

#### Location Data Structure
```javascript
{
  latitude: 12.9716,
  longitude: 77.5946,
  accuracy: 15,              // meters
  address: "Formatted address from reverse geocoding",
  timestamp: 1701594000000
}
```

### Priority Calculation

The comprehensive priority system considers:

1. **AI Severity Score** (0-10+):
   - Pothole size, depth, area coverage
   - Garbage volume, waste complexity
   - Surface quality, crack density

2. **Location Factors**:
   - Traffic density (vehicles, pedestrians)
   - Public exposure
   - Proximity to sensitive areas

3. **Time-Based Adjustments**:
   - Streetlights: Higher priority at night (6 PM - 6 AM)
   - Traffic issues: Higher during rush hours

4. **Health & Safety**:
   - Animal presence near garbage: +5 severity
   - High public exposure: Priority escalation

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Tailwind CSS for styling
- Dark mode support
- Accessible components

### Interactive Maps
- Google Maps integration
- Multiple view modes (roadmap, satellite, hybrid)
- Draggable markers for location adjustment
- Accuracy radius visualization

### Real-Time Feedback
- Live AI analysis results
- Confidence scores and explanations
- Progress indicators
- Toast notifications

## 📊 Analytics & Metrics

### For Citizens
- Reports submitted
- Issues resolved
- Community impact score
- Achievements and badges

### For Government
- Issue distribution by category
- Average resolution time
- Priority queue status
- Geographic heat maps

## 🔐 Security & Privacy

- Secure authentication (JWT-based)
- Role-based access control (Citizen, Authority, Admin)
- Data encryption in transit
- Privacy-compliant location handling
- Image data processing (client-side AI)

## 🌐 API Integration

### Google Maps API
- Geocoding for address resolution
- Reverse geocoding for coordinates
- Map display and interaction
- Place search and autocomplete

### TensorFlow.js Models
- COCO-SSD for object detection
- Custom waste classification (planned)
- Edge detection for road damage

## 🚧 Roadmap & Future Enhancements

### AI Improvements
- [ ] Custom-trained model for waste/infrastructure detection
- [ ] Image segmentation for better area analysis
- [ ] Server-side AI processing for critical analysis
- [ ] Ensemble methods for higher confidence
- [ ] Real-time video analysis

### Geolocation Enhancements
- [ ] GPS averaging (multiple readings)
- [ ] Accuracy indicators on map
- [ ] Manual location verification
- [ ] Offline location caching
- [ ] Integration with additional location services

### Platform Features
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Offline mode
- [ ] Multi-language support
- [ ] Voice-based reporting
- [ ] AR visualization of issues

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Test AI analysis with various images
- Verify geolocation accuracy

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Authors

- **Pavan Kumar** - [pavankumar022](https://github.com/pavankumar022)

## 🙏 Acknowledgments

- TensorFlow.js team for the COCO-SSD model
- Google Maps Platform
- React and Tailwind CSS communities
- All contributors and testers

## 📞 Support

For support, email support@kartavya.com or open an issue in the GitHub repository.

## 📈 Recent Updates

### v1.1.0 - AI Analysis Accuracy Improvements (December 2024)
- ✅ Added black plastic bag detection in color analysis
- ✅ Implemented misclassification handling for garbage bags
- ✅ Enhanced pothole analysis with context-aware debris detection
- ✅ Improved confidence scoring and priority assessment
- ✅ Added detailed analysis explanations for users

### v1.0.0 - Initial Release
- ✅ Core reporting functionality
- ✅ AI-powered image analysis
- ✅ Geolocation integration
- ✅ Community features
- ✅ Government dashboard

---

**Made with ❤️ for better civic infrastructure**
