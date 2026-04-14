const supabase = require("../config/supabase");
// Assuming we have mock support to be consistent with main repo

const getPendingPandits = async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, location:district, created_at, avatar_url, specializations, verification_status")
        .eq("role", "pandit")
        .eq("verification_status", "pending");

      if (error) throw error;
      return res.json({ success: true, data });
    }
    return res.json({ success: true, data: [] });
  } catch (err) {
    next(err);
  }
};

const getAllPandits = async (req, res, next) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, location:district, created_at, avatar_url, specializations, verification_status")
        .eq("role", "pandit")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return res.json({ success: true, data });
    }
    return res.json({ success: true, data: [] });
  } catch (err) {
    next(err);
  }
};

const getPanditDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (supabase) {
      // 1. Get pandit details
      const { data: pandit, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;

      // 2. Get verification logs specifically for this pandit
      const { data: logs, error: logsError } = await supabase
        .from("verification_logs")
        .select("id, action, notes, created_at, admin_id")
        .eq("pandit_id", id);

      if (!logsError && logs) {
        pandit.verification_logs = logs;
      }

      return res.json({ success: true, data: pandit });
    }
    return res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};

const verifyPandit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body; // status: 'verified' | 'rejected'
    
    if (!status || !['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    if (supabase) {
      const { data: updatedPandit, error } = await supabase
        .from("profiles")
        .update({ 
          verification_status: status, 
          verification_notes: notes,
          verified_at: new Date().toISOString(),
          verified_by: req.user.id,
          is_verified: status === 'verified'
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Log the verification action
      await supabase.from("verification_logs").insert({
        pandit_id: id,
        admin_id: req.user.id,
        action: status === 'verified' ? 'approved' : 'rejected',
        notes: notes || ''
      });

      return res.json({ success: true, message: `Pandit ${status}`, data: updatedPandit });
    }
    return res.json({ success: true, message: "Mock updated" });
  } catch (err) {
    next(err);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    if (supabase) {
      const { data: allPandits, error } = await supabase
        .from("profiles")
        .select("verification_status")
        .eq("role", "pandit");
        
      if (error) throw error;
      
      const total = allPandits.length;
      const pending = allPandits.filter(p => p.verification_status === 'pending').length;
      const verified = allPandits.filter(p => p.verification_status === 'verified').length;
      const rejected = allPandits.filter(p => p.verification_status === 'rejected').length;
      
      return res.json({ 
        success: true, 
        data: { total, pending, verified, rejected } 
      });
    }
    return res.json({ success: true, data: { total: 0, pending: 0, verified: 0, rejected: 0 } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPendingPandits,
  getAllPandits,
  getPanditDetails,
  verifyPandit,
  getDashboardStats
};
