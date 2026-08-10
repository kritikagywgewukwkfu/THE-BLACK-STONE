import React, { useState } from 'react';
import io from 'socket.io-client';

// Socket Backend Server सँग Connect गर्ने
const socket = io('http://localhost:5000');

const sampleMenu = [
  { id: 1, name: 'Burger', price: 350 },
  { id: 2, name: 'Chicken MoMo', price: 200 },
  { id: 3, name: 'Milk Tea', price: 40 },
  { id: 4, name: 'Cold Coffee', price: 180 },
  { id: 5, name: 'French Fries', price: 160 },
  { id: 6, name: 'Margherita Pizza', price: 420 }
];

export default function IPadApp() {
  const [selectedTable, setSelectedTable] = useState('Table 1');
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === itemId ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const handleSendOrder = () => {
    if (cart.length === 0) {
      alert('⚠️ कृपया पहिले केही आइटम्स छानेर Cart मा थप्नुहोस्!');
      return;
    }

    const orderData = {
      id: 'ORD-' + Date.now(),
      table: selectedTable,
      items: cart,
      total: calculateTotal(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    console.log('Sending Order to Backend:', orderData);
    
    // BACKEND मा SOCКET MARFAT ORDER PATHAUNE
    socket.emit('send_order', orderData);

    alert(`✅ ${selectedTable} को अर्डर सफलतापुर्वक Counter Billing मा पठाइयो!`);
    setCart([]); // Cart खालि गर्ने
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#FAF7F2', fontFamily: 'sans-serif' }}>
      
      {/* LEFT: MENU ITEMS */}
      <div style={{ flex: 2, padding: '24px', overflowY: 'auto' }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#2C1810' }}>📱 Waiter Console</h2>
        
        {/* Table Selector */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          {['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5'].map((tbl) => (
            <button
              key={tbl}
              onClick={() => setSelectedTable(tbl)}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: selectedTable === tbl ? '#2C1810' : '#FFFFFF',
                color: selectedTable === tbl ? '#FFFFFF' : '#2C1810',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
              }}
            >
              {tbl}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
          {sampleMenu.map((item) => (
            <div
              key={item.id}
              onClick={() => addToCart(item)}
              style={{
                backgroundColor: '#FFFFFF',
                padding: '20px',
                borderRadius: '14px',
                border: '1px solid #EFEAE1',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <h4 style={{ margin: '0 0 8px 0', color: '#2C1810' }}>{item.name}</h4>
              <span style={{ fontWeight: '800', color: '#6F4E37' }}>Rs. {item.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: CART SUMMARY */}
      <div style={{ flex: 1, backgroundColor: '#FFFFFF', borderLeft: '1px solid #EFEAE1', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: '0 0 16px 0', color: '#2C1810' }}>🛒 {selectedTable} Items</h3>
          {cart.length === 0 ? (
            <p style={{ color: '#8C7A6B', fontSize: '13px' }}>आइटम थप्नको लागि देब्रेपट्टी क्लिक गर्नुहोस्।</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #FAF7F2', paddingBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#8C7A6B' }}>Rs. {item.price} x {item.qty}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => removeFromCart(item.id)} style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer' }}>-</button>
                    <span style={{ fontWeight: '800' }}>{item.qty}</span>
                    <button onClick={() => addToCart(item)} style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer' }}>+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>
            <span>Total:</span>
            <span style={{ color: '#6F4E37' }}>Rs. {calculateTotal()}</span>
          </div>
          <button
            onClick={handleSendOrder}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#6F4E37',
              color: '#FFF',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '15px',
              cursor: 'pointer'
            }}
          >
            🚀 SEND TO KITCHEN / BILLING
          </button>
        </div>
      </div>

    </div>
  );
}
