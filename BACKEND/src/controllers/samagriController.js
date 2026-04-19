const supabase = require("../config/supabase");
const { sendEmail } = require("./notificationController");

// ──────────────────────────────────────────────
// GET /api/samagri
// Fetch samagri items with optional district and poojaType filters
// ──────────────────────────────────────────────
const getSamagris = async (req, res, next) => {
  try {
    const { district, poojaType } = req.query;

    if (supabase) {
      // First, get vendors in the district
      let vendorQuery = supabase
        .from("profiles")
        .select("id, full_name, district, state, phone, avatar_url")
        .eq("role", "vendor")
        .eq("verification_status", "verified")
        .eq("is_active", true);
        
      if (district) {
        vendorQuery = vendorQuery.eq("district", district);
      }
      
      const { data: vendors, error: vendorError } = await vendorQuery;
      if (vendorError) throw vendorError;
      
      const vendorIds = vendors.map(v => v.id);
      
      if (vendorIds.length === 0) {
         return res.json({ success: true, data: [] });
      }

      // Then get samagris for these vendors
      let samagriQuery = supabase
        .from("samagri_items")
        .select("*")
        .in("vendor_id", vendorIds)
        .eq("is_active", true);
        
      if (poojaType) {
        samagriQuery = samagriQuery.eq("pooja_type", poojaType);
      }
      
      const { data: samagris, error: samagriError } = await samagriQuery;
      if (samagriError) throw samagriError;
      
      // Combine vendor info
      const enrichedSamagris = samagris.map(item => {
        const vendor = vendors.find(v => v.id === item.vendor_id);
        return {
          ...item,
          vendor
        };
      });

      return res.json({ success: true, data: enrichedSamagris });
    }

    return res.json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// POST /api/samagri
// Vendor adds a new samagri item
// ──────────────────────────────────────────────
const addSamagri = async (req, res, next) => {
  try {
    const { name, poojaType, description, price, imageUrl } = req.body;
    const vendorId = req.user.id;

    if (!name || !poojaType || !price) {
      return res.status(400).json({ success: false, message: "Name, poojaType, and price are required" });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from("samagri_items")
        .insert({
          vendor_id: vendorId,
          name,
          pooja_type: poojaType,
          description,
          price,
          image_url: imageUrl
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, message: "Samagri added successfully", data });
    }

    return res.status(201).json({ success: true, message: "Samagri added (mock)" });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/samagri/vendor
// Get samagri items for the logged-in vendor
// ──────────────────────────────────────────────
const getVendorSamagris = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    if (supabase) {
      const { data, error } = await supabase
        .from("samagri_items")
        .select("*")
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return res.json({ success: true, data });
    }
    return res.json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// DELETE /api/samagri/:id
// Vendor deletes a samagri item
// ──────────────────────────────────────────────
const deleteSamagri = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    if (supabase) {
      const { error } = await supabase
        .from("samagri_items")
        .delete()
        .eq("id", id)
        .eq("vendor_id", vendorId);

      if (error) throw error;
      return res.json({ success: true, message: "Samagri deleted successfully" });
    }
    return res.json({ success: true, message: "Samagri deleted (mock)" });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// POST /api/samagri/orders
// User creates an order
// ──────────────────────────────────────────────
const createOrder = async (req, res, next) => {
  try {
    const { vendorId, items, totalAmount, paymentMethod, shippingAddress, userPhone, notes } = req.body;
    const userId = req.user.id;

    if (!vendorId || !items || items.length === 0 || !totalAmount || !shippingAddress) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (totalAmount < 500 && paymentMethod === 'cod') {
      return res.status(400).json({ success: false, message: "COD is only available for orders over ₹500" });
    }

    if (supabase) {
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from("samagri_orders")
        .insert({
          user_id: userId,
          vendor_id: vendorId,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          shipping_address: shippingAddress,
          user_phone: userPhone,
          notes: notes,
          payment_status: paymentMethod === 'cod' ? 'cod_pending' : 'pending',
          order_status: 'placed'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        samagri_id: item.id,
        quantity: item.qty,
        price_at_time: item.price
      }));

      const { error: itemsError } = await supabase
        .from("samagri_order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Send notification to vendor
      const { data: vendorData } = await supabase.from("profiles").select("email, full_name").eq("id", vendorId).single();
      const { data: userData } = await supabase.from("profiles").select("full_name").eq("id", userId).single();
      
      const title = "New Samagri Order! 📦";
      const message = `${userData?.full_name || "A user"} placed an order worth ₹${totalAmount}.`;
      
      await supabase.from("notifications").insert({
        user_id: vendorId,
        type: "samagri_order_new",
        title,
        message,
        title_translations: { en: title, hi: "नया सामग्री आर्डर! 📦", mr: "नवीन सामग्री ऑर्डर! 📦" },
        message_translations: { en: message, hi: `${userData?.full_name || "एक उपयोगकर्ता"} ने ₹${totalAmount} का ऑर्डर दिया है।`, mr: `${userData?.full_name || "एका वापरकर्त्याने"} ₹${totalAmount} ची ऑर्डर दिली आहे.` },
        channel: "app"
      });
      
      if (vendorData?.email) {
        await sendEmail(vendorData.email, title, message + " Check your vendor dashboard for details.");
      }

      return res.status(201).json({ success: true, message: "Order placed successfully", data: order });
    }

    return res.status(201).json({ success: true, message: "Order placed (mock)", data: { id: "mock_order_123" } });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/samagri/orders/vendor
// Get orders for the logged-in vendor
// ──────────────────────────────────────────────
const getVendorOrders = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    if (supabase) {
      const { data: orders, error } = await supabase
        .from("samagri_orders")
        .select("*, samagri_order_items(quantity, price_at_time, samagri_items(name, image_url)), user:user_id(full_name, email)")
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return res.json({ success: true, data: orders });
    }
    return res.json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// GET /api/samagri/orders/user
// Get orders for the logged-in user
// ──────────────────────────────────────────────
const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (supabase) {
      const { data: orders, error } = await supabase
        .from("samagri_orders")
        .select("*, samagri_order_items(quantity, price_at_time, samagri_items(name, image_url)), vendor:vendor_id(full_name, phone, email)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return res.json({ success: true, data: orders });
    }
    return res.json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// PUT /api/samagri/orders/:id/status
// Vendor updates order status
// ──────────────────────────────────────────────
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;
    const vendorId = req.user.id;

    if (supabase) {
      const { data, error } = await supabase
        .from("samagri_orders")
        .update({ order_status: orderStatus, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("vendor_id", vendorId)
        .select()
        .single();

      if (error) throw error;
      
      // Send notification to User
      const { data: orderDetails } = await supabase.from("samagri_orders").select("user_id, user:user_id(email, full_name)").eq("id", id).single();
      
      if (orderDetails && orderDetails.user_id) {
        const title = "Order Status Updated 📦";
        const message = `Your samagri order status is now: ${orderStatus.toUpperCase()}`;
        
        await supabase.from("notifications").insert({
          user_id: orderDetails.user_id,
          type: "samagri_order_update",
          title,
          message,
          title_translations: { en: title, hi: "ऑर्डर स्थिति अपडेट की गई 📦", mr: "ऑर्डर स्थिती अद्यतनित 📦" },
          message_translations: { en: message, hi: `आपकी सामग्री ऑर्डर स्थिति अब है: ${orderStatus}`, mr: `तुमची सामग्री ऑर्डर स्थिती आता आहे: ${orderStatus}` },
          channel: "app"
        });
        
        if (orderStatus === "shipped" && orderDetails.user?.email) {
          await sendEmail(
            orderDetails.user.email, 
            "Your Pooja Samagri is Shipped! 🚚", 
            `Great news, ${orderDetails.user.full_name}! Your samagri order has been shipped and is on its way to you.`
          );
        } else if (orderStatus === "delivered" && orderDetails.user?.email) {
          await sendEmail(
            orderDetails.user.email, 
            "Your Pooja Samagri is Delivered! 🎉", 
            `Your samagri order has been delivered successfully. Thank you for using E-Pandit!`
          );
        }
      }

      return res.json({ success: true, message: "Order status updated", data });
    }
    return res.json({ success: true, message: "Order status updated (mock)" });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────────────────────────────
// PUT /api/samagri/orders/user/:id/cancel
// User cancels their own order
// ──────────────────────────────────────────────
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (supabase) {
      // Check if order exists and belongs to user
      const { data: order, error: fetchError } = await supabase
        .from("samagri_orders")
        .select("order_status, vendor_id, vendor:vendor_id(email)")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (fetchError || !order) return res.status(404).json({ success: false, message: "Order not found" });

      if (order.order_status !== "placed") {
        return res.status(400).json({ success: false, message: "Only orders in 'placed' status can be cancelled." });
      }

      const { data, error } = await supabase
        .from("samagri_orders")
        .update({ order_status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      // Notify vendor
      if (order.vendor_id) {
        await supabase.from("notifications").insert({
          user_id: order.vendor_id,
          type: "samagri_order_cancel",
          title: "Order Cancelled ❌",
          message: `An order has been cancelled by the user.`,
          channel: "app"
        });
        
        if (order.vendor?.email) {
          await sendEmail(order.vendor.email, "Order Cancelled ❌", "A samagri order has been cancelled by the user.");
        }
      }

      return res.json({ success: true, message: "Order cancelled successfully", data });
    }
    return res.json({ success: true, message: "Order cancelled (mock)" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSamagris,
  addSamagri,
  getVendorSamagris,
  deleteSamagri,
  createOrder,
  getVendorOrders,
  getUserOrders,
  updateOrderStatus,
  cancelOrder
};
