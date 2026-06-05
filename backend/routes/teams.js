const express = require('express');
const pool = require('../db');
const isAuth = require('../middleware/isAuth');
const { teamSchema, addMemberSchema } = require('../validators/schemas');

const router = express.Router();

// Every team route needs a logged-in user
router.use(isAuth);

// GET /teams - all teams the current user belongs to
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.name, t.created_by, t.created_at
       FROM teams t
       JOIN team_members tm ON tm.team_id = t.id
       WHERE tm.user_id = $1
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load teams' });
  }
});

// POST /teams - create a team, creator becomes a member automatically
router.post('/', async (req, res) => {
  try {
    const { error, value } = teamSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const teamResult = await pool.query(
      `INSERT INTO teams (name, created_by) VALUES ($1, $2) RETURNING *`,
      [value.name, req.user.id]
    );
    const team = teamResult.rows[0];

    await pool.query(`INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)`, [
      team.id,
      req.user.id,
    ]);

    res.status(201).json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create team' });
  }
});

// PUT /teams/:id - rename a team (only the creator can do this)
router.put('/:id', async (req, res) => {
  try {
    const { error, value } = teamSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Check the team exists and belongs to this user
    const teamResult = await pool.query('SELECT * FROM teams WHERE id = $1', [req.params.id]);
    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }
    const team = teamResult.rows[0];
    if (team.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Only the team creator can rename this team' });
    }

    const updated = await pool.query(
      'UPDATE teams SET name = $1 WHERE id = $2 RETURNING *',
      [value.name, req.params.id]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update team' });
  }
});

// DELETE /teams/:id - delete a team (only the creator can do this)
router.delete('/:id', async (req, res) => {
  try {
    const teamResult = await pool.query(
      'SELECT * FROM teams WHERE id = $1',
      [req.params.id]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const team = teamResult.rows[0];

    if (Number(team.created_by) !== Number(req.user.id)) {
      return res.status(403).json({
        error: 'Only the team creator can delete this team'
      });
    }

    await pool.query(
      'DELETE FROM teams WHERE id = $1',
      [req.params.id]
    );

    res.json({ message: 'Team deleted' });

  } catch (err) {
    console.error('DELETE /teams/:id error:', err);
    res.status(500).json({ error: 'Could not delete team' });
  }
});

// POST /teams/:id/members - add a user to a team
router.post('/:id/members', async (req, res) => {
  try {
    const { error, value } = addMemberSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    await pool.query(
      `INSERT INTO team_members (team_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [req.params.id, value.user_id]
    );

    res.status(201).json({ message: 'Member added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not add member' });
  }
});

// GET /teams/:id/members - list members of a team
router.get('/:id/members', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.username, u.email
       FROM users u
       JOIN team_members tm ON tm.user_id = u.id
       WHERE tm.team_id = $1
       ORDER BY u.username`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load members' });
  }
});

module.exports = router;