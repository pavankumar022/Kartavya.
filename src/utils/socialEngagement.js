// Social engagement and community impact analysis

// Engagement weights for different actions
const ENGAGEMENT_WEIGHTS = {
  like: 1,
  comment: 3,
  share: 5,
  follow_up: 4,
  support: 2,
  urgent_flag: 8
};

// Time decay factors (newer engagement has more weight)
const TIME_DECAY = {
  hour: 1.0,
  day: 0.9,
  week: 0.7,
  month: 0.5,
  older: 0.3
};

// Community impact thresholds for priority tiers
const IMPACT_THRESHOLDS = {
  tier2_high: { likes: 100, comments: 50, shares: 25, totalScore: 100 }, // Tier 2 priority
  tier2_medium: { likes: 50, comments: 25, shares: 10, totalScore: 50 }, // Tier 2 priority
  viral: { likes: 200, comments: 100, shares: 50, totalScore: 200 }, // Extreme engagement
  high: { likes: 75, comments: 35, shares: 15, totalScore: 75 },
  medium: { likes: 25, comments: 12, shares: 6, totalScore: 25 },
  low: { likes: 10, comments: 5, shares: 2, totalScore: 10 }
};

// Calculate time decay factor
const getTimeDecayFactor = (timestamp) => {
  const now = new Date();
  const actionTime = new Date(timestamp);
  const diffHours = (now - actionTime) / (1000 * 60 * 60);

  if (diffHours <= 1) return TIME_DECAY.hour;
  if (diffHours <= 24) return TIME_DECAY.day;
  if (diffHours <= 168) return TIME_DECAY.week; // 7 days
  if (diffHours <= 720) return TIME_DECAY.month; // 30 days
  return TIME_DECAY.older;
};

// Calculate engagement score for an issue
export const calculateEngagementScore = (issue) => {
  if (!issue.socialMetrics) {
    return {
      score: 0,
      level: 'none',
      analysis: 'No social engagement data available'
    };
  }

  const metrics = issue.socialMetrics;
  let totalScore = 0;

  // Calculate weighted engagement score
  const likes = metrics.likes || 0;
  const comments = metrics.comments || 0;
  const shares = metrics.shares || 0;
  const urgentFlags = metrics.urgentFlags || 0;

  // Base engagement score
  totalScore += likes * ENGAGEMENT_WEIGHTS.like;
  totalScore += comments * ENGAGEMENT_WEIGHTS.comment;
  totalScore += shares * ENGAGEMENT_WEIGHTS.share;
  totalScore += urgentFlags * ENGAGEMENT_WEIGHTS.urgent_flag;

  // Apply time decay if engagement history is available
  if (metrics.engagementHistory) {
    let timeWeightedScore = 0;
    for (const engagement of metrics.engagementHistory) {
      const decayFactor = getTimeDecayFactor(engagement.timestamp);
      const actionWeight = ENGAGEMENT_WEIGHTS[engagement.type] || 1;
      timeWeightedScore += actionWeight * decayFactor;
    }
    totalScore = Math.max(totalScore, timeWeightedScore);
  }

  // Determine engagement level based on total score and individual metrics
  let level = 'low';
  
  if (totalScore >= IMPACT_THRESHOLDS.viral.totalScore || 
      likes >= IMPACT_THRESHOLDS.viral.likes || 
      comments >= IMPACT_THRESHOLDS.viral.comments) {
    level = 'viral';
  } else if (totalScore >= IMPACT_THRESHOLDS.tier2_high.totalScore || 
             likes >= IMPACT_THRESHOLDS.tier2_high.likes || 
             comments >= IMPACT_THRESHOLDS.tier2_high.comments) {
    level = 'tier2_high'; // Qualifies for Tier 2 priority
  } else if (totalScore >= IMPACT_THRESHOLDS.tier2_medium.totalScore || 
             likes >= IMPACT_THRESHOLDS.tier2_medium.likes || 
             comments >= IMPACT_THRESHOLDS.tier2_medium.comments) {
    level = 'tier2_medium'; // Qualifies for Tier 2 priority
  } else if (totalScore >= IMPACT_THRESHOLDS.high.totalScore || 
             likes >= IMPACT_THRESHOLDS.high.likes || 
             comments >= IMPACT_THRESHOLDS.high.comments) {
    level = 'high';
  } else if (totalScore >= IMPACT_THRESHOLDS.medium.totalScore || 
             likes >= IMPACT_THRESHOLDS.medium.likes || 
             comments >= IMPACT_THRESHOLDS.medium.comments) {
    level = 'medium';
  }

  return {
    score: totalScore,
    level,
    analysis: generateEngagementAnalysis(metrics, level, totalScore)
  };
};

