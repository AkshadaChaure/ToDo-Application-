require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Joi = require('@hapi/joi');
const mysql = require('mysql2/promise');

const PORT = process.env.PORT || 4000;

let pool;
async function initDb() {
  pool = await mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'todo_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10
  });
  console.log('DB pool created');
}

const init = async () => {
  await initDb();

  const server = Hapi.server({
    port: PORT,
    host: '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'] // DEV only — restrict in production
      }
    }
  });

  // GET all todos
  server.route({
    method: 'GET',
    path: '/api/todos',
    handler: async (req, h) => {
      const [rows] = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
      return h.response(rows);
    }
  });

  // GET todo by id
  server.route({
    method: 'GET',
    path: '/api/todos/{id}',
    handler: async (req, h) => {
      const id = Number(req.params.id);
      const [rows] = await pool.query('SELECT * FROM todos WHERE id = ?', [id]);
      if (rows.length === 0) return h.response({ message: 'Not found' }).code(404);
      return rows[0];
    }
  });

  // POST create
  server.route({
    method: 'POST',
    path: '/api/todos',
    options: {
      validate: {
        payload: Joi.object({
          title: Joi.string().min(1).required(),
          description: Joi.string().allow('').optional(),
          is_done: Joi.boolean().optional()
        }),
        failAction: (request, h, err) => { throw err; }
      }
    },
    handler: async (req, h) => {
      const { title, description = '', is_done = false } = req.payload;
      const [result] = await pool.query(
        'INSERT INTO todos (title, description, is_done) VALUES (?, ?, ?)',
        [title, description, is_done ? 1 : 0]
      );
      const [rows] = await pool.query('SELECT * FROM todos WHERE id = ?', [result.insertId]);
      return h.response(rows[0]).code(201);
    }
  });



  // PUT update
  server.route({
    method: 'PUT',
    path: '/api/todos/{id}',
    options: {
      validate: {
        payload: Joi.object({
          id: Joi.any().optional(),
          title: Joi.string().optional(),
          description: Joi.string().allow('').optional(),
          is_done: Joi.boolean().optional(),
          created_at: Joi.any().optional(),
          updated_at: Joi.any().optional()
        }).unknown(true), // Allow any additional fields
        params: Joi.object({ id: Joi.number().required() }),
        failAction: (request, h, err) => { 
          console.log('Validation error:', err.details);
          return h.response({ message: 'Validation error', details: err.details }).code(400);
        }
      }
    },
    handler: async (req, h) => {
      try {
        console.log('=== PUT /api/todos/{id} START ===');
        console.log('Request params:', req.params);
        console.log('Request payload:', req.payload);
        console.log('Payload type:', typeof req.payload);
        console.log('Payload keys:', Object.keys(req.payload || {}));
        
        const id = Number(req.params.id);
        console.log('Parsed ID:', id, 'Type:', typeof id);
        
        const { title, description, is_done } = req.payload || {};
        console.log('Extracted values:', { title, description, is_done });
        
        const fields = [];
        const values = [];

        // Only update fields that are provided in the payload
        if (title !== undefined) { 
          fields.push('title = ?'); 
          values.push(title); 
          console.log('Adding title field:', title);
        }
        if (description !== undefined) { 
          fields.push('description = ?'); 
          values.push(description); 
          console.log('Adding description field:', description);
        }
        if (is_done !== undefined) { 
          fields.push('is_done = ?'); 
          values.push(is_done ? 1 : 0); 
          console.log('Adding is_done field:', is_done);
        }

        console.log('Fields to update:', fields);
        console.log('Values to update:', values);

        if (fields.length === 0) {
          console.log('No fields to update, returning 400');
          return h.response({ message: 'No fields to update' }).code(400);
        }

        values.push(id);
        const sql = `UPDATE todos SET ${fields.join(', ')} WHERE id = ?`;
        console.log('Final SQL:', sql);
        console.log('Final values:', values);
        
        const [result] = await pool.query(sql, values);
        console.log('Update result:', result);

        const [rows] = await pool.query('SELECT * FROM todos WHERE id = ?', [id]);
        console.log('Select result:', rows);
        
        if (rows.length === 0) {
          console.log('Todo not found after update');
          return h.response({ message: 'Not found' }).code(404);
        }
        
        console.log('=== PUT /api/todos/{id} SUCCESS ===');
        return rows[0];
      } catch (error) {
        console.error('=== PUT /api/todos/{id} ERROR ===');
        console.error('Error details:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        return h.response({ message: 'Internal server error', error: error.message }).code(500);
      }
    }
  });

  
  server.route({
    method: 'DELETE',
    path: '/api/todos/{id}',
    handler: async (req, h) => {
      const id = Number(req.params.id);
      const [result] = await pool.query('DELETE FROM todos WHERE id = ?', [id]);
      if (result.affectedRows === 0) return h.response({ message: 'Not found' }).code(404);
      return { message: 'Deleted' };
    }
  });

  await server.start();
  console.log(`Hapi server running at ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();
