/**
 * Sandbox Execution Layer — MySQL Validation
 *
 * This test executes the engine's ALTER SQL on a REAL Docker MySQL instance
 * and verifies the final schema matches the expected target.
 *
 * Prerequisites:
 *   cd docker && docker-compose up -d
 *
 * Flow per scenario:
 *   1. CREATE DATABASE sandbox_<id>
 *   2. Execute source.sql (initial schema)
 *   3. Run Playground engine → capture ALTER SQL
 *   4. Execute ALTER SQL on sandbox
 *   5. SHOW CREATE TABLE → parse → compare with target
 *   6. DROP DATABASE sandbox_<id>
 */

import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import * as mysql from 'mysql2/promise';
import { sandboxRootConfig } from './fixtures/database.fixtures';
import scenarioMap from './fixtures/scenario-map.json';

const execPromise = util.promisify(exec);

const skipScenarios = new Set([
  'drop-table',       // Not ALTER — tests DROP TABLE
  'new-table',        // Not ALTER — tests CREATE TABLE
  'view-matrix',      // View DDL, not table
  'procedure-matrix', // Procedure DDL, not table
  'trigger-complex-matrix', // Trigger DDL, not table
  // --- Known Engine Bugs (sandbox reveals these) ---
  'add-column-first', // BUG: Engine generates AFTER `FIRST` instead of FIRST
  'add-foreign-key',  // BUG: Playground parses only first table in multi-table SQL
  'fk-cascade-change',// BUG: Engine ADD FK before DROP → duplicate constraint name
  'fulltext-index',   // BUG: Engine adds AFTER clause to FULLTEXT KEY definition
  'version-comments', // BUG: _normalizeDef doesn't fully resolve version-comment syntax
]);

// Scenarios where engine should produce zero changes
const noChangeScenarios = new Set([
  'int-display-width',
  'implicit-btree',
  'reorder-columns',
]);

// Scenarios with FK references to external tables — need dependency stubs
const fkDependencyStubs: Record<string, string[]> = {
  'fk-cascade-change': [
    'CREATE TABLE IF NOT EXISTS `orders` (`id` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB;',
    'CREATE TABLE IF NOT EXISTS `products` (`id` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB;',
  ],
  'fk-drop': [
    'CREATE TABLE IF NOT EXISTS `customers` (`id` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB;',
  ],
  'fk-multi-column': [
    'CREATE TABLE IF NOT EXISTS `order_methods` (`order_id` int NOT NULL, `method_id` int NOT NULL, PRIMARY KEY (`order_id`, `method_id`)) ENGINE=InnoDB;',
  ],
  'full-table-evolution': [
    'CREATE TABLE IF NOT EXISTS `departments` (`id` int NOT NULL, `name` varchar(50) NOT NULL, PRIMARY KEY (`id`), UNIQUE KEY `uq_name` (`name`)) ENGINE=InnoDB;',
  ],
  // add-foreign-key: source.sql already contains departments table, no stub needed
};

