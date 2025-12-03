// Report management utilities

// Get all reports
export const getReports = () => {
  const reports = localStorage.getItem('reports');
  return reports ? JSON.parse(reports) : [];
};

// Add new report
export const addReport = (reportData) => {
  const reports = getReports();
  const newReport = {
    id: reports.length + 1,
    ...reportData,
    date: new Date().toISOString(),
    status: 'pending',
    upvotes: 0
  };
  
  reports.push(newReport);
  localStorage.setItem('reports', JSON.stringify(reports));
  return newReport;
};

// Get reports by user
export const getReportsByUser = (userId) => {
  const reports = getReports();
  return reports.filter(r => r.userId === userId);
};

// Update report status
export const updateReportStatus = (reportId, status) => {
  const reports = getReports();
  const reportIndex = reports.findIndex(r => r.id === reportId);
  
  if (reportIndex !== -1) {
    reports[reportIndex].status = status;
    localStorage.setItem('reports', JSON.stringify(reports));
    return reports[reportIndex];
  }
  return null;
};

// Upvote report
export const upvoteReport = (reportId) => {
  const reports = getReports();
  const reportIndex = reports.findIndex(r => r.id === reportId);
  
  if (reportIndex !== -1) {
    reports[reportIndex].upvotes += 1;
    localStorage.setItem('reports', JSON.stringify(reports));
    return reports[reportIndex];
  }
  return null;
};
