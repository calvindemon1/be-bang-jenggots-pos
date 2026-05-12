/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Kosongin tabel dulu biar gak duplicate pas di-run ulang
  await knex("purchases").del();
  await knex("orders").del();
  await knex("menus").del();
  await knex("inventory").del();
  await knex("suppliers").del();

  // Insert Suppliers
  await knex("suppliers").insert([
    {
      id: "SUP-001",
      name: "PT Daging Utama",
      pic: "Bpk. Budi",
      phone: "0812-3333-4444",
      category: "Daging & Seafood",
      status: "Aktif",
    },
    {
      id: "SUP-002",
      name: "Sayur Segar Farm",
      pic: "Ibu Ani",
      phone: "0813-5555-6666",
      category: "Sayur & Buah",
      status: "Aktif",
    },
  ]);

  // Insert Inventory
  await knex("inventory").insert([
    {
      id: "INV-001",
      name: "Ribeye Beef (Raw)",
      category: "Daging",
      stock: 12.5,
      unit: "Kg",
      status: "Aman",
    },
    {
      id: "INV-002",
      name: "Truffle Oil",
      category: "Bumbu",
      stock: 0.8,
      unit: "Liter",
      status: "Menipis",
    },
    {
      id: "INV-003",
      name: "Kentang Curah",
      category: "Sayur",
      stock: 2,
      unit: "Kg",
      status: "Menipis",
    },
  ]);

  // Insert Menus
  await knex("menus").insert([
    {
      id: "MN-001",
      name: "Ribeye Steak 200g",
      category: "Main Course",
      price: 185000,
      status: "Tersedia",
    },
    {
      id: "MN-002",
      name: "Truffle Mushroom Pasta",
      category: "Pasta",
      price: 85000,
      status: "Tersedia",
    },
    {
      id: "MN-003",
      name: "Classic Caesar Salad",
      category: "Appetizer",
      price: 55000,
      status: "Tersedia",
    },
  ]);

  // Insert Orders
  await knex("orders").insert([
    {
      id: "ORD-1105-001",
      customer_name: "John Doe",
      table_number: "Meja 4",
      payment_method: "QRIS",
      total: 325000,
      status: "Diproses",
    },
    {
      id: "ORD-1105-002",
      customer_name: "Sarah",
      table_number: "Meja 12",
      payment_method: "Transfer",
      total: 150000,
      status: "Selesai",
    },
  ]);

  // Insert Pembelian
  await knex("purchases").insert([
    {
      id: "PO-001",
      supplier_id: "SUP-001",
      items_summary: "Ribeye Beef, Tenderloin",
      total: 4500000,
      status: "Diterima",
    },
  ]);
};
