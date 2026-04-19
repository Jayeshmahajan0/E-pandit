const supabase = require('../config/supabase');

// @desc    Get blocked dates for a pandit
// @route   GET /api/availability/pandit/:panditId
// @access  Public
const getPanditAvailability = async (req, res, next) => {
  try {
    const { panditId } = req.params;
    const { month } = req.query; // optional YYYY-MM filter

    if (!supabase) {
      return res.json({ success: true, data: [] }); // fallback for dev without DB
    }

    let query = supabase
      .from('pandit_blocked_dates')
      .select('*')
      .eq('pandit_id', panditId);

    if (month) {
      // e.g. "2026-04" -> >= 2026-04-01 and <= 2026-04-31
      query = query
        .gte('date', `${month}-01`)
        .lte('date', `${month}-31`);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error("Availability Fetch Error:", error);
    next(error);
  }
};

// @desc    Update blocked dates for a pandit
// @route   POST /api/availability/pandit
// @access  Private (Pandit only)
const updatePanditAvailability = async (req, res, next) => {
  try {
    const { date, isFullDay, slots, reason, notes } = req.body;
    const panditId = req.user.id;

    if (req.user.role !== 'pandit') {
      return res.status(403).json({ success: false, message: 'Not authorized as pandit' });
    }

    if (!supabase) {
      return res.json({ success: true, message: 'Availability updated (mock)' });
    }

    // Upsert the availability
    const { data, error } = await supabase
      .from('pandit_blocked_dates')
      .upsert(
        {
          pandit_id: panditId,
          date,
          is_full_day: isFullDay,
          slots: slots || [],
          reason: reason || 'personal',
          notes: notes || null
        },
        { onConflict: 'pandit_id, date' }
      )
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Availability Update Error:", error);
    next(error);
  }
};

module.exports = {
  getPanditAvailability,
  updatePanditAvailability
};
