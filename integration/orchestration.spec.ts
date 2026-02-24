import { ParserService } from '../../andb-core/src/modules/parser/parser.service';
import { ComparatorService } from '../../andb-core/src/modules/comparator/comparator.service';
import { MigratorService } from '../../andb-core/src/modules/migrator/migrator.service';

describe('Orchestration Integration Suite', () => {
  let parser: ParserService;
  let comparator: ComparatorService;
  let migrator: MigratorService;

  // NOTE: This test simulates the "Offline" compare model that the CLI uses.
  // It does not connect to a real DB, but feeds raw string DDL through the entire memory pipeline.

  beforeAll(() => {
    parser = new ParserService();
    comparator = new ComparatorService(parser);
    migrator = new MigratorService();
  });

  it('should successfully parse, compare, and generate migration SQL end-to-end', () => {
    // 1. Raw DDL Input (Simulating `source.sql` and `target.sql`)
    const currentSchema = `
      CREATE TABLE \`users\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(50) NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB;

      CREATE VIEW \`vw_active\` AS SELECT id FROM users;
    `;

    const desiredSchema = `
      CREATE TABLE \`users\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(100) NOT NULL,
        \`age\` int DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_age\` (\`age\`)
      ) ENGINE=InnoDB;

      CREATE TABLE \`logs\` (
        \`id\` int PRIMARY KEY
      );
    `;

    // 2. Parse Step
    // For a real orchestration we parse the whole file, here we use parseTable explicitly
    // to simulate how the CLI builds its fake 'Introspection' lists in memory.
    const currentTable = parser.parseTable(currentSchema.split('CREATE VIEW')[0]);
    const desiredTable = parser.parseTable(desiredSchema.split('CREATE TABLE \`logs\`')[0]);
    expect(currentTable).not.toBeNull();
    expect(desiredTable).not.toBeNull();

    // 3. Compare Step
    // ComparatorService.compareTables expects raw DDL strings, it parses internally
    const tableDiff = comparator.compareTables(
      desiredSchema.split('CREATE TABLE `logs`')[0],
      currentSchema.split('CREATE VIEW')[0]
    );
    expect(tableDiff.hasChanges).toBe(true);
    expect(tableDiff.operations.length).toBeGreaterThan(0);

    // 4. Migrate Step
    const statements = migrator.generateAlterSQL(tableDiff);

    // Assert that the pipeline correctly identified the changes
    const fullSql = statements.join('\\n');
    expect(fullSql).toContain('MODIFY COLUMN \`name\` varchar(100) NOT NULL');
    expect(fullSql).toContain('ADD COLUMN \`age\` int DEFAULT NULL');
    expect(fullSql).toContain('ADD KEY \`idx_age\` (\`age\`)');
  });
});
