const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connectionString = 'postgresql://postgres.pbxootcdttwvwokhnhqy:CZ2K%25%40MnT%2B*2%23gy@aws-0-eu-west-1.pooler.supabase.com:6543/postgres';
  const client = new Client({ connectionString });

  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected! Executing schema script...');

    const sqlPath = path.join(__dirname, '../../supabase-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await client.query(sql);
    console.log('Schema executed successfully!');

    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('Created tables in Supabase public schema:');
    res.rows.forEach(r => console.log(' - ' + r.table_name));

  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

runMigration();
