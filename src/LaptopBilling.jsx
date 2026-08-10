import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function LaptopBilling({ onSaleComplete }) {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  useEffect(() => {
    // Backend ले कुन Event Name पठाए पनि Catch गर्न दुवै राखिएको छ:
    const handleNewOrder = (newOrder) => {
      console.log('📥 Billing Page Received Order:', newOrder);
      setOrders((prev) => {
        // Duplicate order आउन नदिन
        const exists = prev.find((o) => o.id === newOrder.id);
        if (exists) return prev;
        return [newOrder, ...prev];
      });
    };

    socket.on('init_orders', (initialOrders) => {
      setOrders(initialOrders || []);
    });

    socket.on('order_received', handleNewOrder);
    socket.on('new_order', handleNewOrder); // सेफ्टीको लागि दुवै event name

    socket.on('order_completed', (orderId) => {
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      setSelectedOrder(null);
    });

    return () => {
      socket.off('init_orders');
      socket.off('order_received', handleNewOrder);
      socket.off('new_order', handleNewOrder);
      socket.off('order_completed');
    };
  }, []);

  const calculateGrandTotal = (total) => {
    const discountAmount = (total * discountPercent) / 100;
    return Math.round(total - discountAmount);
  };

  const handleCompleteSale = (order) => {
    const finalAmount = calculateGrandTotal(order.total);
    const completedRecord = {
      ...order,
      discountPercent,
      finalAmount,
      paymentMethod,
    };

    socket.emit('complete_order', order.id);
    if (onSaleComplete) onSaleComplete(completedRecord);
    alert(`✅ Bill settled for ${order.table} via ${paymentMethod}!`);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#FAF7F2', color: '#2C1810', fontFamily: 'sans-serif' }}>
      
      {/* LEFT SIDE: ACTIVE ORDERS LIST */}
      <div style={{ flex: 1.1, backgroundColor: '#FFFFFF', borderRight: '1px solid #EFEAE1', padding: '24px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#2C1810' }}>⚡ Active Orders</h2>
          <span style={{ backgroundColor: '#6F4E37', color: '#FFF', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '800' }}>
            {orders.length}
          </span>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#A08976', marginTop: '100px' }}>
            <p style={{ fontSize: '40px', margin: '0 0 10px 0' }}>☕</p>
            <p style={{ fontSize: '14px', fontWeight: '700' }}>No active orders right now</p>
            <p style={{ fontSize: '12px' }}>Orders sent from Waiter Console will show here instantly.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.map((ord) => (
              <div
                key={ord.id || Math.random()}
                onClick={() => setSelectedOrder(ord)}
                style={{
                  padding: '16px',
                  backgroundColor: selectedOrder?.id === ord.id ? '#FAF7F2' : '#FFFFFF',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  border: selectedOrder?.id === ord.id ? '2px solid #6F4E37' : '1px solid #EFEAE1',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#2C1810' }}>{ord.table}</span>
                  <span style={{ fontSize: '11px', color: '#8C7A6B', fontWeight: '600' }}>{ord.createdAt || 'Now'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#8C7A6B' }}>{ord.items ? ord.items.length : 0} Items</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#6F4E37' }}>Rs. {ord.total}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT SIDE: BILL RECEIPT PREVIEW */}
      <div style={{ flex: 2, padding: '28px', overflowY: 'auto', display: 'flex', gap: '24px', justifyContent: 'center' }}>
        {selectedOrder ? (
          <>
            {/* THERMAL RECEIPT CARD */}
            <div
              id="printable-bill"
              style={{
                width: '340px',
                backgroundColor: '#FFFFFF',
                color: '#1A1A1A',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                border: '1px solid #E2D9CC',
                height: 'fit-content',
                fontFamily: "'Courier New', Courier, monospace",
              }}
            >
              <div style={{ textAlign: 'center', borderBottom: '2px solid #2C1810', paddingBottom: '14px', marginBottom: '14px' }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>☕</div>
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: '#2C1810' }}>THE BLACK STONE</h2>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#C5A059' }}>ARTISANAL CAFE & BAR</span>
                <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#666' }}>Bharatpur-10, Chitwan | Ph: 9800000000</p>
              </div>

              <div style={{ fontSize: '12px', marginBottom: '14px', borderBottom: '1px dashed #CCC', paddingBottom: '10px', lineHeight: '1.6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><b>Bill No:</b> #{selectedOrder.id ? String(selectedOrder.id).slice(-5) : '1001'}</span>
                  <span><b>Table:</b> {selectedOrder.table}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><b>Date:</b> {new Date().toLocaleDateString()}</span>
                  <span><b>Time:</b> {selectedOrder.createdAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div style={{ borderBottom: '2px solid #1A1A1A', paddingBottom: '6px', marginBottom: '10px', fontSize: '11px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ flex: 2 }}>ITEM</span>
                <span style={{ flex: 0.5, textAlign: 'center' }}>QTY</span>
                <span style={{ flex: 1, textAlign: 'right' }}>RATE</span>
                <span style={{ flex: 1, textAlign: 'right' }}>TOTAL</span>
              </div>

              <div style={{ borderBottom: '1px dashed #CCC', paddingBottom: '12px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ flex: 2, fontWeight: 'bold' }}>{item.name}</span>
                    <span style={{ flex: 0.5, textAlign: 'center' }}>{item.qty}</span>
                    <span style={{ flex: 1, textAlign: 'right' }}>{item.price}</span>
                    <span style={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}>{item.qty * item.price}</span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: '2px solid #1A1A1A', paddingBottom: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>Rs. {selectedOrder.total}</span>
                </div>
                {discountPercent > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D9534F' }}>
                    <span>Discount ({discountPercent}%):</span>
                    <span>- Rs. {(selectedOrder.total * discountPercent) / 100}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '900', marginTop: '4px', color: '#2C1810' }}>
                  <span>GRAND TOTAL:</span>
                  <span>Rs. {calculateGrandTotal(selectedOrder.total)}</span>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '4px 0 2px 0', fontSize: '11px', fontWeight: '800' }}>THANK YOU FOR VISITING!</p>
              </div>
            </div>

            {/* ACTION CONTROLS */}
            <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1px solid #E2D9CC' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#8C7A6B', display: 'block', marginBottom: '10px' }}>DISCOUNT</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[0, 5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setDiscountPercent(pct)}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: '8px',
                        border: discountPercent === pct ? 'none' : '1px solid #E5DEC9',
                        backgroundColor: discountPercent === pct ? '#6F4E37' : '#FAF7F2',
                        color: discountPercent === pct ? '#FFFFFF' : '#2C1810',
                        fontWeight: '800', fontSize: '12px', cursor: 'pointer',
                      }}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => window.print()}
                  style={{ width: '100%', padding: '14px', backgroundColor: '#2C1810', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
                >
                  🖨️ Print Receipt
                </button>
                <button
                  onClick={() => handleCompleteSale(selectedOrder)}
                  style={{ width: '100%', padding: '14px', backgroundColor: '#4E9F3D', color: '#FFFFFF', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
                >
                  ✅ Complete & Settle
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#A08976', marginTop: '140px' }}>
            <p style={{ fontSize: '15px', fontWeight: '700' }}>👈 Select an active order on the left to generate bill</p>
          </div>
        )}
      </div>

    </div>
  );
}
