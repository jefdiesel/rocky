const { Router } = require('express');
const supabase = require('../services/supabase');

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }

    if (supabase) {
      const { error } = await supabase
        .from('waitlist')
        .upsert({ email, signed_up_at: new Date().toISOString() }, { onConflict: 'email' });

      if (error) {
        console.error('[waitlist] Insert error:', error.message);
      }
    }

    return res.json({ data: { success: true } });
  } catch (err) {
    console.error('[waitlist] Error:', err.message);
    return res.json({ data: { success: true } }); // Don't fail the UX
  }
});

module.exports = router;
