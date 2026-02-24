/**
 * Test Fixtures - Database Configurations
 */

export const dockerMysqlConfigs = {
  dev: {
    host: '127.0.0.1',
    port: 3306,
    user: 'dev_user',
    password: 'dev_pass',
    database: 'dev_database',
  },
  stage: {
    host: '127.0.0.1',
    port: 3307,
    user: 'stage_user',
    password: 'stage_pass',
    database: 'stage_database',
  },
  uat: {
    host: '127.0.0.1',
    port: 3308,
    user: 'uat_user',
    password: 'uat_pass',
    database: 'uat_database',
  },
  prod: {
    host: '127.0.0.1',
    port: 3309,
    user: 'prod_user',
    password: 'prod_pass',
    database: 'prod_database',
  },
};

// Root config for sandbox execution layer (CREATE/DROP DATABASE)
export const sandboxRootConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'root123',
  database: '',
};

export const dockerSshConfig = {
  host: '127.0.0.1',
  port: 2222,
  username: 'andbuser',
  password: 'andbpass',
};

// Docker internal hostnames (for SSH tunnel)
export const dockerInternalHosts = {
  mysqlDev: 'mysql-dev',
  mysqlStage: 'mysql-stage',
  mysqlUat: 'mysql-uat',
  mysqlProd: 'mysql-prod',
};
