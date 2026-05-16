const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ==========================================
// HELPER: FORMAT TANGGAL & ID GENERATOR
// ==========================================

// Bikin format DDMMYY (Contoh: 120526)
const getFormattedDate = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0"); // Bulan mulai dari 0
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}`;
};

// Generate ID berurutan berdasarkan tabel dan prefix
const generateSequenceId = async (tableName, prefix) => {
  const dateStr = getFormattedDate();
  const fullPrefix = `${prefix}-${dateStr}`;

  // Ambil semua ID di tabel ini yang punya prefix hari ini
  const records = await db(tableName)
    .select("id")
    .where("id", "like", `${fullPrefix}%`);

  let maxSeq = 0;
  records.forEach((row) => {
    // Buang prefixnya, sisa angkanya aja (ex: "001")
    const seqStr = row.id.replace(fullPrefix, "");
    const seqNum = parseInt(seqStr, 10);
    if (!isNaN(seqNum) && seqNum > maxSeq) {
      maxSeq = seqNum;
    }
  });

  // Tambah urutan dan tambahin padding nol di depannya
  const nextSeq = maxSeq + 1;
  const seqStr = String(nextSeq).padStart(3, "0");
  return `${fullPrefix}${seqStr}`;
};

// ==========================================
// 1. AUTHENTICATION & USERS CRUD
// ==========================================
const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const userExist = await db("users").where({ email }).first();
    if (userExist)
      return res
        .status(400)
        .json({ success: false, message: "Email udah terdaftar bro!" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Pakai helper baru
    const id = await generateSequenceId("users", "USR");

    await db("users").insert({
      id,
      username,
      email,
      password: hashedPassword,
      role: role || "admin",
    });
    res.status(201).json({
      success: true,
      message: "Register berhasil!",
      data: { id, username, email },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db("users").where({ email }).first();
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User gak ketemu!" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res
        .status(401)
        .json({ success: false, message: "Password salah!" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" },
    );

    res.json({
      success: true,
      message: "Login sukses!",
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await db("users").select(
      "id",
      "username",
      "email",
      "role",
      "created_at",
    );
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await db("users").where({ id: req.params.id }).del();
    res.json({ success: true, message: "User berhasil dihapus!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 2. MENUS CRUD
// ==========================================
const getMenus = async (req, res) => {
  try {
    const menus = await db("menus").select("*");
    res.json({ success: true, data: menus });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getMenuById = async (req, res) => {
  try {
    const menu = await db("menus").where({ id: req.params.id }).first();
    res.json({ success: true, data: menu });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createMenu = async (req, res) => {
  try {
    const { name } = req.body;

    // Logika deteksi Set Paket vs Ala Carte
    const isSet = name.toLowerCase().includes("set");
    const prefix = isSet ? "MN-SET" : "MN-ALC";

    const id = await generateSequenceId("menus", prefix);

    await db("menus").insert({ id, ...req.body });
    res.status(201).json({ success: true, message: "Menu ditambahkan!", id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateMenu = async (req, res) => {
  try {
    await db("menus").where({ id: req.params.id }).update(req.body);
    res.json({ success: true, message: "Menu diupdate!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteMenu = async (req, res) => {
  try {
    await db("menus").where({ id: req.params.id }).del();
    res.json({ success: true, message: "Menu dihapus!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 3. ORDERS CRUD (HEADER - DETAIL)
// ==========================================
const getOrders = async (req, res) => {
  try {
    const orders = await db("orders").select("*").orderBy("created_at", "desc");

    // TAMBAHAN: Looping ambil items & join nama menu
    for (let order of orders) {
      const items = await db("order_items")
        .where({ order_id: order.id })
        .leftJoin("menus", "order_items.menu_id", "=", "menus.id")
        .select("order_items.*", "menus.name as menu_name");

      order.items = items;
    }

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await db("orders").where({ id: req.params.id }).first();
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order tidak ditemukan" });

    const items = await db("order_items")
      .where({ order_id: req.params.id })
      .leftJoin("menus", "order_items.menu_id", "=", "menus.id")
      .select("order_items.*", "menus.name as menu_name");

    res.json({ success: true, data: { ...order, items } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createOrder = async (req, res) => {
  const trx = await db.transaction();
  try {
    // 1. TAMBAHIN no_wa DI DESTRUCTURING INI
    const {
      customer_name,
      no_wa,
      table_number,
      order_type,
      payment_method,
      discount_percent,
      items,
    } = req.body;

    // Pakai helper ID Kasir BJG-DDMMYYXXX
    const orderId = await generateSequenceId("orders", "BJG");

    let subtotal = 0;
    items.forEach((item) => {
      subtotal += item.price * item.qty;
    });

    const total_payment = subtotal - (subtotal * (discount_percent || 0)) / 100;

    // 2. INSERT HEADER ORDER (MASUKIN no_wa KE SINI)
    await trx("orders").insert({
      id: orderId,
      customer_name,
      no_wa, // <--- Data WA disave ke tabel utama order
      table_number,
      order_type: order_type || "Dine In",
      payment_method,
      discount_percent: discount_percent || 0,
      subtotal,
      total_payment,
      status: "Menunggu",
    });

    // 3. INSERT DETAIL ITEMS
    const orderItems = items.map((item) => ({
      order_id: orderId,
      // no_wa dihapus dari sini karena ini tabel menu/item, bukan customer
      menu_id: item.menu_id,
      qty: item.qty || 1,
      price: item.price,
      portion: item.portion || "1",
      spiciness_level: item.spiciness_level || 0,
      egg_type: item.egg_type || "None",
      sauce_type: item.sauce_type || "Original",
      toppings: JSON.stringify(item.toppings || {}),
      notes: item.notes || "",
    }));

    await trx("order_items").insert(orderItems);
    await trx.commit();

    // 🔔 KIRIM NOTIF REAL-TIME
    if (global.io) {
      global.io.emit("new_order", {
        id: Date.now(),
        type: "Order",
        title: "Pesanan Teppanyaki Masuk!",
        desc: `Order ${orderId} meja ${table_number} siap dimasak.`,
        time: "Baru saja",
        icon: "ChefHat",
        color: "text-red-600",
      });
    }

    res
      .status(201)
      .json({ success: true, message: "Order berhasil dibuat!", id: orderId });
  } catch (error) {
    await trx.rollback();
    res.status(500).json({ success: false, error: error.message });
  }
};

// Tambahin fungsi ini bro
const updateOrder = async (req, res) => {
  try {
    const { status, total, customer_name, no_wa } = req.body;
    let updateData = {};

    // 1. Cek kalau ada perubahan status (buat tracking waktu)
    if (status) {
      updateData.status = status;
      if (status === "Dimasak") {
        updateData.started_cooking_at = db.fn.now();
      } else if (status === "Selesai") {
        updateData.completed_at = db.fn.now();
      }
    }

    // 2. Cek kalau ada editan data pelanggan (Nama & WA)
    if (customer_name !== undefined) updateData.customer_name = customer_name;
    if (no_wa !== undefined) updateData.no_wa = no_wa;
    if (total !== undefined) updateData.total_payment = total;

    await db("orders").where({ id: req.params.id }).update(updateData);

    res.json({ success: true, message: "Data order berhasil diupdate!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Jangan lupa di-export di bawahnya ya!
// module.exports = { ..., updateOrder };

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body; // "Dimasak" atau "Selesai"
    let updateData = { status };

    if (status === "Dimasak") {
      updateData.started_cooking_at = db.fn.now();
    } else if (status === "Selesai") {
      updateData.completed_at = db.fn.now();
    }

    await db("orders").where({ id: req.params.id }).update(updateData);
    res.json({ success: true, message: `Status order diupdate ke ${status}!` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    await db("orders").where({ id: req.params.id }).del();
    res.json({ success: true, message: "Order dihapus!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 4. INVENTORY CRUD
// ==========================================
const getInventory = async (req, res) => {
  try {
    const inventory = await db("inventory").select("*");
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getInventoryById = async (req, res) => {
  try {
    const inventory = await db("inventory")
      .where({ id: req.params.id })
      .first();
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createInventory = async (req, res) => {
  try {
    const id = await generateSequenceId("inventory", "INV");
    await db("inventory").insert({ id, ...req.body });
    res
      .status(201)
      .json({ success: true, message: "Item inventory ditambah!", id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateInventory = async (req, res) => {
  try {
    await db("inventory").where({ id: req.params.id }).update(req.body);
    res.json({ success: true, message: "Inventory diupdate!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteInventory = async (req, res) => {
  try {
    await db("inventory").where({ id: req.params.id }).del();
    res.json({ success: true, message: "Inventory dihapus!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 5. SUPPLIERS CRUD
// ==========================================
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await db("suppliers").select("*");
    res.json({ success: true, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const supplier = await db("suppliers").where({ id: req.params.id }).first();
    res.json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createSupplier = async (req, res) => {
  try {
    const id = await generateSequenceId("suppliers", "SUP");
    await db("suppliers").insert({ id, ...req.body });
    res.status(201).json({ success: true, message: "Supplier ditambah!", id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateSupplier = async (req, res) => {
  try {
    await db("suppliers").where({ id: req.params.id }).update(req.body);
    res.json({ success: true, message: "Supplier diupdate!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    await db("suppliers").where({ id: req.params.id }).del();
    res.json({ success: true, message: "Supplier dihapus!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 6. PURCHASES CRUD (HEADER - DETAIL)
// ==========================================
const getPurchases = async (req, res) => {
  try {
    const purchases = await db("purchases")
      .leftJoin("suppliers", "purchases.supplier_id", "=", "suppliers.id")
      .select("purchases.*", "suppliers.name as supplier_name")
      .orderBy("created_at", "desc");

    // TAMBAHAN: Ambil list item untuk masing-masing PO biar bisa di-export
    for (let po of purchases) {
      const items = await db("purchase_items")
        .where({ purchase_id: po.id })
        .leftJoin(
          "inventory",
          "purchase_items.inventory_id",
          "=",
          "inventory.id",
        )
        .select("purchase_items.*", "inventory.name as inventory_name");

      po.items = items; // Masukin array items ke dalam object po
    }

    res.json({ success: true, data: purchases });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getPurchaseById = async (req, res) => {
  try {
    const purchase = await db("purchases")
      .where({ "purchases.id": req.params.id })
      .leftJoin("suppliers", "purchases.supplier_id", "=", "suppliers.id")
      .select("purchases.*", "suppliers.name as supplier_name")
      .first();

    if (!purchase)
      return res
        .status(404)
        .json({ success: false, message: "Data pembelian tidak ditemukan" });

    const items = await db("purchase_items")
      .where({ purchase_id: req.params.id })
      .leftJoin("inventory", "purchase_items.inventory_id", "=", "inventory.id")
      .select("purchase_items.*", "inventory.name as inventory_name");

    res.json({ success: true, data: { ...purchase, items } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createPurchase = async (req, res) => {
  const trx = await db.transaction();
  try {
    const { supplier_id, items } = req.body;
    const purchaseId = await generateSequenceId("purchases", "PO");

    let total_cost = 0;

    const purchaseItems = items.map((item) => {
      const subtotal = item.qty * item.unit_price;
      total_cost += subtotal;
      return {
        purchase_id: purchaseId,
        inventory_id: item.inventory_id,
        qty: item.qty,
        unit_price: item.unit_price,
        subtotal: subtotal,
      };
    });

    await trx("purchases").insert({
      id: purchaseId,
      supplier_id,
      total_cost,
      status: "Diterima",
    });

    await trx("purchase_items").insert(purchaseItems);

    for (let item of items) {
      await trx("inventory")
        .where({ id: item.inventory_id })
        .update({
          stock: db.raw(`stock + ${item.qty}`),
          last_purchase_price: item.unit_price,
        });
    }

    await trx.commit();
    res.status(201).json({
      success: true,
      message: "Belanjaan masuk, stok otomatis update!",
      id: purchaseId,
    });
  } catch (error) {
    await trx.rollback();
    res.status(500).json({ success: false, error: error.message });
  }
};

const updatePurchase = async (req, res) => {
  const trx = await db.transaction();
  try {
    const { supplier_id, status, items } = req.body;
    const purchaseId = req.params.id;

    let updateData = {};
    if (supplier_id) updateData.supplier_id = supplier_id;
    if (status) updateData.status = status;

    // Cek apakah ada perubahan list barang (items)
    if (items && items.length > 0) {
      // 1. AMBIL DATA ITEM LAMA
      const existingItems = await trx("purchase_items").where({
        purchase_id: purchaseId,
      });

      // 2. ROLLBACK STOK LAMA (Kurangi stok inventory sesuai data belanjaan lama)
      for (let oldItem of existingItems) {
        await trx("inventory")
          .where({ id: oldItem.inventory_id })
          .update({
            stock: db.raw(`stock - ${oldItem.qty}`),
          });
      }

      // 3. HAPUS DATA ITEM LAMA DARI DATABASE
      await trx("purchase_items").where({ purchase_id: purchaseId }).del();

      // 4. KALKULASI DATA BARU
      let total_cost = 0;
      const purchaseItems = items.map((item) => {
        const subtotal = item.qty * item.unit_price;
        total_cost += subtotal;
        return {
          purchase_id: purchaseId,
          inventory_id: item.inventory_id,
          qty: item.qty,
          unit_price: item.unit_price,
          subtotal: subtotal,
        };
      });

      updateData.total_cost = total_cost;

      // 5. UPDATE HEADER PURCHASES (Total Biaya & Supplier)
      await trx("purchases").where({ id: purchaseId }).update(updateData);

      // 6. INSERT DATA ITEM BARU
      await trx("purchase_items").insert(purchaseItems);

      // 7. TAMBAH STOK BARU KE INVENTORY & UPDATE HARGA MODAL
      for (let item of items) {
        await trx("inventory")
          .where({ id: item.inventory_id })
          .update({
            stock: db.raw(`stock + ${item.qty}`),
            last_purchase_price: item.unit_price,
          });
      }
    } else {
      // Kalau ngga ngedit barang (misal cuma ganti status/supplier doang)
      if (Object.keys(updateData).length > 0) {
        await trx("purchases").where({ id: purchaseId }).update(updateData);
      }
    }

    await trx.commit();
    res.json({
      success: true,
      message:
        "Data belanja berhasil diupdate dan stok sudah disesuaikan otomatis!",
    });
  } catch (error) {
    await trx.rollback();
    res.status(500).json({ success: false, error: error.message });
  }
};

const deletePurchase = async (req, res) => {
  try {
    await db("purchases").where({ id: req.params.id }).del();
    res.json({ success: true, message: "Purchase dihapus!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// 7. STOCK OPNAME CRUD
// ==========================================
const getStockOpnames = async (req, res) => {
  try {
    const records = await db("stock_opnames")
      .leftJoin("inventory", "stock_opnames.inventory_id", "=", "inventory.id")
      .select("stock_opnames.*", "inventory.name as inventory_name")
      .orderBy("created_at", "desc");
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createStockOpname = async (req, res) => {
  try {
    const { inventory_id, actual_stock, condition, notes, checked_by } =
      req.body;

    const item = await db("inventory").where({ id: inventory_id }).first();
    if (!item)
      return res.status(404).json({
        success: false,
        message: "Barang tidak ditemukan di inventory!",
      });

    const system_stock = item.stock;
    const difference_stock = actual_stock - system_stock;

    await db("stock_opnames").insert({
      inventory_id,
      system_stock,
      actual_stock,
      difference_stock,
      condition,
      notes,
      checked_by,
    });

    await db("inventory")
      .where({ id: inventory_id })
      .update({ stock: actual_stock });

    res.status(201).json({
      success: true,
      message: "Stock opname dicatat & stok inventory disesuaikan!",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- GET BY ID ---
const getStockOpnameById = async (req, res) => {
  try {
    const record = await db("stock_opnames")
      .where({ "stock_opnames.id": req.params.id })
      .leftJoin("inventory", "stock_opnames.inventory_id", "=", "inventory.id")
      .select("stock_opnames.*", "inventory.name as inventory_name")
      .first();

    if (!record)
      return res
        .status(404)
        .json({ success: false, message: "Data tidak ditemukan" });

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- UPDATE ---
const updateStockOpname = async (req, res) => {
  const trx = await db.transaction();
  try {
    const { actual_stock, condition, notes, checked_by } = req.body;
    const opnameId = req.params.id;

    // 1. Ambil data opname lama
    const oldOpname = await trx("stock_opnames")
      .where({ id: opnameId })
      .first();
    if (!oldOpname) {
      await trx.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Data tidak ditemukan" });
    }

    // 2. Hitung selisih baru berdasarkan system_stock awal saat opname dilakukan
    const system_stock = oldOpname.system_stock;
    const difference_stock = actual_stock - system_stock;

    // 3. Update riwayat opname
    await trx("stock_opnames").where({ id: opnameId }).update({
      actual_stock,
      difference_stock,
      condition,
      notes,
      checked_by,
    });

    // 4. Sesuaikan stok di tabel inventory
    await trx("inventory")
      .where({ id: oldOpname.inventory_id })
      .update({ stock: actual_stock });

    await trx.commit();
    res.json({ success: true, message: "Stock opname berhasil diperbarui!" });
  } catch (error) {
    await trx.rollback();
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- DELETE ---
const deleteStockOpname = async (req, res) => {
  const trx = await db.transaction();
  try {
    const opnameId = req.params.id;

    // 1. Cari datanya dulu buat ambil info stock awal sebelum opname
    const opname = await trx("stock_opnames").where({ id: opnameId }).first();
    if (!opname) {
      await trx.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Data tidak ditemukan" });
    }

    // 2. Rollback stok inventory ke "system_stock" sebelum opname ini terjadi
    // Ini gunanya kalau lu salah input opname dan mau ngebatalin efek perubahan stoknya
    await trx("inventory")
      .where({ id: opname.inventory_id })
      .update({ stock: opname.system_stock });

    // 3. Hapus record opname
    await trx("stock_opnames").where({ id: opnameId }).del();

    await trx.commit();
    res.json({
      success: true,
      message: "Data opname dihapus & stok inventory dikembalikan (rollback)!",
    });
  } catch (error) {
    await trx.rollback();
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// EXPORTS SEMUA FUNGSI
// ==========================================
module.exports = {
  register,
  login,
  getUsers,
  deleteUser,
  getMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  getInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
  getStockOpnames,
  getStockOpnameById,
  createStockOpname,
  updateStockOpname,
  deleteStockOpname,
};
