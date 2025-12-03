// Social features utility for reports - likes, comments, shares, reposts
import { addNotification } from './notifications';

// Social actions for reports
export const SOCIAL_ACTIONS = {
  LIKE: 'like',
  DISLIKE: 'dislike', 
  COMMENT: 'comment',
  SHARE: 'share',
  REPOST: 'repost'
};

// Points for social actions
export const SOCIAL_POINTS = {
  LIKE_RECEIVED: 5,
  COMMENT_RECEIVED: 10,
  SHARE_RECEIVED: 15,
  REPOST_RECEIVED: 20,
  COMMENT_MADE: 5,
  SHARE_MADE: 10,
  REPOST_MADE: 15
};

// Get social data for a report
export const getReportSocialData = (reportId) => {
  const socialData = JSON.parse(localStorage.getItem('reportSocialData') || '{}');
  return socialData[reportId] || {
    likes: [],
    dislikes: [],
    comments: [],
    shares: [],
    reposts: []
  };
};

// Save social data for a report
const saveReportSocialData = (reportId, data) => {
  const socialData = JSON.parse(localStorage.getItem('reportSocialData') || '{}');
  socialData[reportId] = data;
  localStorage.setItem('reportSocialData', JSON.stringify(socialData));
};

// Like/Unlike a report
export const toggleLike = (reportId, userId) => {
  const socialData = getReportSocialData(reportId);
  const hasLiked = socialData.likes.includes(userId);
  
  if (hasLiked) {
    // Unlike
    socialData.likes = socialData.likes.filter(id => id !== userId);
    addNotification('Unliked', 'You unliked this report', 'info');
  } else {
    // Like
    socialData.likes.push(userId);
    // Remove from dislikes if present
    socialData.dislikes = socialData.dislikes.filter(id => id !== userId);
    addNotification('Liked', 'You liked this report', 'success');
    
    // Award points to report author
    awardSocialPoints(reportId, SOCIAL_POINTS.LIKE_RECEIVED, 'like');
  }
  
  saveReportSocialData(reportId, socialData);
  return socialData;
};

// Dislike/Remove dislike from a report
export const toggleDislike = (reportId, userId) => {
  const socialData = getReportSocialData(reportId);
  const hasDisliked = socialData.dislikes.includes(userId);
  
  if (hasDisliked) {
    // Remove dislike
    socialData.dislikes = socialData.dislikes.filter(id => id !== userId);
    addNotification('Removed Dislike', 'You removed your dislike', 'info');
  } else {
    // Dislike
    socialData.dislikes.push(userId);
    // Remove from likes if present
    socialData.likes = socialData.likes.filter(id => id !== userId);
    addNotification('Disliked', 'You disliked this report', 'info');
  }
  
  saveReportSocialData(reportId, socialData);
  return socialData;
};

// Add comment to a report
export const addComment = (reportId, userId, userName, comment) => {
  const socialData = getReportSocialData(reportId);
  const newComment = {
    id: Date.now(),
    userId,
    userName,
    comment,
    timestamp: new Date().toISOString(),
    likes: [],
    replies: []
  };
  
  socialData.comments.push(newComment);
  saveReportSocialData(reportId, socialData);
  
  addNotification('Comment Added', 'Your comment has been posted', 'success');
  
  // Award points to commenter and report author
  awardUserPoints(userId, SOCIAL_POINTS.COMMENT_MADE, 'comment made');
  awardSocialPoints(reportId, SOCIAL_POINTS.COMMENT_RECEIVED, 'comment');
  
  return socialData;
};

// Delete comment (only by comment author)
export const deleteComment = (reportId, commentId, userId) => {
  const socialData = getReportSocialData(reportId);
  const commentIndex = socialData.comments.findIndex(c => c.id === commentId && c.userId === userId);
  
  if (commentIndex !== -1) {
    socialData.comments.splice(commentIndex, 1);
    saveReportSocialData(reportId, socialData);
    addNotification('Comment Deleted', 'Your comment has been removed', 'info');
    return socialData;
  }
  
  return null;
};

// Like/Unlike a comment
export const toggleCommentLike = (reportId, commentId, userId) => {
  const socialData = getReportSocialData(reportId);
  const comment = socialData.comments.find(c => c.id === commentId);
  
  if (comment) {
    const hasLiked = comment.likes.includes(userId);
    
    if (hasLiked) {
      comment.likes = comment.likes.filter(id => id !== userId);
    } else {
      comment.likes.push(userId);
    }
    
    saveReportSocialData(reportId, socialData);
    return socialData;
  }
  
  return null;
};

// Share a report
export const shareReport = (reportId, userId, platform = 'general') => {
  const socialData = getReportSocialData(reportId);
  const shareData = {
    userId,
    platform,
    timestamp: new Date().toISOString()
  };
  
  socialData.shares.push(shareData);
  saveReportSocialData(reportId, socialData);
  
  addNotification('Report Shared', `Report shared successfully`, 'success');
  
  // Award points to sharer and report author
  awardUserPoints(userId, SOCIAL_POINTS.SHARE_MADE, 'share made');
  awardSocialPoints(reportId, SOCIAL_POINTS.SHARE_RECEIVED, 'share');
  
  return socialData;
};

