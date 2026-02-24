/**
 * MySQL Docker Integration Tests
 *
 * Prerequisites:
 *   cd docker && docker-compose up -d
 *
 * Resources:
 *   - mysql-dev:   localhost:3306 (dev_user/dev_pass, dev_database)
 *   - mysql-stage: localhost:3307 (stage_user/stage_pass, stage_database)
 *   - mysql-uat:   localhost:3308 (uat_user/uat_pass, uat_database)
 *   - mysql-prod:  localhost:3309 (prod_user/prod_pass, prod_database)
 *   - ssh-server:  localhost:2222 (andbuser/andbpass)
 */

import { MysqlDriver } from '../../andb-core/src/modules/driver/mysql/mysql.driver';
import { SshTunnel } from '../../andb-core/src/modules/driver/ssh-tunnel';
import { IDatabaseConfig } from '../../andb-core/src/common/interfaces/driver.interface';
import { ISshConfig } from '../../andb-core/src/common/interfaces/connection.interface';
import { dockerMysqlConfigs, dockerSshConfig, dockerInternalHosts } from '../fixtures/database.fixtures';

describe('MySQL Docker Integration Tests', () => {
  const devConfig: IDatabaseConfig = dockerMysqlConfigs.dev;
  const stageConfig: IDatabaseConfig = dockerMysqlConfigs.stage;

  describe('Direct Connection (No SSH)', () => {
    let driver: MysqlDriver;

    afterEach(async () => {
      if (driver) {
        await driver.disconnect();
      }
    });

    it('should connect to DEV database', async () => {
      driver = new MysqlDriver(devConfig);
      await driver.connect();

      const result = await driver.query('SELECT 1 as test');
      expect(result).toBeDefined();
      expect(result[0]?.test).toBe(1);
    });

    it('should connect to STAGE database', async () => {
      driver = new MysqlDriver(stageConfig);
      await driver.connect();

      const result = await driver.query('SELECT 1 as test');
      expect(result).toBeDefined();
    });

    it('should introspect tables from DEV', async () => {
      driver = new MysqlDriver(devConfig);
      await driver.connect();

      const result = await driver.query(
        `SELECT TABLE_NAME FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = 'dev_database' AND TABLE_TYPE = 'BASE TABLE'
         LIMIT 10`,
      );

      expect(result.length).toBeGreaterThan(0);
      const tableNames = result.map((r: any) => r.TABLE_NAME);
      expect(tableNames).toContain('users');
      expect(tableNames).toContain('products');
    });

    it('should introspect views from DEV', async () => {
      driver = new MysqlDriver(devConfig);
      await driver.connect();

      const result = await driver.query(
        `SELECT TABLE_NAME FROM information_schema.VIEWS 
         WHERE TABLE_SCHEMA = 'dev_database'`,
      );

      expect(result.length).toBeGreaterThan(0);
      const viewNames = result.map((r: any) => r.TABLE_NAME);
      expect(viewNames).toContain('v_user_order_summary');
    });

    it('should introspect routines from DEV', async () => {
      driver = new MysqlDriver(devConfig);
      await driver.connect();

      const result = await driver.query(
        `SELECT ROUTINE_NAME, ROUTINE_TYPE FROM information_schema.ROUTINES 
         WHERE ROUTINE_SCHEMA = 'dev_database'`,
      );

      expect(result.length).toBeGreaterThanOrEqual(2);
      const routineNames = result.map((r: any) => r.ROUTINE_NAME);
      expect(routineNames).toContain('sp_process_order');
      expect(routineNames).toContain('fn_get_user_level');
    });

    it('should handle connection errors gracefully', async () => {
      const badConfig: IDatabaseConfig = {
        host: '127.0.0.1',
        port: 9999, // Invalid port
        user: 'invalid',
        password: 'invalid',
        database: 'invalid',
      };

      driver = new MysqlDriver(badConfig);

      await expect(driver.connect()).rejects.toThrow();
    });
  });

  describe('SSH Tunnel Connection', () => {
    const sshConfig: ISshConfig = dockerSshConfig;

    // SSH tunnel to mysql-dev container (internal Docker network)
    const configWithSsh: IDatabaseConfig = {
      host: dockerInternalHosts.mysqlDev,
      port: 3306,
      user: 'dev_user',
      password: 'dev_pass',
      database: 'dev_database',
      sshConfig,
    };

    let driver: MysqlDriver;

    afterEach(async () => {
      if (driver) {
        await driver.disconnect();
      }
    });

    it('should connect via SSH tunnel', async () => {
      driver = new MysqlDriver(configWithSsh);
      await driver.connect();

      const result = await driver.query('SELECT 1 as test');
      expect(result).toBeDefined();
      expect(result[0]?.test).toBe(1);
    }, 30000);

    it('should introspect tables via SSH tunnel', async () => {
      driver = new MysqlDriver(configWithSsh);
      await driver.connect();

      const result = await driver.query(
        `SELECT TABLE_NAME FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = 'dev_database' AND TABLE_TYPE = 'BASE TABLE'
         LIMIT 5`,
      );

      expect(result.length).toBeGreaterThan(0);
    }, 30000);

    it('should handle SSH auth failure gracefully', async () => {
      const badSshConfig: ISshConfig = {
        host: '127.0.0.1',
        port: 2222,
        username: 'wronguser',
        password: 'wrongpass',
      };

      const configWithBadSsh: IDatabaseConfig = {
        ...devConfig,
        host: dockerInternalHosts.mysqlDev,
        sshConfig: badSshConfig,
      };

      driver = new MysqlDriver(configWithBadSsh);

      await expect(driver.connect()).rejects.toThrow();
    }, 30000);
  });

  describe('SshTunnel Utility', () => {
    const sshConfig: ISshConfig = dockerSshConfig;

    it('should establish SSH tunnel and forward to MySQL', async () => {
      const tunnel = new SshTunnel(sshConfig);

      try {
        const stream = await tunnel.forward(dockerInternalHosts.mysqlDev, 3306);
        expect(stream).toBeDefined();
        expect(stream.readable).toBe(true);
        expect(stream.writable).toBe(true);
      } finally {
        tunnel.close();
      }
    }, 15000);

    it('should handle invalid destination host', async () => {
      const tunnel = new SshTunnel(sshConfig);

      try {
        await expect(tunnel.forward('invalid-host', 3306)).rejects.toThrow();
      } finally {
        tunnel.close();
      }
    }, 15000);
  });
});