// Generate engagement analysis text
const generateEngagementAnalysis = (metrics, level, score) => {
  const likes = metrics.likes || 0;
  const comments = metrics.comments || 0;
  const shares = metrics.shares || 0;
  const urgentFlags = metrics.urgentFlags || 0;

  let analysis = `📊 Community engagement: ${level.toUpperCase()} (Score: ${score}). `;
  
  if (level === 'viral') {
    analysis += `🔥 Viral issue with massive community attention! `;
  } else if (level === 'high') {
    analysis += `⚡ High community interest and concern. `;
  } else if (level === 'medium') {
    analysis += `👥 Moderate community engagement. `;
  } else {
    analysis += `📝 Limited community engagement so far. `;
  }

  analysis += `${likes} likes, ${comments} comments, ${shares} shares`;
  
  if (urgentFlags > 0) {
    analysis += `, ${urgentFlags} urgent flags`;
  }
  
  analysis += '. ';

  // Add trending analysis
  if (metrics.engagementHistory) {
    const recentEngagement = metrics.engagementHistory.filter(e => 
      getTimeDecayFactor(e.timestamp) >= TIME_DECAY.day
    ).length;
    
    if (recentEngagement > 5) {
      analysis += `📈 Trending: ${recentEngagement} recent interactions. `;
    }
  }

  return analysis;
};

// Calculate community impact multiplier
export const getCommunityImpactMultiplier = (engagementScore, locationScore) => {
  let multiplier = 1.0;

  // Engagement-based multiplier
  if (engagementScore.level === 'viral') {
    multiplier += 1.5;
  } else if (engagementScore.level === 'high') {
    multiplier += 1.0;
  } else if (engagementScore.level === 'medium') {
    multiplier += 0.5;
  }

  // Location-based multiplier
  if (locationScore >= 2.5) {
    multiplier += 1.0;
  } else if (locationScore >= 2.0) {
    multiplier += 0.7;
  } else if (locationScore >= 1.5) {
    multiplier += 0.3;
  }

  return Math.min(multiplier, 3.0); // Cap at 3x multiplier
};

// Analyze comment sentiment (basic implementation)
export const analyzeCommentSentiment = (comments) => {
  if (!comments || comments.length === 0) {
    return {
      overall: 'neutral',
      urgency: 0,
      concerns: []
    };
  }

  // Keywords for sentiment analysis
  const urgentKeywords = ['urgent', 'emergency', 'dangerous', 'critical', 'immediate', 'asap'];
  const concernKeywords = ['worried', 'scared', 'problem', 'issue', 'concern', 'trouble'];
  const positiveKeywords = ['good', 'great', 'excellent', 'helpful', 'thanks', 'appreciate'];

  let urgencyScore = 0;
  let concernScore = 0;
  let positiveScore = 0;
  const concerns = [];

  for (const comment of comments) {
    const text = comment.text.toLowerCase();
    
    // Check for urgent keywords
    for (const keyword of urgentKeywords) {
      if (text.includes(keyword)) {
        urgencyScore += 2;
        concerns.push(`Urgency mentioned: "${keyword}"`);
      }
    }

    // Check for concern keywords
    for (const keyword of concernKeywords) {
      if (text.includes(keyword)) {
        concernScore += 1;
      }
    }

    // Check for positive keywords
    for (const keyword of positiveKeywords) {
      if (text.includes(keyword)) {
        positiveScore += 1;
      }
    }
  }

  // Determine overall sentiment
  let overall = 'neutral';
  if (urgencyScore > 3 || concernScore > positiveScore + 2) {
    overall = 'urgent';
  } else if (concernScore > positiveScore) {
    overall = 'concerned';
  } else if (positiveScore > concernScore) {
    overall = 'positive';
  }

  return {
    overall,
    urgency: urgencyScore,
    concerns: concerns.slice(0, 5) // Top 5 concerns
  };
};

