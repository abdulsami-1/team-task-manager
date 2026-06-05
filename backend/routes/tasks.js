const express = require('express');
const pool = require('../db');
const isAuth = require('../middleware/isAuth');
const { taskSchema, updateTaskSchema } = require('../validators/schemas');

const router = express.Router();

router.use(isAuth);

// GET /tasks - list tasks, optionally filtered by ?team_id= or ?assigned_to=
router.get('/', async (req, res) => {
  try {
    const { team_id, assigned_to } = req.query;

    // Build the query step by step so it stays readable and safe.
    // We only ever show tasks from teams the user is part of.
    let query = `
      SELECT tasks.*, users.username AS assigned_username
      FROM tasks
      LEFT JOIN users ON users.id = tasks.assigned_to
      WHERE tasks.team_id IN (
        SELECT team_id FROM team_members WHERE user_id = $1
      )`;
    const params = [req.user.id];

    if (team_id) {
      params.push(team_id);
      query += ` AND tasks.team_id = $${params.length}`;
    }
    if (assigned_to) {
      params.push(assigned_to);
      query += ` AND tasks.assigned_to = $${params.length}`;
    }

    query += ' ORDER BY tasks.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load tasks' });
  }
});

// POST /tasks - create a task
router.post('/', async (req, res) => {
  try {
    const { error, value } = taskSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { title, description, team_id, assigned_to, due_date, status } = value;

    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, team_id, assigned_to, created_by, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description || null, status || 'todo', team_id, assigned_to || null, req.user.id, due_date || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create task' });
  }
});

// PUT /tasks/:id - update a task
router.put('/:id', async (req, res) => {
  try {
    const { error, value } = updateTaskSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Verify the requesting user is a member of the task's team
    const authCheck = await pool.query(
      `SELECT id FROM tasks
       WHERE id = $1
       AND team_id IN (SELECT team_id FROM team_members WHERE user_id = $2)`,
      [req.params.id, req.user.id]
    );
    if (authCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Build the query dynamically so we can handle assigned_to = null
    // This allows explicit null to unassign a task
    const updates = [];
    const params = [];
    let paramCount = 1;

    if ('title' in value) {
      updates.push(`title = $${paramCount++}`);
      params.push(value.title ?? null);
    }
    if ('description' in value) {
      updates.push(`description = $${paramCount++}`);
      params.push(value.description ?? null);
    }
    if ('status' in value) {
      updates.push(`status = $${paramCount++}`);
      params.push(value.status ?? null);
    }
    if ('assigned_to' in value) {
      // This allows null to explicitly unassign
      updates.push(`assigned_to = $${paramCount++}`);
      params.push(value.assigned_to ?? null);
    }
    if ('due_date' in value) {
      updates.push(`due_date = $${paramCount++}`);
      params.push(value.due_date ?? null);
    }

    // If no fields to update, return the task as-is
    if (updates.length === 0) {
      const checkResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      return res.json(checkResult.rows[0]);
    }

    params.push(req.params.id);
    const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update task' });
  }
});

// DELETE /tasks/:id - delete a task
router.delete('/:id', async (req, res) => {
  try {
    // Verify the requesting user is a member of the task's team
    const authCheck = await pool.query(
      `SELECT id FROM tasks
       WHERE id = $1
       AND team_id IN (SELECT team_id FROM team_members WHERE user_id = $2)`,
      [req.params.id, req.user.id]
    );
    if (authCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete task' });
  }
});

module.exports = router;