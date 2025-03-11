const express = require('express');
const { Pool } = require('pg');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 3000;

const DATABASE_URL = process.env.DATABASE_URL; 

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});

async function initializeDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS roots (
      rootname TEXT PRIMARY KEY,
      password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS branches (
      id SERIAL PRIMARY KEY,
      rootname TEXT REFERENCES roots(rootname) ON DELETE CASCADE,
      branchname TEXT,
      count INTEGER DEFAULT 0,
      UNIQUE(rootname, branchname)
    );
    CREATE TABLE IF NOT EXISTS auth_keys (
      id SERIAL PRIMARY KEY,
      rootname TEXT REFERENCES roots(rootname) ON DELETE CASCADE,
      keyname TEXT,
      auth_key TEXT UNIQUE
    );
  `);
  console.log("Database initialized.");
}
initializeDB();

app.get('/', (req, res) => {
  res.send("Counter API is running!");
});

app.get('/create/:rootname/:password', async (req, res) => {
  const { rootname, password } = req.params;
  try {
    await pool.query("INSERT INTO roots (rootname, password) VALUES ($1, $2)", [rootname, password]);
    await pool.query("INSERT INTO branches (rootname, branchname, count) VALUES ($1, 'main', 0)", [rootname]);
    res.json({ message: "Success | ADMIN: Root successfully created. Default branch 'main' created with the Count 0." });
  } catch (error) {
    res.status(400).json({ error: "Failure | Root name already exists." });
  }
});

app.get('/manage/:rootname/:password/delete', async (req, res) => {
  const { rootname, password } = req.params;
  try {
    const rootResult = await pool.query("SELECT * FROM roots WHERE rootname = $1", [rootname]);
    if (rootResult.rows.length === 0) {
      return res.status(400).json({ error: "Failure | Root name doesn't exist." });
    }
    if (rootResult.rows[0].password !== password) {
      return res.status(403).json({ error: "Failure | ADMIN: Password is wrong. You must use the Password that was used to create the Root." });
    }
    await pool.query("DELETE FROM roots WHERE rootname = $1", [rootname]);
    res.json({ message: "Success | ADMIN: Root deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failure | Database error, try again later." });
  }
});

app.get('/manage/:rootname/:password', async (req, res) => {
  const { rootname, password } = req.params;
  try {
    const rootResult = await pool.query("SELECT * FROM roots WHERE rootname = $1", [rootname]);
    if (rootResult.rows.length === 0) {
      return res.status(400).json({ error: "Failure | Root name doesn't exist." });
    }
    if (rootResult.rows[0].password !== password) {
      return res.status(403).json({ error: "Failure | ADMIN: Password is wrong. You must use the Password that was used to create the Root." });
    }
    const branchesResult = await pool.query("SELECT branchname, count FROM branches WHERE rootname = $1", [rootname]);
    const authKeysResult = await pool.query("SELECT keyname, auth_key FROM auth_keys WHERE rootname = $1", [rootname]);
    res.json({
      root: rootname,
      password: password,
      branches: branchesResult.rows,
      auth_keys: authKeysResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: "Failure | Database error, try again later." });
  }
});

app.get('/manage/:rootname/:password/create/key/:keyname', async (req, res) => {
  const { rootname, password, keyname } = req.params;
  try {
    const rootResult = await pool.query("SELECT * FROM roots WHERE rootname = $1", [rootname]);
    if (rootResult.rows.length === 0) {
      return res.status(400).json({ error: "Failure | Root name doesn't exist." });
    }
    if (rootResult.rows[0].password !== password) {
      return res.status(403).json({ error: "Failure | ADMIN: Password is wrong. You must use the Password that was used to create the Root." });
    }
    const keyCheck = await pool.query("SELECT * FROM auth_keys WHERE rootname = $1 AND keyname = $2", [rootname, keyname]);
    if (keyCheck.rows.length > 0) {
      return res.status(400).json({ error: "Failure | ADMIN: Authentication key with the same name already exists." });
    }
    const auth_key = crypto.randomBytes(16).toString('hex');
    await pool.query("INSERT INTO auth_keys (rootname, keyname, auth_key) VALUES ($1, $2, $3)", [rootname, keyname, auth_key]);
    res.json({ message: "Success | ADMIN: Authentication key created.", auth_key });
  } catch (error) {
    res.status(500).json({ error: "Failure | Database error, try again later." });
  }
});

app.get('/manage/:rootname/:password/remove/key/:keyname', async (req, res) => {
  const { rootname, password, keyname } = req.params;
  try {
    const rootResult = await pool.query("SELECT * FROM roots WHERE rootname = $1", [rootname]);
    if (rootResult.rows.length === 0) {
      return res.status(400).json({ error: "Failure | Root name doesn't exist." });
    }
    if (rootResult.rows[0].password !== password) {
      return res.status(403).json({ error: "Failure | ADMIN: Password is wrong. You must use the Password that was used to create the Root." });
    }
    const keyResult = await pool.query("SELECT * FROM auth_keys WHERE rootname = $1 AND keyname = $2", [rootname, keyname]);
    if (keyResult.rows.length === 0) {
      const allKeys = await pool.query("SELECT keyname, auth_key FROM auth_keys WHERE rootname = $1", [rootname]);
      return res.status(400).json({ error: "Failure | ADMIN: Authentication key doesn't exist.", existing_keys: allKeys.rows });
    }
    await pool.query("DELETE FROM auth_keys WHERE rootname = $1 AND keyname = $2", [rootname, keyname]);
    res.json({ message: "Auth key removed" });
  } catch (error) {
    res.status(500).json({ error: "Failure | Database error, try again later." });
  }
});

app.get('/manage/:rootname/:password/create/branch/:branchname', async (req, res) => {
  const { rootname, password, branchname } = req.params;
  try {
    const rootResult = await pool.query("SELECT * FROM roots WHERE rootname = $1", [rootname]);
    if (rootResult.rows.length === 0) {
      return res.status(400).json({ error: "Failure | Root name doesn't exist." });
    }
    if (rootResult.rows[0].password !== password) {
      return res.status(403).json({ error: "Failure | ADMIN: Password is wrong. You must use the Password that was used to create the Root." });
    }
    const branchResult = await pool.query("SELECT * FROM branches WHERE rootname = $1 AND branchname = $2", [rootname, branchname]);
    if (branchResult.rows.length > 0) {
      return res.status(400).json({ error: "Failure | ADMIN: Branch with the same name already exists." });
    }
    await pool.query("INSERT INTO branches (rootname, branchname, count) VALUES ($1, $2, 0)", [rootname, branchname]);
    res.json({ message: `Success | Branch '${branchname}' created with Count 0.` });
  } catch (error) {
    res.status(500).json({ error: "Failure | Database error, try again later." });
  }
});

app.get('/manage/:rootname/:password/remove/branch/:branchname', async (req, res) => {
  const { rootname, password, branchname } = req.params;
  try {
    const rootResult = await pool.query("SELECT * FROM roots WHERE rootname = $1", [rootname]);
    if (rootResult.rows.length === 0) {
      return res.status(400).json({ error: "Failure | Root name doesn't exist." });
    }
    if (rootResult.rows[0].password !== password) {
      return res.status(403).json({ error: "Failure | ADMIN: Password is wrong. You must use the Password that was used to create the Root." });
    }
    const branchResult = await pool.query("SELECT * FROM branches WHERE rootname = $1 AND branchname = $2", [rootname, branchname]);
    if (branchResult.rows.length === 0) {
      return res.status(400).json({ error: "Failure | Branch doesn't exist." });
    }
    await pool.query("DELETE FROM branches WHERE rootname = $1 AND branchname = $2", [rootname, branchname]);
    res.json({ message: `Success | Branch '${branchname}' has been removed.` });
  } catch (error) {
    res.status(500).json({ error: "Failure | Database error, try again later." });
  }
});

app.get('/manage/:rootname/:password/:branch/set-count/:int', async (req, res) => {
  const { rootname, password, branch, int } = req.params;
  const newCount = parseInt(int, 10);
  if (isNaN(newCount)) {
    return res.status(400).json({ error: "Failure | :COUNT must be a number." });
  }
  try {
    const rootResult = await pool.query("SELECT * FROM roots WHERE rootname = $1", [rootname]);
    if (rootResult.rows.length === 0) {
      return res.status(400).json({ error: "Failure | Root name doesn't exist." });
    }
    if (rootResult.rows[0].password !== password) {
      return res.status(403).json({ error: "Failure | ADMIN: Password is wrong. You must use the Password that was used to create the Root." });
    }
    const branchResult = await pool.query("SELECT * FROM branches WHERE rootname = $1 AND branchname = $2", [rootname, branch]);
    if (branchResult.rows.length === 0) {
      return res.status(400).json({ error: "Failure | Branch doesn't exist." });
    }
    await pool.query("UPDATE branches SET count = $1 WHERE rootname = $2 AND branchname = $3", [newCount, rootname, branch]);
    res.json({ message: "Success | ADMIN: Count set.", branch, count: newCount });
  } catch (error) {
    res.status(500).json({ error: "Failure | Database error, try again later." });
  }
});

app.get('/get/:rootname/:auth/:branch', async (req, res) => {
  const { rootname, auth, branch } = req.params;
  try {
    const rootResult = await pool.query("SELECT * FROM roots WHERE rootname = $1", [rootname]);
    if (rootResult.rows.length === 0) {
      return res.status(400).json({ error: "Failure | Root name doesn't exist." });
    }
    if (auth === rootResult.rows[0].password) {
      return res.status(403).json({ error: "Failure | The Password cannot be used as an Authentication key." });
    }
    const authCheck = await pool.query("SELECT * FROM auth_keys WHERE rootname = $1 AND auth_key = $2", [rootname, auth]);
    if (authCheck.rows.length === 0) {
      return res.status(403).json({ error: "Failure | Invalid Authentication key. Make sure to use the Authentication key itself and not its name." });
    }
    const branchData = await pool.query("SELECT count FROM branches WHERE rootname = $1 AND branchname = $2", [rootname, branch]);
    if (branchData.rows.length === 0) {
      return res.status(404).json({ error: "Failure | Branch not found." });
    }
    res.json({ branch, count: branchData.rows[0].count });
  } catch (error) {
    res.status(500).json({ error: "Failure | Database error, try again later." });
  }
});

app.get('/punch/:rootname/:auth/:branch', async (req, res) => {
  const { rootname, auth, branch } = req.params;
  try {
    const rootResult = await pool.query("SELECT * FROM roots WHERE rootname = $1", [rootname]);
    if (rootResult.rows.length === 0) {
      return res.status(400).json({ error: "Failure | Root name doesn't exist." });
    }
    if (auth === rootResult.rows[0].password) {
      return res.status(403).json({ error: "Failure | The Password cannot be used as an Authentication key." });
    }
    const authCheck = await pool.query("SELECT * FROM auth_keys WHERE rootname = $1 AND auth_key = $2", [rootname, auth]);
    if (authCheck.rows.length === 0) {
      return res.status(403).json({ error: "Failure | Invalid Authentication key. Make sure to use the Authentication key itself and not its name." });
    }
    const result = await pool.query(
      "UPDATE branches SET count = count + 1 WHERE rootname = $1 AND branchname = $2 RETURNING count",
      [rootname, branch]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Failure | Branch does not exist." });
    }
    res.json({ branch, count: result.rows[0].count });
  } catch (error) {
    res.status(500).json({ error: "Failure | Database error, try again later." });
  }
});

app.get('/', (req, res) => {
  res.redirect('https://github.com/sippedaway/Counter-API');
});

app.listen(() => {
  console.log(`API running`);
});