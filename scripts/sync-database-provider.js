const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const envPath = path.join(__dirname, '..', '.env');

let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
  if (match) databaseUrl = match[1];
}

if (databaseUrl && fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, 'utf-8');
  const isPostgres = databaseUrl.startsWith('postgres');
  const targetProvider = isPostgres ? 'postgresql' : 'mysql';
  const newSchema = schema.replace(/provider\s*=\s*["'](postgresql|mysql)["']/, `provider = "${targetProvider}"`);
  if (newSchema !== schema) {
    fs.writeFileSync(schemaPath, newSchema, 'utf-8');
    console.log(`[sync-database-provider] Updated prisma provider to "${targetProvider}" based on DATABASE_URL.`);
  }

  if (isPostgres && process.env.VERCEL) {
    try {
      console.log('[sync-database-provider] Synchronizing PostgreSQL schema on Vercel build...');
      const cp = require('child_process');
      cp.execSync('npx prisma db push --skip-generate --accept-data-loss', { stdio: 'inherit', timeout: 30000 });
      console.log('[sync-database-provider] PostgreSQL schema synchronized successfully.');
    } catch (pushErr) {
      console.warn('[sync-database-provider] Note: Prisma db push on build skipped (runtime auto-DDL will handle schema):', pushErr.message);
    }
  }
}
