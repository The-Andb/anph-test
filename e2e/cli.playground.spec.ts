import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';

import scenarioMap from './fixtures/scenario-map.json';

const execPromise = util.promisify(exec);

describe('CLI Playground Matrix E2E', () => {
  const cliPath = path.join(__dirname, '../../andb-cli/andb.js');
  const scenariosDir = path.join(__dirname, 'fixtures/scenarios');
  const scenarios = fs.readdirSync(scenariosDir).filter(f =>
    fs.statSync(path.join(scenariosDir, f)).isDirectory()
  );

  const scenarioData = scenarios.map(id => ({
    id,
    description: (scenarioMap as Record<string, string>)[id] || 'Dynamic database transformation'
  }));

  test.each(scenarioData)('Scenario: $description ($id)', async ({ id, description }) => {
    const sourceFile = path.join(scenariosDir, id, 'source.sql');
    const targetFile = path.join(scenariosDir, id, 'target.sql');

    const cmd = `node ${cliPath} playground -s ${sourceFile} -t ${targetFile}`;

    const { stdout, stderr } = await execPromise(cmd);

    // Filter out standard NestJS noise from stderr if any
    const pureStderr = stderr.split('\n').filter(l => l && !l.includes('[Nest]')).join('\n');
    expect(pureStderr).toBe('');

    expect(stdout).toContain('Comparing');

    // Extract operations summary
    const diffMatch = stdout.match(/--- Diff Operations ---\s+({[\s\S]+?})\s+--- Generated/);
    if (diffMatch) {
      const diff = JSON.parse(diffMatch[1]);
      const ops = diff.operations.map((op: any) => `${op.type} ${op.target} ${op.name}`).join(', ');
      console.log(`   \x1b[32m✔ Detected Operations:\x1b[0m ${ops}`);
      expect(diff.hasChanges).toBe(true);
      expect(diff.operations.length).toBeGreaterThan(0);
    } else if (!id.includes('drop-table') && !id.includes('new-table')) {
      expect(stdout).toContain('ALTER TABLE');
    }
  });

  it('should fail gracefully if files are not found', async () => {
    const cmd = `node ${cliPath} playground -s fake1.sql -t fake2.sql`;

    try {
      await execPromise(cmd);
      expect(true).toBe(false);
    } catch (e: any) {
      // CLI uses direct fs.readFileSync which throws to stderr in this version
      expect(e.stderr).toContain('no such file or directory');
      expect(e.code).toBe(1);
    }
  });
});
