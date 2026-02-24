# 🔍 Test Gap Analysis — The Andb

This document analyzes the current testing state of The Andb project, focusing on Logic Tests (Unit) vs. Scenario Tests (E2E/Matrix).

## 🧩 1. Logic Tests (Unit)

_Focus: Internal algorithms, regex, and state management._

| Module         | Coverage Status | Missing / Weak Points                                                                                          |
| :------------- | :-------------- | :------------------------------------------------------------------------------------------------------------- |
| **Parser**     | ✅ Good         | Complex Procedures with nested `BEGIN...END`, Triggers with multiple statements, backtick escaping edge cases. |
| **Comparator** | 🟡 Partial      | Cross-table dependency sorting (ensuring tables are dropped/created in correct order to avoid FK errors).      |
| **Migrator**   | ✅ Good         | Partitioning logic (if supported), complex MariaDB vs MySQL 8.0 subtle syntax differences.                     |
| **Exporter**   | 🔴 None         | Needs filesystem mocking to ensure metadata and SQL files are written correctly.                               |

---

## 🎭 2. Scenario Tests (Matrix/Playground)

_Focus: Real-world SQL transformations via `andb playground`._

### ✅ Current Scenarios

- `add-column`, `modify-column` (type change), `new-table`, `drop-table`, `change-index` (Key -> Unique), `add-foreign-key`.

### ❌ Missing Scenarios (Gaps)

#### A. Columns & Constraints

- [ ] **Rename Column**: Testing if the system detects renaming or treats it as DROP + ADD.
- [ ] **Change Nullability**: `NULL` -> `NOT NULL` (and vice versa).
- [ ] **Change Default Value**: `DEFAULT NULL` -> `DEFAULT 0`.
- [ ] **Auto Increment**: Adding/Removing `AUTO_INCREMENT`.

#### B. Indexes

- [ ] **Drop Index**: Ensuring indexes can be removed properly.
- [ ] **Composite Index**: Changing column order in a multi-column index.
- [ ] **Rename Index**: (MySQL 5.7+ supports `RENAME INDEX`).

#### C. Foreign Keys

- [ ] **Drop Foreign Key**: Removing constraints.
- [ ] **Update Action**: Changing `ON DELETE RESTRICT` to `ON DELETE CASCADE`.

#### D. Routines & Views (High Priority Gap)

- [ ] **View Matrix**: New View, Changed View query, Drop View.
- [ ] **Procedure/Function Matrix**: Body changes, Parameter changes.
- [ ] **Trigger Matrix**: `BEFORE INSERT` -> `AFTER INSERT`, body logic changes.

#### E. Complex DB States

- [ ] **Empty to Full**: `source.sql` is empty, `target.sql` has 10+ related tables.
- [ ] **Character Set / Collation**: Changing table/column encoding.

---

## 🚀 Recommendation

We should prioritize **Section D (Routines & Views)** and **Section A (Rename/Nullability)** to make the Matrix suite truly robust.
