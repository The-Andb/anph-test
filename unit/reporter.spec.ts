import { ReporterService } from '../../andb-core/src/modules/reporter/reporter.service';
import { ISchemaDiff } from '../../andb-core/src/common/interfaces/diff.interface';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs
jest.mock('fs');

describe('ReporterService Unit', () => {
  let reporter: ReporterService;

  beforeEach(() => {
    reporter = new ReporterService();
    jest.resetAllMocks();
  });

  describe('generateHtmlReport', () => {
    it('should generate an HTML report string properly resolving template', async () => {
      // Setup mock diff
      const diff: ISchemaDiff = {
        summary: { totalChanges: 2, tablesChanged: 1, objectsChanged: 1 },
        droppedTables: ['old_table'],
        tables: {
          users: {
            tableName: 'users',
            hasChanges: true,
            operations: [
              { type: 'ADD', target: 'COLUMN', name: 'age', definition: 'int' }
            ],
          },
        },
        objects: [
          { type: 'VIEW', name: 'vw_users', operation: 'CREATE' },
        ],
      };

      // Mock fs readFileSync to return a fake HTML template
      const fakeTemplate = '<html><body>{{ENV}} | {{TABLE_NEW}} | {{TABLE_UPDATE}} | {{TABLE_DEPRECATED}} | {{VIEW_NEW}}</body></html>';
      (fs.readFileSync as jest.Mock).mockReturnValue(fakeTemplate);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.mkdirSync as jest.Mock).mockReturnValue(true);
      (fs.writeFileSync as jest.Mock).mockReturnValue(true);

      const outputPath = '/fake/path/report.html';
      const resultPath = await reporter.generateHtmlReport('test-env', 'db_test', diff, outputPath);

      expect(resultPath).toBe(outputPath);

      // Verify writeFileSync got called with replaced string
      const writeCall = (fs.writeFileSync as jest.Mock).mock.calls[0];
      expect(writeCall[0]).toBe(outputPath);
      const generatedHtml = writeCall[1];

      // Check replacements
      expect(generatedHtml).toContain('test-env');
      expect(generatedHtml).toContain('<li>users</li>'); // Updated table
      expect(generatedHtml).toContain('<li>old_table</li>'); // Dropped table
      expect(generatedHtml).toContain('<li>vw_users</li>'); // New view
    });
  });
});
