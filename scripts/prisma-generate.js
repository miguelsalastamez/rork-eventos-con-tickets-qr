#!/usr/bin/env bun

console.log('🔧 Running Prisma setup...');
console.log('📁 Looking for schema at: ./prisma/schema.prisma');

try {
  const { spawnSync } = require('child_process');
  
  const result = spawnSync('bunx', ['prisma', 'generate', '--schema=./prisma/schema.prisma'], {
    stdio: 'inherit',
    shell: true,
  });
  
  if (result.status === 0) {
    console.log('✅ Prisma Client generated successfully');
    process.exit(0);
  } else {
    console.error('❌ Prisma generation failed');
    process.exit(result.status || 1);
  }
} catch (error) {
  console.error('❌ Error running Prisma generate:', error);
  process.exit(1);
}
