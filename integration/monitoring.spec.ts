/**
 * Monitoring Service Integration Tests
 * 
 * Tests all monitoring methods against Docker MySQL
 */

import { MysqlDriver } from '../../andb-core/src/modules/driver/mysql/mysql.driver';
import { IMonitoringService } from '../../andb-core/src/common/interfaces/driver.interface';
import { dockerMysqlConfigs } from '../fixtures/database.fixtures';

describe('MysqlMonitoringService', () => {
  let driver: MysqlDriver;
  let monitoring: IMonitoringService;

  beforeAll(async () => {
    driver = new MysqlDriver(dockerMysqlConfigs.dev);
    await driver.connect();
    monitoring = driver.getMonitoringService();
  });

  afterAll(async () => {
    await driver.disconnect();
  });

  describe('Server Info', () => {
    it('should get MySQL version', async () => {
      const version = await monitoring.getVersion();

      expect(version).toBeDefined();
      expect(typeof version).toBe('string');
      expect(version).toMatch(/^\d+\.\d+\.\d+/); // e.g., 8.0.33
    });

    it('should get server status', async () => {
      const status = await monitoring.getStatus();

      expect(status).toBeInstanceOf(Array);
      expect(status.length).toBeGreaterThan(0);

      // Check some common status variables
      const variableNames = status.map((row: any) => row.Variable_name);
      expect(variableNames).toContain('Uptime');
      expect(variableNames).toContain('Threads_connected');
    });

    it('should get server variables', async () => {
      const variables = await monitoring.getVariables();

      expect(variables).toBeInstanceOf(Array);
      expect(variables.length).toBeGreaterThan(0);

      // Check some common variables
      const variableNames = variables.map((row: any) => row.Variable_name);
      expect(variableNames).toContain('version');
      expect(variableNames).toContain('max_connections');
      expect(variableNames).toContain('sql_mode');
    });
  });

  describe('Process & Connection Info', () => {
    it('should get process list', async () => {
      const processList = await monitoring.getProcessList();

      expect(processList).toBeInstanceOf(Array);
      expect(processList.length).toBeGreaterThan(0);

      // Our connection should be in the list
      const ourProcess = processList.find((p: any) =>
        p.User === 'dev_user' && p.db === 'dev_database'
      );
      expect(ourProcess).toBeDefined();
    });

    it('should get connection statistics', async () => {
      const connections = await monitoring.getConnections();

      expect(connections).toBeInstanceOf(Array);
      // At least one connection (ours)
      expect(connections.length).toBeGreaterThan(0);

      // Check structure
      const firstRow = connections[0];
      expect(firstRow).toHaveProperty('connections');
      expect(firstRow).toHaveProperty('USER');
    });

    it('should get active transactions (may fail due to permissions)', async () => {
      try {
        const transactions = await monitoring.getTransactions();
        expect(transactions).toBeInstanceOf(Array);
        // May be empty if no active transactions, that's OK
      } catch (error: any) {
        // User may lack permission to query innodb_trx
        expect(error.message).toMatch(/SELECT command denied|access denied/i);
      }
    });
  });

  describe('Performance Insights', () => {
    it('should measure query execution time', async () => {
      const start = Date.now();
      await monitoring.getProcessList();
      const duration = Date.now() - start;

      // Should complete quickly (under 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it('should handle multiple rapid calls', async () => {
      const promises = [
        monitoring.getVersion(),
        monitoring.getProcessList(),
        monitoring.getConnections(),
      ];

      const results = await Promise.all(promises);

      expect(results[0]).toBeDefined(); // version
      expect(results[1]).toBeInstanceOf(Array); // process list
      expect(results[2]).toBeInstanceOf(Array); // connections
    });
  });
});
