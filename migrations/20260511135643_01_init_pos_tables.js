/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return (
    knex.schema
      // 0. Tabel Users (Karyawan & Akses Login)
      .createTable("users", (table) => {
        table.string("id").primary(); // USR-12345
        table.string("username").notNullable().unique();
        table.string("email").notNullable().unique();
        table.string("password").notNullable(); // Hashed password
        table.string("role").notNullable().defaultTo("kasir"); // admin, kasir, koki
        table.string("status").defaultTo("Aktif"); // Aktif, Nonaktif
        table.timestamp("created_at").defaultTo(knex.fn.now());
      })

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
        table.integer("last_purchase_price").defaultTo(0); // Buat tracking modal terakhir
        table.string("status").defaultTo("Aktif");
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

      // 4. Tabel Orders (Data Transaksi Utama)
      .createTable("orders", (table) => {
        table.string("id").primary();
        table.string("customer_name");
        table.string("table_number");
        table.string("order_type").notNullable().defaultTo("Dine In"); // (Point 3: Take away / Dine In)
        table.string("payment_method");
        table.float("discount_percent").defaultTo(0); // (Point 9: Diskon dalam persen)
        table.integer("subtotal").defaultTo(0); // Total sebelum diskon
        table.integer("total_payment").defaultTo(0); // Total setelah diskon
        table.string("status").defaultTo("Menunggu"); // Menunggu, Dimasak, Selesai, Batal

        // (Point 7: Tracking waktu pembuatan)
        table.timestamp("created_at").defaultTo(knex.fn.now()); // Waktu order masuk
        table.timestamp("started_cooking_at").defaultTo(null); // Waktu koki mulai masak
        table.timestamp("completed_at").defaultTo(null); // Waktu pesanan di-serve ke customer
      })

      // 5. Tabel Order Items (Detail Kustomisasi Makanan per Porsi)
      .createTable("order_items", (table) => {
        table.increments("id").primary();
        table
          .string("order_id")
          .references("id")
          .inTable("orders")
          .onDelete("CASCADE");
        table.string("menu_id").references("id").inTable("menus");
        table.integer("qty").defaultTo(1);
        table.integer("price").notNullable(); // Harga saat dibeli (jaga-jaga harga menu berubah)

        // (Point 1, 4, 5, 6, 8: Request khusus Teppanyaki)
        table.string("portion").defaultTo("1"); // "1" atau "1/2"
        table.integer("spiciness_level").defaultTo(0); // 0 (ngga pedas) sampai misal 5
        table.string("egg_type").defaultTo("None"); // Sunny Side Up, Scrambled, Omelette
        table.string("sauce_type"); // Teriyaki, Blackpepper, Spicy Mayo, dll

        // (Point 2: Toppings - Pakai JSON biar gampang nyimpen { "daun_bawang": true, "wijen": false })
        table.json("toppings");

        table.text("notes"); // Catatan tambahan
      })

      // 6. Tabel Purchases (Pembelian / Belanja Bahan)
      .createTable("purchases", (table) => {
        table.string("id").primary();
        table.string("supplier_id").references("id").inTable("suppliers");
        table.integer("total_cost").defaultTo(0); // (Point 1: Keluar uang berapa buat belanja)
        table.string("status").defaultTo("Diterima");
        table.timestamp("created_at").defaultTo(knex.fn.now());
      })

      // 7. Tabel Purchase Items (Detail Barang yang dibeli)
      .createTable("purchase_items", (table) => {
        table.increments("id").primary();
        table
          .string("purchase_id")
          .references("id")
          .inTable("purchases")
          .onDelete("CASCADE");
        table.string("inventory_id").references("id").inTable("inventory");
        table.float("qty").notNullable(); // (Point 4: Nambah jumlah barang)
        table.integer("unit_price").notNullable(); // Harga per item pas beli
        table.integer("subtotal").notNullable(); // qty * unit_price
      })

      // 8. Tabel Stock Opname (Log pengecekan & sisa barang harian)
      .createTable("stock_opnames", (table) => {
        table.increments("id").primary();
        table.string("inventory_id").references("id").inTable("inventory");

        // (Point 2 & 3: Stok sistem vs sisa realita harian & kondisinya)
        table.float("system_stock").notNullable();
        table.float("actual_stock").notNullable();
        table.float("difference_stock").defaultTo(0); // Selisihnya (kalo minus berarti ada yg hilang/basi)
        table.string("condition"); // Bagus, Rusak, Basi

        table.text("notes"); // Keterangan (misal: "Dibuang karena basi")
        table.string("checked_by"); // Nama pegawai yang ngecek
        table.timestamp("created_at").defaultTo(knex.fn.now());
      })
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  // Harus drop dari tabel yang bergantung (child) dulu biar ngga error Foreign Key
  return knex.schema
    .dropTableIfExists("stock_opnames")
    .dropTableIfExists("purchase_items")
    .dropTableIfExists("purchases")
    .dropTableIfExists("order_items")
    .dropTableIfExists("orders")
    .dropTableIfExists("menus")
    .dropTableIfExists("inventory")
    .dropTableIfExists("suppliers")
    .dropTableIfExists("users");
};
