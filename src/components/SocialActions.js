import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Repeat2, 
  ThumbsDown,
  Send,
  X,
  Copy,
  ExternalLink
} from 'lucide-react';
import {
  getReportSocialData,
  getReportSocialStats,
  getUserInteraction,
  toggleLike,
  toggleDislike,
  addComment,
  deleteComment,
  toggleCommentLike,
  repostReport,
  shareToSocialMedia
} from '../utils/socialFeatures';

const SocialActions = ({ reportId, reportTitle, compact = false }) => {
  const [socialData, setSocialData] = useState(null);
  const [socialStats, setSocialStats] = useState(null);
  const [userInteraction, setUserInteraction] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showRepostDialog, setShowRepostDialog] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [repostMessage, setRepostMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadSocialData();
  }, [reportId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSocialData = () => {
    const data = getReportSocialData(reportId);
    const stats = getReportSocialStats(reportId);
    const interaction = getUserInteraction(reportId, user.id);
    
    setSocialData(data);
    setSocialStats(stats);
    setUserInteraction(interaction);
  };

  const handleLike = () => {
    toggleLike(reportId, user.id);
    loadSocialData();
  };

  const handleDislike = () => {
    toggleDislike(reportId, user.id);
    loadSocialData();
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(reportId, user.id, user.name, newComment.trim());
      setNewComment('');
      loadSocialData();
    }
  };

  const handleDeleteComment = (commentId) => {
    deleteComment(reportId, commentId, user.id);
    loadSocialData();
  };

  const handleCommentLike = (commentId) => {
    toggleCommentLike(reportId, commentId, user.id);
    loadSocialData();
  };

  const handleShare = (platform) => {
    if (platform === 'copy') {
      const shareUrl = `${window.location.origin}/report/${reportId}`;
      navigator.clipboard.writeText(shareUrl);
    } else {
      shareToSocialMedia(reportId, platform);
    }
    setShowShareMenu(false);
  };

  const handleRepost = () => {
    if (loading) return;
    
    setLoading(true);
    repostReport(reportId, user.id, user.name, repostMessage.trim());
    setRepostMessage('');
    setShowRepostDialog(false);
    setLoading(false);
    loadSocialData();
  };

  if (!socialStats) return null;

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className={`flex items-center ${compact ? 'space-x-4' : 'space-x-6'} text-gray-400`}>
        {/* Like Button */}
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 hover:text-red-400 transition-colors ${
            userInteraction?.hasLiked ? 'text-red-400' : ''
          }`}
        >
          <Heart 
            className={`w-5 h-5 ${userInteraction?.hasLiked ? 'fill-current' : ''}`} 
          />
          <span className="text-sm">{socialStats.likesCount}</span>
        </button>

        {/* Dislike Button */}
        <button
          onClick={handleDislike}
          className={`flex items-center space-x-2 hover:text-gray-300 transition-colors ${
            userInteraction?.hasDisliked ? 'text-gray-300' : ''
          }`}
        >
          <ThumbsDown 
            className={`w-5 h-5 ${userInteraction?.hasDisliked ? 'fill-current' : ''}`} 
          />
          <span className="text-sm">{socialStats.dislikesCount}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 hover:text-blue-400 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">{socialStats.commentsCount}</span>
        </button>

        {/* Share Button */}
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center space-x-2 hover:text-green-400 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm">{socialStats.sharesCount}</span>
          </button>

          {/* Share Menu */}
          {showShareMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-2 z-10">
              <div className="flex flex-col space-y-2 min-w-[150px]">
                <button
                  onClick={() => handleShare('copy')}
                  className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-700 rounded text-sm"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-700 rounded text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Twitter</span>
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-700 rounded text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Facebook</span>
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-700 rounded text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Repost Button */}
        <button
          onClick={() => setShowRepostDialog(true)}
          className={`flex items-center space-x-2 hover:text-purple-400 transition-colors ${
            userInteraction?.hasReposted ? 'text-purple-400' : ''
          }`}
        >
          <Repeat2 className="w-5 h-5" />
          <span className="text-sm">{socialStats.repostsCount}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-700 pt-4 space-y-4">
          {/* Add Comment */}
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {socialData?.comments?.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {comment.userName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white text-sm">{comment.userName}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                        {comment.userId === user.id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{comment.comment}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <button
                      onClick={() => handleCommentLike(comment.id)}
                      className={`flex items-center space-x-1 text-xs hover:text-red-400 transition-colors ${
                        comment.likes?.includes(user.id) ? 'text-red-400' : 'text-gray-400'
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${comment.likes?.includes(user.id) ? 'fill-current' : ''}`} />
                      <span>{comment.likes?.length || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Repost Dialog */}
      {showRepostDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Repost Report</h3>
              <button
                onClick={() => setShowRepostDialog(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-300 text-sm mb-2">Add your thoughts (optional):</p>
              <textarea
                value={repostMessage}
                onChange={(e) => setRepostMessage(e.target.value)}
                placeholder="Why are you reposting this report?"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                rows="3"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRepostDialog(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRepost}
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Reposting...' : 'Repost'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menus */}
      {(showShareMenu || showRepostDialog) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowShareMenu(false);
            setShowRepostDialog(false);
          }}
        />
      )}
    </div>
  );
};

export default SocialActions;