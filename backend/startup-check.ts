console.log('\n' + '='.repeat(60));
console.log('🔍 BACKEND STARTUP VALIDATION');
console.log('='.repeat(60) + '\n');

let canStart = true;
const errors: string[] = [];
const warnings: string[] = [];

console.log('Checking prerequisites...\n');

console.log('1. Checking @prisma/client...');
try {
  require('@prisma/client');
  console.log('   ✅ @prisma/client available\n');
} catch (error) {
  console.error('   ❌ @prisma/client NOT FOUND');
  console.error('   This means Prisma Client has not been generated.');
  console.error('   Run: bunx prisma generate\n');
  errors.push('Missing Prisma Client - run: bunx prisma generate');
  canStart = false;
}

console.log('2. Checking environment variables...');
if (!process.env.DATABASE_URL) {
  console.warn('   ⚠️  DATABASE_URL not set');
  warnings.push('DATABASE_URL not configured');
} else {
  console.log('   ✅ DATABASE_URL configured');
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'cambia-esto-por-un-secreto-seguro' || process.env.JWT_SECRET === 'your-secret-key-change-this') {
  console.warn('   ⚠️  JWT_SECRET using default value');
  warnings.push('JWT_SECRET should be changed for security');
} else {
  console.log('   ✅ JWT_SECRET configured');
}

if (!process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
  console.warn('   ⚠️  EXPO_PUBLIC_RORK_API_BASE_URL not set');
  warnings.push('EXPO_PUBLIC_RORK_API_BASE_URL not configured');
} else {
  console.log('   ✅ EXPO_PUBLIC_RORK_API_BASE_URL configured');
}
console.log('');

console.log('3. Checking required dependencies...');
const requiredDeps = ['hono', '@hono/trpc-server', '@trpc/server', 'zod'];
let allDepsAvailable = true;

for (const dep of requiredDeps) {
  try {
    require(dep);
  } catch {
    console.error(`   ❌ ${dep} not found`);
    errors.push(`Missing dependency: ${dep}`);
    allDepsAvailable = false;
    canStart = false;
  }
}

if (allDepsAvailable) {
  console.log('   ✅ All required dependencies available\n');
}

console.log('='.repeat(60));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(60) + '\n');

if (errors.length > 0) {
  console.error('❌ ERRORS (must fix to start):');
  errors.forEach(err => console.error('   • ' + err));
  console.log('');
}

if (warnings.length > 0) {
  console.warn('⚠️  WARNINGS (should fix but not critical):');
  warnings.forEach(warn => console.warn('   • ' + warn));
  console.log('');
}

if (canStart) {
  console.log('✅ All critical checks passed!');
  console.log('   Starting backend server...\n');
} else {
  console.error('❌ Cannot start backend - fix errors above first.');
  console.log('\n📖 See BACKEND-TROUBLESHOOTING.md for help.\n');
  process.exit(1);
}

export { canStart };
