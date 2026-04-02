import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../prisma/generated/client.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Row counts ────────────────────────────────────────────────
  const userCount       = await prisma.user.count();
  const profileCount    = await prisma.user_profile.count();
  const classroomCount  = await prisma.classroom.count();
  const scenarioCount   = await prisma.scenario.count();
  const assignmentCount = await prisma.assignment.count();
  const attemptCount    = await prisma.attempt.count();

  console.log('✅ Prisma adapter-pg connected successfully\n');
  console.log('── Row counts ─────────────────────────');
  console.log('  neon_auth.user   :', userCount);
  console.log('  user_profile     :', profileCount);
  console.log('  classroom        :', classroomCount);
  console.log('  scenario         :', scenarioCount);
  console.log('  assignment       :', assignmentCount);
  console.log('  attempt          :', attemptCount);

  // ── Users ─────────────────────────────────────────────────────
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true },
    take: 5,
  });
  console.log('\n── Users ──────────────────────────────');
  users.forEach(u => console.log(' ', u.email, '|', u.name));

  // ── Classrooms with member count ──────────────────────────────
  const classrooms = await prisma.classroom.findMany({
    include: { members: true, created_by: true },
    take: 5,
  });
  console.log('\n── Classrooms ─────────────────────────');
  classrooms.forEach(c =>
    console.log(`  "${c.name}" – ${c.members.length} members, created by ${c.created_by.id.slice(0, 8)}…`)
  );

  // ── Scenarios ─────────────────────────────────────────────────
  const scenarios = await prisma.scenario.findMany({
    select: { id: true, title: true, latest_version_number: true },
    take: 5,
  });
  console.log('\n── Scenarios ──────────────────────────');
  scenarios.forEach(s => console.log(`  "${s.title}" (v${s.latest_version_number})`));

  // ── Assignments ───────────────────────────────────────────────
  const assignments = await prisma.assignment.findMany({
    include: { classroom: true, scenario_version: { include: { scenario: true } } },
    take: 5,
  });
  console.log('\n── Assignments ────────────────────────');
  assignments.forEach(a =>
    console.log(`  "${a.title}" in "${a.classroom.name}" → scenario "${a.scenario_version.scenario.title}"`)
  );

  // ── JWKS key IDs (for auth) ────────────────────────────────────
  const jwks = await prisma.jwks.findMany({ select: { id: true } });
  console.log('\n── JWKS keys in DB ────────────────────');
  jwks.forEach(k => console.log(' ', k.id));

  console.log('\n✅ All queries succeeded — database is healthy!');
}

main()
  .catch(e => { console.error('❌ Error:', e.message); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
