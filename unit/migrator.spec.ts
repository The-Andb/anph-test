import { MigratorService } from '../../andb-core/src/modules/migrator/migrator.service';
import { ITableDiff, ISchemaDiff, IObjectDiff } from '../../andb-core/src/common/interfaces/diff.interface';

describe('MigratorService Unit', () => {
  let migrator: MigratorService;

  beforeEach(() => {
    migrator = new MigratorService();
  });

  describe('generateAlterSQL', () => {
    it('should generate ADD COLUMN statements', () => {
      const diff: ITableDiff = {
        tableName: 'users',
        hasChanges: true,
        operations: [
          {
            type: 'ADD',
            target: 'COLUMN',
            name: 'age',
            definition: 'int(11) DEFAULT NULL',
          },
        ],
      };

      const sql = migrator.generateAlterSQL(diff);
      expect(sql).toContain('ALTER TABLE `users` ADD COLUMN `age` int(11) DEFAULT NULL;');
    });

    it('should generate DROP COLUMN statements', () => {
      const diff: ITableDiff = {
        tableName: 'users',
        hasChanges: true,
        operations: [
          {
            type: 'DROP',
            target: 'COLUMN',
            name: 'age',
          },
        ],
      };

      const sql = migrator.generateAlterSQL(diff);
      expect(sql).toContain('ALTER TABLE `users` DROP COLUMN `age`;');
    });

    it('should generate MODIFY COLUMN statements', () => {
      const diff: ITableDiff = {
        tableName: 'users',
        hasChanges: true,
        operations: [
          {
            type: 'MODIFY',
            target: 'COLUMN',
            name: 'status',
            definition: 'varchar(50) NOT NULL',
          },
        ],
      };

      const sql = migrator.generateAlterSQL(diff);
      expect(sql).toContain('ALTER TABLE `users` MODIFY COLUMN `status` varchar(50) NOT NULL;');
    });

    it('should generate ADD INDEX statements', () => {
      const diff: ITableDiff = {
        tableName: 'users',
        hasChanges: true,
        operations: [
          {
            type: 'ADD',
            target: 'INDEX',
            name: 'idx_status',
            definition: 'KEY `idx_status` (`status`)',
          },
        ],
      };

      const sql = migrator.generateAlterSQL(diff);
      expect(sql).toContain('ALTER TABLE `users` ADD KEY `idx_status` (`status`);');
    });

    it('should generate DROP INDEX statements', () => {
      const diff: ITableDiff = {
        tableName: 'users',
        hasChanges: true,
        operations: [
          {
            type: 'DROP',
            target: 'INDEX',
            name: 'idx_status',
          },
        ],
      };

      const sql = migrator.generateAlterSQL(diff);
      expect(sql).toContain('ALTER TABLE `users` DROP INDEX `idx_status`;');
    });

    it('should support ADD PRIMARY KEY', () => {
      const diff: ITableDiff = {
        tableName: 'users',
        hasChanges: true,
        operations: [
          {
            type: 'ADD',
            target: 'INDEX',
            name: 'PRIMARY',
            definition: 'PRIMARY KEY (`id`)',
          },
        ],
      };

      const sql = migrator.generateAlterSQL(diff);
      expect(sql).toContain('ALTER TABLE `users` ADD PRIMARY KEY (`id`);');
    });

    it('should support DROP PRIMARY KEY', () => {
      const diff: ITableDiff = {
        tableName: 'users',
        hasChanges: true,
        operations: [
          {
            type: 'DROP',
            target: 'INDEX',
            name: 'PRIMARY',
          },
        ],
      };

      const sql = migrator.generateAlterSQL(diff);
      expect(sql).toContain('ALTER TABLE `users` DROP PRIMARY KEY;');
    });

    it('should support ADD FOREIGN KEY', () => {
      const diff: ITableDiff = {
        tableName: 'orders',
        hasChanges: true,
        operations: [
          {
            type: 'ADD',
            target: 'FOREIGN_KEY',
            name: 'fk_user_id',
            definition: 'CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)',
          },
        ],
      };

      const sql = migrator.generateAlterSQL(diff);
      expect(sql).toContain('ALTER TABLE `orders` ADD CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);');
    });

    it('should support DROP FOREIGN KEY', () => {
      const diff: ITableDiff = {
        tableName: 'orders',
        hasChanges: true,
        operations: [
          {
            type: 'DROP',
            target: 'FOREIGN_KEY',
            name: 'fk_user_id',
          },
        ],
      };

      const sql = migrator.generateAlterSQL(diff);
      expect(sql).toContain('ALTER TABLE `orders` DROP FOREIGN KEY `fk_user_id`;');
    });
  });

  describe('generateObjectSQL', () => {
    it('should generate CREATE for objects', () => {
      const diff: IObjectDiff = {
        type: 'VIEW',
        name: 'vw_users',
        operation: 'CREATE',
        definition: 'CREATE VIEW `vw_users` AS SELECT * FROM users',
      };
      const sql = migrator.generateObjectSQL(diff);
      expect(sql).toEqual(['CREATE VIEW `vw_users` AS SELECT * FROM users;']);
    });

    it('should generate DROP for objects', () => {
      const diff: IObjectDiff = {
        type: 'PROCEDURE',
        name: 'calc_totals',
        operation: 'DROP',
      };
      const sql = migrator.generateObjectSQL(diff);
      expect(sql).toEqual(['DROP PROCEDURE IF EXISTS `calc_totals`;']);
    });

    it('should generate DROP then CREATE for REPLACE operations', () => {
      const diff: IObjectDiff = {
        type: 'TRIGGER',
        name: 'before_insert',
        operation: 'REPLACE',
        definition: 'CREATE TRIGGER `before_insert` BEFORE INSERT ON users',
      };
      const sql = migrator.generateObjectSQL(diff);
      expect(sql).toEqual([
        'DROP TRIGGER IF EXISTS `before_insert`;',
        'CREATE TRIGGER `before_insert` BEFORE INSERT ON users;',
      ]);
    });
  });

  describe('generateSchemaSQL', () => {
    it('should generate ordered full schema migration', () => {
      const diff: ISchemaDiff = {
        summary: { totalChanges: 4, tablesChanged: 1, objectsChanged: 3 },
        tables: {
          users: {
            tableName: 'users',
            hasChanges: true,
            operations: [{ type: 'ADD', target: 'COLUMN', name: 'age', definition: 'int(11)' }],
          },
        },
        droppedTables: ['old_table'],
        objects: [
          { type: 'VIEW', name: 'vw_1', operation: 'DROP' },
          { type: 'PROCEDURE', name: 'proc_1', operation: 'CREATE', definition: 'CREATE PROCEDURE proc_1' },
          { type: 'TRIGGER', name: 'trg_1', operation: 'REPLACE', definition: 'CREATE TRIGGER trg_1' },
        ],
      };

      const sql = migrator.generateSchemaSQL(diff);
      // Ensure order: Drops -> Tables -> Create/Replace Objects
      expect(sql).toEqual([
        'DROP TABLE IF EXISTS `old_table`;',
        'DROP VIEW IF EXISTS `vw_1`;',
        'ALTER TABLE `users` ADD COLUMN `age` int(11);',
        'CREATE PROCEDURE proc_1;',
        'DROP TRIGGER IF EXISTS `trg_1`;',
        'CREATE TRIGGER trg_1;',
      ]);
    });
  });
});
