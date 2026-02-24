import { ComparatorService } from '../../andb-core/src/modules/comparator/comparator.service';
import { ParserService } from '../../andb-core/src/modules/parser/parser.service';

describe('ComparatorService Integration', () => {
  let comparator: ComparatorService;
  let parser: ParserService;

  beforeAll(() => {
    parser = new ParserService();
    comparator = new ComparatorService(parser);
  });

  it('should ignore USING BTREE when generating INDEX differences', () => {
    const desiredSchema = `
      CREATE TABLE \`helper_article_organized_categories\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`article_uid\` varchar(255) NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_article_uid\` (\`article_uid\`) USING BTREE
      ) ENGINE=InnoDB;
    `;

    const currentSchema = `
      CREATE TABLE \`helper_article_organized_categories\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`article_uid\` varchar(255) NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_article_uid\` (\`article_uid\`)
      ) ENGINE=InnoDB;
    `;

    // (Desired, Current)
    const diff = comparator.compareTables(desiredSchema, currentSchema);

    // Because we just removed USING BTREE implicit metadata parsing,
    // the semantic meaning of the keys is the same. Thus, it should not produce changes.
    expect(diff.hasChanges).toBe(false);
    expect(diff.operations.length).toBe(0);
  });

  it('should accurately output an ADD FOREIGN KEY operation when desired state introduces it', () => {
    const desiredSchema = `
      CREATE TABLE \`helper_article_organized_categories\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`article_uid\` varchar(255) NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_article_uid\` (\`article_uid\`),
        CONSTRAINT \`helper_article_organized_categories_ibfk_1\` FOREIGN KEY (\`article_uid\`) REFERENCES \`helper_articles\` (\`article_uid\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `;

    const currentSchema = `
      CREATE TABLE \`helper_article_organized_categories\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`article_uid\` varchar(255) NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_article_uid\` (\`article_uid\`)
      ) ENGINE=InnoDB;
    `;

    // (Desired, Current)
    const diff = comparator.compareTables(desiredSchema, currentSchema);

    expect(diff.hasChanges).toBe(true);
    expect(diff.operations).toEqual([
      {
        type: 'ADD',
        target: 'FOREIGN_KEY',
        name: 'helper_article_organized_categories_ibfk_1',
        tableName: 'helper_article_organized_categories',
        definition: 'CONSTRAINT `helper_article_organized_categories_ibfk_1` FOREIGN KEY (`article_uid`) REFERENCES `helper_articles` (`article_uid`) ON DELETE CASCADE',
      }
    ]);
  });

  it('should accurately output a DROP FOREIGN KEY operation when desired state drops it', () => {
    const currentSchema = `
      CREATE TABLE \`helper_article_organized_categories\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`article_uid\` varchar(255) NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_article_uid\` (\`article_uid\`),
        CONSTRAINT \`helper_article_organized_categories_ibfk_1\` FOREIGN KEY (\`article_uid\`) REFERENCES \`helper_articles\` (\`article_uid\`) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `;

    const desiredSchema = `
      CREATE TABLE \`helper_article_organized_categories\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`article_uid\` varchar(255) NOT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_article_uid\` (\`article_uid\`)
      ) ENGINE=InnoDB;
    `;

    // (Desired, Current)
    const diff = comparator.compareTables(desiredSchema, currentSchema);

    expect(diff.hasChanges).toBe(true);
    expect(diff.operations).toEqual([
      {
        type: 'DROP',
        target: 'FOREIGN_KEY',
        name: 'helper_article_organized_categories_ibfk_1',
        tableName: 'helper_article_organized_categories'
      }
    ]);
  });

  it('should handle realistic robust DDL schemas including enums, comments, and collations', () => {
    const currentSchema = `
CREATE TABLE \`helper_article_organized_categories\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`article_uid\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Article unique identifier',
  \`category_uid\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Organized category unique identifier',
  \`group_type\` enum('concepts','guides','bestPractices','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Group type within the category',
  \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Association creation timestamp',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`unique_article_category_group\` (\`article_uid\`,\`category_uid\`,\`group_type\`),
  KEY \`idx_article_uid\` (\`article_uid\`) USING BTREE,
  KEY \`idx_category_uid\` (\`category_uid\`) USING BTREE,
  KEY \`idx_group_type\` (\`group_type\`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Junction table for articles and organized categories (many-to-many)';
    `;

    const desiredSchema = `
CREATE TABLE \`helper_article_organized_categories\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`article_uid\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Article unique identifier',
  \`category_uid\` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Organized category unique identifier',
  \`group_type\` enum('concepts','guides','bestPractices','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Group type within the category',
  \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Association creation timestamp',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`unique_article_category_group\` (\`article_uid\`,\`category_uid\`,\`group_type\`),
  KEY \`idx_article_uid\` (\`article_uid\`),
  KEY \`idx_category_uid\` (\`category_uid\`),
  KEY \`idx_group_type\` (\`group_type\`),
  CONSTRAINT \`helper_article_organized_categories_ibfk_1\` FOREIGN KEY (\`article_uid\`) REFERENCES \`helper_articles\` (\`article_uid\`) ON DELETE CASCADE,
  CONSTRAINT \`helper_article_organized_categories_ibfk_2\` FOREIGN KEY (\`category_uid\`) REFERENCES \`helper_organized_categories\` (\`category_uid\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Junction table for articles and organized categories (many-to-many)';
    `;

    // (Desired, Current)
    const diff = comparator.compareTables(desiredSchema, currentSchema);

    expect(diff.hasChanges).toBe(true);
    expect(diff.operations).toEqual([
      {
        type: 'ADD',
        target: 'FOREIGN_KEY',
        name: 'helper_article_organized_categories_ibfk_1',
        tableName: 'helper_article_organized_categories',
        definition: 'CONSTRAINT `helper_article_organized_categories_ibfk_1` FOREIGN KEY (`article_uid`) REFERENCES `helper_articles` (`article_uid`) ON DELETE CASCADE',
      },
      {
        type: 'ADD',
        target: 'FOREIGN_KEY',
        name: 'helper_article_organized_categories_ibfk_2',
        tableName: 'helper_article_organized_categories',
        definition: 'CONSTRAINT `helper_article_organized_categories_ibfk_2` FOREIGN KEY (`category_uid`) REFERENCES `helper_organized_categories` (`category_uid`) ON DELETE CASCADE',
      }
    ]);
  });
});
