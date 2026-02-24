/**
 * MysqlDriver Additional Tests
 * 
 * Tests for session context, foreign key checks, and user setup script
 */

import { MysqlDriver } from '../../andb-core/src/modules/driver/mysql/mysql.driver';
import { dockerMysqlConfigs } from '../fixtures/database.fixtures';

describe('MysqlDriver Advanced Features', () => {
  let driver: MysqlDriver;

  beforeAll(async () => {
    driver = new MysqlDriver(dockerMysqlConfigs.dev);
    await driver.connect();
  });

  afterAll(async () => {
    await driver.disconnect();
  });

  describe('Session Context', () => {
    it('should get session context with sql_mode', async () => {
      const context = await driver.getSessionContext();

      expect(context).toBeDefined();
      expect(context).toHaveProperty('sql_mode');
      expect(context).toHaveProperty('time_zone');
      expect(context).toHaveProperty('charset');

      // Check sql_mode contains expected modes
      expect(context.sql_mode).toContain('STRICT_TRANS_TABLES');
    });

    it('should have correct charset', async () => {
      const context = await driver.getSessionContext();
      expect(context.charset).toBe('utf8mb4');
    });
  });

  describe('Foreign Key Checks', () => {
    it('should disable foreign key checks', async () => {
      await driver.setForeignKeyChecks(false);

      const result = await driver.query<any[]>('SELECT @@SESSION.foreign_key_checks as fk');
      expect(result[0].fk).toBe(0);
    });

    it('should enable foreign key checks', async () => {
      await driver.setForeignKeyChecks(true);

      const result = await driver.query<any[]>('SELECT @@SESSION.foreign_key_checks as fk');
      expect(result[0].fk).toBe(1);
    });

    it('should toggle foreign key checks multiple times', async () => {
      await driver.setForeignKeyChecks(false);
      await driver.setForeignKeyChecks(true);
      await driver.setForeignKeyChecks(false);
      await driver.setForeignKeyChecks(true);

      const result = await driver.query<any[]>('SELECT @@SESSION.foreign_key_checks as fk');
      expect(result[0].fk).toBe(1);
    });
  });

  describe('User Setup Script Generation', () => {
    it('should generate basic read-only user script', async () => {
      const script = await driver.generateUserSetupScript({
        username: 'readonly_user',
        password: 'secure123',
        database: 'test_db',
        host: '%',
        permissions: {},
      });

      expect(script).toContain("CREATE USER IF NOT EXISTS 'readonly_user'@'%'");
      expect(script).toContain("IDENTIFIED BY 'secure123'");
      expect(script).toContain('GRANT SELECT, SHOW VIEW');
      expect(script).toContain('`test_db`.*');
      expect(script).toContain('FLUSH PRIVILEGES');

      // Should NOT have write permissions
      expect(script).not.toContain('ALTER,');
      expect(script).not.toContain('CREATE VIEW');
      expect(script).not.toContain('CREATE ROUTINE');
    });

    it('should generate user script with DDL permissions', async () => {
      const script = await driver.generateUserSetupScript({
        username: 'ddl_user',
        password: 'pass123',
        database: 'app_db',
        host: 'localhost',
        permissions: {
          writeAlter: true,
        },
      });

      expect(script).toContain("'ddl_user'@'localhost'");
      expect(script).toContain('GRANT ALTER, CREATE, DROP, INDEX, REFERENCES');
      expect(script).toContain('`app_db`.*');
    });

    it('should generate user script with view permissions', async () => {
      const script = await driver.generateUserSetupScript({
        username: 'view_user',
        password: 'pass123',
        database: 'reports_db',
        host: '%',
        permissions: {
          writeView: true,
        },
      });

      expect(script).toContain('GRANT CREATE VIEW');
      expect(script).toContain('`reports_db`.*');
    });

    it('should generate user script with routine permissions', async () => {
      const script = await driver.generateUserSetupScript({
        username: 'routine_user',
        password: 'pass123',
        database: 'proc_db',
        host: '%',
        permissions: {
          writeRoutine: true,
        },
      });

      expect(script).toContain('GRANT ALTER ROUTINE, CREATE ROUTINE, EXECUTE');
      expect(script).toContain('`proc_db`.*');
    });

    it('should generate user script with all permissions', async () => {
      const script = await driver.generateUserSetupScript({
        username: 'full_user',
        password: 'pass123',
        database: 'full_db',
        host: '%',
        permissions: {
          writeAlter: true,
          writeView: true,
          writeRoutine: true,
        },
      });

      expect(script).toContain('GRANT SELECT, SHOW VIEW');
      expect(script).toContain('GRANT ALTER, CREATE, DROP');
      expect(script).toContain('GRANT CREATE VIEW');
      expect(script).toContain('GRANT ALTER ROUTINE, CREATE ROUTINE, EXECUTE');
    });

    it('should sanitize special characters in input', async () => {
      const script = await driver.generateUserSetupScript({
        username: "user'test",
        password: "pass'word",
        database: "db`name",
        host: "host'name",
        permissions: {},
      });

      // Should remove quotes/backticks to prevent injection
      expect(script).not.toContain("'user'test'");
      expect(script).not.toContain("'pass'word'");
      expect(script).not.toContain('`db`name`');
    });

    it('should use default host when not specified', async () => {
      const script = await driver.generateUserSetupScript({
        username: 'test_user',
        password: 'pass',
        database: 'mydb',
        permissions: {},
      });

      // Default host is %
      expect(script).toContain("'test_user'@'%'");
    });
  });
});
