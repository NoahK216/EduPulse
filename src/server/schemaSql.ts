import {
  ZodArray,
  ZodBoolean,
  ZodDate,
  ZodDefault,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodString,
} from 'zod';
import type { ZodTypeAny } from 'zod';
import { ScenarioRowSchema, SubmissionRowSchema, UserRoleSchema, UserRowSchema } from './schemas.js';

type ColumnOverride = {
  sqlType?: string;
  primaryKey?: boolean;
  unique?: boolean;
  references?: string;
  default?: string;
  check?: string;
  notNull?: boolean;
};

function unwrap(type: ZodTypeAny): ZodTypeAny {
  if (type instanceof ZodOptional || type instanceof ZodNullable || type instanceof ZodDefault) {
    return unwrap((type as any)._def.innerType);
  }
  return type;
}

function isOptionalOrNullable(type: ZodTypeAny): boolean {
  if (type instanceof ZodOptional || type instanceof ZodNullable || type instanceof ZodDefault) return true;
  return false;
}

function inferSqlType(type: ZodTypeAny): string {
  const t = unwrap(type);
  if (t instanceof ZodString) return 'TEXT';
  if (t instanceof ZodNumber) return 'INTEGER';
  if (t instanceof ZodBoolean) return 'BOOLEAN';
  if (t instanceof ZodDate) return 'TIMESTAMPTZ';
  if (t instanceof ZodArray) return 'JSONB';
  if (t instanceof ZodObject) return 'JSONB';
  return 'JSONB';
}

function columnSql(name: string, type: ZodTypeAny, override: ColumnOverride = {}): string {
  const parts = [`"${name}" ${override.sqlType ?? inferSqlType(type)}`];
  if (override.primaryKey) parts.push('PRIMARY KEY');
  if (override.unique) parts.push('UNIQUE');
  if (override.notNull ?? !isOptionalOrNullable(type)) parts.push('NOT NULL');
  if (override.default) parts.push(`DEFAULT ${override.default}`);
  if (override.references) parts.push(`REFERENCES ${override.references}`);
  if (override.check) parts.push(`CHECK (${override.check})`);
  return parts.join(' ');
}

function createTableSql(
  table: string,
  shape: Record<string, ZodTypeAny>,
  overrides: Record<string, ColumnOverride>,
  extraSql: string[] = [],
): string {
  const cols = Object.entries(shape).map(([name, type]) => columnSql(name, type, overrides[name] ?? {}));
  return `CREATE TABLE IF NOT EXISTS ${table} (\n  ${cols.join(',\n  ')}${extraSql.length ? ',\n  ' + extraSql.join(',\n  ') : ''}\n);`;
}

// Users
export const createUsersTableSQL = createTableSql(
  'users',
  UserRowSchema.shape,
  {
    id: { sqlType: 'SERIAL', primaryKey: true, notNull: true },
    email: { sqlType: 'VARCHAR(255)', unique: true, notNull: true },
    name: { sqlType: 'VARCHAR(255)', notNull: false },
    role: {
      sqlType: 'VARCHAR(50)',
      default: `'trainee'`,
      check: `role IN (${UserRoleSchema.options.map((r) => `'${r}'`).join(',')})`,
      notNull: true,
    },
    created_at: { sqlType: 'TIMESTAMPTZ', default: 'NOW()', notNull: true },
    updated_at: { sqlType: 'TIMESTAMPTZ', default: 'NOW()', notNull: true },
  },
);

// Scenarios
export const createScenariosTableSQL = createTableSql(
  'scenarios',
  ScenarioRowSchema.shape,
  {
    id: { sqlType: 'VARCHAR(255)', primaryKey: true, notNull: true },
    user_id: { sqlType: 'INTEGER', references: 'users(id)', notNull: true },
    title: { sqlType: 'VARCHAR(255)', notNull: true },
    scenario_version: { sqlType: 'INTEGER', notNull: true },
    content: { sqlType: 'JSONB', notNull: true },
    created_at: { sqlType: 'TIMESTAMPTZ', default: 'NOW()', notNull: true },
    updated_at: { sqlType: 'TIMESTAMPTZ', default: 'NOW()', notNull: true },
  },
);

// Submissions
export const createSubmissionsTableSQL = createTableSql(
  'submissions',
  SubmissionRowSchema.shape,
  {
    id: { sqlType: 'SERIAL', primaryKey: true, notNull: true },
    user_id: { sqlType: 'INTEGER', references: 'users(id)', notNull: true },
    scenario_id: { sqlType: 'VARCHAR(255)', references: 'scenarios(id)', notNull: true },
    node_id: { sqlType: 'VARCHAR(255)', notNull: true },
    question_prompt: { sqlType: 'TEXT', notNull: true },
    user_response_text: { sqlType: 'TEXT', notNull: true },
    bucket_id: { sqlType: 'VARCHAR(255)', notNull: false },
    feedback: { sqlType: 'TEXT', notNull: false },
    created_at: { sqlType: 'TIMESTAMPTZ', default: 'NOW()', notNull: true },
  },
);

export const createIndexesSQL = [
  'CREATE INDEX IF NOT EXISTS idx_scenarios_user_id ON scenarios(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_submissions_scenario_id ON submissions(scenario_id)',
];