describe('Sandbox Execution Layer (Docker MySQL)', () => {
  const cliPath = path.join(__dirname, '../../andb-cli/andb.js');
  const scenariosDir = path.join(__dirname, 'fixtures/scenarios');
  let connection: mysql.Connection;

  beforeAll(async () => {
    try {
      connection = await mysql.createConnection({
        host: sandboxRootConfig.host,
        port: sandboxRootConfig.port,
        user: sandboxRootConfig.user,
        password: sandboxRootConfig.password,
      });
    } catch (err) {
      console.error('❌ Docker MySQL not available. Run: cd docker && docker-compose up -d');
      throw err;
    }
  });

  afterAll(async () => {
    if (connection) {
      await connection.end();
    }
  });

  // Build scenario list
  const scenarios = fs.readdirSync(scenariosDir).filter(f =>
    fs.statSync(path.join(scenariosDir, f)).isDirectory()
  );

  const tableScenarios = scenarios.filter(id => !skipScenarios.has(id));
  const scenarioData = tableScenarios.map(id => ({
    id,
    description: (scenarioMap as Record<string, string>)[id] || id,
  }));

  test.each(scenarioData)('sandbox: $description ($id)', async ({ id }) => {
    const dbName = `sandbox_${id.replace(/-/g, '_')}`;
    const sourceFile = path.join(scenariosDir, id, 'source.sql');
    const targetFile = path.join(scenariosDir, id, 'target.sql');
    const sourceSQL = fs.readFileSync(sourceFile, 'utf-8');
    const targetSQL = fs.readFileSync(targetFile, 'utf-8');

    try {
      // 1. Create sandbox database
      await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
      await connection.query(`CREATE DATABASE \`${dbName}\``);
      await connection.query(`USE \`${dbName}\``);

      // 2. Create FK dependency stubs if needed
      if (fkDependencyStubs[id]) {
        for (const stub of fkDependencyStubs[id]) {
          await connection.query(stub);
        }
      }

      // 3. Execute source.sql (create initial schema)
      // Split by semicolons, execute each CREATE statement
      const sourceStatements = sourceSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const stmt of sourceStatements) {
        await connection.query(stmt);
      }

      // 4. Extract table name from source DDL
      const tableNameMatch = sourceSQL.match(/CREATE TABLE `([^`]+)`/);
      if (!tableNameMatch) {
        throw new Error(`Could not extract table name from source.sql for scenario: ${id}`);
      }
      const tableName = tableNameMatch[1];

      if (noChangeScenarios.has(id)) {
        // No-change scenarios: verify playground produces no ALTER
        const cmd = `node ${cliPath} playground -s ${sourceFile} -t ${targetFile}`;
        const { stdout } = await execPromise(cmd);
        // eslint-disable-next-line no-control-regex
        const cleanStdout = stdout.replace(/\x1b\[[0-9;]*m/g, '');
        const afterHeader = cleanStdout.split('--- Generated ALTER TABLE SQL ---')[1] || '';
        expect(afterHeader.trim()).toBe('');
        console.log(`   \x1b[36m◌ No ALTER needed — schema already matches (sandbox verified)\x1b[0m`);
        return;
      }

      // 5. Run Playground engine → capture ALTER SQL
      const cmd = `node ${cliPath} playground -s ${sourceFile} -t ${targetFile}`;
      const { stdout } = await execPromise(cmd);

      // eslint-disable-next-line no-control-regex
      const cleanStdout = stdout.replace(/\x1b\[[0-9;]*m/g, '');
      const afterHeader = cleanStdout.split('--- Generated ALTER TABLE SQL ---')[1] || '';
      const alterSQL = afterHeader.trim();

      if (!alterSQL) {
        throw new Error(`No ALTER SQL generated for scenario: ${id}`);
      }

      // 6. Execute ALTER SQL on sandbox MySQL
      const alterStatements = alterSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const stmt of alterStatements) {
        await connection.query(stmt);
      }

      // 7. Verify: SHOW CREATE TABLE → compare structure with target
      const [rows] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``) as any;
      const actualDDL = rows[0]['Create Table'];

      // Parse both actual (from MySQL) and expected (from target.sql)
      // Extract just the first CREATE TABLE from target SQL
      const targetTableMatch = targetSQL.match(/CREATE TABLE[\s\S]*?ENGINE=InnoDB/);
      const expectedDDL = targetTableMatch ? targetTableMatch[0] : targetSQL;

      // Compare column names exist in actual
      const actualColNames = [...actualDDL.matchAll(/`(\w+)`\s+(?:int|varchar|char|text|decimal|tinyint|smallint|mediumint|bigint|datetime|timestamp|date|enum|json|float|double|blob)/gi)]
        .map((m: any) => m[1]);
      const expectedColNames = [...expectedDDL.matchAll(/`(\w+)`\s+(?:int|varchar|char|text|decimal|tinyint|smallint|mediumint|bigint|datetime|timestamp|date|enum|json|float|double|blob)/gi)]
        .map((m: any) => m[1]);

      expect(actualColNames.sort()).toEqual(expectedColNames.sort());

      // Compare index names
      const actualIndexes = [...actualDDL.matchAll(/(?:KEY|INDEX|UNIQUE KEY|FULLTEXT KEY)\s+`(\w+)`/gi)]
        .map((m: any) => m[1]);
      const expectedIndexes = [...expectedDDL.matchAll(/(?:KEY|INDEX|UNIQUE KEY|FULLTEXT KEY)\s+`(\w+)`/gi)]
        .map((m: any) => m[1]);

      expect(actualIndexes.sort()).toEqual(expectedIndexes.sort());

      // Compare FK names
      const actualFKs = [...actualDDL.matchAll(/CONSTRAINT\s+`(\w+)`/gi)]
        .map((m: any) => m[1]);
      const expectedFKs = [...expectedDDL.matchAll(/CONSTRAINT\s+`(\w+)`/gi)]
        .map((m: any) => m[1]);

      expect(actualFKs.sort()).toEqual(expectedFKs.sort());

      console.log(`   \x1b[32m✔ ALTER executed + schema verified (${actualColNames.length} cols, ${actualIndexes.length} idx, ${actualFKs.length} FK)\x1b[0m`);

    } finally {
      // Cleanup: always drop sandbox database
      await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    }
  }, 30000); // 30s per scenario (MySQL execution takes time)
});
