import React, { useState, useEffect, useRef } from 'react';
import menuData from './menuData';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('bs_isLoggedIn') === 'true';
  });
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Password Management State
  const [storedPassword, setStoredPassword] = useState(() => {
    return localStorage.getItem('bs_password') || 'admin123';
  });
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Staff Role State ('admin', 'waiter') - Cashier merged into Admin
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('bs_userRole') || 'admin';
  });

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
  
  // Clean Data Reset: Initialized to empty array[cite: 6]
  const [placedOrders, setPlacedOrders] = useState(() => {
    const saved = localStorage.getItem('bs_placedOrders');
    return saved ? JSON.parse(saved) : [];
  });

  // Clean Data Reset: Initialized to empty array[cite: 6]
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('bs_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  // Clean Data Reset: Initialized with blank names and zero values[cite: 6]
  const [staffList, setStaffList] = useState(() => {
    const saved = localStorage.getItem('bs_staffList');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: '', role: 'Waiter', salary: 0, paidAmount: 0, payoutHistory: [] },
      { id: 2, name: '', role: 'Chef', salary: 0, paidAmount: 0, payoutHistory: [] },
      { id: 3, name: '', role: 'Cashier', salary: 0, paidAmount: 0, payoutHistory: [] }
    ];
  });
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Waiter');
  const [newStaffSalary, setNewStaffSalary] = useState('');
  const [payoutStaffId, setPayoutStaffId] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');

  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  const prevOrdersLenRef = useRef(placedOrders.length);
  const [selectedBill, setSelectedBill] = useState(null);

  // QR Customer View State
  const [customerTable, setCustomerTable] = useState(null);
  const [customerCart, setCustomerCart] = useState([]);
  const [customerCategory, setCustomerCategory] = useState('All');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerOrderPlaced, setCustomerOrderPlaced] = useState(false);

  // Clean / Clear All Current Order Data Function for Cafe Manager Handover
  const handleCleanAllOrders = () => {
    if (window.confirm('Are you sure you want to clean/clear all current placed orders and history? This will reset active orders for a fresh shift.')) {
      setPlacedOrders([]);
      localStorage.setItem('bs_placedOrders', JSON.stringify([]));
      setCurrentCart([]);
      setSelectedBill(null);
      alert('All order data has been successfully cleaned and reset for the manager shift!');
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

  useEffect(() => {
    localStorage.setItem('bs_placedOrders', JSON.stringify(placedOrders));
    if (placedOrders.length > prevOrdersLenRef.current) {
      playBeep();
    }
    prevOrdersLenRef.current = placedOrders.length;
  }, [placedOrders]);

  useEffect(() => {
    localStorage.setItem('bs_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('bs_userRole', userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('bs_staffList', JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem('bs_password', storedPassword);
  }, [storedPassword]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    if (tableParam) {
      setCustomerTable(decodeURIComponent(tableParam));
    }
  }, []);

  useEffect(() => {
    if (userRole === 'waiter' && activeTab === 'dashboard') {
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

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginEmail && loginPassword) {
      if (loginPassword !== storedPassword) {
        alert('Incorrect password! Please try again.');
        return;
      }
      setIsLoggedIn(true);
      localStorage.setItem('bs_isLoggedIn', 'true');
    } else {
      alert('Please enter credentials!');
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (currentPasswordInput !== storedPassword) {
      alert('Current password does not match!');
      return;
    }
    if (!newPasswordInput || newPasswordInput.length < 4) {
      alert('New password must be at least 4 characters long!');
      return;
    }
    setStoredPassword(newPasswordInput);
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    alert('Password updated successfully!');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('bs_isLoggedIn');
  };

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

    const handleCustomerSubmitOrder = () => {
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

      const existingOrders = JSON.parse(localStorage.getItem('bs_placedOrders') || '[]');
      localStorage.setItem('bs_placedOrders', JSON.stringify([newOrder, ...existingOrders]));
      setPlacedOrders([newOrder, ...existingOrders]);

      setCustomerOrderPlaced(true);
      setCustomerCart([]);
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
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px', fontFamily: "Inter, system-ui, sans-serif", backgroundColor: '#090d16', minHeight: '100vh', color: '#f8fafc', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px', background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', color: '#fff', padding: '24px 20px', borderRadius: '24px', border: '1px solid rgba(197, 160, 89, 0.3)', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
          <div style={{ width: '60px', height: '60px', margin: '0 auto 10px auto', borderRadius: '50%', overflow: 'hidden', border: '2px solid #C5A059', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827', boxShadow: '0 0 15px rgba(197, 160, 89, 0.3)' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e)=>{e.target.style.display='none';}} />
          </div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '700', letterSpacing: '0.5px' }}>The Black Stone</h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Scan, Select & Enjoy Your Meal</p>
          <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3b82f6', color: '#60a5fa', padding: '6px 16px', borderRadius: '30px', fontSize: '13px', fontWeight: '600' }}>
            📍 Seated at: {customerTable}
          </div>
        </div>

        {customerOrderPlaced ? (
          <div style={{ textAlign: 'center', backgroundColor: '#111827', padding: '40px 24px', borderRadius: '24px', border: '1px solid #1f2937', marginTop: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
            <h2 style={{ color: '#34d399', fontSize: '22px', fontWeight: '700' }}>Order Placed Successfully!</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: '15px 0 24px 0', lineHeight: '1.5' }}>Your items have been sent straight to the kitchen. Enjoy your stay at The Black Stone!</p>
            <button onClick={() => setCustomerOrderPlaced(false)} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #C5A059 0%, #a3813e 100%)', color: '#090d16', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', boxShadow: '0 4px 15px rgba(197, 160, 89, 0.3)' }}>
              Order More Items
            </button>
          </div>
        ) : (
          <div>
            {myTableOrders.length > 0 && (
              <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '20px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#f8fafc', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>📢 Live Order Tracking</span>
                  <span style={{ fontSize: '12px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '2px 10px', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>Active</span>
                </div>
                {myTableOrders.map((ord, idx) => (
                  <div key={idx} style={{ fontSize: '13px', padding: '8px 0', borderBottom: idx < myTableOrders.length - 1 ? '1px solid #1f2937' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600', color: '#e2e8f0', marginBottom: '4px' }}>
                      <span>Order #{ord.id}</span>
                      <span style={{ color: ord.status === 'Ready' ? '#34d399' : ord.status === 'Preparing' ? '#fbbf24' : '#60a5fa' }}>
                        ● {ord.status}
                      </span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                      Items: {ord.items.map(i => `${i.name} (${i.qty})`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <input
                type="text"
                placeholder="🔍 Search items..."
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '14px', border: '1px solid #1f2937', backgroundColor: '#111827', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px', paddingBottom: '4px' }}>
              {customerCategories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setCustomerCategory(cat)}
                  style={{
                    padding: '8px 16px', borderRadius: '20px', border: customerCategory === cat ? '1px solid #C5A059' : '1px solid #1f2937', whiteSpace: 'nowrap',
                    backgroundColor: customerCategory === cat ? '#C5A059' : '#111827',
                    color: customerCategory === cat ? '#090d16' : '#94a3b8',
                    fontSize: '13px', cursor: 'pointer', fontWeight: customerCategory === cat ? '700' : '500'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '110px' }}>
              {filteredCustomerMenu.map((cat, idx) => (
                <div key={idx} style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: '#C5A059', borderBottom: '1px solid #1f2937', paddingBottom: '6px', marginBottom: '12px', fontSize: '16px', fontWeight: '700' }}>{cat.category}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {cat.items.map((item, i) => (
                      <div key={i} style={{ backgroundColor: '#111827', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1f2937' }}>
                        <div style={{ flex: 1, paddingRight: '12px' }}>
                          <div style={{ fontWeight: '600', color: '#f8fafc', fontSize: '15px' }}>{item.name}</div>
                          <div style={{ color: '#34d399', fontSize: '14px', marginTop: '4px', fontWeight: '700' }}>Rs. {item.price}</div>
                        </div>
                        <button onClick={() => addToCustomerCart(item)} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {customerCart.length > 0 && (
              <div style={{ position: 'fixed', bottom: '15px', left: '16px', right: '16px', maxWidth: '448px', margin: '0 auto', backgroundColor: '#111827', color: '#fff', padding: '16px', borderRadius: '20px', border: '1px solid #C5A059', boxShadow: '0 15px 35px rgba(0,0,0,0.5)' }}>
                <div style={{ fontWeight: '700', marginBottom: '8px', fontSize: '14px', borderBottom: '1px solid #1f2937', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🛒 Cart Summary</span>
                  <span>{customerCart.reduce((sum, it) => sum + it.qty, 0)} items</span>
                </div>
                <div style={{ maxHeight: '110px', overflowY: 'auto', marginBottom: '12px' }}>
                  {customerCart.map((it, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', margin: '6px 0', color: '#94a3b8', alignItems: 'center' }}>
                      <span>{it.name} x {it.qty}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '600', color: '#fff' }}>Rs. {it.price * it.qty}</span>
                        <button onClick={() => updateCustomerQty(it.name, -1)} style={{ padding: '2px 8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>-</button>
                        <button onClick={() => updateCustomerQty(it.name, 1)} style={{ padding: '2px 8px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={handleCustomerSubmitOrder} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)', color: '#090d16', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(52,211,153,0.3)' }}>
                  Confirm & Send Order 🚀
                </button>
              </div>
            )}
          </div>
        )}
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

  const updateActiveCabinItemQty = (itemName, delta) => {
    if (!activeCabinOrder) return;
    
    const updatedItems = activeCabinOrder.items.map(it => {
      if (it.name === itemName) {
        const newQty = it.qty + delta;
        return newQty > 0 ? { ...it, qty: newQty } : null;
      }
      return it;
    }).filter(Boolean);

    const newTotalAmount = updatedItems.reduce((sum, it) => sum + (it.price * it.qty), 0);

    const updatedOrders = placedOrders.map(ord => {
      if (ord.id === activeCabinOrder.id) {
        return {
          ...ord,
          items: updatedItems,
          totalAmount: newTotalAmount
        };
      }
      return ord;
    });

    setPlacedOrders(updatedOrders);
  };

  const removeActiveCabinItem = (itemName) => {
    if (!activeCabinOrder) return;
    
    const updatedItems = activeCabinOrder.items.filter(it => it.name !== itemName);
    const newTotalAmount = updatedItems.reduce((sum, it) => sum + (it.price * it.qty), 0);

    const updatedOrders = placedOrders.map(ord => {
      if (ord.id === activeCabinOrder.id) {
        return {
          ...ord,
          items: updatedItems,
          totalAmount: newTotalAmount
        };
      }
      return ord;
    });

    setPlacedOrders(updatedOrders);
  };

  const handlePlaceOrder = () => {
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

      const updatedOrders = placedOrders.map(ord => {
        if (ord.id === activeCabinOrder.id) {
          return {
            ...ord,
            items: mergedItems,
            totalAmount: newTotalAmount,
            waiterName: waiterName,
            status: 'Kitchen'
          };
        }
        return ord;
      });

      setPlacedOrders(updatedOrders);
      targetOrder = updatedOrders.find(o => o.id === activeCabinOrder.id);
    } else {
      const newOrder = {
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

      const updated = [newOrder, ...placedOrders];
      setPlacedOrders(updated);
      targetOrder = newOrder;
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

  const updateOrderStatus = (orderId, newStatus) => {
    const updated = placedOrders.map((ord) =>
      ord.id === orderId ? { ...ord, status: newStatus } : ord
    );
    setPlacedOrders(updated);
  };

  const handleAddExpense = (e) => {
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
    setExpenses([newExp, ...expenses]);
    setExpenseTitle('');
    setExpenseAmount('');
  };

  const handleAddStaff = (e) => {
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
    setStaffList([...staffList, newStaff]);
    setNewStaffName('');
    setNewStaffSalary('');
    alert('Staff added successfully!');
  };

  const handleUpdateStaffField = (id, field, value) => {
    setStaffList(staffList.map(st => {
      if (st.id === id) {
        return { 
          ...st, 
          [field]: field === 'salary' ? Number(value) : value 
        };
      }
      return st;
    }));
  };

  const handleRecordSalaryPayout = (e) => {
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

    const updatedStaff = staffList.map(s => {
      if (s.id === Number(payoutStaffId)) {
        return { 
          ...s, 
          paidAmount: s.paidAmount + amountNum,
          payoutHistory: [...(s.payoutHistory || []), payoutRecord]
        };
      }
      return s;
    });
    setStaffList(updatedStaff);

    const newExp = {
      id: Date.now(),
      title: `Salary Payout: ${staffMember.name || 'Staff'} (${staffMember.role})`,
      amount: amountNum,
      rawDate: now.getTime(),
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setExpenses([newExp, ...expenses]);

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

  if (!isLoggedIn) {
    return (
      <div style={{ height: '100vh', backgroundColor: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "Inter, system-ui, sans-serif", padding: '16px' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: '#111827', padding: '40px 32px', borderRadius: '24px', border: '1px solid rgba(197, 160, 89, 0.3)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ width: '70px', height: '70px', backgroundColor: '#090d16', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #C5A059', boxShadow: '0 0 20px rgba(197, 160, 89, 0.4)' }}>
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e)=>{e.target.style.display='none';}} />
          </div>
          <h2 style={{ color: '#f8fafc', margin: '0 0 4px 0', fontSize: '24px', fontWeight: '750', letterSpacing: '0.5px' }}>The Black Stone</h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 28px 0' }}>Unified POS & Management Portal</p>
          
          <div style={{ textAlign: 'left', marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '600' }}>Email Address</label>
            <input type="email" placeholder="admin@blackstone.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required style={{ width: '100%', padding: '12px 14px', marginTop: '6px', borderRadius: '12px', border: '1px solid #1f2937', backgroundColor: '#090d16', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
          </div>

          <div style={{ textAlign: 'left', marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '600' }}>Password</label>
            <input type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required style={{ width: '100%', padding: '12px 14px', marginTop: '6px', borderRadius: '12px', border: '1px solid #1f2937', backgroundColor: '#090d16', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
          </div>

          <div style={{ textAlign: 'left', marginBottom: '28px' }}>
            <label style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '600' }}>Staff Role & Permissions</label>
            <select value={userRole} onChange={(e) => setUserRole(e.target.value)} style={{ width: '100%', padding: '12px 14px', marginTop: '6px', borderRadius: '12px', border: '1px solid #1f2937', backgroundColor: '#090d16', color: '#fff', fontSize: '14px', boxSizing: 'border-box', outline: 'none', fontWeight: '600' }}>
              <option value="admin">👑 Admin & Cashier (Full Access)</option>
              <option value="waiter">📝 Waiter (Orders & Status)</option>
            </select>
          </div>

          <button type="submit" style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #C5A059 0%, #a3813e 100%)', color: '#090d16', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(197, 160, 89, 0.4)' }}>
            Login to System
          </button>
        </form>
      </div>
    );
  }

  const allSidebarItems = [
    { id: 'dashboard', label: 'Dashboard & Finance', icon: '📊', roles: ['admin'] },
    { id: 'tables', label: 'Table & Cabin Status', icon: '🪑', roles: ['admin', 'waiter'] },
    { id: 'order', label: 'Order & KOT', icon: '📝', roles: ['admin', 'waiter'] },
    { id: 'salary', label: 'Staff & Salary Mgmt', icon: '💰', roles: ['admin'] },
    { id: 'qr-menu', label: 'QR Menu Setup', icon: '📱', roles: ['admin'] },
    { id: 'expenses', label: 'Daily Expense Entry', icon: '💸', roles: ['admin'] },
    { id: 'billing', label: 'Billing & Receipt', icon: '🧾', roles: ['admin'] },
    { id: 'history', label: 'Order History', icon: '📅', roles: ['admin'] },
    { id: 'menu', label: 'Menu Card', icon: '📜', roles: ['admin', 'waiter'] },
    { id: 'settings', label: 'Change Password', icon: '⚙️', roles: ['admin', 'waiter'] },
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
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "Inter, system-ui, sans-serif", backgroundColor: '#090d16', color: '#f8fafc' }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area { position: absolute; left: 0; top: 0; width: 80mm; font-size: 12px; font-family: 'Courier New', Courier, monospace; color: #000; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #090d16; }
        ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #C5A059; }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ 
        width: '260px', backgroundColor: '#111827', borderRight: '1px solid #1f2937', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 0', 
        position: 'sticky', top: 0, height: '100vh', zIndex: 1200, flexShrink: 0
      }}>
        <div>
          <div style={{ padding: '0 24px 20px 24px', borderBottom: '1px solid #1f2937', marginBottom: '16px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', margin: '0 auto 10px auto', borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #C5A059', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090d16', boxShadow: '0 0 10px rgba(197, 160, 89, 0.3)' }}>
              <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e)=>{e.target.style.display='none';}} />
            </div>
            <h2 style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: '700', letterSpacing: '0.5px' }}>The Black Stone</h2>
            <div style={{ marginTop: '6px' }}>
              <span style={{ fontSize: '11px', background: 'rgba(197, 160, 89, 0.2)', color: '#C5A059', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(197, 160, 89, 0.3)', textTransform: 'uppercase', fontWeight: '700' }}>
                {userRole === 'admin' ? 'Admin / Cashier' : 'Waiter'}
              </span>
            </div>
          </div>

          <nav style={{ padding: '0 12px' }}>
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                    backgroundColor: isActive ? 'rgba(197, 160, 89, 0.15)' : 'transparent',
                    color: isActive ? '#C5A059' : '#94a3b8',
                    border: isActive ? '1px solid rgba(197, 160, 89, 0.3)' : '1px solid transparent', 
                    borderRadius: '12px', textAlign: 'left', fontSize: '14px',
                    fontWeight: isActive ? '700' : '500', cursor: 'pointer', marginBottom: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div style={{ padding: '0 20px', borderTop: '1px solid #1f2937', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {userRole === 'admin' && (
            <button onClick={handleCleanAllOrders} style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#facc15', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
              🧹 Clean Shift Orders
            </button>
          )}
          <button onClick={handleLogout} style={{ width: '100%', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', maxWidth: 'calc(100vw - 260px)' }}>
        
        {/* 1. DASHBOARD & FINANCE */}
        {activeTab === 'dashboard' && userRole === 'admin' && (
          <div>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ color: '#f8fafc', margin: '0 0 4px 0', fontSize: '26px', fontWeight: '750' }}>📊 Dashboard & Finance Overview</h1>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Track sales, expenses, and net revenue based on time intervals.</p>
              </div>

              <div style={{ display: 'flex', gap: '6px', backgroundColor: '#111827', padding: '4px', borderRadius: '12px', border: '1px solid #1f2937', overflowX: 'auto' }}>
                {filterTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDashFilter(tab.id)}
                    style={{
                      padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                      backgroundColor: dashFilter === tab.id ? '#C5A059' : 'transparent',
                      color: dashFilter === tab.id ? '#090d16' : '#94a3b8',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '20px', borderLeft: '4px solid #34d399', border: '1px solid #1f2937', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Total Sales ({dashFilter.toUpperCase()})</span>
                <h2 style={{ margin: '10px 0 0 0', color: '#34d399', fontSize: '26px', fontWeight: '750' }}>Rs. {totalSales}</h2>
              </div>
              <div style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '20px', borderLeft: '4px solid #f87171', border: '1px solid #1f2937', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Total Expenses ({dashFilter.toUpperCase()})</span>
                <h2 style={{ margin: '10px 0 0 0', color: '#f87171', fontSize: '26px', fontWeight: '750' }}>Rs. {totalExpenses}</h2>
              </div>
              <div style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '20px', borderLeft: '4px solid #60a5fa', border: '1px solid #1f2937', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>Net Balance ({dashFilter.toUpperCase()})</span>
                <h2 style={{ margin: '10px 0 0 0', color: '#60a5fa', fontSize: '26px', fontWeight: '750' }}>Rs. {netRevenue}</h2>
              </div>
            </div>

            <div style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '20px', border: '1px solid #1f2937', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              <h3 style={{ color: '#f8fafc', margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Live Running Orders</h3>
              {placedOrders.filter(o => o.status !== 'Billed').length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#090d16', textAlign: 'left', color: '#94a3b8', fontSize: '13px', borderBottom: '1px solid #1f2937' }}>
                        <th style={{ padding: '12px' }}>Order ID</th>
                        <th style={{ padding: '12px' }}>Location</th>
                        <th style={{ padding: '12px' }}>Staff</th>
                        <th style={{ padding: '12px' }}>Amount</th>
                        <th style={{ padding: '12px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {placedOrders.filter(o => o.status !== 'Billed').map((ord, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #1f2937', fontSize: '14px' }}>
                          <td style={{ padding: '12px', fontWeight: '600', color: '#f8fafc' }}>{ord.id}</td>
                          <td style={{ padding: '12px', fontWeight: '600', color: '#C5A059' }}>{ord.tableNo}</td>
                          <td style={{ padding: '12px', color: '#94a3b8' }}>{ord.waiterName}</td>
                          <td style={{ padding: '12px', fontWeight: '700', color: '#34d399' }}>Rs. {ord.totalAmount}</td>
                          <td style={{ padding: '12px' }}>
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
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. ORDER SECTION */}
        {activeTab === 'order' && (
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {filteredOrderData.map((category, index) => (
                  <section key={index} style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: '#C5A059', borderBottom: '1px solid #1f2937', paddingBottom: '6px', marginBottom: '14px', fontSize: '16px', fontWeight: '700' }}>
                      {category.category}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
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

                  <button onClick={handlePlaceOrder} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #C5A059 0%, #a3813e 100%)', color: '#090d16', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(197, 160, 89, 0.3)' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
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
                  <button type="submit" style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #C5A059 0%, #a3813e 100%)', color: '#090d16', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
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
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#090d16', textAlign: 'left', color: '#94a3b8', fontSize: '13px', borderBottom: '1px solid #1f2937' }}>
                        <th style={{ padding: '12px' }}>Staff Name (Editable)</th>
                        <th style={{ padding: '12px' }}>Role</th>
                        <th style={{ padding: '12px' }}>Monthly Salary</th>
                        <th style={{ padding: '12px' }}>Total Paid So Far</th>
                        <th style={{ padding: '12px' }}>Payout Dates & Amounts</th>
                        <th style={{ padding: '12px' }}>Remaining Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map((st) => {
                        const due = st.salary - st.paidAmount;
                        return (
                          <tr key={st.id} style={{ borderBottom: '1px solid #1f2937', fontSize: '14px', verticalAlign: 'top' }}>
                            <td style={{ padding: '12px' }}>
                              <input
                                type="text"
                                placeholder="Type staff name..."
                                value={st.name}
                                onChange={(e) => handleUpdateStaffField(st.id, 'name', e.target.value)}
                                style={{ width: '100%', padding: '8px 10px', backgroundColor: '#090d16', border: '1px solid #1f2937', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }}
                              />
                            </td>
                            <td style={{ padding: '12px', color: '#C5A059' }}>{st.role}</td>
                            <td style={{ padding: '12px', color: '#fff', fontWeight: '600' }}>
                              <input
                                type="number"
                                value={st.salary}
                                onChange={(e) => handleUpdateStaffField(st.id, 'salary', e.target.value)}
                                style={{ width: '110px', padding: '8px 10px', backgroundColor: '#090d16', border: '1px solid #1f2937', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' }}
                              />
                            </td>
                            <td style={{ padding: '12px', color: '#34d399', fontWeight: '700' }}>Rs. {st.paidAmount}</td>
                            <td style={{ padding: '12px', color: '#cbd5e1', fontSize: '12px' }}>
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
                            <td style={{ padding: '12px', color: due > 0 ? '#f87171' : '#34d399', fontWeight: '700' }}>Rs. {due > 0 ? due : 0}</td>
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
        {activeTab === 'expenses' && userRole === 'admin' && (
          <div>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ color: '#f8fafc', margin: '0 0 4px 0', fontSize: '26px', fontWeight: '750' }}>💸 Daily Expense & Cash-Out Entry</h1>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Easily record today's petty cash expenses and purchases.</p>
              </div>

              <div style={{ display: 'flex', gap: '6px', backgroundColor: '#111827', padding: '4px', borderRadius: '12px', border: '1px solid #1f2937', overflowX: 'auto' }}>
                {filterTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setExpenseFilter(tab.id)}
                    style={{
                      padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                      backgroundColor: expenseFilter === tab.id ? '#C5A059' : 'transparent',
                      color: expenseFilter === tab.id ? '#090d16' : '#94a3b8',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
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
                  <button type="submit" style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #C5A059 0%, #a3813e 100%)', color: '#090d16', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(197, 160, 89, 0.3)' }}>
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
                  <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#090d16', textAlign: 'left', color: '#94a3b8', fontSize: '13px', borderBottom: '1px solid #1f2937' }}>
                          <th style={{ padding: '10px' }}>Title</th>
                          <th style={{ padding: '10px' }}>Date</th>
                          <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExpenseList.map((exp) => (
                          <tr key={exp.id} style={{ borderBottom: '1px solid #1f2937', fontSize: '14px' }}>
                            <td style={{ padding: '10px', fontWeight: '600', color: '#f8fafc' }}>{exp.title}</td>
                            <td style={{ padding: '10px', color: '#94a3b8', fontSize: '12px' }}>{exp.date} {exp.time}</td>
                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700', color: '#f87171' }}>Rs. {exp.amount}</td>
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
        {activeTab === 'billing' && userRole === 'admin' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ color: '#f8fafc', margin: '0 0 4px 0', fontSize: '26px', fontWeight: '750' }}>🧾 Billing & Counter Receipts</h1>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Select order to generate printed receipt with logo.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
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
        {activeTab === 'history' && userRole === 'admin' && (
          <div>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ color: '#f8fafc', margin: '0 0 4px 0', fontSize: '26px', fontWeight: '750' }}>📅 Order History</h1>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Review past orders and completed transactions.</p>
              </div>

              <div style={{ display: 'flex', gap: '6px', backgroundColor: '#111827', padding: '4px', borderRadius: '12px', border: '1px solid #1f2937', overflowX: 'auto' }}>
                {filterTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setHistoryFilter(tab.id)}
                    style={{
                      padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                      backgroundColor: historyFilter === tab.id ? '#C5A059' : 'transparent',
                      color: historyFilter === tab.id ? '#090d16' : '#94a3b8',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: '#111827', borderRadius: '20px', overflow: 'hidden', border: '1px solid #1f2937', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              {filteredHistoryOrders.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#090d16', textAlign: 'left', color: '#94a3b8', fontSize: '13px', borderBottom: '1px solid #1f2937' }}>
                      <th style={{ padding: '12px' }}>Order ID</th>
                      <th style={{ padding: '12px' }}>Location</th>
                      <th style={{ padding: '12px' }}>Date & Time</th>
                      <th style={{ padding: '12px' }}>Amount</th>
                      <th style={{ padding: '12px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistoryOrders.map((ord, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #1f2937', fontSize: '14px' }}>
                        <td style={{ padding: '12px', fontWeight: '600', color: '#f8fafc' }}>{ord.id}</td>
                        <td style={{ padding: '12px', color: '#C5A059', fontWeight: '600' }}>{ord.tableNo}</td>
                        <td style={{ padding: '12px', color: '#94a3b8' }}>{ord.date} {ord.time}</td>
                        <td style={{ padding: '12px', fontWeight: '700', color: '#34d399' }}>Rs. {ord.totalAmount}</td>
                        <td style={{ padding: '12px', color: '#cbd5e1' }}><b>{ord.status}</b></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
            {filteredData.map((category, index) => (
              <section key={index} style={{ marginBottom: '32px' }}>
                <h3 style={{ color: '#C5A059', borderBottom: '1px solid #1f2937', paddingBottom: '8px', marginBottom: '16px', fontSize: '18px', fontWeight: '700' }}>{category.category}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                  {category.items.map((item, itemIdx) => (
                    <div key={itemIdx} style={{ backgroundColor: '#111827', borderRadius: '16px', padding: '18px', border: '1px solid #1f2937', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                      <h3 style={{ fontSize: '15px', margin: '0 0 8px 0', color: '#f8fafc', fontWeight: '600' }}>{item.name}</h3>
                      <p style={{ fontWeight: '700', color: '#34d399', margin: 0, fontSize: '15px' }}>Rs. {item.price}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* 9. CHANGE PASSWORD SETTINGS */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '480px' }}>
            <h1 style={{ color: '#f8fafc', margin: '0 0 4px 0', fontSize: '26px', fontWeight: '750' }}>⚙️ Security & Password</h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>Update your portal login password securely.</p>

            <div style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '20px', border: '1px solid #1f2937', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              <form onSubmit={handlePasswordChange}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '600' }}>Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px 14px', marginTop: '6px', borderRadius: '12px', border: '1px solid #1f2937', backgroundColor: '#090d16', color: '#fff', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '600' }}>New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password (min 4 chars)"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px 14px', marginTop: '6px', borderRadius: '12px', border: '1px solid #1f2937', backgroundColor: '#090d16', color: '#fff', fontSize: '14px', outline: 'none' }}
                  />
                </div>

                <button type="submit" style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #C5A059 0%, #a3813e 100%)', color: '#090d16', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(197, 160, 89, 0.3)' }}>
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