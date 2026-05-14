/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Kosongin tabel dari child ke parent biar gak kena error Foreign Key
  await knex("stock_opnames").del();
  await knex("purchase_items").del();
  await knex("purchases").del();
  await knex("order_items").del();
  await knex("orders").del();
  await knex("menus").del();
  await knex("inventory").del();
  await knex("suppliers").del();

  // 1. Insert Suppliers
  await knex("suppliers").insert([
    {
      id: "SUP-001",
      name: "Juragan Daging & Ayam",
      pic: "Mang Ujang",
      phone: "0812-111-222",
      category: "Daging & Seafood",
      status: "Aktif",
    },
    {
      id: "SUP-002",
      name: "Grosir Beras & Kentang",
      pic: "Ko Aseng",
      phone: "0813-333-444",
      category: "Sayur & Karbo",
      status: "Aktif",
    },
  ]);

  // 2. Insert Inventory (Sesuai dengan menu futsal)
  await knex("inventory").insert([
    {
      id: "INV-001",
      name: "Paha Ayam Fillet (Karage/RCC)",
      category: "Daging",
      stock: 15,
      unit: "Kg",
      last_purchase_price: 45000,
      status: "Aktif",
    },
    {
      id: "INV-002",
      name: "Daging Sapi Slice (Yakiniku)",
      category: "Daging",
      stock: 8,
      unit: "Kg",
      last_purchase_price: 110000,
      status: "Aktif",
    },
    {
      id: "INV-003",
      name: "Beras Premium",
      category: "Sayur",
      stock: 20,
      unit: "Kg",
      last_purchase_price: 15000,
      status: "Aktif",
    },
    {
      id: "INV-004",
      name: "Kentang Truffle Chips",
      category: "Sayur",
      stock: 10,
      unit: "Kg",
      last_purchase_price: 35000,
      status: "Aktif",
    },
    {
      id: "INV-005",
      name: "Bumbu Cajun & Honey Sauce",
      category: "Bumbu",
      stock: 5,
      unit: "Liter",
      last_purchase_price: 50000,
      status: "Aktif",
    },
  ]);

  // 3. Insert Menus (Konsep Booth Futsal Anak)
  await knex("menus").insert([
    // Chicken Karage Honey Sauce
    {
      id: "MN-001",
      name: "Honey Karage (Ala Carte)",
      category: "Main Course",
      price: 20000,
      status: "Tersedia",
    },
    {
      id: "MN-002",
      name: "Honey Karage (Set Nasi)",
      category: "Main Course",
      price: 25000,
      status: "Tersedia",
    },
    {
      id: "MN-003",
      name: "Honey Karage (Set Truffle Chips)",
      category: "Main Course",
      price: 30000,
      status: "Tersedia",
    },

    // Yakiniku
    {
      id: "MN-004",
      name: "Beef Yakiniku (Ala Carte)",
      category: "Main Course",
      price: 25000,
      status: "Tersedia",
    },
    {
      id: "MN-005",
      name: "Beef Yakiniku (Set Nasi)",
      category: "Main Course",
      price: 30000,
      status: "Tersedia",
    },
    {
      id: "MN-006",
      name: "Beef Yakiniku (Set Truffle Chips)",
      category: "Main Course",
      price: 35000,
      status: "Tersedia",
    },

    // RCC
    {
      id: "MN-007",
      name: "RCC (Ala Carte)",
      category: "Main Course",
      price: 20000,
      status: "Tersedia",
    },
    {
      id: "MN-008",
      name: "RCC (Set Nasi)",
      category: "Main Course",
      price: 25000,
      status: "Tersedia",
    },
    {
      id: "MN-009",
      name: "RCC (Set Truffle Chips)",
      category: "Main Course",
      price: 30000,
      status: "Tersedia",
    },

    // Chicken Karage Cajun Style
    {
      id: "MN-010",
      name: "Cajun Karage (Ala Carte)",
      category: "Main Course",
      price: 20000,
      status: "Tersedia",
    },
    {
      id: "MN-011",
      name: "Cajun Karage (Set Nasi)",
      category: "Main Course",
      price: 25000,
      status: "Tersedia",
    },
    {
      id: "MN-012",
      name: "Cajun Karage (Set Truffle Chips)",
      category: "Main Course",
      price: 30000,
      status: "Tersedia",
    },
  ]);

  // 4. Insert Orders (Header)
  await knex("orders").insert([
    {
      id: "ORD-001",
      customer_name: "Tim Futsal Garuda",
      table_number: "Takeaway",
      order_type: "Takeaway",
      payment_method: "QRIS",
      discount_percent: 0,
      subtotal: 80000,
      total_payment: 80000,
      status: "Selesai",
    },
    {
      id: "ORD-002",
      customer_name: "Budi (Penonton)",
      table_number: "Dine In",
      order_type: "Dine In",
      payment_method: "Cash",
      discount_percent: 0,
      subtotal: 35000,
      total_payment: 35000,
      status: "Diproses",
    },
  ]);

  // 5. Insert Order Items (Detail & Kustomisasi Makanan)
  await knex("order_items").insert([
    // Pesanan Tim Futsal (Beli banyak set nasi biar kenyang)
    {
      order_id: "ORD-001",
      menu_id: "MN-011", // Cajun Karage Set Nasi
      qty: 2,
      price: 25000,
      portion: "1",
      spiciness_level: 0,
      egg_type: "None",
      sauce_type: "Cajun",
      toppings: JSON.stringify({ extra_sauce: true }),
      notes: "Bungkus misah ya bang",
    },
    {
      order_id: "ORD-001",
      menu_id: "MN-002", // Honey Karage Set Nasi
      qty: 1,
      price: 25000,
      portion: "1",
      spiciness_level: 0,
      egg_type: "None",
      sauce_type: "Honey",
      toppings: JSON.stringify({ wijen: true }),
      notes: "",
    },
    // Pesanan Budi (Makan santai pake truffle chips)
    {
      order_id: "ORD-002",
      menu_id: "MN-006", // Beef Yakiniku Set Truffle Chips
      qty: 1,
      price: 35000,
      portion: "1",
      spiciness_level: 2, // Minta agak pedas
      egg_type: "Sunny Side Up",
      sauce_type: "Yakiniku",
      toppings: JSON.stringify({ daun_bawang: true }),
      notes: "Chipsnya dibanyakin dong",
    },
  ]);

  // 6. Insert Purchase (Header Belanja)
  await knex("purchases").insert([
    {
      id: "PO-001",
      supplier_id: "SUP-001",
      total_cost: 450000,
      status: "Diterima",
    },
  ]);

  // 7. Insert Purchase Items (Detail Belanja Paha Ayam)
  await knex("purchase_items").insert([
    {
      purchase_id: "PO-001",
      inventory_id: "INV-001", // Paha Ayam
      qty: 10,
      unit_price: 45000,
      subtotal: 450000,
    },
  ]);

  // 8. Insert Stock Opname (Contoh Pengecekan Akhir Hari pas futsal kelar)
  await knex("stock_opnames").insert([
    {
      inventory_id: "INV-004", // Ngecek Truffle Chips
      system_stock: 10,
      actual_stock: 9.8,
      difference_stock: -0.2,
      condition: "Rusak",
      notes: "Hancur remuk di dasar plastik",
      checked_by: "Admin Kasir",
    },
  ]);
};