// Get trending issues based on engagement
export const getTrendingIssues = (issues, timeWindow = 24) => {
  const cutoffTime = new Date(Date.now() - timeWindow * 60 * 60 * 1000);
  
  return issues
    .map(issue => {
      const engagementScore = calculateEngagementScore(issue);
      
      // Calculate recent engagement
      let recentEngagement = 0;
      if (issue.socialMetrics && issue.socialMetrics.engagementHistory) {
        recentEngagement = issue.socialMetrics.engagementHistory
          .filter(e => new Date(e.timestamp) > cutoffTime)
          .length;
      }

      return {
        ...issue,
        engagementScore: engagementScore.score,
        recentEngagement,
        trendingScore: engagementScore.score + (recentEngagement * 5)
      };
    })
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, 10); // Top 10 trending
};

// Generate social engagement report
export const generateEngagementReport = (issue) => {
  const engagementScore = calculateEngagementScore(issue);
  const sentiment = analyzeCommentSentiment(issue.comments || []);
  
  return {
    engagement: engagementScore,
    sentiment,
    recommendations: generateSocialRecommendations(engagementScore, sentiment),
    metrics: {
      totalEngagement: engagementScore.score,
      communityInterest: engagementScore.level,
      urgencyLevel: sentiment.urgency,
      overallSentiment: sentiment.overall
    }
  };
};

// Generate recommendations based on social engagement
const generateSocialRecommendations = (engagementScore, sentiment) => {
  const recommendations = [];

  if (engagementScore.level === 'viral') {
    recommendations.push('🔥 Viral issue - immediate media attention likely');
    recommendations.push('📢 Prepare public statement/response');
    recommendations.push('⚡ Fast-track resolution to prevent escalation');
  }

  if (engagementScore.level === 'high') {
    recommendations.push('📈 High community interest - prioritize resolution');
    recommendations.push('💬 Engage with community for updates');
  }

  if (sentiment.overall === 'urgent') {
    recommendations.push('🚨 Community expressing urgency - immediate action needed');
    recommendations.push('📞 Consider emergency response protocols');
  }

  if (sentiment.urgency > 5) {
    recommendations.push('⚠️ Multiple urgent flags - escalate to authorities');
  }

  if (engagementScore.level === 'low' && sentiment.overall === 'neutral') {
    recommendations.push('📝 Standard processing - monitor for changes');
  }

  return recommendations;
};

// Mock function to simulate social metrics (for testing)
export const generateMockSocialMetrics = (baseLevel = 'low') => {
  const levels = {
    low: { likes: [1, 5], comments: [0, 3], shares: [0, 1] },
    medium: { likes: [10, 25], comments: [5, 15], shares: [2, 8] },
    high: { likes: [30, 70], comments: [15, 35], shares: [8, 20] },
    viral: { likes: [80, 150], comments: [40, 80], shares: [20, 50] }
  };

  const level = levels[baseLevel] || levels.low;
  
  return {
    likes: Math.floor(Math.random() * (level.likes[1] - level.likes[0]) + level.likes[0]),
    comments: Math.floor(Math.random() * (level.comments[1] - level.comments[0]) + level.comments[0]),
    shares: Math.floor(Math.random() * (level.shares[1] - level.shares[0]) + level.shares[0]),
    urgentFlags: Math.floor(Math.random() * 3),
    engagementHistory: generateMockEngagementHistory(baseLevel)
  };
};

// Generate mock engagement history
const generateMockEngagementHistory = (level) => {
  const history = [];
  const count = level === 'viral' ? 50 : level === 'high' ? 25 : level === 'medium' ? 10 : 5;
  
  for (let i = 0; i < count; i++) {
    const types = ['like', 'comment', 'share'];
    const type = types[Math.floor(Math.random() * types.length)];
    const hoursAgo = Math.random() * 72; // Within last 3 days
    
    history.push({
      type,
      timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
      userId: `user_${Math.floor(Math.random() * 1000)}`
    });
  }
  
  return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};