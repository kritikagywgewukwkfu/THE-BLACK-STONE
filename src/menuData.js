const menuData = [
  {
    category: "Main Course",
    items: [
      { name: "Chi. Curry", price: 300, image: "/images/chi_curry.jpg" },
      { name: "Chi. Butter Masala", price: 350, image: "/images/chi_butter_masala.jpg" },
      { name: "Chi. Masala", price: 330, image: "/images/chi_masala.jpg" },
      { name: "Chi. Dopyaja", price: 350, image: "/images/chi_dopyaja.jpg" },
      { name: "Mutton Curry", price: 400, image: "/images/mutton_curry.jpg" },
      { name: "Chi. Kadai", price: 350, image: "/images/chi_kadai.jpg" },
      { name: "Matar Paneer", price: 230, image: "/images/matar_paneer.jpg" },
      { name: "Sai Paneer", price: 320, image: "/images/sai_paneer.jpg" },
      { name: "Dal Fry", price: 130, image: "/images/dal_fry.jpg" },
      { name: "Dal Tadka", price: 150, image: "/images/dal_tadka.jpg" },
      { name: "Mix. Veg. Curry", price: 200, image: "/images/mix_veg_curry.jpg" },
      { name: "Mix. Veg. Masala", price: 250, image: "/images/mix_veg_masala.jpg" },
      { name: "Paneer Curry", price: 280, image: "/images/paneer_curry.jpg" },
      { name: "Mushroom Curry", price: 220, image: "/images/mushroom_curry.jpg" }
    ]
  },
  {
    category: "Biryani & Rice",
    items: [
      { name: "Plain Rice", price: 120, image: "/images/plain_rice.jpg" },
      { name: "Jeera Rice", price: 160, image: "/images/jeera_rice.jpg" },
      { name: "Egg Fry Rice", price: 190, image: "/images/egg_fry_rice.jpg" },
      { name: "Chi. Fry Rice", price: 250, image: "/images/chi_fry_rice.jpg" },
      { name: "Mix Fry Rice", price: 330, image: "/images/mix_fry_rice.jpg" },
      { name: "Veg. Biryani", price: 200, image: "/images/veg_biryani.jpg" },
      { name: "Egg Biryani", price: 220, image: "/images/egg_biryani.jpg" },
      { name: "Mutton Biryani", price: 450, image: "/images/mutton_biryani.jpg" },
      { name: "Chicken Biryani", price: 350, image: "/images/chicken_biryani.jpg" }
    ]
  },
  {
    category: "Khaja Set",
    items: [
      { name: "Sukuti Khaja Set", price: 300, image: "/images/sukuti_khaja_set.jpg" },
      { name: "Chi. Khaja Set", price: 330, image: "/images/chi_khaja_set.jpg" },
      { name: "Bhutan Khaja Set", price: 300, image: "/images/bhutan_khaja_set.jpg" },
      { name: "Sekuwa Khaja Set", price: 330, image: "/images/sekuwa_khaja_set.jpg" },
      { name: "Veg Khaja (Mushroom/Paneer)", price: 350, image: "/images/veg_khaja_set.jpg" }
    ]
  },
  {
    category: "Khana Set",
    items: [
      { name: "Chi. Khana", price: 260, image: "/images/chi_khana.jpg" },
      { name: "Mutton Khana", price: 380, image: "/images/mutton_khana.jpg" },
      { name: "Fish Khana", price: 340, image: "/images/fish_khana.jpg" },
      { name: "Roti Khana Set Veg.", price: 200, image: "/images/roti_khana_veg.jpg" },
      { name: "Roti Khana Set Chi.", price: 280, image: "/images/roti_khana_chi.jpg" },
      { name: "Roti Khana Set Mutton", price: 390, image: "/images/roti_khana_mutton.jpg" }
    ]
  },
  {
    category: "Sandwich & Burger",
    items: [
      { name: "Veg. Sandwich", price: 150, image: "/images/veg_sandwich.jpg" },
      { name: "Chi. Sandwich", price: 250, image: "/images/chi_sandwich.jpg" },
      { name: "Chi. Burger", price: 220, image: "/images/chi_burger.jpg" },
      { name: "Veg. Burger", price: 180, image: "/images/veg_burger.jpg" },
      { name: "Crispy Chi. Burger", price: 290, image: "/images/crispy_chi_burger.jpg" },
      { name: "Cheese Burger", price: 190, image: "/images/cheese_burger.jpg" },
      { name: "Extra Cheese", price: 100, image: "/images/extra_cheese.jpg" }
    ]
  },
  {
    category: "Roll",
    items: [
      { name: "Veg Katti Roll", price: 150, image: "/images/veg_katti_roll.jpg" },
      { name: "Chi. Katti Roll", price: 200, image: "/images/chi_katti_roll.jpg" },
      { name: "Paneer Katti Roll", price: 180, image: "/images/paneer_katti_roll.jpg" }
    ]
  },
  {
    category: "Soup",
    items: [
      { name: "Mushroom Soup", price: 130, image: "/images/mushroom_soup.jpg" },
      { name: "Chi. Soup", price: 180, image: "/images/chi_soup.jpg" },
      { name: "Veg. Soup", price: 110, image: "/images/veg_soup.jpg" },
      { name: "Hot & Sour Soup", price: 230, image: "/images/hot_and_sour_soup.jpg" }
    ]
  },
  {
    category: "Appetizer Non Veg",
    items: [
      { name: "Chi. Chilly (W/B)", price: 300, image: "/images/chi_chilly_wb.jpg" },
      { name: "Chi. Chilly (B/L)", price: 375, image: "/images/chi_chilly_bl.jpg" },
      { name: "Chi. Chilly Crispy", price: 390, image: "/images/chi_chilly_crispy.jpg" },
      { name: "Chi. Lollypop", price: 300, image: "/images/chi_lollypop.jpg" },
      { name: "Sausage Fry 4pcs", price: 270, image: "/images/sausage_fry.jpg" },
      { name: "Sausage Boiled", price: 230, image: "/images/sausage_boiled.jpg" },
      { name: "Sausage Chilly", price: 330, image: "/images/sausage_chilly.jpg" },
      { name: "Garlic Chicken", price: 350, image: "/images/garlic_chicken.jpg" },
      { name: "Lemon Garlic Chicken", price: 330, image: "/images/lemon_garlic_chicken.jpg" },
      { name: "Chi. Fry with Bone", price: 300, image: "/images/chi_fry_with_bone.jpg" },
      { name: "Bhuttan", price: 320, image: "/images/bhuttan.jpg" },
      { name: "Crispy Chicken", price: 370, image: "/images/crispy_chicken.jpg" }
    ]
  },
  {
    category: "Appetizer Veg",
    items: [
      { name: "French Fry [S/M/L]", price: "150/200/300", image: "/images/french_fry.jpg" },
      { name: "Veg. Pakada", price: 200, image: "/images/veg_pakada.jpg" },
      { name: "Chips Chilly", price: 280, image: "/images/chips_chilly.jpg" },
      { name: "Paneer Pakauda", price: 320, image: "/images/paneer_pakauda.jpg" },
      { name: "Paneer Chilly", price: 350, image: "/images/paneer_chilly.jpg" },
      { name: "Mushroom Pakauda", price: 220, image: "/images/mushroom_pakauda.jpg" },
      { name: "Mushroom Chilly", price: 300, image: "/images/mushroom_chilly.jpg" },
      { name: "Mushroom Choila", price: 300, image: "/images/mushroom_choila.jpg" },
      { name: "Aalu Chop", price: 300, image: "/images/aalu_chop.jpg" },
      { name: "Mix Veg. Boil", price: 200, image: "/images/mix_veg_boil.jpg" },
      { name: "Sweet Corn Fry", price: 300, image: "/images/sweet_corn_fry.jpg" },
      { name: "Crispy Sweet Corn", price: 200, image: "/images/crispy_sweet_corn.jpg" },
      { name: "Sweet Corn Boil", price: 150, image: "/images/sweet_corn_boil.jpg" },
      { name: "Bhatamas Sandeko", price: 100, image: "/images/bhatamas_sandeko.jpg" },
      { name: "Noodles Sandeko", price: 160, image: "/images/noodles_sandeko.jpg" },
      { name: "Aloo Sandeko", price: 220, image: "/images/aloo_sandeko.jpg" },
      { name: "Peanut Sandeko", price: 170, image: "/images/peanut_sandeko.jpg" },
      { name: "Aloo timur", price: 170, image: "/images/aloo_timur.jpg" }
    ]
  },
  {
    category: "Pizza",
    items: [
      { name: "Chi. Pizza [M/L]", price: "580/780", image: "/images/chi_pizza.jpg" },
      { name: "Mix Pizza [M/L]", price: "700/850", image: "/images/mix_pizza.jpg" },
      { name: "Veg. Pizza [M/L]", price: "550/700", image: "/images/veg_pizza.jpg" },
      { name: "Mushroom Pizza [M/L]", price: "550/680", image: "/images/mushroom_pizza.jpg" }
    ]
  },
  {
    category: "MoMo Chicken",
    items: [
      { name: "Chi. MoMo S", price: 150, image: "/images/chi_momo.jpg" },
      { name: "Chi. C MoMo", price: 220, image: "/images/chi_c_momo.jpg" },
      { name: "Chi. Kothey MoMo", price: 190, image: "/images/chi_kothey_momo.jpg" },
      { name: "Sandeko MoMo", price: 200, image: "/images/chi_sandeko_momo.jpg" },
      { name: "Crispy MoMo", price: 220, image: "/images/chi_crispy_momo.jpg" },
      { name: "Fry MoMo", price: 180, image: "/images/chi_fry_momo.jpg" },
      { name: "Jhol MoMo", price: 220, image: "/images/chi_jhol_momo.jpg" }
    ]
  },
  {
    category: "MoMo Veg",
    items: [
      { name: "Veg. MoMo S", price: 110, image: "/images/veg_momo.jpg" },
      { name: "Veg. C MoMo", price: 180, image: "/images/veg_c_momo.jpg" },
      { name: "Veg. Kothey MoMo", price: 170, image: "/images/veg_kothey_momo.jpg" },
      { name: "Sandeko MoMo", price: 170, image: "/images/veg_sandeko_momo.jpg" },
      { name: "Crispy MoMo", price: 170, image: "/images/veg_crispy_momo.jpg" },
      { name: "Fry MoMo", price: 150, image: "/images/veg_fry_momo.jpg" },
      { name: "Jhol MoMo", price: 180, image: "/images/veg_jhol_momo.jpg" }
    ]
  },
  {
    category: "Choumein",
    items: [
      { name: "Chi. Choumein", price: 200, image: "/images/chi_choumein.jpg" },
      { name: "Veg. Choumein", price: 130, image: "/images/veg_choumein.jpg" },
      { name: "Mix Choumein", price: 330, image: "/images/mix_choumein.jpg" },
      { name: "Mix Veg. Choumein", price: 200, image: "/images/mix_veg_choumein.jpg" },
      { name: "Egg Choumein", price: 170, image: "/images/egg_choumein.jpg" }
    ]
  },
  {
    category: "Salad",
    items: [
      { name: "Green Salad", price: 150, image: "/images/green_salad.jpg" },
      { name: "Fruit Salad", price: 390, image: "/images/fruit_salad.jpg" },
      { name: "Nepali Salad", price: 160, image: "/images/nepali_salad.jpg" },
      { name: "Russian Fruit Salad", price: 450, image: "/images/russian_fruit_salad.jpg" }
    ]
  },
  {
    category: "Tea & Coffee",
    items: [
      { name: "Black Tea", price: 20, image: "/images/black_tea.jpg" },
      { name: "Milk Tea", price: 40, image: "/images/milk_tea.jpg" },
      { name: "Lemon Tea", price: 25, image: "/images/lemon_tea.jpg" },
      { name: "Milk Masala Tea", price: 50, image: "/images/milk_masala_tea.jpg" },
      { name: "Black Coffee", price: 60, image: "/images/black_coffee.jpg" },
      { name: "Milk Coffee", price: 100, image: "/images/milk_coffee.jpg" },
      { name: "Hot Lemon Water", price: 80, image: "/images/hot_lemon_water.jpg" },
      { name: "Hot Lemon with Honey", price: 120, image: "/images/hot_lemon_honey.jpg" },
      { name: "Lemon Water", price: 80, image: "/images/lemon_water.jpg" }
    ]
  },
  {
    category: "Breakfast & Roti",
    items: [
      { name: "Chhola Bhatara", price: 130, image: "/images/chhola_bhatara.jpg" },
      { name: "Chana Anda", price: 100, image: "/images/chana_anda.jpg" },
      { name: "Bread Omlete with Jam", price: 120, image: "/images/bread_omlete.jpg" },
      { name: "Bread Toast", price: 60, image: "/images/bread_toast.jpg" },
      { name: "Plain Roti", price: 20, image: "/images/plain_roti.jpg" },
      { name: "Butter Roti", price: 40, image: "/images/butter_roti.jpg" },
      { name: "Lachha Paratha", price: 80, image: "/images/lachha_paratha.jpg" },
      { name: "Aloo Paratha", price: 60, image: "/images/aloo_paratha.jpg" },
      { name: "Paneer Paratha", price: 100, image: "/images/paneer_paratha.jpg" },
      { name: "Keema Paratha", price: 120, image: "/images/keema_paratha.jpg" }
    ]
  },
  {
    category: "Hard Drinks & Beer",
    items: [
      { name: "Black Label (1 Ltr.)", price: "11111 (Full) / 2300 (180ml) / 750 (60ml)", image: "/images/black_label.jpg" },
      { name: "Double Black Label (1 Ltr.)", price: "13625 (Full) / 2550 (180ml) / 900 (60ml)", image: "/images/double_black.jpg" },
      { name: "Absolut Vodka (1 Ltr.)", price: "9800 (Full) / 7850 (750ml) / 1950 (180ml) / 680 (60ml) / 360 (30ml)", image: "/images/absolut_vodka.jpg" },
      { name: "Red Label (1 Ltr.)", price: "10000 (Full) / 7800 (750ml) / 1950 (180ml) / 710 (60ml) / 370 (30ml)", image: "/images/red_label.jpg" },
      { name: "Chivas (1 Ltr.)", price: "12700 (Full) / 9800 (750ml) / 2500 (180ml) / 900 (60ml) / 480 (30ml)", image: "/images/chivas.jpg" },
      { name: "VAT 69", price: "8900 (Full) / 6800 (750ml) / 1800 (180ml) / 625 (60ml) / 325 (30ml)", image: "/images/vat69.jpg" },
      { name: "Jamson (1 Ltr.)", price: "10100 (Full) / 6600 (750ml) / 1850 (180ml) / 650 (60ml) / 350 (30ml)", image: "/images/jameson.jpg" },
      { name: "High Lander (Quarter)", price: 400, image: "/images/high_lander.jpg" },
      { name: "Goldmeak (Quarter)", price: 425, image: "/images/goldmeak.jpg" },
      { name: "Red Signature (Quarter)", price: 825, image: "/images/red_signature.jpg" },
      { name: "8848 (Quarter)", price: 720, image: "/images/8848.jpg" },
      { name: "Khukuri Rum (Quarter)", price: 675, image: "/images/khukuri_rum.jpg" },
      { name: "Mustang (Quarter)", price: 390, image: "/images/mustang.jpg" },
      { name: "GNG (Quarter)", price: 950, image: "/images/gng.jpg" },
      { name: "OD Regular (Quarter)", price: 900, image: "/images/od_regular.jpg" },
      { name: "Black Chimney (Quarter)", price: 1100, image: "/images/black_chimney.jpg" },
      { name: "Gorkha Beer Small", price: 275, image: "/images/gorkha_small.jpg" },
      { name: "Gorkha Beer Large", price: 475, image: "/images/gorkha_large.jpg" },
      { name: "Gorkha Beer Premium", price: 480, image: "/images/gorkha_premium.jpg" },
      { name: "Tuborg Beer", price: 550, image: "/images/tuborg_beer.jpg" },
      { name: "Carlsberg Beer", price: 625, image: "/images/carlsberg_beer.jpg" },
      { name: "Tuborg Beer Can", price: 400, image: "/images/tuborg_can.jpg" },
      { name: "Gorkha Strong Can", price: 350, image: "/images/gorkha_can.jpg" }
    ]
  },
  {
    category: "Wine & Soft Drinks",
    items: [
      { name: "Big Master White", price: 1100, image: "/images/big_master_white.jpg" },
      { name: "Big Master Red", price: 1100, image: "/images/big_master_red.jpg" },
      { name: "Canvas White", price: 1150, image: "/images/canvas_white.jpg" },
      { name: "Canvas Red", price: 1150, image: "/images/canvas_red.jpg" },
      { name: "JP (White/Red)", price: 2750, image: "/images/jp_wine.jpg" },
      { name: "Jacob's Creek", price: 2400, image: "/images/jacobs_creek.jpg" },
      { name: "Red Blue", price: 200, image: "/images/red_blue.jpg" },
      { name: "Red Bull", price: 150, image: "/images/red_bull.jpg" },
      { name: "Mix Juice", price: 60, image: "/images/mix_juice.jpg" },
      { name: "Hot Lemon", price: 150, image: "/images/hot_lemon.jpg" },
      { name: "Fresh Juice", price: 25, image: "/images/fresh_juice.jpg" },
      { name: "Water", price: 30, image: "/images/water.jpg" }
    ]
  }
];

export default menuData;
