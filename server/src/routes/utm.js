const { Router } = require('express');
const supabase = require('../services/supabase');
const { verifyToken } = require('../middleware/auth');

const router = Router();

// ── GET /utm/templates — List saved UTM templates ────────────────────────────
router.get('/templates', verifyToken, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    const { data, error } = await supabase
      .from('utm_templates')
      .select('*')
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[utm] Fetch error:', error.message);
      return res.status(500).json({ error: 'Failed to fetch UTM templates.' });
    }

    return res.json({ data: data || [] });
  } catch (err) {
    console.error('[utm] Error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch UTM templates.' });
  }
});

// ── POST /utm/templates — Save template ──────────────────────────────────────
router.post('/templates', verifyToken, async (req, res) => {
  try {
    const { name, source, medium, campaign, content, term } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Field name is required.' });
    }

    if (!supabase) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    const { data, error } = await supabase
      .from('utm_templates')
      .insert({
        user_id: req.user.id,
        name,
        source: source || null,
        medium: medium || null,
        campaign: campaign || null,
        content: content || null,
        term: term || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[utm] Insert error:', error.message);
      return res.status(500).json({ error: 'Failed to save UTM template.' });
    }

    return res.status(201).json({ data });
  } catch (err) {
    console.error('[utm] Error creating template:', err.message);
    return res.status(500).json({ error: 'Failed to save UTM template.' });
  }
});

// ── PUT /utm/templates/:id — Update template ─────────────────────────────────
router.put('/templates/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, source, medium, campaign, content, term } = req.body;

    if (!supabase) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (source !== undefined) updates.source = source;
    if (medium !== undefined) updates.medium = medium;
    if (campaign !== undefined) updates.campaign = campaign;
    if (content !== undefined) updates.content = content;
    if (term !== undefined) updates.term = term;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields provided for update.' });
    }

    const { data, error } = await supabase
      .from('utm_templates')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('[utm] Update error:', error.message);
      return res.status(500).json({ error: 'Failed to update UTM template.' });
    }

    if (!data) {
      return res.status(404).json({ error: 'UTM template not found.' });
    }

    return res.json({ data });
  } catch (err) {
    console.error('[utm] Error updating template:', err.message);
    return res.status(500).json({ error: 'Failed to update UTM template.' });
  }
});

// ── DELETE /utm/templates/:id — Delete template ──────────────────────────────
router.delete('/templates/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabase) {
      return res.status(503).json({ error: 'Database unavailable.' });
    }

    const { error } = await supabase
      .from('utm_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('[utm] Delete error:', error.message);
      return res.status(500).json({ error: 'Failed to delete UTM template.' });
    }

    return res.json({ data: { deleted: true } });
  } catch (err) {
    console.error('[utm] Error deleting template:', err.message);
    return res.status(500).json({ error: 'Failed to delete UTM template.' });
  }
});

// ── POST /utm/build — Build tagged URL ───────────────────────────────────────
router.post('/build', verifyToken, async (req, res) => {
  try {
    const { url: baseUrl, source, medium, campaign, content, term } = req.body;

    if (!baseUrl) {
      return res.status(400).json({ error: 'Field url is required.' });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(baseUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format.' });
    }

    if (source) parsedUrl.searchParams.set('utm_source', source);
    if (medium) parsedUrl.searchParams.set('utm_medium', medium);
    if (campaign) parsedUrl.searchParams.set('utm_campaign', campaign);
    if (content) parsedUrl.searchParams.set('utm_content', content);
    if (term) parsedUrl.searchParams.set('utm_term', term);

    return res.json({ data: { tagged_url: parsedUrl.toString() } });
  } catch (err) {
    console.error('[utm] Error building URL:', err.message);
    return res.status(500).json({ error: 'Failed to build tagged URL.' });
  }
});

module.exports = router;
