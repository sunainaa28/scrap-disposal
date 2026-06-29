import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;

// Load environment variables immediately
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface ScrapItem {
  id: string;
  srNo: number;
  materialDescription: string;
  materialNumber: string;
  uom: string;
  quantity: number;
  typeOfWaste: string;
  scrapLocation: string;
  isFromMaster?: boolean;
  category?: string;
  fromLocation?: string;
  toLocation?: string;
  photo?: string;
  descriptionReason?: string;
}

export interface ScrapRequest {
  id: string;
  requestNumber: string;
  date: string;
  department: string;
  items: ScrapItem[];
  reasonForDisposal: string;
  requirementCheck: 'yes' | 'no' | null;
  categoryVerification: 'yes' | 'no' | null;
  remarks: string;
  status: 'draft' | 'pending' | 'reviewed' | 'approved' | 'rejected';
  initiatedBy: {
    name: string;
    employeeId: string;
    designation: string;
    date: string;
  };
  reviewedBy: {
    name: string;
    designation: string;
    status: 'pending' | 'approved' | 'rejected';
  };
  approvedBy: {
    name: string;
    designation: string;
    status: 'pending' | 'approved' | 'rejected';
  };
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'requests.json');

// Helper to map DB row to ScrapRequest
function mapRequestRow(row: any, items: ScrapItem[]): ScrapRequest {
  return {
    id: row.id,
    requestNumber: row.request_number,
    date: row.request_date instanceof Date ? row.request_date.toISOString().split('T')[0] : row.request_date,
    department: row.system,
    items: items,
    reasonForDisposal: row.reason || '',
    requirementCheck: row.requirement_check || null,
    categoryVerification: row.category_verification || null,
    remarks: row.remarks || '',
    status: row.status,
    initiatedBy: typeof row.initiated_by === 'string' ? JSON.parse(row.initiated_by) : row.initiated_by,
    reviewedBy: typeof row.reviewed_by === 'string' ? JSON.parse(row.reviewed_by) : row.reviewed_by,
    approvedBy: typeof row.approved_by === 'string' ? JSON.parse(row.approved_by) : row.approved_by,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

// Helper to map DB row to ScrapItem
function mapItemRow(row: any): ScrapItem {
  return {
    id: row.id,
    srNo: row.sr_no,
    materialDescription: row.material_description,
    materialNumber: row.material_number,
    uom: row.uom,
    quantity: Number(row.quantity),
    typeOfWaste: row.type_of_waste || row.category || '',
    category: row.category || '',
    scrapLocation: row.from_location || '',
    fromLocation: row.from_location || '',
    toLocation: row.to_location || '',
    photo: row.scrap_photo || '',
    descriptionReason: row.description_reason || '',
  };
}

class Database {
  private pool: pg.Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'scrap_portal',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    });
    this.init();
  }

  private async init() {
    try {
      const dbName = process.env.DB_NAME || 'scrap_portal';

      // Connect to postgres first to check/create target database
      const initPool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: 'postgres',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
      });

      try {
        const initClient = await initPool.connect();
        try {
          const checkDb = await initClient.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [dbName]
          );
          if (checkDb.rows.length === 0) {
            console.log(`Database "${dbName}" does not exist. Creating...`);
            await initClient.query(`CREATE DATABASE ${dbName}`);
            console.log(`Database "${dbName}" created successfully.`);
          }
        } finally {
          initClient.release();
        }
      } catch (err) {
        console.warn('Could not verify/create database via default postgres db connection. Attempting direct connection...', err);
      } finally {
        await initPool.end();
      }

      // Connect to PostgreSQL
      const client = await this.pool.connect();
      console.log(`Connected to PostgreSQL database "${dbName}".`);

      // Create scrap_requests table if missing
      await client.query(`
        CREATE TABLE IF NOT EXISTS scrap_requests (
          id VARCHAR(255) PRIMARY KEY,
          request_number VARCHAR(255) NOT NULL,
          request_date DATE NOT NULL,
          system VARCHAR(255) NOT NULL,
          remarks TEXT,
          reason TEXT,
          status VARCHAR(50) NOT NULL,
          initiated_by JSONB,
          reviewed_by JSONB,
          approved_by JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          requirement_check VARCHAR(50),
          category_verification VARCHAR(50)
        );
      `);

      // Create scrap_items table if missing
      await client.query(`
        CREATE TABLE IF NOT EXISTS scrap_items (
          id VARCHAR(255) PRIMARY KEY,
          request_id VARCHAR(255) REFERENCES scrap_requests(id) ON DELETE CASCADE,
          sr_no INTEGER NOT NULL,
          material_description TEXT NOT NULL,
          material_number VARCHAR(255) NOT NULL,
          uom VARCHAR(50) NOT NULL,
          quantity INTEGER NOT NULL,
          category VARCHAR(255),
          from_location TEXT,
          to_location TEXT,
          scrap_photo TEXT,
          description_reason TEXT,
          type_of_waste VARCHAR(255)
        );
      `);

      // Create material_master table if missing
      await client.query(`
        CREATE TABLE IF NOT EXISTS material_master (
          material_number VARCHAR(255) PRIMARY KEY,
          material_description TEXT NOT NULL,
          uom VARCHAR(50) NOT NULL,
          category VARCHAR(255)
        );
      `);

      // Create indexes for faster description searching
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_material_desc ON material_master(material_description);
      `);

      client.release();

      // Run migrations and seed data
      await this.migrateDataIfNeeded();
      await this.seedMaterialsIfNeeded();
    } catch (error) {
      console.error('Error during database initialization:', error);
    }
  }

  private async migrateDataIfNeeded() {
    try {
      const res = await this.pool.query('SELECT COUNT(*) FROM scrap_requests');
      const count = parseInt(res.rows[0].count);
      if (count > 0) {
        console.log('Database already has requests, skipping JSON migration.');
        return;
      }

      if (!fs.existsSync(DATA_FILE)) {
        console.log(`JSON request file not found at ${DATA_FILE}, skipping migration.`);
        return;
      }

      console.log('Database requests table is empty. Migrating requests from JSON file...');
      const dataStr = fs.readFileSync(DATA_FILE, 'utf8');
      const requests = JSON.parse(dataStr) as ScrapRequest[];

      for (const req of requests) {
        await this.insert(req);
      }
      console.log(`Successfully migrated ${requests.length} requests from JSON to PostgreSQL.`);
    } catch (error) {
      console.error('Error migrating data from JSON to PostgreSQL:', error);
    }
  }

  private async seedMaterialsIfNeeded() {
    try {
      const res = await this.pool.query('SELECT COUNT(*) FROM material_master');
      const count = parseInt(res.rows[0].count);
      if (count > 0) {
        console.log('Database already has material master records, skipping materials seeding.');
        return;
      }

      let materialsPath = '';
      const pathsToTry = [
        path.resolve(__dirname, '../../public/materials.json'),
        path.resolve(process.cwd(), 'public/materials.json'),
        path.resolve(process.cwd(), '../public/materials.json'),
      ];

      for (const p of pathsToTry) {
        if (fs.existsSync(p)) {
          materialsPath = p;
          break;
        }
      }

      if (!materialsPath) {
        console.warn('Could not locate materials.json for seeding.');
        return;
      }

      console.log(`Found materials.json at ${materialsPath}. Loading and seeding materials...`);
      const raw = fs.readFileSync(materialsPath, 'utf8');
      const materials = JSON.parse(raw) as Array<{
        materialNumber: string;
        materialDescription: string;
        uom: string;
        materialGroup?: string;
        materialType?: string;
      }>;

      console.log(`Seeding ${materials.length} materials into database...`);

      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        const chunkSize = 2000;
        for (let i = 0; i < materials.length; i += chunkSize) {
          const chunk = materials.slice(i, i + chunkSize);
          const valueRows: string[] = [];
          const values: any[] = [];
          let paramIdx = 1;
          
          for (const item of chunk) {
            valueRows.push(`($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2}, $${paramIdx + 3})`);
            values.push(
              item.materialNumber,
              item.materialDescription,
              item.uom || 'Nos',
              item.materialGroup || item.materialType || ''
            );
            paramIdx += 4;
          }

          const queryText = `
            INSERT INTO material_master (material_number, material_description, uom, category)
            VALUES ${valueRows.join(', ')}
            ON CONFLICT (material_number) DO NOTHING
          `;
          await client.query(queryText, values);
        }
        await client.query('COMMIT');
        console.log(`Seeded ${materials.length} materials into material_master.`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error seeding material master:', error);
    }
  }

  public async getAll(): Promise<ScrapRequest[]> {
    const client = await this.pool.connect();
    try {
      const requestsRes = await client.query('SELECT * FROM scrap_requests ORDER BY created_at DESC');
      const itemsRes = await client.query('SELECT * FROM scrap_items ORDER BY sr_no ASC');

      const itemsMap = new Map<string, ScrapItem[]>();
      for (const itemRow of itemsRes.rows) {
        const reqId = itemRow.request_id;
        if (!itemsMap.has(reqId)) {
          itemsMap.set(reqId, []);
        }
        itemsMap.get(reqId)!.push(mapItemRow(itemRow));
      }

      return requestsRes.rows.map((row) => mapRequestRow(row, itemsMap.get(row.id) || []));
    } finally {
      client.release();
    }
  }

  public async getById(id: string): Promise<ScrapRequest | undefined> {
    const client = await this.pool.connect();
    try {
      const reqRes = await client.query('SELECT * FROM scrap_requests WHERE id = $1', [id]);
      if (reqRes.rows.length === 0) return undefined;

      const itemsRes = await client.query('SELECT * FROM scrap_items WHERE request_id = $1 ORDER BY sr_no ASC', [id]);
      return mapRequestRow(reqRes.rows[0], itemsRes.rows.map(mapItemRow));
    } finally {
      client.release();
    }
  }

  public async insert(request: ScrapRequest): Promise<ScrapRequest> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const reqQuery = `
        INSERT INTO scrap_requests (
          id, request_number, request_date, system, remarks, reason, status,
          initiated_by, reviewed_by, approved_by, created_at, updated_at,
          requirement_check, category_verification
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET
          request_number = EXCLUDED.request_number,
          request_date = EXCLUDED.request_date,
          system = EXCLUDED.system,
          remarks = EXCLUDED.remarks,
          reason = EXCLUDED.reason,
          status = EXCLUDED.status,
          initiated_by = EXCLUDED.initiated_by,
          reviewed_by = EXCLUDED.reviewed_by,
          approved_by = EXCLUDED.approved_by,
          updated_at = EXCLUDED.updated_at,
          requirement_check = EXCLUDED.requirement_check,
          category_verification = EXCLUDED.category_verification
      `;

      await client.query(reqQuery, [
        request.id,
        request.requestNumber,
        request.date,
        request.department || '',
        request.remarks,
        request.reasonForDisposal || '',
        request.status,
        JSON.stringify(request.initiatedBy),
        JSON.stringify(request.reviewedBy),
        JSON.stringify(request.approvedBy),
        request.createdAt || new Date().toISOString(),
        request.updatedAt || new Date().toISOString(),
        request.requirementCheck,
        request.categoryVerification,
      ]);

      await client.query('DELETE FROM scrap_items WHERE request_id = $1', [request.id]);

      if (request.items && request.items.length > 0) {
        for (const item of request.items) {
          const itemQuery = `
            INSERT INTO scrap_items (
              id, request_id, sr_no, material_description, material_number, uom, quantity,
              category, from_location, to_location, scrap_photo, description_reason, type_of_waste
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          `;
          await client.query(itemQuery, [
            item.id || Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
            request.id,
            item.srNo,
            item.materialDescription,
            item.materialNumber,
            item.uom,
            item.quantity,
            item.category || item.typeOfWaste || '',
            item.fromLocation || item.scrapLocation || '',
            item.toLocation || '',
            item.photo || '',
            item.descriptionReason || '',
            item.typeOfWaste || '',
          ]);
        }
      }

      await client.query('COMMIT');
      return request;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async update(id: string, requestData: Partial<ScrapRequest>): Promise<ScrapRequest | undefined> {
    const existing = await this.getById(id);
    if (!existing) return undefined;

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const updated = {
        ...existing,
        ...requestData,
        updatedAt: new Date().toISOString(),
      };

      const fields: string[] = [];
      const values: any[] = [];
      let index = 1;

      if (requestData.requestNumber !== undefined) {
        fields.push(`request_number = $${index++}`);
        values.push(updated.requestNumber);
      }
      if (requestData.date !== undefined) {
        fields.push(`request_date = $${index++}`);
        values.push(updated.date);
      }
      if (requestData.department !== undefined) {
        fields.push(`system = $${index++}`);
        values.push(updated.department);
      }
      if (requestData.remarks !== undefined) {
        fields.push(`remarks = $${index++}`);
        values.push(updated.remarks);
      }
      if (requestData.reasonForDisposal !== undefined) {
        fields.push(`reason = $${index++}`);
        values.push(updated.reasonForDisposal);
      }
      if (requestData.status !== undefined) {
        fields.push(`status = $${index++}`);
        values.push(updated.status);
      }
      if (requestData.initiatedBy !== undefined) {
        fields.push(`initiated_by = $${index++}`);
        values.push(JSON.stringify(updated.initiatedBy));
      }
      if (requestData.reviewedBy !== undefined) {
        fields.push(`reviewed_by = $${index++}`);
        values.push(JSON.stringify(updated.reviewedBy));
      }
      if (requestData.approvedBy !== undefined) {
        fields.push(`approved_by = $${index++}`);
        values.push(JSON.stringify(updated.approvedBy));
      }
      if (requestData.requirementCheck !== undefined) {
        fields.push(`requirement_check = $${index++}`);
        values.push(updated.requirementCheck);
      }
      if (requestData.categoryVerification !== undefined) {
        fields.push(`category_verification = $${index++}`);
        values.push(updated.categoryVerification);
      }

      fields.push(`updated_at = $${index++}`);
      values.push(updated.updatedAt);

      values.push(id);
      const updateReqQuery = `
        UPDATE scrap_requests
        SET ${fields.join(', ')}
        WHERE id = $${index}
      `;

      await client.query(updateReqQuery, values);

      if (requestData.items !== undefined) {
        await client.query('DELETE FROM scrap_items WHERE request_id = $1', [id]);
        for (const item of requestData.items) {
          const itemQuery = `
            INSERT INTO scrap_items (
              id, request_id, sr_no, material_description, material_number, uom, quantity,
              category, from_location, to_location, scrap_photo, description_reason, type_of_waste
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          `;
          await client.query(itemQuery, [
            item.id || Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
            id,
            item.srNo,
            item.materialDescription,
            item.materialNumber,
            item.uom,
            item.quantity,
            item.category || item.typeOfWaste || '',
            item.fromLocation || item.scrapLocation || '',
            item.toLocation || '',
            item.photo || '',
            item.descriptionReason || '',
            item.typeOfWaste || '',
          ]);
        }
      }

      await client.query('COMMIT');
      return updated;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async searchMaterials(q: string): Promise<any[]> {
    const query = `
      SELECT material_number as "materialNumber",
             material_description as "materialDescription",
             uom,
             category
      FROM material_master
      WHERE material_number ILIKE $1 OR material_description ILIKE $1
      LIMIT 15
    `;
    const res = await this.pool.query(query, [`%${q}%`]);
    return res.rows;
  }
}

export const db = new Database();
