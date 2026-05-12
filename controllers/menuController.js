const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Helper buat bikin ID otomatis (contoh: MN-1683920192)
const generateId = (prefix) => `${prefix}-${Date.now()}`;

// ==========================================
// 1. AUTHENTICATION & USERS CRUD
// ==========================================
const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Cek email udah ada belum
    const userExist = await db("users").where({ email }).first();
    if (userExist)
      return res
        .status(400)
        .json({ success: false, message: "Email udah terdaftar bro!" });

    // Enkripsi password
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = generateId("USR");

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

    // Cari user
    const user = await db("users").where({ email }).first();
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User gak ketemu!" });

    // Cek password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res
        .status(401)
        .json({ success: false, message: "Password salah!" });

    // Generate Token
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
    const id = generateId("MN");
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
// 3. ORDERS CRUD
// ==========================================
const getOrders = async (req, res) => {
  try {
    const orders = await db("orders").select("*").orderBy("created_at", "desc");
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await db("orders").where({ id: req.params.id }).first();
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const id = generateId("ORD");
    await db("orders").insert({ id, ...req.body });

    // 🔔 KIRIM NOTIF REAL-TIME KE FRONTEND
    if (global.io) {
      global.io.emit("new_order", {
        id: Date.now(),
        type: "Order",
        title: "Order Baru Masuk!",
        desc: `Order ${id} dari ${req.body.customer_name || "Pelanggan"} perlu diproses.`,
        time: "Baru saja",
        icon: "ShoppingCart", // Identifikasi icon di FE
        color: "text-blue-600",
      });
    }

    res.status(201).json({ success: true, message: "Order dibuat!", id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    await db("orders").where({ id: req.params.id }).update(req.body);
    res.json({ success: true, message: "Order diupdate!" });
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
    const id = generateId("INV");
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
    const id = generateId("SUP");
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
// 6. PURCHASES CRUD
// ==========================================
const getPurchases = async (req, res) => {
  try {
    const purchases = await db("purchases")
      .leftJoin("suppliers", "purchases.supplier_id", "=", "suppliers.id")
      .select("purchases.*", "suppliers.name as supplier_name")
      .orderBy("created_at", "desc");
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
    res.json({ success: true, data: purchase });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createPurchase = async (req, res) => {
  try {
    const id = generateId("PO");
    await db("purchases").insert({ id, ...req.body });
    res
      .status(201)
      .json({ success: true, message: "Purchase order dibuat!", id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updatePurchase = async (req, res) => {
  try {
    await db("purchases").where({ id: req.params.id }).update(req.body);
    res.json({ success: true, message: "Purchase order diupdate!" });
  } catch (error) {
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
};
