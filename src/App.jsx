export const API_URL = "https://the-black-stone.onrender.com";

import React, { useState, useEffect, useRef } from 'react';
import menuData from './menuData';

function App() {
  // Login Page State (Initially false so login page shows first)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginRole, setLoginRole] = useState('admin'); // 'admin' or 'waiter'
  const [loginPasswordInput, setLoginPasswordInput] = useState('');

  // Password Management State
  const [storedPassword, setStoredPassword] = useState('admin123');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Staff Role State ('admin', 'cashier', 'waiter')
  const [userRole, setUserRole] = useState('admin');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderCategory, setOrderCategory] = useState('All');

  // Time Filters State ('all', 'today', 'yesterday', 'week', 'month', 'year')
  const [dashFilter, setDashFilter] = useState('today');
  const [expenseFilter, setExpenseFilter] = useState('today');
  const [historyFilter, setHistoryFilter] = useState('today');

  // Cabin Setup (6 Cabins, 1 Hall, 1 Outdoor)
  const [tableNo, setTableNo] = useState('Cabin 1');
  const [waiterName, setWaiterName] = useState('');
  
  // Payment & Discount States
  const [paymentMethod, setPaymentMethod] = useState('eSewa');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isPaid, setIsPaid] = useState(false);

  const [currentCart, setCurrentCart] = useState([]);
  
  // Clean Data Reset: Initialized to empty array
  const [placedOrders, setPlacedOrders] = useState([]);

  // Clean Data Reset: Initialized to empty array
  const [expenses, setExpenses] = useState([]);

  // Clean Data Reset: Initialized with blank names and zero values
  const [staffList, setStaffList] = useState([
    { id: 1, name: '', role: 'Waiter', salary: 0, paidAmount: 0, payoutHistory: [] },
    { id: 2, name: '', role: 'Chef', salary: 0, paidAmount: 0, payoutHistory: [] },
    { id: 3, name: '', role: 'Cashier', salary: 0, paidAmount: 0, payoutHistory: [] }
  ]);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Waiter');
  const [newStaffSalary, setNewStaffSalary] = useState('');
  const [payoutStaffId, setPayoutStaffId] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');

  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  const prevOrdersLenRef = useRef(0);
  const [selectedBill, setSelectedBill] = useState(null);

  // Mobile Hamburger Sidebar Toggle State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // QR Customer View State
  const [customerTable, setCustomerTable] = useState(null);
  const [customerCart, setCustomerCart] = useState([]);
  const [customerCategory, setCustomerCategory] = useState('All');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerOrderPlaced, setCustomerOrderPlaced] = useState(false);

  // ================= API FETCH FUNCTIONS (Replacing localStorage) =================

  // 1. Fetch initial data on load
  useEffect(() => {
    fetchOrders();
    fetchExpenses();
    fetchStaff();
    fetchSettings();
    
    // Polling interval to auto-sync live order updates for customers and admin
    const interval = setInterval(() => {
      fetchOrders();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        setPlacedOrders(data);
        prevOrdersLenRef.current = data.length;
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/expenses`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (e) {
      console.error('Error fetching expenses:', e);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API_URL}/api/staff`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) setStaffList(data);
      }
    } catch (e) {
      console.error('Error fetching staff:', e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings`);
      if (res.ok) {
        const data = await res.json();
        if (data.password) setStoredPassword(data.password);
      }
    } catch (e) {
      console.error('Error fetching settings:', e);
    }
  };

  // Web Audio API Beep Sound Generator for KOT Alerts
  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  // Check new orders length for audio alert via ref
  useEffect(() => {
    if (placedOrders.length > prevOrdersLenRef.current) {
      playBeep();
    }
    prevOrdersLenRef.current = placedOrders.length;
  }, [placedOrders]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    if (tableParam) {
      setCustomerTable(decodeURIComponent(tableParam));
    }
  }, []);

  useEffect(() => {
    if (userRole === 'waiter' && (activeTab === 'dashboard' || activeTab === 'settings')) {
      setActiveTab('order');
    }
  }, [userRole, activeTab]);

  if (!menuData || !Array.isArray(menuData)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2 style={{ color: '#ef4444' }}>Menu Data Not Found!</h2>
      </div>
    );
  }

  const checkTimeFilter = (itemRawDate, filterType) => {
    if (!itemRawDate) return true;
    const itemDate = new Date(itemRawDate);
    const now = new Date();

    const isSameDay = (d1, d2) => 
      d1.getDate() === d2.getDate() && 
      d1.getMonth() === d2.getMonth() && 
      d1.getFullYear() === d2.getFullYear();

    if (filterType === 'today') {
      return isSameDay(itemDate, now);
    }
    if (filterType === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      return isSameDay(itemDate, yesterday);
    }
    if (filterType === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return itemDate >= oneWeekAgo && itemDate <= now;
    }
    if (filterType === 'month') {
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }
    if (filterType === 'year') {
      return itemDate.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (currentPasswordInput !== storedPassword) {
      alert('Current password does not match!');
      return;
    }
    if (!newPasswordInput || newPasswordInput.length < 4) {
      alert('New password must be at least 4 characters long!');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPasswordInput })
      });
      if (res.ok) {
        setStoredPassword(newPasswordInput);
        setCurrentPasswordInput('');
        setNewPasswordInput('');
        alert('Password updated successfully!');
      } else {
        alert('Failed to update password on server.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while updating password.');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginRole === 'admin') {
      if (loginPasswordInput !== storedPassword) {
        alert('Incorrect Admin Password! (Default: admin123)');
        return;
      }
      setUserRole('admin');
      setActiveTab('dashboard');
    } else {
      setUserRole('waiter');
      setActiveTab('order');
    }
    setIsLoggedIn(true);
    setLoginPasswordInput('');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // ================= LOGIN PAGE =================
  if (!isLoggedIn && !customerTable) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#090d16', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
        <style>{`
          .login-card { background: #111827; border: 1px solid #1f2937; padding: 32px; border-radius: 24px; width: 100%; max-width: 400px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); color: #f8fafc; }
          .role-toggle-btn { flex: 1; padding: 12px; border-radius: 12px; border: 1px solid #1f2937; background: #090d16; color: #94a3b8; font-weight: 600; cursor: pointer; transition: all 0.2s; }
          .role-toggle-btn.active { background: #C5A059; color: #090d16; border-color: #C5A059; font-weight: 700; }
        `}</style>
        <div className="login-card">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '60px', height: '60px', margin: '0 auto 12px auto', borderRadius: '50%', border: '2px solid #C5A059', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090d16' }}>
              <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={(e)=>{e.target.style.display='none';}} />
            </div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '750', color: '#fff' }}>The Black Stone</h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Select your role to sign in</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
              type="button" 
              className={`role-toggle-btn ${loginRole === 'admin' ? 'active' : ''}`}
              onClick={() => setLoginRole('admin')}
            >
              👑 Admin
            </button>
            <button 
              type="button" 
              className={`role-toggle-btn ${loginRole === 'waiter' ? 'active' : ''}`}
              onClick={() => setLoginRole('waiter')}
            >
              🍽️ Waiter
            </button>
          </div>

          <form onSubmit={handleLoginSubmit}>
            {loginRole === 'admin' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Admin Password</label>
                <input 
                  type="password" 
                  placeholder="Enter password (default: admin123)"
                  value={loginPasswordInput}
                  onChange={(e) => setLoginPasswordInput(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #1f2937', background: '#090d16', color: '#fff', fontSize: '14px', outline: 'none' }}
                  required
                />
              </div>
            )}

            {loginRole === 'waiter' && (
              <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(197, 160, 89, 0.1)', border: '1px solid rgba(197, 160, 89, 0.2)', borderRadius: '12px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#C5A059', textAlign: 'center' }}>Waiter panel provides quick access to table orders and KOT generation.</p>
              </div>
            )}

            <button type="submit" style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #C5A059 0%, #a3813e 100%)', color: '#090d16', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(197, 160, 89, 0.4)' }}>
              Login as {loginRole === 'admin' ? 'Admin' : 'Waiter'} 🚀
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ================= CUSTOMER QR SELF-ORDERING VIEW =================
  if (customerTable) {
    const addToCustomerCart = (item) => {
      const existing = customerCart.find((c) => c.name === item.name);
      if (existing) {
        setCustomerCart(customerCart.map((c) => c.name === item.name ? { ...c, qty: c.qty + 1 } : c));
      } else {
        setCustomerCart([...customerCart, { ...item, qty: 1 }]);
      }
    };

    const updateCustomerQty = (name, delta) => {
      setCustomerCart(customerCart.map((item) => {
        if (item.name === name) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : null;
        }
        return item;
      }).filter(Boolean));
    };

    const handleCustomerSubmitOrder = async () => {
      if (customerCart.length === 0) {
        alert('Please select at least one item!');
        return;
      }

      const now = new Date();
      const newOrder = {
        id: `ORD-${Date.now().toString().slice(-4)}`,
        tableNo: customerTable,
        waiterName: 'QR Self-Order',
        items: [...customerCart],
        totalAmount: customerCart.reduce((sum, it) => sum + (it.price * it.qty), 0),
        status: 'Kitchen',
        rawDate: now.getTime(),
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      try {
        const res = await fetch(`${API_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        });
        if (res.ok) {
          fetchOrders();
          setCustomerOrderPlaced(true);
          setCustomerCart([]);
        } else {
          alert('Failed to place order.');
        }
      } catch (err) {
        console.error(err);
        alert('Network error while placing order.');
      }
    };

    const customerCategories = ['All', ...menuData.map((cat) => cat.category)];
    
    const filteredCustomerMenu = menuData.map((cat) => {
      if (customerCategory !== 'All' && cat.category !== customerCategory) return null;
      const matchedItems = (cat.items || []).filter(item => 
        item.name.toLowerCase().includes(customerSearchQuery.toLowerCase())
      );
      if (matchedItems.length === 0) return null;
      return { ...cat, items: matchedItems };
    }).filter(Boolean);

    const myTableOrders = placedOrders.filter(ord => ord.tableNo === customerTable && ord.status !== 'Billed');

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', padding: '16px', fontFamily: 'Inter, sans-serif', paddingBottom: customerCart.length > 0 ? '120px' : '30px' }}>
        <style>{`
          .qr-container { max-width: 600px; margin: 0 auto; }
          .qr-header { background: linear-gradient(135deg, #111827 0%, #1f2937 100%); border: 1px solid #1f2937; padding: 24px; border-radius: 20px; text-align: center; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .qr-logo { width: 56px; height: 56px; margin: 0 auto 12px auto; border-radius: 50%; border: 2px solid #C5A059; overflow: hidden; background: #090d16; display: flex; align-items: center; justify-content: center; }
          .qr-logo img { width: 100%; height: 100%; object-fit: cover; }
          .table-badge { display: inline-block; background: rgba(197, 160, 89, 0.15); color: #C5A059; border: 1px solid rgba(197, 160, 89, 0.3); padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; margin-top: 10px; }
          .search-bar { width: 100%; padding: 12px 16px; border-radius: 14px; border: 1px solid #1f2937; background: #111827; color: #fff; font-size: 14px; outline: none; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
          .cat-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 20px; scrollbar-width: none; }
          .cat-scroll::-webkit-scrollbar { display: none; }
          .cat-chip { padding: 8px 16px; border-radius: 20px; border: 1px solid #1f2937; background: #111827; color: #94a3b8; font-weight: 600; font-size: 13px; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
          .cat-chip.active { background: #C5A059; color: #090d16; border-color: #C5A059; font-weight: 700; box-shadow: 0 4px 12px rgba(197, 160, 89, 0.3); }
          .menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; margin-bottom: 20px; }
          .menu-card { background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
          .add-item-btn { background: linear-gradient(135deg, #C5A059 0%, #a3813e 100%); color: #090d16; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; box-shadow: 0 4px 12px rgba(197, 160, 89, 0.2); }
          .floating-cart-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #111827; border-top: 1px solid #1f2937; padding: 16px; box-shadow: 0 -10px 30px rgba(0,0,0,0.5); z-index: 1500; border-top-left-radius: 24px; border-top-right-radius: 24px; max-width: 600px; margin: 0 auto; }
          .live-tracker { background: #111827; border: 1px solid rgba(52, 211, 153, 0.3); border-radius: 16px; padding: 16px; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
        `}</style>

        <div className="qr-container">
          <div className="qr-header">
            <div className="qr-logo">
              <img src="/logo.png" alt="Logo" onError={(e)=>{e.target.style.display='none';}} />
            </div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '750', color: '#fff' }}>The Black Stone</h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Digital Self-Ordering Menu</p>
            <div className="table-badge">
              📍 Seated at: {customerTable}
            </div>
          </div>

          {customerOrderPlaced ? (
            <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '20px', padding: '32px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
              <h2 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '22px' }}>Order Placed Successfully!</h2>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>Your items have been sent straight to the kitchen. Enjoy your dining experience!</p>
              <button onClick={() => setCustomerOrderPlaced(false)} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #C5A059 0%, #a3813e 100%)', color: '#090d16', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
                Order More Items 🍕
              </button>
            </div>
          ) : (
            <div>
              {myTableOrders.length > 0 && (
                <div className="live-tracker">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #1f2937', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: '#34d399' }}>📢 Live Order Tracking</span>
                    <span style={{ fontSize: '11px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>Active</span>
                  </div>
                  {myTableOrders.map((ord, idx) => (
                    <div key={idx} style={{ marginBottom: idx < myTableOrders.length - 1 ? '12px' : '0', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', marginBottom: '4px' }}>
                        <span style={{ color: '#cbd5e1' }}>Order #{ord.id}</span>
                        <span style={{ color: ord.status === 'Ready' ? '#34d399' : ord.status === 'Preparing' ? '#fbbf24' : '#60a5fa' }}>
                          ● Status: {ord.status}
                        </span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                        {ord.items.map(i => `${i.name} (${i.qty})`).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="text"
                className="search-bar"
                placeholder="🔍 Search delicious items..."
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
              />

              <div className="cat-scroll">
                {customerCategories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCustomerCategory(cat)}
                    className={`cat-chip ${customerCategory === cat ? 'active' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div>
                {filteredCustomerMenu.map((cat, idx) => (
                  <div key={idx} style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: '#C5A059', fontSize: '16px', fontWeight: '700', marginBottom: '12px', borderBottom: '1px solid #1f2937', paddingBottom: '6px' }}>
                      {cat.category}
                    </h3>
                    <div className="menu-grid">
                      {cat.items.map((item, i) => (
                        <div key={i} className="menu-card">
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '14px', color: '#fff', marginBottom: '4px' }}>{item.name}</div>
                            <div style={{ fontWeight: '700', fontSize: '14px', color: '#34d399' }}>Rs. {item.price}</div>
                          </div>
                          <button onClick={() => addToCustomerCart(item)} className="add-item-btn">
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {customerCart.length > 0 && (
                <div className="floating-cart-bar">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: '#C5A059' }}>🛒 Cart Summary ({customerCart.reduce((s, i) => s + i.qty, 0)} items)</span>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: '#34d399' }}>
                      Rs. {customerCart.reduce((sum, it) => sum + (it.price * it.qty), 0)}
                    </span>
                  </div>
                  <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '12px', borderTop: '1px solid #1f2937', borderBottom: '1px solid #1f2937', padding: '8px 0' }}>
                    {customerCart.map((it, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '13px' }}>
                        <span style={{ color: '#cbd5e1' }}>{it.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#34d399', fontWeight: '600' }}>Rs. {it.price * it.qty}</span>
                          <button onClick={() => updateCustomerQty(it.name, -1)} style={{ background: '#1f2937', color: '#fff', border: 'none', width: '22px', height: '22px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                          <span style={{ fontWeight: '600', minWidth: '16px', textAlign: 'center' }}>{it.qty}</span>
                          <button onClick={() => updateCustomerQty(it.name, 1)} style={{ background: '#1f2937', color: '#fff', border: 'none', width: '22px', height: '22px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={handleCustomerSubmitOrder} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)', color: '#090d16', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(52,211,153,0.3)' }}>
                    Confirm & Send Order to Kitchen 🚀
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const availableCabins = [
    'Cabin 1', 'Cabin 2', 'Cabin 3', 'Cabin 4', 'Cabin 5', 'Cabin 6',
    'Hall', 'Outdoor'
  ];

  const categories = ['All', ...menuData.map((cat) => cat.category)];

  const filteredData = menuData
    .map((cat) => {
      if (selectedCategory !== 'All' && cat.category !== selectedCategory) return null;
      const matchingItems = (cat.items || []).filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matchingItems.length === 0) return null;
      return { ...cat, items: matchingItems };
    })
    .filter(Boolean);

  const filteredOrderData = menuData
    .map((cat) => {
      if (orderCategory !== 'All' && cat.category !== orderCategory) return null;
      const matchingItems = (cat.items || []).filter((item) =>
        item.name.toLowerCase().includes(orderSearchQuery.toLowerCase())
      );
      if (matchingItems.length === 0) return null;
      return { ...cat, items: matchingItems };
    })
    .filter(Boolean);

  const addToCart = (item) => {
    const existing = currentCart.find((c) => c.name === item.name);
    if (existing) {
      setCurrentCart(
        currentCart.map((c) =>
          c.name === item.name ? { ...c, qty: c.qty + 1 } : c
        )
      );
    } else {
      setCurrentCart([...currentCart, { ...item, qty: 1 }]);
    }
  };

  const updateQty = (name, delta) => {
    setCurrentCart(
      currentCart
        .map((item) => {
          if (item.name === name) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const calculateSubtotal = () =>
    currentCart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const activeCabinOrder = placedOrders.find(
    (ord) => ord.tableNo === tableNo && ord.status !== 'Billed'
  );

  const updateActiveCabinItemQty = async (itemName, delta) => {
    if (!activeCabinOrder) return;
    
    const updatedItems = activeCabinOrder.items.map(it => {
      if (it.name === itemName) {
        const newQty = it.qty + delta;
        return newQty > 0 ? { ...it, qty: newQty } : null;
      }
      return it;
    }).filter(Boolean);

    const newTotalAmount = updatedItems.reduce((sum, it) => sum + (it.price * it.qty), 0);

    const updatedOrderPayload = {
      ...activeCabinOrder,
      items: updatedItems,
      totalAmount: newTotalAmount
    };

    try {
      const res = await fetch(`${API_URL}/api/orders/${activeCabinOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrderPayload)
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error('Error updating order item qty:', e);
    }
  };

  const removeActiveCabinItem = async (itemName) => {
    if (!activeCabinOrder) return;
    
    const updatedItems = activeCabinOrder.items.filter(it => it.name !== itemName);
    const newTotalAmount = updatedItems.reduce((sum, it) => sum + (it.price * it.qty), 0);

    const updatedOrderPayload = {
      ...activeCabinOrder,
      items: updatedItems,
      totalAmount: newTotalAmount
    };

    try {
      const res = await fetch(`${API_URL}/api/orders/${activeCabinOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrderPayload)
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error('Error removing order item:', e);
    }
  };

  const handlePlaceOrder = async () => {
    if (currentCart.length === 0) {
      alert('Please select at least one item!');
      return;
    }
    if (!waiterName.trim()) {
      alert('Please enter Waiter / Staff Name!');
      return;
    }

    const now = new Date();
    const currentDateStr = now.toLocaleDateString();
    const currentTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let targetOrder;

    if (activeCabinOrder) {
      const updatedItemsMap = {};
      activeCabinOrder.items.forEach(it => {
        updatedItemsMap[it.name] = { ...it };
      });
      
      currentCart.forEach(it => {
        if (updatedItemsMap[it.name]) {
          updatedItemsMap[it.name].qty += it.qty;
        } else {
          updatedItemsMap[it.name] = { ...it };
        }
      });

      const mergedItems = Object.values(updatedItemsMap);
      const newTotalAmount = mergedItems.reduce((sum, it) => sum + (it.price * it.qty), 0);

      targetOrder = {
        ...activeCabinOrder,
        items: mergedItems,
        totalAmount: newTotalAmount,
        waiterName: waiterName,
        status: 'Kitchen'
      };

      try {
        await fetch(`${API_URL}/api/orders/${activeCabinOrder.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(targetOrder)
        });
        fetchOrders();
      } catch (e) {
        console.error('Error merging cabin order:', e);
      }
    } else {
      targetOrder = {
        id: `ORD-${Date.now().toString().slice(-4)}`,
        tableNo,
        waiterName,
        items: [...currentCart],
        totalAmount: calculateSubtotal(),
        status: 'Kitchen',
        rawDate: now.getTime(),
        date: currentDateStr,
        time: currentTimeStr
      };

      try {
        await fetch(`${API_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(targetOrder)
        });
        fetchOrders();
      } catch (e) {
        console.error('Error creating new order:', e);
      }
    }

    printKOTTicket(targetOrder || { tableNo, waiterName, items: currentCart });
    setCurrentCart([]);
    alert(`Order sent to Kitchen for ${tableNo} & KOT Printed!`);
  };

  const printKOTTicket = (orderData) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    const kotHTML = `
      <html>
        <head>
          <title>KOT Print</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 72mm; margin: 0; padding: 10px; font-size: 12px; color: #000; }
            h3 { text-align: center; margin: 0 0 5px 0; font-size: 14px; }
            .center { text-align: center; }
            .line { border-bottom: 1px dashed #000; margin: 6px 0; }
            ul { padding-left: 15px; margin: 5px 0; }
            li { font-weight: bold; font-size: 13px; margin-bottom: 3px; }
          </style>
        </head>
        <body>
          <h3>KITCHEN ORDER TICKET (KOT)</h3>
          <div class="center" style="font-size: 11px;">The Black Stone Cafe</div>
          <div class="line"></div>
          <div><b>Location:</b> ${orderData.tableNo}</div>
          <div><b>Staff:</b> ${orderData.waiterName || 'Staff'}</div>
          <div><b>Time:</b> ${new Date().toLocaleTimeString()}</div>
          <div class="line"></div>
          <ul>
            ${orderData.items.map(it => `<li>${it.name} x ${it.qty}</li>`).join('')}
          </ul>
          <div class="line"></div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(kotHTML);
    printWindow.document.close();
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const ordToUpdate = placedOrders.find(o => o.id === orderId);
    if (!ordToUpdate) return;
    const updatedPayload = { ...ordToUpdate, status: newStatus };

    try {
      await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });
      fetchOrders();
    } catch (e) {
      console.error('Error updating status:', e);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount) {
      alert('Please fill both expense title and amount!');
      return;
    }
    const now = new Date();
    const newExp = {
      id: Date.now(),
      title: expenseTitle,
      amount: Number(expenseAmount),
      rawDate: now.getTime(),
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      const res = await fetch(`${API_URL}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExp)
      });
      if (res.ok) {
        fetchExpenses();
        setExpenseTitle('');
        setExpenseAmount('');
      }
    } catch (e) {
      console.error('Error adding expense:', e);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaffName || !newStaffSalary) {
      alert('Please provide staff name and salary!');
      return;
    }
    const newStaff = {
      id: Date.now(),
      name: newStaffName,
      role: newStaffRole,
      salary: Number(newStaffSalary),
      paidAmount: 0,
      payoutHistory: []
    };

    try {
      const res = await fetch(`${API_URL}/api/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff)
      });
      if (res.ok) {
        fetchStaff();
        setNewStaffName('');
        setNewStaffSalary('');
        alert('Staff added successfully!');
      }
    } catch (e) {
      console.error('Error adding staff:', e);
    }
  };

  const handleUpdateStaffField = async (id, field, value) => {
    const updatedStaffList = staffList.map(st => {
      if (st.id === id) {
        return { 
          ...st, 
          [field]: field === 'salary' ? Number(value) : value 
        };
      }
      return st;
    });
    setStaffList(updatedStaffList);

    const staffMember = updatedStaffList.find(s => s.id === id);
    if (staffMember) {
      try {
        await fetch(`${API_URL}/api/staff/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(staffMember)
        });
      } catch (e) {
        console.error('Error updating staff member field:', e);
      }
    }
  };

  const handleRecordSalaryPayout = async (e) => {
    e.preventDefault();
    if (!payoutStaffId || !payoutAmount) {
      alert('Please select staff and enter payout amount!');
      return;
    }

    const amountNum = Number(payoutAmount);
    const staffMember = staffList.find(s => s.id === Number(payoutStaffId));
    if (!staffMember) return;

    const now = new Date();
    const payoutRecord = {
      amount: amountNum,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedStaffMember = {
      ...staffMember,
      paidAmount: staffMember.paidAmount + amountNum,
      payoutHistory: [...(staffMember.payoutHistory || []), payoutRecord]
    };

    try {
      await fetch(`${API_URL}/api/staff/${staffMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStaffMember)
      });
      fetchStaff();
    } catch (e) {
      console.error('Error recording payout:', e);
    }

    const newExp = {
      id: Date.now(),
      title: `Salary Payout: ${staffMember.name || 'Staff'} (${staffMember.role})`,
      amount: amountNum,
      rawDate: now.getTime(),
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      await fetch(`${API_URL}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExp)
      });
      fetchExpenses();
    } catch (e) {
      console.error('Error recording payout expense:', e);
    }

    setPayoutStaffId('');
    setPayoutAmount('');
    alert(`Salary payout of Rs. ${amountNum} recorded for ${staffMember.name || 'Staff'}!`);
  };

  const filteredSalesOrders = placedOrders.filter(ord => checkTimeFilter(ord.rawDate, dashFilter));
  const filteredExpenseList = expenses.filter(exp => checkTimeFilter(exp.rawDate, expenseFilter));
  const filteredHistoryOrders = placedOrders.filter(ord => checkTimeFilter(ord.rawDate, historyFilter));

  const totalSales = filteredSalesOrders.reduce((sum, ord) => sum + ord.totalAmount, 0);
  const totalExpenses = filteredExpenseList.reduce((sum, exp) => sum + exp.amount, 0);
  const netRevenue = totalSales - totalExpenses;

  const allSidebarItems = [
    { id: 'dashboard', label: 'Dashboard & Finance', icon: '📊', roles: ['admin'] },
    { id: 'tables', label: 'Table & Cabin Status', icon: '🪑', roles: ['admin', 'cashier', 'waiter'] },
    { id: 'order', label: 'Order & KOT', icon: '📝', roles: ['admin', 'waiter'] },
    { id: 'salary', label: 'Staff & Salary Mgmt', icon: '💰', roles: ['admin'] },
    { id: 'qr-menu', label: 'QR Menu Setup', icon: '📱', roles: ['admin'] },
    { id: 'expenses', label: 'Daily Expense Entry', icon: '💸', roles: ['admin', 'cashier'] },
    { id: 'billing', label: 'Billing & Receipt', icon: '🧾', roles: ['admin', 'cashier'] },
    { id: 'history', label: 'Order History', icon: '📅', roles: ['admin', 'cashier'] },
    { id: 'menu', label: 'Menu Card', icon: '📜', roles: ['admin', 'cashier', 'waiter'] },
    { id: 'settings', label: 'Change Password', icon: '⚙️', roles: ['admin', 'cashier'] },
  ];

  const sidebarItems = allSidebarItems.filter(item => item.roles.includes(userRole));

  const filterTabs = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
    { id: 'all', label: 'All Time' },
  ];

  return (
    <div className="app-layout">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area { position: absolute; left: 0; top: 0; width: 80mm; font-size: 12px; font-family: 'Courier New', Courier, monospace; color: #000; }
        }
        
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background-color: #090d16; color: #f8fafc; font-family: Inter, system-ui, sans-serif; }
        
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #090d16; }
        ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #C5A059; }

        .app-layout {
          display: flex;
          min-height: 100vh;
          background-color: #090d16;
          position: relative;
        }

        .desktop-sidebar {
          width: 260px;
          background-color: #111827;
          border-right: 1px solid #1f2937;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 24px 0;
          position: sticky;
          top: 0;
          height: 100vh;
          z-index: 1200;
          flex-shrink: 0;
        }

        .sidebar-brand {
          padding: 0 24px 20px 24px;
          border-bottom: 1px solid #1f2937;
          margin-bottom: 16px;
          text-align: center;
        }

        .brand-logo-circle {
          width: 48px;
          height: 48px;
          margin: 0 auto 10px auto;
          border-radius: 50%;
          overflow: hidden;
          border: 1.5px solid #C5A059;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #090d16;
          box-shadow: 0 0 10px rgba(197, 160, 89, 0.3);
        }

        .brand-logo-circle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sidebar-brand h2 {
          margin: 0;
          font-size: 15px;
          color: #fff;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .role-badge {
          font-size: 11px;
          background: rgba(197, 160, 89, 0.2);
          color: #C5A059;
          padding: 2px 8px;
          border-radius: 6px;
          border: 1px solid rgba(197, 160, 89, 0.3);
          text-transform: uppercase;
          font-weight: 700;
          display: inline-block;
          margin-top: 6px;
        }

        .sidebar-nav {
          padding: 0 12px;
          overflow-y: auto;
          flex: 1;
        }

        .nav-item-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          text-align: left;
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 6px;
          transition: all 0.2s ease;
        }

        .sidebar-footer {
          padding: 0 20px;
          border-top: 1px solid #1f2937;
          padding-top: 16px;
        }

        .logout-btn {
          width: 100%;
          padding: 12px;
          background-color: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .mobile-navbar {
          display: none;
          background-color: #111827;
          border-bottom: 1px solid #1f2937;
          padding: 12px 16px;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 1300;
          width: 100%;
        }

        .mobile-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mobile-logo {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          overflow: hidden;
          border: 1.5px solid #C5A059;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #090d16;
        }

        .mobile-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hamburger-btn {
          background: #1f2937;
          border: 1px solid #374151;
          color: #fff;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
        }

        .mobile-dropdown-menu {
          position: fixed;
          top: 61px;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #090d16;
          z-index: 1250;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .main-workspace {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
          width: 100%;
          max-width: 100%;
        }

        .gold-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #C5A059 0%, #a3813e 100%);
          color: #090d16;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(197, 160, 89, 0.4);
        }

        .form-group {
          text-align: left;
          margin-bottom: 16px;
        }

        .form-group label {
          font-size: 13px;
          color: #cbd5e1;
          font-weight: 600;
        }

        .form-group input, .form-group select {
          width: 100%;
          padding: 12px 14px;
          margin-top: 6px;
          border-radius: 12px;
          border: 1px solid #1f2937;
          background-color: #090d16;
          color: #fff;
          font-size: 14px;
          outline: none;
        }

        .dashboard-header-flex, .filter-header-flex {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .metric-card {
          background-color: #111827;
          padding: 24px;
          border-radius: 20px;
          border: 1px solid #1f2937;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .time-filters-bar {
          display: flex;
          gap: 6px;
          background-color: #111827;
          padding: 4px;
          border-radius: 12px;
          border: 1px solid #1f2937;
          overflow-x: auto;
          max-width: 100%;
        }

        .time-filter-btn {
          padding: 6px 12px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .card-container {
          background-color: #111827;
          padding: 24px;
          border-radius: 20px;
          border: 1px solid #1f2937;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .table-responsive-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .custom-data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }

        .custom-data-table th {
          background-color: #090d16;
          text-align: left;
          color: #94a3b8;
          font-size: 13px;
          padding: 12px;
          border-bottom: 1px solid #1f2937;
        }

        .custom-data-table td {
          padding: 12px;
          border-bottom: 1px solid #1f2937;
          font-size: 14px;
        }

        .dual-grid-section {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 24px;
        }

        @media (max-width: 1100px) {
          .dual-grid-section {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .app-layout {
            flex-direction: column;
          }
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-navbar {
            display: flex !important;
          }
          .main-workspace {
            padding: 16px !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* MOBILE TOP NAVIGATION BAR */}
      <div className="mobile-navbar">
        <div className="mobile-brand">
          <div className="mobile-logo">
            <img src="/logo.png" alt="Logo" onError={(e)=>{e.target.style.display='none';}} />
          </div>
          <span style={{ fontWeight: '700', fontSize: '15px', color: '#fff' }}>The Black Stone</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="hamburger-btn"
        >
          {isMobileMenuOpen ? '✕ Close' : '☰ Menu'}
        </button>
      </div>

      {/* MOBILE FULLSCREEN DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <div className="mobile-dropdown-menu">
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {sidebarItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                      backgroundColor: isActive ? 'rgba(197, 160, 89, 0.15)' : '#111827',
                      color: isActive ? '#C5A059' : '#94a3b8',
                      border: isActive ? '1px solid rgba(197, 160, 89, 0.3)' : '1px solid #1f2937', 
                      borderRadius: '12px', textAlign: 'left', fontSize: '15px',
                      fontWeight: isActive ? '700' : '500', cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #1f2937', paddingTop: '16px' }}>
            <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="desktop-sidebar">
        <div>
          <div className="sidebar-brand">
            <div className="brand-logo-circle">
              <img src="/logo.png" alt="Logo" onError={(e)=>{e.target.style.display='none';}} />
            </div>
            <h2>The Black Stone</h2>
            <div>
              <span className="role-badge">
                {userRole === 'admin' ? 'Admin' : userRole === 'cashier' ? 'Cashier' : 'Waiter'}
              </span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="nav-item-btn"
                  style={{
                    backgroundColor: isActive ? 'rgba(197, 160, 89, 0.15)' : 'transparent',
                    color: isActive ? '#C5A059' : '#94a3b8',
                    border: isActive ? '1px solid rgba(197, 160, 89, 0.3)' : '1px solid transparent',
                    fontWeight: isActive ? '700' : '500'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-workspace">
        
        {/* 1. DASHBOARD & FINANCE */}
        {activeTab === 'dashboard' && userRole === 'admin' && (
          <div>
            <div className="dashboard-header-flex">
              <div>
                <h1 style={{ color: '#f8fafc', margin: '0 0 4px 0', fontSize: '26px', fontWeight: '750' }}>📊 Dashboard & Finance Overview</h1>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Track sales, expenses, and net revenue based on time intervals.</p>
              </div>

              <div className="time-filters-bar">
                {filterTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDashFilter(tab.id)}
                    className="time-filter-btn"
                    style={{
                      backgroundColor: dashFilter === tab.id ? '#C5A059' : 'transparent',
                      color: dashFilter === tab.id ? '#090d16' : '#94a3b8'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="metrics-grid">
              <div className="metric-card" style={{ borderLeft: '4px solid #34d399' }}>
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Total Sales ({dashFilter.toUpperCase()})</span>
                <h2 style={{ margin: '10px 0 0 0', color: '#34d399', fontSize: '26px', fontWeight: '750' }}>Rs. {totalSales}</h2>
              </div>
              <div className="metric-card" style={{ borderLeft: '4px solid #f87171' }}>
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Total Expenses ({dashFilter.toUpperCase()})</span>
                <h2 style={{ margin: '10px 0 0 0', color: '#f87171', fontSize: '26px', fontWeight: '750' }}>Rs. {totalExpenses}</h2>
              </div>
              <div className="metric-card" style={{ borderLeft: '4px solid #60a5fa' }}>
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Net Balance ({dashFilter.toUpperCase()})</span>
                <h2 style={{ margin: '10px 0 0 0', color: '#60a5fa', fontSize: '26px', fontWeight: '750' }}>Rs. {netRevenue}</h2>
              </div>
            </div>

            <div className="card-container">
              <h3 style={{ color: '#f8fafc', margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Live Running Orders</h3>
              {placedOrders.filter(o => o.status !== 'Billed').length > 0 ? (
                <div className="table-responsive-wrapper">
                  <table className="custom-data-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Location</th>
                        <th>Staff</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {placedOrders.filter(o => o.status !== 'Billed').map((ord, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: '600', color: '#f8fafc' }}>{ord.id}</td>
                          <td style={{ fontWeight: '600', color: '#C5A059' }}>{ord.tableNo}</td>
                          <td style={{ color: '#94a3b8' }}>{ord.waiterName}</td>
                          <td style={{ fontWeight: '700', color: '#34d399' }}>Rs. {ord.totalAmount}</td>
                          <td>
                            <select
                              value={ord.status}
                              onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                              style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #1f2937', fontWeight: '600', backgroundColor: '#090d16', color: '#f8fafc', fontSize: '12px', outline: 'none' }}
                            >
                              <option value="Kitchen">🟠 Kitchen</option>
                              <option value="Preparing">🟡 Preparing</option>
                              <option value="Ready">🔵 Ready</option>
                              <option value="Served">🟢 Served</option>
                              <option value="Billed">✅ Billed</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>No active running orders right now.</p>
              )}
            </div>
          </div>
        )}

        {/* TABLE / CABIN STATUS */}
        {activeTab === 'tables' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ color: '#f8fafc', margin: '0 0 4px 0', fontSize: '26px', fontWeight: '750' }}>🪑 Table & Cabin Status Indicators</h1>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Monitor real-time occupancy status across all cabins, hall, and outdoor seating.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {availableCabins.map((cabinName, idx) => {
                const activeOrderForCabin = placedOrders.find(ord => ord.tableNo === cabinName && ord.status !== 'Billed');
                const isOccupied = Boolean(activeOrderForCabin);

                return (
                  <div key={idx} style={{ 
                    backgroundColor: '#111827', padding: '24px', borderRadius: '20px', 
                    border: isOccupied ? '1px solid #ef4444' : '1px solid #34d399', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' 
                  }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: isOccupied ? '#ef4444' : '#34d399' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#f8fafc' }}>{cabinName}</h3>
                      <span style={{ 
                        fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '8px', 
                        backgroundColor: isOccupied ? 'rgba(239, 68, 68, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                        color: isOccupied ? '#f87171' : '#34d399', border: `1px solid ${isOccupied ? 'rgba(239, 68, 68, 0.3)' : 'rgba(52, 211, 153, 0.3)'}`
                      }}>
                        {isOccupied ? '🔴 Occupied' : '🟢 Free'}
                      </span>
                    </div>

                    {isOccupied ? (
                      <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '10px', borderTop: '1px solid #1f2937', paddingTop: '10px' }}>
                        <div><b>Order ID:</b> {activeOrderForCabin.id}</div>
                        <div><b>Staff:</b> {activeOrderForCabin.waiterName}</div>
                        <div><b>Status:</b> <span style={{ color: '#fbbf24', fontWeight: '600' }}>{activeOrderForCabin.status}</span></div>
                        <div style={{ marginTop: '6px', color: '#34d399', fontWeight: '700' }}>Amount: Rs. {activeOrderForCabin.totalAmount}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '10px', borderTop: '1px solid #1f2937', paddingTop: '10px' }}>
                        Ready for new guests.
                      </div>
                    )}

                    {userRole !== 'cashier' && (
                      <div style={{ marginTop: '16px' }}>
                        <button 
                          onClick={() => {
                            setTableNo(cabinName);
                            setActiveTab('order');
                          }}
                          style={{ width: '100%', padding: '10px', backgroundColor: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          {isOccupied ? 'View / Add Items' : 'Take Order 📝'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. ORDER SECTION */}
        {activeTab === 'order' && userRole !== 'cashier' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ color: '#f8fafc', margin: '0 0 4px 0', fontSize: '26px', fontWeight: '750' }}>📝 Order & KOT Management (Cabin-wise)</h1>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Select specific cabin (Cabin 1, Cabin 2, Cabin 3, etc.) to manage orders separately.</p>
            </div>

            <div style={{ marginBottom: '16px', maxWidth: '400px' }}>
              <input
                type="text"
                placeholder="🔍 Search items..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #1f2937', backgroundColor: '#111827', color: '#fff', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '6px' }}>
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setOrderCategory(cat)}
                  style={{
                    padding: '8px 18px', borderRadius: '20px', border: orderCategory === cat ? '1px solid #C5A059' : '1px solid #1f2937',
                    backgroundColor: orderCategory === cat ? '#C5A059' : '#111827',
                    color: orderCategory === cat ? '#090d16' : '#94a3b8',
                    fontWeight: orderCategory === cat ? '700' : '500', cursor: 'pointer', whiteSpace: 'nowrap'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="dual-grid-section">
              <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {filteredOrderData.map((category, index) => (
                  <section key={index} style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: '#C5A059', borderBottom: '1px solid #1f2937', paddingBottom: '6px', marginBottom: '14px', fontSize: '16px', fontWeight: '700' }}>
                      {category.category}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                      {category.items.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => addToCart(item)}
                          style={{
                            backgroundColor: '#111827', padding: '14px', borderRadius: '14px',
                            border: '1px solid #1f2937', cursor: 'pointer', fontWeight: '600', color: '#f8fafc',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ fontSize: '14px', marginBottom: '6px' }}>{item.name}</div>
                          <div style={{ fontSize: '13px', color: '#34d399', fontWeight: '700' }}>Rs. {item.price}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ backgroundColor: '#111827', padding: '20px', borderRadius: '20px', border: '1px solid #1f2937' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #1f2937', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: '#C5A059' }}>📋 Live Running Order ({tableNo})</span>
                    {activeCabinOrder && (
                      <span style={{ fontSize: '12px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>
                        {activeCabinOrder.status}
                      </span>
                    )}
                  </div>

                  {activeCabinOrder && activeCabinOrder.items.length > 0 ? (
                    <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                      {activeCabinOrder.items.map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0', fontSize: '13px', borderBottom: '1px dashed #1f2937', paddingBottom: '6px' }}>
                          <div>
                            <div style={{ fontWeight: '600', color: '#fff' }}>{it.name}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Rs. {it.price} x {it.qty} = <span style={{ color: '#34d399', fontWeight: '700' }}>Rs. {it.price * it.qty}</span></div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button onClick={() => updateActiveCabinItemQty(it.name, -1)} style={{ padding: '2px 6px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>-</button>
                            <span style={{ fontWeight: '600', color: '#fff', minWidth: '16px', textAlign: 'center' }}>{it.qty}</span>
                            <button onClick={() => updateActiveCabinItemQty(it.name, 1)} style={{ padding: '2px 6px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>+</button>
                            <button onClick={() => removeActiveCabinItem(it.name)} style={{ padding: '2px 6px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', marginLeft: '4px' }}>🗑️</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, textAlign: 'center', padding: '10px 0' }}>No active placed order for this table yet.</p>
                  )}
                </div>

                <div style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '20px', border: '1px solid #1f2937', height: 'fit-content' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#f8fafc', textAlign: 'center', borderBottom: '1px dashed #1f2937', paddingBottom: '12px', fontSize: '16px', fontWeight: '700' }}>
                    🛒 ADD NEW ITEMS CART
                  </h3>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>Select Cabin / Table:</label>
                    <select value={tableNo} onChange={(e) => setTableNo(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '10px', border: '1px solid #1f2937', fontWeight: '600', backgroundColor: '#090d16', color: '#fff', outline: 'none' }}>
                      {availableCabins.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>Staff Name:</label>
                    <input type="text" placeholder="Enter staff name..." value={waiterName} onChange={(e) => setWaiterName(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '10px', border: '1px solid #1f2937', backgroundColor: '#090d16', color: '#fff', outline: 'none' }} />
                  </div>

                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>Selected Items to Add:</div>
                  <div style={{ minHeight: '90px', maxHeight: '150px', overflowY: 'auto', borderBottom: '1px dashed #1f2937', paddingBottom: '12px', marginBottom: '16px' }}>
                    {currentCart.length > 0 ? (
                      currentCart.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0', fontSize: '13px' }}>
                          <div style={{ fontWeight: '600', color: '#cbd5e1' }}>{item.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button onClick={() => updateQty(item.name, -1)} style={{ padding: '2px 8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                            <span style={{ fontWeight: '600', color: '#fff' }}>{item.qty}</span>
                            <button onClick={() => updateQty(item.name, 1)} style={{ padding: '2px 8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>Click items from menu to add.</p>
                    )}
                  </div>

                  <button onClick={handlePlaceOrder} className="gold-btn">
                    Send to Kitchen & Print KOT 🖨️
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. STAFF & SALARY MANAGEMENT */}
        {activeTab === 'salary' && userRole === 'admin' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ color: '#f8fafc', margin: '0 0 4px 0', fontSize: '26px', fontWeight: '750' }}>💰 Staff & Salary Management</h1>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Configure staff salaries, track payout dates, and record disbursements automatically.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              <div style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '20px', border: '1px solid #1f2937', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>Add New Staff Member</h3>
                <form onSubmit={handleAddStaff}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>Staff Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Ramesh Karki"
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px', border: '1px solid #1f2937', backgroundColor: '#090d16', color: '#fff', outline: 'none' }}
                    />
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>Role / Designation</label>
                    <select
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value)}
                      style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px', border: '1px solid #1f2937', backgroundColor: '#090d16', color: '#fff', outline: 'none' }}
                    >
                      <option value="Waiter">Waiter</option>
                      <option value="Chef">Chef</option>
                      <option value="Cashier">Cashier</option>
                      <option value="Cleaner">Cleaner</option>
                      <option value="Manager">Manager</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>Monthly Salary (Rs.)</label>
                    <input
                      type="number"
                      placeholder="18000"
                      value={newStaffSalary}
                      onChange={(e) => setNewStaffSalary(e.target.value)}
                      style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px', border: '1px solid #1f2937', backgroundColor: '#090d16', color: '#fff', outline: 'none' }}
                    />
                  </div>
                  <button type="submit" className="gold-btn">
                    Save Staff Profile 👤
                  </button>
                </form>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '20px', border: '1px solid #1f2937', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>Record Salary Payout (Advance / Full)</h3>
                <form onSubmit={handleRecordSalaryPayout}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>Select Staff</label>
                    <select
                      value={payoutStaffId}
                      onChange={(e) => setPayoutStaffId(e.target.value)}
                      style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px', border: '1px solid #1f2937', backgroundColor: '#090d16', color: '#fff', outline: 'none' }}
                    >
                      <option value="">-- Choose Staff Member --</option>
                      {staffList.map(st => (
                        <option key={st.id} value={st.id}>{st.name || 'Unnamed Staff'} ({st.role}) - Sal: Rs. {st.salary}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>Payout Amount (Rs.)</label>
                    <input
                      type="number"
                      placeholder="5000"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px', border: '1px solid #1f2937', backgroundColor: '#090d16', color: '#fff', outline: 'none' }}
                    />
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)', color: '#090d16', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
                    Disburse & Log Expense 💸
                  </button>
                </form>
              </div>
            </div>

            <div style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '20px', border: '1px solid #1f2937' }}>
              <h3 style={{ color: '#f8fafc', margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Staff Salaries & Payout History & Dates</h3>
              {staffList.length > 0 ? (
                <div className="table-responsive-wrapper">
                  <table className="custom-data-table" style={{ minWidth: '700px' }}>
                    <thead>
                      <tr>
                        <th>Staff Name (Editable)</th>
                        <th>Role</th>
                        <th>Monthly Salary</th>
                        <th>Total Paid So Far</th>
                        <th>Payout Dates & Amounts</th>
                        <th>Remaining Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map((st) => {
                        const due = st.salary - st.paidAmount;
                        return (
                          <tr key={st.id} style={{ verticalAlign: 'top' }}>
                            <td>
                              <input
                                type="text"
                                placeholder="Type staff name..."
                                value={st.name}
                                onChange={(e) => handleUpdateStaffField(st.id, 'name', e.target.value)}
                                style={{ width: '100%', padding: '8px 10px', backgroundColor: '#090d16', border: '1px solid #1f2937', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }}
                              />
                            </td>
                            <td style={{ color: '#C5A059' }}>{st.role}</td>
                            <td style={{ color: '#fff', fontWeight: '600' }}>
                              <input
                                type="number"
                                value={st.salary}
                                onChange={(e) => handleUpdateStaffField(st.id, 'salary', e.target.value)}
                                style={{ width: '110px', padding: '8px 10px', backgroundColor: '#090d16', border: '1px solid #1f2937', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }}
                              />
                            </td>
                            <td style={{ color: '#34d399', fontWeight: '700' }}>Rs. {st.paidAmount}</td>
                            <td style={{ color: '#cbd5e1', fontSize: '12px' }}>
                              {st.payoutHistory && st.payoutHistory.length > 0 ? (
                                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                                  {st.payoutHistory.map((ph, idx) => (
                                    <li key={idx} style={{ marginBottom: '3px' }}>
                                      <b style={{ color: '#34d399' }}>Rs. {ph.amount}</b> on {ph.date} ({ph.time})
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span style={{ color: '#64748b' }}>No payouts yet</span>
                              )}
                            </td>
                            <td style={{ color: due > 0 ? '#f87171' : '#34d399', fontWeight: '700' }}>Rs. {due > 0 ? due : 0}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>No staff members added yet.</p>
              )}
            </div>
          </div>
        )}

        {/* 4. QR MENU SETUP */}
        {activeTab === 'qr-menu' && userRole === 'admin' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ color: '#f8fafc', margin: '0 0 4px 0', fontSize: '26px', fontWeight: '750' }}>📱 QR Code Menu Setup</h1>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Print these QR codes for customer self-ordering.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {availableCabins.map((tbl, idx) => {
                const qrUrl = `${window.location.protocol}//${window.location.host}/?table=${encodeURIComponent(tbl)}`;
                const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrUrl)}`;
                return (
                  <div key={idx} style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '20px', textAlign: 'center', border: '1px solid #1f2937', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                    <h3 style={{ color: '#f8fafc', margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>{tbl}</h3>
                    <div style={{ background: '#090d16', padding: '12px', display: 'inline-block', borderRadius: '14px', border: '1px solid #1f2937', marginBottom: '16px' }}>
                      <img src={qrImgSrc} alt="QR" style={{ width: '140px', height: '140px', display: 'block', filter: 'invert(1) hue-rotate(180deg)' }} />
                    </div>
                    <div>
                      <a href={qrUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '10px 16px', backgroundColor: '#3b82f6', color: '#FFF', textDecoration: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
                        🔗 Test View
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. DAILY EXPENSE ENTRY */}
        {activeTab === 'expenses' && (
          <div>
            <div className="filter-header-flex">
              <div>
                <h1 style={{ color: '#f8fafc', margin: '0 0 4px 0', fontSize: '26px', fontWeight: '750' }}>💸 Daily Expense & Cash-Out Entry</h1>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Easily record today's petty cash expenses and purchases.</p>
              </div>

              <div className="time-filters-bar">
                {filterTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setExpenseFilter(tab.id)}
                    className="time-filter-btn"
                    style={{
                      backgroundColor: expenseFilter === tab.id ? '#C5A059' : 'transparent',
                      color: expenseFilter === tab.id ? '#090d16' : '#94a3b8'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '20px', border: '1px solid #1f2937', height: 'fit-content', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>Add New Expense</h3>
                <form onSubmit={handleAddExpense}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>Expense Title / Description</label>
                    <input
                      type="text"
                      placeholder="e.g., Vegetables & Milk purchase"
                      value={expenseTitle}
                      onChange={(e) => setExpenseTitle(e.target.value)}
                      style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px', border: '1px solid #1f2937', backgroundColor: '#090d16', color: '#fff', outline: 'none' }}
                    />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>Amount (Rs.)</label>
                    <input
                      type="number"
                      placeholder="500"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      style={{ width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px', border: '1px solid #1f2937', backgroundColor: '#090d16', color: '#fff', outline: 'none' }}
                    />
                  </div>
                  <button type="submit" className="gold-btn">
                    Record Expense 💾
                  </button>
                </form>
              </div>

              <div style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '20px', border: '1px solid #1f2937', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>Expenses History ({expenseFilter.toUpperCase()})</h3>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#f87171' }}>Total: Rs. {totalExpenses}</span>
                </div>
                {filteredExpenseList.length > 0 ? (
                  <div className="table-responsive-wrapper" style={{ maxHeight: '400px' }}>
                    <table className="custom-data-table" style={{ minWidth: '350px' }}>
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Date</th>
                          <th style={{ textAlign: 'right' }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExpenseList.map((exp) => (
                          <tr key={exp.id}>
                            <td style={{ fontWeight: '600', color: '#f8fafc' }}>{exp.title}</td>
                            <td style={{ color: '#94a3b8', fontSize: '12px' }}>{exp.date} {exp.time}</td>
                            <td style={{ textAlign: 'right', fontWeight: '700', color: '#f87171' }}>Rs. {exp.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: '14px' }}>No expenses recorded for this period.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 6. BILLING & RECEIPTS */}
        {activeTab === 'billing' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ color: '#f8fafc', margin: '0 0 4px 0', fontSize: '26px', fontWeight: '750' }}>🧾 Billing & Counter Receipts</h1>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Select order to generate printed receipt with logo.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div>
                <h3 style={{ color: '#f8fafc', margin: '0 0 16px 0', fontSize: '18px' }}>Active Orders</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '70vh', overflowY: 'auto' }}>
                  {placedOrders.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => {
                        setSelectedBill(ord);
                        updateOrderStatus(ord.id, 'Billed');
                        setIsPaid(false);
                      }}
                      style={{
                        backgroundColor: '#111827', padding: '16px', borderRadius: '16px',
                        borderLeft: '4px solid #3b82f6', cursor: 'pointer', border: '1px solid #1f2937',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#f8fafc', fontSize: '15px' }}>{ord.id} ({ord.tableNo})</strong>
                        <span style={{ color: '#34d399', fontWeight: '700', fontSize: '15px' }}>Rs. {ord.totalAmount}</span>
                      </div>
                      <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>By: <b style={{ color: '#cbd5e1' }}>{ord.waiterName}</b> | {ord.date} {ord.time}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {selectedBill ? (
                  <div style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '20px', border: '1px solid #1f2937', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>Discount (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(Number(e.target.value))}
                        style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '10px', border: '1px solid #1f2937', backgroundColor: '#090d16', color: '#fff', outline: 'none' }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{ width: '100%', padding: '10px', marginTop: '6px', borderRadius: '10px', border: '1px solid #1f2937', backgroundColor: '#090d16', color: '#fff', fontWeight: '600', outline: 'none' }}
                      >
                        <option value="eSewa">🟢 eSewa</option>
                        <option value="Khalti">🟣 Khalti</option>
                        <option value="Fonepay">🔵 Fonepay</option>
                        <option value="Cash">💵 Cash</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        setIsPaid(true);
                        alert(`Payment verified via ${paymentMethod}!`);
                      }}
                      style={{ width: '100%', padding: '12px', backgroundColor: isPaid ? '#10b981' : '#3b82f6', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', marginBottom: '20px', boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}
                    >
                      {isPaid ? '✅ Payment Verified' : `Verify ${paymentMethod} Payment`}
                    </button>

                    <div id="printable-area" style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: "'Courier New', Courier, monospace", width: '280px', margin: '0 auto', color: '#000' }}>
                      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                        <div style={{ width: '40px', height: '40px', margin: '0 auto 4px auto', borderRadius: '50%', overflow: 'hidden', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e)=>{e.target.style.display='none';}} />
                        </div>
                        <h2 style={{ margin: '0', fontSize: '15px' }}>THE BLACK STONE</h2>
                        <div style={{ fontSize: '10px' }}>Bharatpur 10, Chitwan</div>
                      </div>
                      <div style={{ borderBottom: '1px dashed #000', borderTop: '1px dashed #000', padding: '6px 0', fontSize: '10px', margin: '8px 0' }}>
                        <div><b>Bill No:</b> {selectedBill.id}</div>
                        <div><b>Location:</b> {selectedBill.tableNo}</div>
                        <div><b>Date:</b> {selectedBill.date} {selectedBill.time}</div>
                      </div>
                      <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
                            <th>Item</th><th>Qty</th><th style={{ textAlign: 'right' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedBill.items.map((it, idx) => (
                            <tr key={idx}>
                              <td>{it.name}</td><td>{it.qty}</td><td style={{ textAlign: 'right' }}>Rs. {it.price * it.qty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{ borderTop: '1px dashed #000', marginTop: '10px', paddingTop: '6px', fontSize: '11px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal:</span><span>Rs. {selectedBill.totalAmount}</span></div>
                        {discountPercent > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Discount ({discountPercent}%):</span><span>- Rs. {Math.round((selectedBill.totalAmount * discountPercent) / 100)}</span></div>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px', marginTop: '6px', borderTop: '1px solid #000', paddingTop: '4px' }}>
                          <span>Grand Total:</span><span>Rs. {discountPercent > 0 ? selectedBill.totalAmount - Math.round((selectedBill.totalAmount * discountPercent) / 100) : selectedBill.totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    <button onClick={() => window.print()} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)', color: '#090d16', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', marginTop: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(52,211,153,0.3)' }}>
                      🖨️ Print Receipt
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', backgroundColor: '#111827', borderRadius: '20px', border: '1px solid #1f2937' }}>
                    <p style={{ margin: 0, fontSize: '14px' }}>Select an active order to view bill.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 7. ORDER HISTORY */}
        {activeTab === 'history' && (
          <div>
            <div className="filter-header-flex">
              <div>
                <h1 style={{ color: '#f8fafc', margin: '0 0 4px 0', fontSize: '26px', fontWeight: '750' }}>📅 Order History & All Days Record</h1>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Sabai din ko sales, kharcha (expenses) ra completed transactions ko history yeta herna milcha.</p>
              </div>

              <div className="time-filters-bar">
                {filterTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setHistoryFilter(tab.id)}
                    className="time-filter-btn"
                    style={{
                      backgroundColor: historyFilter === tab.id ? '#C5A059' : 'transparent',
                      color: historyFilter === tab.id ? '#090d16' : '#94a3b8'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Cards for Selected History Filter */}
            <div className="metrics-grid" style={{ marginBottom: '24px' }}>
              <div className="metric-card" style={{ borderLeft: '4px solid #34d399' }}>
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Total Sales ({historyFilter.toUpperCase()})</span>
                <h2 style={{ margin: '10px 0 0 0', color: '#34d399', fontSize: '22px', fontWeight: '750' }}>
                  Rs. {filteredHistoryOrders.reduce((sum, ord) => sum + ord.totalAmount, 0)}
                </h2>
              </div>
              <div className="metric-card" style={{ borderLeft: '4px solid #f87171' }}>
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Total Expenses ({historyFilter.toUpperCase()})</span>
                <h2 style={{ margin: '10px 0 0 0', color: '#f87171', fontSize: '22px', fontWeight: '750' }}>
                  Rs. {expenses.filter(exp => checkTimeFilter(exp.rawDate, historyFilter)).reduce((sum, exp) => sum + exp.amount, 0)}
                </h2>
              </div>
            </div>

            <div style={{ backgroundColor: '#111827', borderRadius: '20px', overflow: 'hidden', border: '1px solid #1f2937', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              {filteredHistoryOrders.length > 0 ? (
                <div className="table-responsive-wrapper">
                  <table className="custom-data-table" style={{ minWidth: '550px' }}>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Location</th>
                        <th>Date & Time</th>
                        <th>Staff / Waiter</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistoryOrders.map((ord, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: '600', color: '#f8fafc' }}>{ord.id}</td>
                          <td style={{ color: '#C5A059', fontWeight: '600' }}>{ord.tableNo}</td>
                          <td style={{ color: '#94a3b8' }}>{ord.date} {ord.time}</td>
                          <td style={{ color: '#cbd5e1' }}>{ord.waiterName}</td>
                          <td style={{ fontWeight: '700', color: '#34d399' }}>Rs. {ord.totalAmount}</td>
                          <td>
                            <span style={{ 
                              padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                              backgroundColor: ord.status === 'Billed' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(96, 165, 250, 0.15)',
                              color: ord.status === 'Billed' ? '#34d399' : '#60a5fa'
                            }}>
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  No orders found for {historyFilter}.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. MENU CARD */}
        {activeTab === 'menu' && (
          <div>
            <h1 style={{ color: '#f8fafc', margin: '0 0 4px 0', fontSize: '26px', fontWeight: '750' }}>📜 Digital Menu Card</h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>Browse categories and items properly organized.</p>
            
            <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
              <input
                type="text"
                placeholder="🔍 Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #1f2937', backgroundColor: '#111827', color: '#fff', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '6px' }}>
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '8px 18px', borderRadius: '20px', border: selectedCategory === cat ? '1px solid #C5A059' : '1px solid #1f2937',
                    backgroundColor: selectedCategory === cat ? '#C5A059' : '#111827',
                    color: selectedCategory === cat ? '#090d16' : '#94a3b8',
                    fontWeight: selectedCategory === cat ? '700' : '500', cursor: 'pointer', whiteSpace: 'nowrap'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredData.map((category, index) => (
              <section key={index} style={{ marginBottom: '32px' }}>
                <h3 style={{ color: '#C5A059', borderBottom: '1px solid #1f2937', paddingBottom: '8px', marginBottom: '16px', fontSize: '18px', fontWeight: '700' }}>
                  {category.category}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                  {category.items.map((item, idx) => (
                    <div key={idx} style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '16px', border: '1px solid #1f2937', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                      <div style={{ fontWeight: '600', fontSize: '15px', color: '#f8fafc', marginBottom: '8px' }}>{item.name}</div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#34d399' }}>Rs. {item.price}</div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* 9. SETTINGS & PASSWORD */}
        {activeTab === 'settings' && userRole === 'admin' && (
          <div style={{ maxWidth: '500px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ color: '#f8fafc', margin: '0 0 4px 0', fontSize: '26px', fontWeight: '750' }}>⚙️ Security & Settings</h1>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Update your admin panel access password.</p>
            </div>

            <div style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '20px', border: '1px solid #1f2937', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              <form onSubmit={handlePasswordChange}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #1f2937', backgroundColor: '#090d16', color: '#fff', fontSize: '14px', outline: 'none' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '600', display: 'block', marginBottom: '6px' }}>New Password (min 4 chars)</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #1f2937', backgroundColor: '#090d16', color: '#fff', fontSize: '14px', outline: 'none' }}
                    required
                  />
                </div>

                <button type="submit" className="gold-btn">
                  Update Password 🔒
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;