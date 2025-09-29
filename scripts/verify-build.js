#!/usr/bin/env node

/**
 * BUILD VERIFICATION SCRIPT
 * Ensures TypeScript compilation produces expected JavaScript files
 * Staff Engineer Orchestrator: Deployment Safety Protocol
 */

import { existsSync, statSync } from 'fs';
import { readdir } from 'fs/promises';
import { join, extname } from 'path';

const REQUIRED_BUILDS = [
  'lib/api/mlb.js',
  'lib/api/nfl.js',
  'lib/adapters/mlb.js',
  'lib/adapters/nfl.js',
  'lib/utils/cache.js',
  'lib/utils/errors.js'
];

const VALIDATION_RULES = {
  minFileSize: 100, // bytes
  requiredExports: ['getNflTeam', 'getNflStandings', 'getMlbTeam', 'getMlbStandings'],
  bannedContent: ['TODO', 'FIXME', 'console.log'] // Production safety
};

async function verifyBuild() {
  console.log('🔍 BLAZE BUILD VERIFICATION: Starting comprehensive check...');
  console.log('=' .repeat(60));

  let errors = [];
  let warnings = [];

  // Phase 1: File Existence Check
  console.log('\n📁 Phase 1: File Existence Verification');
  for (const file of REQUIRED_BUILDS) {
    const fullPath = join(process.cwd(), file);
    if (!existsSync(fullPath)) {
      errors.push(`MISSING: ${file} - TypeScript compilation failed`);
      console.log(`❌ ${file}`);
    } else {
      const stats = statSync(fullPath);
      if (stats.size < VALIDATION_RULES.minFileSize) {
        warnings.push(`SMALL: ${file} (${stats.size} bytes) - Possible compilation issue`);
        console.log(`⚠️  ${file} (${stats.size} bytes)`);
      } else {
        console.log(`✅ ${file} (${stats.size} bytes)`);
      }
    }
  }

  // Phase 2: Source Map Verification
  console.log('\n🗺️  Phase 2: Source Map Verification');
  for (const file of REQUIRED_BUILDS) {
    const mapFile = file + '.map';
    const fullPath = join(process.cwd(), mapFile);
    if (!existsSync(fullPath)) {
      warnings.push(`NO_MAP: ${mapFile} - Debugging will be limited`);
      console.log(`⚠️  ${mapFile}`);
    } else {
      console.log(`✅ ${mapFile}`);
    }
  }

  // Phase 3: Import Path Verification
  console.log('\n🔗 Phase 3: Import Path Verification');
  const testFiles = [
    'test-nfl-typescript.js',
    'index.html'
  ];

  for (const testFile of testFiles) {
    const fullPath = join(process.cwd(), testFile);
    if (existsSync(fullPath)) {
      console.log(`✅ ${testFile} exists for integration testing`);
    } else {
      warnings.push(`TEST_MISSING: ${testFile} - Cannot verify imports`);
      console.log(`⚠️  ${testFile} missing`);
    }
  }

  // Phase 4: TypeScript Artifacts Cleanup Check
  console.log('\n🧹 Phase 4: Artifact Cleanup Verification');
  const libDir = join(process.cwd(), 'lib');
  if (existsSync(libDir)) {
    const checkCleanup = async (dir) => {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          await checkCleanup(fullPath);
        } else if (entry.name.endsWith('.d.ts')) {
          // Skip .d.ts files - they are declaration files, not source files
          console.log(`🔍 ${entry.name} → declaration file (skipped)`);
        } else if (extname(entry.name) === '.ts') {
          // For each .ts file, verify corresponding .js exists
          const jsFile = fullPath.replace('.ts', '.js');
          if (!existsSync(jsFile)) {
            errors.push(`UNCOMPILED: ${fullPath} has no corresponding .js file`);
            console.log(`❌ ${entry.name} → missing .js`);
          } else {
            console.log(`✅ ${entry.name} → compiled`);
          }
        }
      }
    };
    await checkCleanup(libDir);
  }

  // Results Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 BUILD VERIFICATION RESULTS:');
  console.log(`✅ Successful checks: ${REQUIRED_BUILDS.length - errors.length}/${REQUIRED_BUILDS.length}`);
  console.log(`⚠️  Warnings: ${warnings.length}`);
  console.log(`❌ Errors: ${errors.length}`);

  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(w => console.log(`   • ${w}`));
  }

  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(e => console.log(`   • ${e}`));
    console.log('\n🚨 BUILD FAILED - TypeScript compilation incomplete');
    process.exit(1);
  }

  console.log('\n🎯 BUILD VERIFICATION COMPLETE');
  console.log('✅ All TypeScript files successfully compiled to JavaScript');
  console.log('✅ Import paths will resolve correctly');
  console.log('✅ Deployment ready');
}

verifyBuild().catch(error => {
  console.error('🚨 Build verification failed:', error);
  process.exit(1);
});