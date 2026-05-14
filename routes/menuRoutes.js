const express = require("express");
const router = express.Router();
// Pastikan nama file controller-nya bener ya (misal index.js atau menuController.js)
const ctrl = require("../controllers/menuController");

// ==========================
// USERS & AUTH ROUTES
// ==========================
router.post("/auth/register", ctrl.register);
router.post("/auth/login", ctrl.login);
router.get("/users", ctrl.getUsers);
router.delete("/users/:id", ctrl.deleteUser);

// ==========================
// MENUS ROUTES
// ==========================
router.get("/menus", ctrl.getMenus);
router.get("/menus/:id", ctrl.getMenuById);
router.post("/menus", ctrl.createMenu);
router.put("/menus/:id", ctrl.updateMenu);
router.delete("/menus/:id", ctrl.deleteMenu);

// ==========================
// ORDERS ROUTES (UPDATED)
// ==========================
router.get("/orders", ctrl.getOrders);
router.get("/orders/:id", ctrl.getOrderById);
router.post("/orders", ctrl.createOrder);
// Ganti path dan controllernya buat update status aja (Menunggu -> Dimasak -> Selesai)
router.put("/orders/:id", ctrl.updateOrder);
router.put("/orders/:id/status", ctrl.updateOrderStatus);
router.delete("/orders/:id", ctrl.deleteOrder);

// ==========================
// INVENTORY ROUTES
// ==========================
router.get("/inventory", ctrl.getInventory);
router.get("/inventory/:id", ctrl.getInventoryById);
router.post("/inventory", ctrl.createInventory);
router.put("/inventory/:id", ctrl.updateInventory);
router.delete("/inventory/:id", ctrl.deleteInventory);

// ==========================
// SUPPLIERS ROUTES
// ==========================
router.get("/suppliers", ctrl.getSuppliers);
router.get("/suppliers/:id", ctrl.getSupplierById);
router.post("/suppliers", ctrl.createSupplier);
router.put("/suppliers/:id", ctrl.updateSupplier);
router.delete("/suppliers/:id", ctrl.deleteSupplier);

// ==========================
// PURCHASES ROUTES (UPDATED)
// ==========================
router.get("/purchases", ctrl.getPurchases);
router.get("/purchases/:id", ctrl.getPurchaseById);
router.post("/purchases", ctrl.createPurchase);
// updatePurchase dihapus biar stok ngga kacau karena edit nota
router.delete("/purchases/:id", ctrl.deletePurchase);

// ==========================
// STOCK OPNAMES ROUTES (BARU)
// ==========================
router.get("/stock-opnames", ctrl.getStockOpnames);
router.post("/stock-opnames", ctrl.createStockOpname);

module.exports = router;
