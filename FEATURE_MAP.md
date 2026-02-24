# @the-andb/core — Feature Map & Test Coverage

> Last updated: 2026-02-05

## 📊 Overview

| Module             | Status    | Test Coverage | Issues          |
| ------------------ | --------- | ------------- | --------------- |
| **Driver (MySQL)** | ✅ Stable | ✅ Good       | -               |
| **SSH Tunnel**     | ✅ Stable | ✅ Good       | -               |
| **Introspection**  | ✅ Stable | ✅ Good       | -               |
| **Monitoring**     | ✅ Stable | ✅ Good       | -               |
| **Parser**         | ✅ Stable | ✅ Good       | Complex regex   |
| **Comparator**     | ✅ Stable | ✅ Good       | -               |
| **Exporter**       | ✅ Stable | 🔴 None       | Filesystem deps |
| **Migrator**       | ✅ Stable | ✅ Good       | -               |
| **Reporter**       | ✅ Stable | ✅ Good       | Template deps   |

---

## 🔌 Driver Module

### MysqlDriver (`mysql.driver.ts`)

| Method                      | Status | Tested | Notes                     |
| --------------------------- | ------ | ------ | ------------------------- |
| `connect()`                 | ✅     | ✅     | Direct + SSH modes        |
| `disconnect()`              | ✅     | ✅     | -                         |
| `query()`                   | ✅     | ✅     | Tested via introspection  |
| `getIntrospectionService()` | ✅     | ✅     | -                         |
| `getMonitoringService()`    | ✅     | ✅     | -                         |
| `getSessionContext()`       | ✅     | ✅     | -                         |
| `setForeignKeyChecks()`     | ✅     | ✅     | -                         |
| `generateUserSetupScript()` | ✅     | ✅     | Complex permissions logic |

### SshTunnel (`ssh-tunnel.ts`)

| Method         | Status | Tested | Notes               |
| -------------- | ------ | ------ | ------------------- |
| `forward()`    | ✅     | ✅     | Via MySQL tests     |
| `close()`      | ✅     | ✅     | Via cleanup         |
| Error handling | ✅     | ✅     | Bad auth + bad host |

---

## 🔍 Introspection Module

### MysqlIntrospectionService (`mysql.introspection.ts`)

| Method              | Status | Tested | Notes              |
| ------------------- | ------ | ------ | ------------------ |
| `listTables()`      | ✅     | ✅     | Via integration    |
| `listViews()`       | ✅     | ✅     | Via integration    |
| `listProcedures()`  | ✅     | ✅     | -                  |
| `listFunctions()`   | ✅     | ✅     | -                  |
| `listTriggers()`    | ✅     | ✅     | -                  |
| `listEvents()`      | ✅     | ✅     | -                  |
| `getTableDDL()`     | ✅     | ✅     | -                  |
| `getViewDDL()`      | ✅     | ✅     | -                  |
| `getProcedureDDL()` | ✅     | ✅     | May be null (perm) |
| `getFunctionDDL()`  | ✅     | ✅     | May be null (perm) |
| `getTriggerDDL()`   | ✅     | ✅     | -                  |
| `getEventDDL()`     | ✅     | ✅     | -                  |
| `getChecksums()`    | ✅     | ✅     | -                  |
| `getObjectDDL()`    | ✅     | ✅     | Generic wrapper    |

---

## 📈 Monitoring Module

### MysqlMonitoringService (`mysql.monitoring.ts`)

| Method              | Status | Tested | Notes                   |
| ------------------- | ------ | ------ | ----------------------- |
| `getProcessList()`  | ✅     | ✅     | SHOW FULL PROCESSLIST   |
| `getStatus()`       | ✅     | ✅     | SHOW STATUS             |
| `getVariables()`    | ✅     | ✅     | SHOW VARIABLES          |
| `getVersion()`      | ✅     | ✅     | SELECT VERSION()        |
| `getConnections()`  | ✅     | ✅     | info_schema.PROCESSLIST |
| `getTransactions()` | ✅     | ✅     | innodb_trx (perm check) |

---

## 🔄 Comparator Module

### ComparatorService (`comparator.service.ts`)

| Method                | Status | Tested | Notes                        |
| --------------------- | ------ | ------ | ---------------------------- |
| `compareTables()`     | ✅     | 🔴     | Column/Index diff            |
| `compareColumns()`    | ✅     | 🔴     | ADD/DROP/MODIFY              |
| `compareIndexes()`    | ✅     | 🔴     | ADD/DROP                     |
| `compareGenericDDL()` | ✅     | 🔴     | Views/Procs/Functions/Events |
| `compareTriggers()`   | ✅     | 🔴     | Special handling             |
| `compareSchema()`     | ✅     | 🔴     | Full schema diff             |

