export const addNotification = (title, message, type = 'info') => {
  const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
  
  const newNotification = {
    id: Date.now(),
    title,
    message,
    type, // 'success', 'warning', 'info', 'error'
    timestamp: new Date().toLocaleString(),
    read: false
  };
  
  notifications.unshift(newNotification); // Add to beginning
  
  // Keep only last 50 notifications
  if (notifications.length > 50) {
    notifications.splice(50);
  }
  
  localStorage.setItem('notifications', JSON.stringify(notifications));
  
  // Dispatch custom event to update notification count in real-time
  window.dispatchEvent(new CustomEvent('notificationAdded'));
};