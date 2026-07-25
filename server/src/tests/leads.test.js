require('dotenv').config();
process.env.JWT_ACCESS_SECRET = 'test_access_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.ACCESS_TOKEN_EXPIRY = '15m';
process.env.REFRESH_TOKEN_EXPIRY = '7d';

const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Activity = require('../models/Activity');

require('./setup');

// Helpers
const loginAs = async (email, password) => {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  return res.body.data.accessToken;
};

const setupUsers = async () => {
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
    isActive: true,
  });
  const member = await User.create({
    name: 'Member',
    email: 'member@test.com',
    password: 'password123',
    role: 'member',
    isActive: true,
  });
  const member2 = await User.create({
    name: 'Member2',
    email: 'member2@test.com',
    password: 'password123',
    role: 'member',
    isActive: true,
  });
  return { admin, member, member2 };
};

describe('Core Flow 1: Public Lead Submission', () => {
  it('should create a lead via public form without authentication', async () => {
    const res = await request(app).post('/api/v1/public/leads').send({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      company: 'ACME',
      requirement: 'Need CRM software',
      source: 'Website',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.lead.status).toBe('new');
    expect(res.body.data.lead.name).toBe('John Doe');
  });

  it('should reject public lead submission with missing required fields', async () => {
    const res = await request(app).post('/api/v1/public/leads').send({
      email: 'john@example.com',
    });

    expect(res.status).toBe(422);
  });

  it('should reject public lead with invalid email', async () => {
    const res = await request(app).post('/api/v1/public/leads').send({
      name: 'John',
      email: 'not-an-email',
      requirement: 'Need help',
    });

    expect(res.status).toBe(422);
  });
});

describe('Core Flow 2: Lead Assignment', () => {
  let adminToken, memberToken, member2Token, memberId, member2Id, leadId;

  beforeEach(async () => {
    const { admin, member, member2 } = await setupUsers();
    adminToken = await loginAs('admin@test.com', 'password123');
    memberToken = await loginAs('member@test.com', 'password123');
    member2Token = await loginAs('member2@test.com', 'password123');
    memberId = member._id.toString();
    member2Id = member2._id.toString();

    // Admin creates a lead
    const leadRes = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Lead',
        email: 'testlead@example.com',
        requirement: 'Test requirement',
      });
    leadId = leadRes.body.data.lead._id;
  });

  it('admin can view all leads', async () => {
    const res = await request(app)
      .get('/api/v1/leads')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.leads.length).toBeGreaterThan(0);
  });

  it('member cannot view unassigned lead', async () => {
    const res = await request(app)
      .get(`/api/v1/leads/${leadId}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
  });

  it('admin can assign lead to member', async () => {
    const res = await request(app)
      .patch(`/api/v1/leads/${leadId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ assignedTo: memberId });

    expect(res.status).toBe(200);
    expect(res.body.data.lead.assignedTo._id).toBe(memberId);
  });

  it('member can access lead after it is assigned to them', async () => {
    // Assign lead
    await request(app)
      .patch(`/api/v1/leads/${leadId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ assignedTo: memberId });

    // Member can now access it
    const res = await request(app)
      .get(`/api/v1/leads/${leadId}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.lead._id).toBe(leadId);
  });

  it('member cannot access a lead assigned to another member', async () => {
    // Assign to member2
    await request(app)
      .patch(`/api/v1/leads/${leadId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ assignedTo: member2Id });

    // Member (not member2) tries to access
    const res = await request(app)
      .get(`/api/v1/leads/${leadId}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
  });

  it('member only sees their assigned leads in list', async () => {
    // Assign one lead to member
    await request(app)
      .patch(`/api/v1/leads/${leadId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ assignedTo: memberId });

    // Create another lead not assigned to member
    await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Another Lead', email: 'other@example.com', requirement: 'Other req' });

    const res = await request(app)
      .get('/api/v1/leads')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    // Member should only see their assigned lead
    expect(res.body.data.leads.length).toBe(1);
    expect(res.body.data.leads[0].assignedTo._id).toBe(memberId);
  });

  it('member cannot delete a lead', async () => {
    await request(app)
      .patch(`/api/v1/leads/${leadId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ assignedTo: memberId });

    const res = await request(app)
      .delete(`/api/v1/leads/${leadId}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
  });
});

describe('Core Flow 3: Status Change Creates Activity', () => {
  let adminToken, leadId;

  beforeEach(async () => {
    await setupUsers();
    adminToken = await loginAs('admin@test.com', 'password123');

    const leadRes = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Status Test Lead',
        email: 'statustest@example.com',
        requirement: 'Testing status changes',
      });
    leadId = leadRes.body.data.lead._id;
  });

  it('status change creates an activity record', async () => {
    const res = await request(app)
      .patch(`/api/v1/leads/${leadId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'contacted' });

    expect(res.status).toBe(200);
    expect(res.body.data.lead.status).toBe('contacted');

    // Check activity was created
    const activityRes = await request(app)
      .get(`/api/v1/leads/${leadId}/activity`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(activityRes.status).toBe(200);
    const statusActivity = activityRes.body.data.activities.find(
      (a) => a.action === 'status_changed'
    );
    expect(statusActivity).toBeDefined();
    expect(statusActivity.metadata.from).toBe('new');
    expect(statusActivity.metadata.to).toBe('contacted');
  });

  it('should create activity when lead is created', async () => {
    const activityRes = await request(app)
      .get(`/api/v1/leads/${leadId}/activity`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(activityRes.status).toBe(200);
    const createdActivity = activityRes.body.data.activities.find(
      (a) => a.action === 'lead_created'
    );
    expect(createdActivity).toBeDefined();
  });
});

describe('Notes', () => {
  let adminToken, memberToken, memberId, leadId;

  beforeEach(async () => {
    const { member } = await setupUsers();
    adminToken = await loginAs('admin@test.com', 'password123');
    memberToken = await loginAs('member@test.com', 'password123');
    memberId = member._id.toString();

    const leadRes = await request(app)
      .post('/api/v1/leads')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Note Lead', email: 'notelead@example.com', requirement: 'For notes' });
    leadId = leadRes.body.data.lead._id;

    // Assign to member
    await request(app)
      .patch(`/api/v1/leads/${leadId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ assignedTo: memberId });
  });

  it('member can add note to assigned lead', async () => {
    const res = await request(app)
      .post(`/api/v1/leads/${leadId}/notes`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ content: 'Called the client, they are interested' });

    expect(res.status).toBe(201);
    expect(res.body.data.note.content).toBe('Called the client, they are interested');
  });

  it('can retrieve notes for a lead', async () => {
    await request(app)
      .post(`/api/v1/leads/${leadId}/notes`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ content: 'Admin note' });

    const res = await request(app)
      .get(`/api/v1/leads/${leadId}/notes`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.notes.length).toBe(1);
  });
});

describe('Leads Pagination and Filtering', () => {
  let adminToken;

  beforeEach(async () => {
    await setupUsers();
    adminToken = await loginAs('admin@test.com', 'password123');

    // Create multiple leads
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Lead ${i}`,
          email: `lead${i}@example.com`,
          requirement: 'Test requirement',
          status: i < 3 ? 'new' : 'contacted',
        });
    }
  });

  it('should paginate results', async () => {
    const res = await request(app)
      .get('/api/v1/leads?page=1&limit=2')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.leads.length).toBe(2);
    expect(res.body.data.total).toBe(5);
    expect(res.body.data.totalPages).toBe(3);
  });

  it('should filter by status', async () => {
    const res = await request(app)
      .get('/api/v1/leads?status=new')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.leads.every((l) => l.status === 'new')).toBe(true);
  });
});
