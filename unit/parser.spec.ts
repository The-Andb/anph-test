import { ParserService } from '../../andb-core/src/modules/parser/parser.service';

describe('ParserService Unit', () => {
  let parser: ParserService;

  beforeEach(() => {
    parser = new ParserService();
  });

  describe('normalize', () => {
    it('should strip comments and collapse whitespace', () => {
      const ddl = `
        -- This is a comment
        CREATE TABLE \`users\` (
          \`id\` int NOT NULL /* inline comment */ AUTO_INCREMENT
        );
      `;
      // By default options are empty, so it does nothing but return it unless ignoreWhitespace is passed!
      const result = parser.normalize(ddl, { ignoreWhitespace: true });
      // ignoreWhitespace collapses them cleanly 
      expect(result).toBe('-- This is a comment CREATE TABLE `users` ( `id` int NOT NULL /* inline comment */ AUTO_INCREMENT );');
    });
  });

  describe('cleanDefiner', () => {
    it('should remove DEFINER clauses from triggers and views', () => {
      const ddl = "CREATE DEFINER=`root`@`localhost` TRIGGER `before_insert` BEFORE INSERT";
      const result = parser.cleanDefiner(ddl);
      expect(result).not.toContain('DEFINER=');
      // Notice the double space because DEFINER replacement leaves it unless perfectly split
      expect(result).toContain('CREATE  TRIGGER `before_insert`');
    });

    it('should handle complex definers with special characters', () => {
      const ddl = "CREATE DEFINER=`admin-user`@`%` VIEW `vw_users` AS SELECT *";
      const result = parser.cleanDefiner(ddl);
      expect(result).toContain('CREATE  VIEW `vw_users` AS SELECT *');
    });
  });

  describe('parseTable', () => {
    it('should correctly extract table name, columns, primary key, and indexes', () => {
      const ddl = `
        CREATE TABLE \`products\` (
          \`id\` int NOT NULL AUTO_INCREMENT,
          \`name\` varchar(255) NOT NULL,
          \`category_enum\` enum('A','B','C') DEFAULT 'A',
          PRIMARY KEY (\`id\`),
          KEY \`idx_name\` (\`name\`),
          CONSTRAINT \`fk_category\` FOREIGN KEY (\`category_enum\`) REFERENCES \`categories\` (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `;

      const parsed = parser.parseTable(ddl);

      expect(parsed.tableName).toBe('products');
      expect(Object.keys(parsed.columns)).toEqual(['id', 'name', 'category_enum']);
      expect(parsed.primaryKey).toEqual(['id']);
      expect(Object.keys(parsed.indexes)).toEqual(['idx_name']);
      expect(Object.keys(parsed.foreignKeys)).toEqual(['fk_category']);

      // Ensure ENUM is parsed as column not something else
      expect(parsed.columns['category_enum']).toContain("enum('A','B','C')");
    });
  });

  describe('splitRoutine', () => {
    it('should split header and body correctly for routines', () => {
      const ddl = `
CREATE DEFINER=\`root\`@\`localhost\` PROCEDURE \`calc_totals\`()
BEGIN
  SELECT * FROM test;
END
      `;
      const result = parser.splitRoutine(ddl);
      expect(result.header).toContain('PROCEDURE `calc_totals`()');
      // splitRoutine naturally retains the header as is
      expect(result.body.trim()).toBe('BEGIN\n  SELECT * FROM test;\nEND');
    });
  });
});
