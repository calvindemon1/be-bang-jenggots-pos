/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // Pake alterTable buat ngedit tabel yang udah ada
  return knex.schema.alterTable("menus", (table) => {
    table.text("image", "longtext"); // Tambahin kolom barunya di sini
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  // Kalau apesnya lu butuh rollback migrasi INI doang, dia bakal ngehapus kolomnya
  return knex.schema.alterTable("menus", (table) => {
    table.dropColumn("image");
  });
};
