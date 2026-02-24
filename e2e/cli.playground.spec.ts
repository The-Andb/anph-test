import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';

const execPromise = util.promisify(exec);

describe('CLI Playground Matrix E2E', () => {
  const cliPath = path.join(__dirname, '../../andb-cli/andb.js');
  const scenariosDir = path.join(__dirname, 'fixtures/scenarios');
  const scenarios = fs.readdirSync(scenariosDir).filter(f =>
    fs.statSync(path.join(scenariosDir, f)).isDirectory()
  );

  test.each(scenarios)('Scenario: %s', async (scenario) => {
    const sourceFile = path.join(scenariosDir, scenario, 'source.sql');
    const targetFile = path.join(scenariosDir, scenario, 'target.sql');

    const cmd = `node ${cliPath} playground -s ${sourceFile} -t ${targetFile}`;

    const { stdout, stderr } = await execPromise(cmd);

    expect(stderr).toBe('');
    expect(stdout).toContain('Comparing');
    expect(stdout).toContain('ALTER TABLE'); // Most scenarios generate this
  });

  it('should fail gracefully if files are not found', async () => {
    const cmd = `node ${cliPath} playground -s fake1.sql -t fake2.sql`;

    try {
      await execPromise(cmd);
      expect(true).toBe(false);
    } catch (e: any) {
      expect(e.stderr).toContain('ENOENT: no such file or directory');
      expect(e.code).toBe(1);
    }
  });
});