// Repost a report
export const repostReport = (reportId, userId, userName, message = '') => {
  const socialData = getReportSocialData(reportId);
  const repostData = {
    id: Date.now(),
    userId,
    userName,
    message,
    timestamp: new Date().toISOString()
  };
  
  socialData.reposts.push(repostData);
  saveReportSocialData(reportId, socialData);
  
  // Create a new report entry for the repost
  const originalReport = getReportById(reportId);
  if (originalReport) {
    const repostedReport = {
      ...originalReport,
      id: Date.now() + 1,
      isRepost: true,
      originalReportId: reportId,
      repostMessage: message,
      reportedBy: userId,
      reporterName: userName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to reported issues
    const existingIssues = JSON.parse(localStorage.getItem('reportedIssues') || '[]');
    existingIssues.unshift(repostedReport);
    localStorage.setItem('reportedIssues', JSON.stringify(existingIssues));
  }
  
  addNotification('Report Reposted', 'Report has been reposted to your profile', 'success');
  
  // Award points to reposter and original report author
  awardUserPoints(userId, SOCIAL_POINTS.REPOST_MADE, 'repost made');
  awardSocialPoints(reportId, SOCIAL_POINTS.REPOST_RECEIVED, 'repost');
  
  return socialData;
};

// Get report by ID
const getReportById = (reportId) => {
  const reports = JSON.parse(localStorage.getItem('reportedIssues') || '[]');
  return reports.find(report => report.id === reportId);
};

// Award points to report author for social interactions
const awardSocialPoints = (reportId, points, action) => {
  const report = getReportById(reportId);
  if (report && report.reportedBy) {
    awardUserPoints(report.reportedBy, points, `${action} received`);
  }
};

// Award points to a user
const awardUserPoints = (userId, points, reason) => {
  // This would integrate with your existing points system
  // For now, just show notification
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.id === userId) {
    addNotification(
      `+${points} Points!`,
      `You earned ${points} points for ${reason}`,
      'success'
    );
  }
};

// Get social stats for a report
export const getReportSocialStats = (reportId) => {
  const socialData = getReportSocialData(reportId);
  return {
    likesCount: socialData.likes.length,
    dislikesCount: socialData.dislikes.length,
    commentsCount: socialData.comments.length,
    sharesCount: socialData.shares.length,
    repostsCount: socialData.reposts.length,
    totalEngagement: socialData.likes.length + socialData.comments.length + socialData.shares.length + socialData.reposts.length
  };
};

// Check if user has interacted with report
export const getUserInteraction = (reportId, userId) => {
  const socialData = getReportSocialData(reportId);
  return {
    hasLiked: socialData.likes.includes(userId),
    hasDisliked: socialData.dislikes.includes(userId),
    hasCommented: socialData.comments.some(c => c.userId === userId),
    hasShared: socialData.shares.some(s => s.userId === userId),
    hasReposted: socialData.reposts.some(r => r.userId === userId)
  };
};

// Get trending reports based on social engagement
export const getTrendingReports = (limit = 10) => {
  const reports = JSON.parse(localStorage.getItem('reportedIssues') || '[]');
  
  const reportsWithEngagement = reports.map(report => {
    const stats = getReportSocialStats(report.id);
    return {
      ...report,
      socialStats: stats,
      trendingScore: calculateTrendingScore(report, stats)
    };
  });
  
  return reportsWithEngagement
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit);
};

// Calculate trending score based on engagement and recency
const calculateTrendingScore = (report, socialStats) => {
  const now = new Date();
  const reportDate = new Date(report.createdAt);
  const hoursSinceReport = (now - reportDate) / (1000 * 60 * 60);
  
  // Decay factor - newer reports get higher scores
  const decayFactor = Math.exp(-hoursSinceReport / 24); // Decay over 24 hours
  
  // Engagement score
  const engagementScore = 
    socialStats.likesCount * 1 +
    socialStats.commentsCount * 2 +
    socialStats.sharesCount * 3 +
    socialStats.repostsCount * 4;
  
  return engagementScore * decayFactor;
};

// Generate shareable link for a report
export const generateShareableLink = (reportId) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/report/${reportId}`;
};

// Share to social media platforms
export const shareToSocialMedia = (reportId, platform) => {
  const report = getReportById(reportId);
  const shareUrl = generateShareableLink(reportId);
  const shareText = `Check out this civic issue report: "${report.title}" - Help make our community better!`;
  
  let socialUrl = '';
  
  switch (platform) {
    case 'twitter':
      socialUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
      break;
    case 'facebook':
      socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
      break;
    case 'linkedin':
      socialUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
      break;
    case 'whatsapp':
      socialUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
      break;
    case 'telegram':
      socialUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
      break;
    default:
      // Copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      addNotification('Link Copied', 'Report link copied to clipboard', 'success');
      return;
  }
  
  if (socialUrl) {
    window.open(socialUrl, '_blank', 'width=600,height=400');
    
    // Track the share
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    shareReport(reportId, user.id, platform);
  }
};