---

## 📤 Exporter Module

### ExporterService (`exporter.service.ts`)

| Method           | Status | Tested | Notes                |
| ---------------- | ------ | ------ | -------------------- |
| `exportSchema()` | ✅     | 🔴     | Filesystem + Storage |

**Dependencies**: Requires ProjectConfigService, StorageService

---

## 🔧 Migrator Module

### MigratorService (`migrator.service.ts`)

| Method                | Status | Tested | Notes                  |
| --------------------- | ------ | ------ | ---------------------- |
| `generateAlterSQL()`  | ✅     | 🔴     | Table ALTER statements |
| `generateObjectSQL()` | ✅     | 🔴     | CREATE/DROP objects    |
| `generateSchemaSQL()` | ✅     | 🔴     | Full migration script  |

---

## 📝 Parser Module

### ParserService (`parser.service.ts`)

| Method                | Status | Tested | Notes                |
| --------------------- | ------ | ------ | -------------------- |
| `cleanDefiner()`      | ✅     | 🔴     | Regex-based          |
| `splitRoutine()`      | ✅     | 🔴     | Header/Body split    |
| `normalize()`         | ✅     | 🔴     | DDL normalization    |
| `uppercaseKeywords()` | ✅     | 🔴     | 330+ lines of regex  |
| `parseTable()`        | ✅     | 🔴     | Column/Index parsing |
| `parseTrigger()`      | ✅     | 🔴     | Trigger parsing      |

---

## 📊 Reporter Module

### ReporterService (`reporter.service.ts`)

| Method                 | Status | Tested | Notes          |
| ---------------------- | ------ | ------ | -------------- |
| `generateHtmlReport()` | ✅     | 🔴     | Template-based |

**Dependencies**: Requires `templates/template.html`

---

## 🎯 Test Priority Matrix

### Priority 1 — Core Functionality (Next Sprint)

- [ ] `MysqlIntrospectionService.listProcedures/Functions/Triggers/Events`
- [ ] `MysqlIntrospectionService.get*DDL()` methods
- [ ] `MysqlMonitoringService.*` all methods
- [ ] `MysqlDriver.getSessionContext()`
- [ ] `MysqlDriver.setForeignKeyChecks()`

### Priority 2 — Business Logic

- [x] `ParserService.parseTable()` — complex regex, needs fixtures
- [x] `ParserService.parseTrigger()` — needs fixtures
- [x] `ComparatorService.compareTables()` — needs mock DDL pairs
- [x] `ComparatorService.compareSchema()` — needs two introspection services

### Priority 3 — Integration Tests

- [ ] `MysqlDriver.generateUserSetupScript()` — test script generation
- [ ] `ExporterService.exportSchema()` — filesystem mocking
- [ ] `MigratorService.generateSchemaSQL()` — needs schema diff input

### Priority 4 — Reports & Outputs

- [x] `ReporterService.generateHtmlReport()` — template testing

---

## 🐛 Known Issues

| Module   | Issue                                             | Severity  |
| -------- | ------------------------------------------------- | --------- |
| Parser   | Large regex in `uppercaseKeywords()` (330+ lines) | 🟡 Medium |
| Exporter | Hardcoded `process.cwd()` paths                   | 🟡 Medium |
| Reporter | Template file resolution fallback logic           | 🟢 Low    |

---

## 📈 Test Statistics

| Metric                 | Current | Target |
| ---------------------- | ------- | ------ |
| Integration tests      | **47**  | 60+    |
| Test suites            | 4       | 8+     |
| Modules with tests     | 5/9     | 9/9    |
| Introspection coverage | ✅ 16   | ✅     |
| Monitoring coverage    | ✅ 8    | ✅     |
| Driver extras coverage | ✅ 12   | ✅     |
| SSH tunnel tests       | ✅ 3    | ✅     |
| Error handling tests   | ✅ 5    | 8+     |

---

## 📁 Test Files

```
andb-test/
├── integration/
│   ├── mysql-docker.spec.ts       # ✅ 11 tests
│   ├── introspection.spec.ts      # ✅ 16 tests
│   ├── monitoring.spec.ts         # ✅ 8 tests
│   ├── driver-advanced.spec.ts    # ✅ 12 tests
│   └── comparator.spec.ts         # 🔴 TODO
├── e2e/
│   └── (placeholder)
├── fixtures/
│   ├── database.fixtures.ts       # ✅
│   ├── ddl.fixtures.ts            # 🔴 TODO
│   └── schema.fixtures.ts         # 🔴 TODO
└── setup/
    ├── integration.setup.ts       # ✅
    └── e2e.setup.ts               # ✅
```
