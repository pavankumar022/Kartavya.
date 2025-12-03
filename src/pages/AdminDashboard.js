import React from 'react';
import { Users, FileText, CheckCircle, TrendingUp } from 'lucide-react';
import { getUsers } from '../utils/auth';

function AdminDashboard() {
  const allUsers = getUsers();
  const regularUsers = allUsers.filter(u => u.role === 'user');
  const totalReports = regularUsers.reduce((sum, u) => sum + u.stats.totalReports, 0);
  const totalResolved = regularUsers.reduce((sum, u) => sum + u.stats.resolvedIssues, 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ 
        fontSize: '28px', 
        fontWeight: '700', 
        color: '#000080',
        marginBottom: '10px'
      }}>
        Admin Dashboard
      </h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        System overview and user management
      </p>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '25px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '2px solid #FF9933'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
            <Users size={32} color="#FF9933" />
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#FF9933' }}>
                {regularUsers.length}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Total Users</div>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '25px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '2px solid #138808'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
            <FileText size={32} color="#138808" />
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#138808' }}>
                {totalReports}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Total Reports</div>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '25px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '2px solid #000080'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
            <CheckCircle size={32} color="#000080" />
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#000080' }}>
                {totalResolved}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Resolved Issues</div>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '25px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '2px solid #FFD700'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
            <TrendingUp size={32} color="#FFD700" />
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#FFD700' }}>
                {totalReports > 0 ? Math.round((totalResolved / totalReports) * 100) : 0}%
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Resolution Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          fontSize: '22px',
          fontWeight: '600',
          color: '#000080',
          marginBottom: '20px'
        }}>
          Registered Users
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E0E0E0' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#666', fontWeight: '600' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#666', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#666', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#666', fontWeight: '600' }}>Location</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#666', fontWeight: '600' }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#666', fontWeight: '600' }}>Reports</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#666', fontWeight: '600' }}>Points</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#666', fontWeight: '600' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user, index) => (
                <tr key={user.id} style={{
                  borderBottom: '1px solid #F0F0F0',
                  backgroundColor: index % 2 === 0 ? 'white' : '#F9F9F9'
                }}>
                  <td style={{ padding: '12px', color: '#666' }}>{user.id}</td>
                  <td style={{ padding: '12px', fontWeight: '600', color: '#000080' }}>{user.name}</td>
                  <td style={{ padding: '12px', color: '#666' }}>{user.email}</td>
                  <td style={{ padding: '12px', color: '#666' }}>{user.location}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      backgroundColor: user.role === 'admin' ? '#000080' : '#FF9933',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: '#666' }}>{user.stats.totalReports}</td>
                  <td style={{ padding: '12px', fontWeight: '600', color: '#FF9933' }}>{user.stats.points}</td>
                  <td style={{ padding: '12px', color: '#666', fontSize: '14px' }}>
                    {new Date(user.joinDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {allUsers.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666'
          }}>
            No users registered yet
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
