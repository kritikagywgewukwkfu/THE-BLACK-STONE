import React from 'react';

export default function Dashboard({ stats, activeOrders }) {
  return (
    <div style={{ padding: '30px', overflowY: 'auto', height: '100vh', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 5px 0' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Welcome back, Manager. Here's what's happening today.</p>
        </div>
      </div>

      {/* Analytics Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="pro-card">
          <p style={{ color: 'var(--text-muted)', margin: '0 0 10px 0', fontSize: '14px' }}>Total Sales (Today)</p>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--accent-gold)', margin: 0 }}>Rs. {stats?.totalSales || 1830}</h2>
        </div>
        <div className="pro-card">
          <p style={{ color: 'var(--text-muted)', margin: '0 0 10px 0', fontSize: '14px' }}>Active Orders</p>
          <h2 style={{ fontSize: '32px', fontWeight: '700', margin: 0 }}>{stats?.totalOrders || 2}</h2>
        </div>
        <div className="pro-card">
          <p style={{ color: 'var(--text-muted)', margin: '0 0 10px 0', fontSize: '14px' }}>Total Menu Items</p>
          <h2 style={{ fontSize: '32px', fontWeight: '700', margin: 0 }}>159</h2>
        </div>
      </div>

      {/* Live Active Orders Section */}
      <div className="pro-card">
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>Live Running Kitchen Orders</h3>
        {activeOrders && activeOrders.length > 0 ? (
          <div>{/* Active order cards */}</div>
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>No active running orders right now. Kitchen is clear! ✨</p>
        )}
      </div>
    </div>
  );
}
