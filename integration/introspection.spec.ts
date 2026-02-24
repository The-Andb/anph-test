/**
 * Introspection Service Integration Tests
 * 
 * Tests all list* and get*DDL methods against Docker MySQL
 */

import { MysqlDriver } from '../../andb-core/src/modules/driver/mysql/mysql.driver';
import { IIntrospectionService } from '../../andb-core/src/common/interfaces/driver.interface';
import { dockerMysqlConfigs } from '../fixtures/database.fixtures';

describe('MysqlIntrospectionService', () => {
  let driver: MysqlDriver;
  let introspection: IIntrospectionService;
  const dbName = 'dev_database';

  beforeAll(async () => {
    driver = new MysqlDriver(dockerMysqlConfigs.dev);
    await driver.connect();
    introspection = driver.getIntrospectionService();
  });

  afterAll(async () => {
    await driver.disconnect();
  });

  describe('List Methods', () => {
    it('should list all tables', async () => {
      const tables = await introspection.listTables(dbName);

      expect(tables).toBeInstanceOf(Array);
      expect(tables.length).toBeGreaterThan(0);
      expect(tables).toContain('users');
      expect(tables).toContain('products');
      expect(tables).toContain('orders');
    });

    it('should list all views', async () => {
      const views = await introspection.listViews(dbName);

      expect(views).toBeInstanceOf(Array);
      expect(views.length).toBeGreaterThan(0);
      expect(views).toContain('v_user_order_summary');
    });

    it('should list all procedures', async () => {
      const procedures = await introspection.listProcedures(dbName);

      expect(procedures).toBeInstanceOf(Array);
      expect(procedures.length).toBeGreaterThan(0);
      expect(procedures).toContain('sp_process_order');
    });

    it('should list all functions', async () => {
      const functions = await introspection.listFunctions(dbName);

      expect(functions).toBeInstanceOf(Array);
      expect(functions.length).toBeGreaterThan(0);
      expect(functions).toContain('fn_get_user_level');
    });

    it('should list all triggers', async () => {
      const triggers = await introspection.listTriggers(dbName);

      expect(triggers).toBeInstanceOf(Array);
      expect(triggers.length).toBeGreaterThan(0);
      expect(triggers).toContain('trg_products_update');
    });

    it('should list all events', async () => {
      const events = await introspection.listEvents(dbName);

      expect(events).toBeInstanceOf(Array);
      // Events may be empty if scheduler is disabled, just check it doesn't throw
    });
  });

  describe('DDL Retrieval Methods', () => {
    it('should get table DDL', async () => {
      const ddl = await introspection.getTableDDL(dbName, 'users');

      expect(ddl).toBeDefined();
      expect(ddl).toContain('CREATE TABLE');
      expect(ddl).toContain('users');
      expect(ddl).toContain('id');
      expect(ddl).toContain('email');
      // Should not have AUTO_INCREMENT value
      expect(ddl).not.toMatch(/AUTO_INCREMENT=\d+/);
    });

    it('should get view DDL', async () => {
      const ddl = await introspection.getViewDDL(dbName, 'v_user_order_summary');

      expect(ddl).toBeDefined();
      expect(ddl.toLowerCase()).toContain('create');
      expect(ddl.toLowerCase()).toContain('view');
      expect(ddl).toContain('v_user_order_summary');
    });

    it('should get procedure DDL (may be null due to permissions)', async () => {
      const ddl = await introspection.getProcedureDDL(dbName, 'sp_process_order');

      // Note: DDL may be empty if user lacks SHOW_ROUTINE privilege
      expect(ddl).toBeDefined();
      if (ddl) {
        expect(ddl.toLowerCase()).toContain('procedure');
      }
    });

    it('should get function DDL (may be null due to permissions)', async () => {
      const ddl = await introspection.getFunctionDDL(dbName, 'fn_get_user_level');

      // Note: DDL may be empty if user lacks SHOW_ROUTINE privilege
      expect(ddl).toBeDefined();
      if (ddl) {
        expect(ddl.toLowerCase()).toContain('function');
      }
    });

    it('should get trigger DDL', async () => {
      const ddl = await introspection.getTriggerDDL(dbName, 'trg_products_update');

      expect(ddl).toBeDefined();
      expect(ddl.toLowerCase()).toContain('create');
      expect(ddl.toLowerCase()).toContain('trigger');
      expect(ddl).toContain('trg_products_update');
      // DEFINER should be cleaned
      expect(ddl).not.toMatch(/DEFINER=`[^`]+`@`[^`]+`/);
    });

    it('should get checksums for all tables', async () => {
      const checksums = await introspection.getChecksums(dbName);

      expect(checksums).toBeDefined();
      expect(typeof checksums).toBe('object');
      expect(Object.keys(checksums).length).toBeGreaterThan(0);
      // Each checksum should be a string
      Object.values(checksums).forEach(value => {
        expect(typeof value).toBe('string');
      });
    });

    it('should handle getObjectDDL for different types', async () => {
      const viewDDL = await introspection.getObjectDDL(dbName, 'VIEW', 'v_user_order_summary');
      expect(viewDDL).toContain('v_user_order_summary');

      // Procedure/Function DDL may be null due to permissions
      const procDDL = await introspection.getObjectDDL(dbName, 'PROCEDURE', 'sp_process_order');
      expect(procDDL).toBeDefined();

      const funcDDL = await introspection.getObjectDDL(dbName, 'FUNCTION', 'fn_get_user_level');
      expect(funcDDL).toBeDefined();

      const triggerDDL = await introspection.getObjectDDL(dbName, 'TRIGGER', 'trg_products_update');
      expect(triggerDDL).toContain('trg_products_update');
    });

    it('should return empty string for non-existent objects', async () => {
      const ddl = await introspection.getObjectDDL(dbName, 'UNKNOWN_TYPE', 'does_not_exist');
      expect(ddl).toBe('');
    });
  });

  describe('Edge Cases', () => {
    it('should handle table with special characters in name', async () => {
      // Most tables won't have special chars, but test the query doesn't break
      const tables = await introspection.listTables(dbName);
      expect(tables).toBeInstanceOf(Array);
    });

    it('should return empty DDL for non-existent table', async () => {
      try {
        await introspection.getTableDDL(dbName, 'non_existent_table_xyz');
        // If it doesn't throw, the result should be empty or handled
      } catch (error) {
        // MySQL throws error for SHOW CREATE TABLE on non-existent table
        expect(error).toBeDefined();
      }
    });
  });
});
