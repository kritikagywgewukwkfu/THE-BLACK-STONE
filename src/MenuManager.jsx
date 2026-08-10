import React, { useState } from 'react';

const initialCategories = [
  { id: 'tea', name: 'Tea & Coffee', icon: '☕', itemsCount: 12 },
  { id: 'cold', name: 'Cold Beverages', icon: '🥤', itemsCount: 10 },
  { id: 'breakfast', name: 'Breakfast & Toast', icon: '🍳', itemsCount: 8 },
  { id: 'momo', name: 'MoMo Specials', icon: '🥟', itemsCount: 8 },
  { id: 'chowmein', name: 'Noodles & Chowmein', icon: '🍜', itemsCount: 6 },
  { id: 'pizza', name: 'Artisanal Pizza', icon: '🍕', itemsCount: 8 },
  { id: 'burger', name: 'Burgers & Sandwiches', icon: '🍔', itemsCount: 7 },
  { id: 'snacks', name: 'Appetizers & Snacks', icon: '🍟', itemsCount: 11 },
  { id: 'main', name: 'Main Course & Biryani', icon: '🍛', itemsCount: 6 }
];

const menuData = {
  tea: [
    { name: 'Black Tea', price: 20 },
    { name: 'Milk Tea', price: 40 },
    { name: 'Masala Tea', price: 50 },
    { name: 'Lemon Tea', price: 40 },
    { name: 'Ginger Tea', price: 45 },
    { name: 'Green Tea', price: 60 },
    { name: 'Black Coffee', price: 70 },
    { name: 'Milk Coffee', price: 100 },
    { name: 'Espresso Single', price: 90 },
    { name: 'Americano', price: 120 },
    { name: 'Cappuccino', price: 160 },
    { name: 'Cafe Latte', price: 170 }
  ],
  cold: [
    { name: 'Cold Coffee with Ice Cream', price: 220 },
    { name: 'Iced Americano', price: 140 },
    { name: 'Iced Latte', price: 180 },
    { name: 'Lemonade / Lime Soda', price: 120 },
    { name: 'Peach Iced Tea', price: 160 },
    { name: 'Mango Smoothie', price: 200 },
    { name: 'Chocolate Milkshake', price: 220 },
    { name: 'Strawberry Milkshake', price: 220 },
    { name: 'Coke / Fanta / Sprite', price: 70 },
    { name: 'Red Bull', price: 250 }
  ],
  breakfast: [
    { name: 'Plain Toast with Butter', price: 80 },
    { name: 'Toast with Jam/Honey', price: 90 },
    { name: 'French Toast', price: 140 },
    { name: 'Plain Omelette (2 eggs)', price: 100 },
    { name: 'Masala Omelette', price: 120 },
    { name: 'Cheese Omelette', price: 160 },
    { name: 'Pancake with Syrup', price: 180 },
    { name: 'American Breakfast Combo', price: 320 }
  ],
  momo: [
    { name: 'Veg Steam MoMo', price: 120 },
    { name: 'Veg Fried / Kothey MoMo', price: 150 },
    { name: 'Veg C MoMo', price: 180 },
    { name: 'Chicken Steam MoMo', price: 160 },
    { name: 'Chicken Fried / Kothey MoMo', price: 190 },
    { name: 'Chicken C MoMo', price: 230 },
    { name: 'Chicken Jhol MoMo', price: 210 },
    { name: 'Buff Steam MoMo', price: 140 }
  ],
  chowmein: [
    { name: 'Veg Chowmein', price: 130 },
    { name: 'Egg Chowmein', price: 160 },
    { name: 'Chicken Chowmein', price: 200 },
    { name: 'Buff Chowmein', price: 180 },
    { name: 'Mixed Chowmein', price: 240 },
    { name: 'Schezwan Chicken Noodles', price: 230 }
  ],
  pizza: [
    { name: 'Margherita Pizza (Medium)', price: 420 },
    { name: 'Veg Supreme Pizza (Medium)', price: 480 },
    { name: 'Chicken BBQ Pizza (Medium)', price: 580 },
    { name: 'Chicken Mushroom Pizza', price: 560 },
    { name: 'Black Stone Special Meat Lovers Pizza', price: 680 },
    { name: 'Hawaiian Chicken Pizza', price: 590 }
  ],
  burger: [
    { name: 'Veg Burger', price: 160 },
    { name: 'Veg Cheese Burger', price: 190 },
    { name: 'Chicken Burger', price: 220 },
    { name: 'Crispy Chicken Cheese Burger', price: 260 },
    { name: 'Club Sandwich with Chips', price: 280 },
    { name: 'Grilled Chicken Sandwich', price: 240 }
  ],
  snacks: [
    { name: 'French Fries', price: 160 },
    { name: 'Peri Peri Fries', price: 190 },
    { name: 'Potato Wedges', price: 200 },
    { name: 'Chicken Chilli', price: 320 },
    { name: 'Chicken Drumstick (4 pcs)', price: 350 },
    { name: 'Chicken Wings (6 pcs)', price: 380 },
    { name: 'Chicken Nuggets', price: 280 },
    { name: 'Sausage Chilli', price: 220 },
    { name: 'Paneer Chilli', price: 290 },
    { name: 'Mushroom Chilli', price: 260 }
  ],
  main: [
    { name: 'Chicken Biryani with Raita', price: 350 },
    { name: 'Veg Biryani', price: 280 },
    { name: 'Veg Fried Rice', price: 160 },
    { name: 'Chicken Fried Rice', price: 220 },
    { name: 'Mixed Fried Rice', price: 260 },
    { name: 'Thali Set (Chicken/Veg)', price: 380 }
  ]
};

export default function MenuManager() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div style={{ padding: '32px', color: '#2C1810' }}>
      
      {/* Top Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#2C1810' }}>📁 Menu Folder Directory</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#8C7A6B' }}>Select a folder below to view full items from the cafe menu</p>
        </div>

        {selectedCategory && (
          <button 
            onClick={() => setSelectedCategory(null)}
            style={{ padding: '10px 18px', backgroundColor: '#6F4E37', color: '#FFF', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
          >
            ⬅️ Back to Folders
          </button>
        )}
      </div>

      {/* VIEW 1: CATEGORY FOLDERS GRID */}
      {!selectedCategory ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {initialCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              style={{
                backgroundColor: '#FFFFFF',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid #EFEAE1',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(44, 24, 16, 0.03)',
                transition: 'transform 0.2s, boxShadow 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>{cat.icon}</div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '800', color: '#2C1810' }}>{cat.name}</h3>
              <span style={{ fontSize: '12px', color: '#8C7A6B', fontWeight: '600' }}>{cat.itemsCount} Items in folder</span>
            </div>
          ))}
        </div>
      ) : (
        /* VIEW 2: ITEMS INSIDE SELECTED FOLDER */
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: '14px', border: '1px solid #EFEAE1' }}>
            <span style={{ fontSize: '32px' }}>{selectedCategory.icon}</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{selectedCategory.name} Folder</h2>
              <span style={{ fontSize: '12px', color: '#8C7A6B' }}>Showing all items listed under this category</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {(menuData[selectedCategory.id] || []).map((item, index) => (
              <div key={index} style={{ backgroundColor: '#FFFFFF', padding: '18px', borderRadius: '14px', border: '1px solid #EFEAE1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#2C1810' }}>{item.name}</h4>
                  <span style={{ fontSize: '11px', color: '#4E9F3D', fontWeight: '700' }}>● Available</span>
                </div>
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#6F4E37' }}>Rs. {item.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
