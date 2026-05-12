/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return (
    knex.schema
      // 1. Tabel Supplier
      .createTable("suppliers", (table) => {
        table.string("id").primary();
        table.string("name").notNullable();
        table.string("pic");
        table.string("phone");
        table.string("category");
        table.string("status").defaultTo("Aktif");
      })
      // 2. Tabel Inventory (Bahan Baku)
      .createTable("inventory", (table) => {
        table.string("id").primary();
        table.string("name").notNullable();
        table.string("category");
        table.float("stock").defaultTo(0);
        table.string("unit");
        table.string("status");
      })
      // 3. Tabel Menu (Produk POS)
      .createTable("menus", (table) => {
        table.string("id").primary();
        table.string("name").notNullable();
        table.string("category");
        table.integer("price").notNullable();
        table.string("status").defaultTo("Tersedia");
        table.text("image", "longtext");
      })
      // 4. Tabel Order (Penjualan)
      .createTable("orders", (table) => {
        table.string("id").primary();
        table.string("customer_name");
        table.string("table_number");
        table.string("payment_method");
        table.integer("total").defaultTo(0);
        table.string("status").defaultTo("Menunggu"); // Menunggu, Diproses, Selesai, Batal
        table.timestamp("created_at").defaultTo(knex.fn.now());
      })
      // 5. Tabel Pembelian (Purchases)
      .createTable("purchases", (table) => {
        table.string("id").primary();
        table.string("supplier_id").references("id").inTable("suppliers");
        table.text("items_summary");
        table.integer("total").defaultTo(0);
        table.string("status").defaultTo("Diterima");
        table.timestamp("created_at").defaultTo(knex.fn.now());
      })
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("purchases")
    .dropTableIfExists("orders")
    .dropTableIfExists("menus")
    .dropTableIfExists("inventory")
    .dropTableIfExists("suppliers");
};
