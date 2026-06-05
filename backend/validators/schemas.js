const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const teamSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
});

const addMemberSchema = Joi.object({
  user_id: Joi.number().required(),
});

const taskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('').optional(),
  team_id: Joi.number().required(),
  assigned_to: Joi.number().allow(null).optional(),
  due_date: Joi.date().optional(),
  status: Joi.string().valid('todo', 'in-progress', 'done').optional(),
});

// For updates every field is optional - you only send what changed
const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  description: Joi.string().allow('').optional(),
  assigned_to: Joi.number().allow(null).optional(),
  due_date: Joi.date().allow(null).optional(),
  status: Joi.string().valid('todo', 'in-progress', 'done').optional(),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  teamSchema,
  addMemberSchema,
  taskSchema,
  updateTaskSchema,
};