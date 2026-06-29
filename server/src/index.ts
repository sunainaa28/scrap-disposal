import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import { db } from './db.js';
import type { ScrapRequest } from './db.js';
import { authMiddleware } from './middleware/auth.js';

// Load .env from the server root directory and root project directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Apply authentication middleware to all api routes
app.use('/api', authMiddleware);

// Search materials master autocomplete
app.get('/api/materials/search', async (req, res) => {
  try {
    const q = req.query.q as string || '';
    if (q.trim().length < 2) {
      return res.json([]);
    }
    const results = await db.searchMaterials(q);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all requests
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await db.getAll();
    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single request by ID
app.get('/api/requests/:id', async (req, res) => {
  try {
    const request = await db.getById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new request
app.post('/api/requests', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'User context not found in request' });
    }

    const {
      id,
      requestNumber,
      date,
      department,
      items,
      reasonForDisposal,
      requirementCheck,
      categoryVerification,
      remarks,
      status,
    } = req.body;

    const newRequest: ScrapRequest = {
      id: id || Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
      requestNumber: requestNumber || `SDRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: date || new Date().toISOString().split('T')[0],
      department: department || '',
      items: items || [],
      reasonForDisposal: reasonForDisposal || '',
      requirementCheck: requirementCheck ?? null,
      categoryVerification: categoryVerification ?? null,
      remarks: remarks || '',
      status: status || 'draft',
      initiatedBy: {
        name: user.name,
        employeeId: user.employeeId || 'HMRL-EMP-MOCK',
        designation: user.designation || 'Initiator',
        date: new Date().toISOString().split('T')[0],
      },
      reviewedBy: {
        name: 'Priya Sharma', // Default reviewer placeholder until reviewed
        designation: 'Depot Manager',
        status: 'pending',
      },
      approvedBy: {
        name: 'Arun Reddy', // Default approver placeholder until approved
        designation: 'Head of Operations',
        status: 'pending',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedRequest = await db.insert(newRequest);
    res.status(201).json(savedRequest);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update standard fields of a request (e.g. updating a draft)
app.put('/api/requests/:id', async (req, res) => {
  try {
    const existing = await db.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const updated = await db.update(req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Review action (Depot Manager / Reviewer role)
app.put('/api/requests/:id/review', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (user.role !== 'reviewer' && user.role !== 'approver') {
      return res.status(403).json({ error: 'Only Reviewers or Approvers can review requests' });
    }

    const existing = await db.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const { status } = req.body; // 'approved' or 'rejected'
    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const nextStatus = status === 'approved' ? 'reviewed' : 'rejected';

    const updated = await db.update(req.params.id, {
      status: nextStatus,
      reviewedBy: {
        name: user.name,
        designation: user.designation || 'Depot Manager',
        status: status,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approve action (HOD / Approver role)
app.put('/api/requests/:id/approve', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (user.role !== 'approver') {
      return res.status(403).json({ error: 'Only Approvers (HODs) can approve requests' });
    }

    const existing = await db.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const { status } = req.body; // 'approved' or 'rejected'
    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    const nextStatus = status === 'approved' ? 'approved' : 'rejected';

    const updated = await db.update(req.params.id, {
      status: nextStatus,
      approvedBy: {
        name: user.name,
        designation: user.designation || 'Head of Operations',
        status: status,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
