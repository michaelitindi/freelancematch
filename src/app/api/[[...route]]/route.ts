import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import db, { generateId, jsonParse } from '@/lib/db';
import { Polar } from '@polar-sh/sdk';
import { generateToken, verifyToken, hashPassword, verifyPassword, cookieOptions } from '@/lib/auth';

type Variables = {
  user: { userId: string; email: string; role: string } | null;
};

const app = new Hono<{ Variables: Variables }>().basePath('/api');

// Middleware
app.use('*', cors({
  origin: '*',
  credentials: true,
}));

// Initialize Polar client (will use env var)
const polar = process.env.POLAR_ACCESS_TOKEN 
  ? new Polar({ accessToken: process.env.POLAR_ACCESS_TOKEN })
  : null;

const COOKIE_NAME = 'fm_session';

// Auth middleware
async function authMiddleware(c: any, next: () => Promise<void>) {
  const token = getCookie(c, COOKIE_NAME);
  
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      c.set('user', payload);
    }
  }
  
  await next();
}

// Apply auth middleware to all routes
app.use('*', authMiddleware);

// ============ AUTH ROUTES ============

app.post('/auth/register', async (c) => {
  const { email, password, name, role } = await c.req.json();
  
  const id = generateId();
  const passwordHash = hashPassword(password);
  
  try {
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, email, passwordHash, name, role || 'freelancer');
    
    // Create profile based on role
    if (role === 'buyer') {
      db.prepare(`
        INSERT INTO buyer_profiles (id, user_id)
        VALUES (?, ?)
      `).run(generateId(), id);
    } else {
      db.prepare(`
        INSERT INTO freelancer_profiles (id, user_id)
        VALUES (?, ?)
      `).run(generateId(), id);
    }
    
    // Create activity
    db.prepare(`
      INSERT INTO activities (id, user_id, type, title, description)
      VALUES (?, ?, 'account_created', 'Account Created', 'Welcome to FreelanceMatch!')
    `).run(generateId(), id);
    
    const user = db.prepare('SELECT id, email, name, role, avatar, kyc_status FROM users WHERE id = ?').get(id) as any;
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    // Set cookie
    setCookie(c, COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    return c.json({ success: true, user, token });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json();
  
  const user = db.prepare(`
    SELECT id, email, name, role, avatar, kyc_status, is_online, password_hash
    FROM users WHERE email = ?
  `).get(email) as any;
  
  if (!user) {
    return c.json({ success: false, error: 'Invalid credentials' }, 401);
  }
  
  // Verify password (support both old base64 and new hash)
  const isValidOld = Buffer.from(password).toString('base64') === user.password_hash;
  const isValidNew = verifyPassword(password, user.password_hash);
  
  if (!isValidOld && !isValidNew) {
    return c.json({ success: false, error: 'Invalid credentials' }, 401);
  }
  
  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  
  // Set cookie
  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  
  // Remove password_hash from response
  const { password_hash, ...userWithoutPassword } = user;
  
  return c.json({ success: true, user: userWithoutPassword, token });
});

app.post('/auth/logout', async (c) => {
  deleteCookie(c, COOKIE_NAME, { path: '/' });
  return c.json({ success: true });
});

app.get('/auth/me', async (c) => {
  const authUser = c.get('user');
  
  if (!authUser) {
    return c.json({ success: false, error: 'Not authenticated' }, 401);
  }
  
  const user = db.prepare(`
    SELECT id, email, name, role, avatar, kyc_status, is_online
    FROM users WHERE id = ?
  `).get(authUser.userId);
  
  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }
  
  return c.json({ success: true, user });
});

app.post('/auth/refresh', async (c) => {
  const authUser = c.get('user');
  
  if (!authUser) {
    return c.json({ success: false, error: 'Not authenticated' }, 401);
  }
  
  // Generate new token
  const token = generateToken({
    userId: authUser.userId,
    email: authUser.email,
    role: authUser.role,
  });
  
  // Set new cookie
  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  
  return c.json({ success: true, token });
});

// ============ USER ROUTES ============

app.get('/users/:id', (c) => {
  const id = c.req.param('id');
  const user = db.prepare(`
    SELECT id, email, name, role, avatar, bio, kyc_status, is_online, created_at
    FROM users WHERE id = ?
  `).get(id);
  
  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }
  
  return c.json(user);
});

app.patch('/users/:id', async (c) => {
  const id = c.req.param('id');
  const updates = await c.req.json();
  
  const allowedFields = ['name', 'avatar', 'bio', 'is_online'];
  const setClause = Object.keys(updates)
    .filter(k => allowedFields.includes(k))
    .map(k => `${k} = ?`)
    .join(', ');
  
  if (!setClause) {
    return c.json({ error: 'No valid fields to update' }, 400);
  }
  
  const values = Object.keys(updates)
    .filter(k => allowedFields.includes(k))
    .map(k => updates[k]);
  
  db.prepare(`UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(...values, id);
  
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return c.json(user);
});

app.patch('/users/:id/availability', async (c) => {
  const id = c.req.param('id');
  const { isOnline } = await c.req.json();
  
  db.prepare('UPDATE users SET is_online = ? WHERE id = ?').run(isOnline ? 1 : 0, id);
  
  return c.json({ success: true, isOnline });
});

// ============ FREELANCER PROFILE ROUTES ============

app.get('/freelancers', (c) => {
  const category = c.req.query('category');
  const online = c.req.query('online');
  
  let query = `
    SELECT u.id, u.name, u.avatar, u.is_online, fp.*
    FROM users u
    JOIN freelancer_profiles fp ON u.id = fp.user_id
    WHERE u.role = 'freelancer'
  `;
  
  const params: any[] = [];
  
  if (online === 'true') {
    query += ' AND u.is_online = 1';
  }
  
  if (category) {
    query += ' AND fp.categories LIKE ?';
    params.push(`%${category}%`);
  }
  
  query += ' ORDER BY fp.rating DESC';
  
  const freelancers = db.prepare(query).all(...params);
  return c.json(freelancers);
});

app.get('/freelancers/:userId', (c) => {
  const userId = c.req.param('userId');
  
  const profile = db.prepare(`
    SELECT u.id, u.name, u.email, u.avatar, u.bio, u.is_online, u.kyc_status, fp.*
    FROM users u
    JOIN freelancer_profiles fp ON u.id = fp.user_id
    WHERE u.id = ?
  `).get(userId);
  
  if (!profile) {
    return c.json({ error: 'Freelancer not found' }, 404);
  }
  
  return c.json(profile);
});

app.patch('/freelancers/:userId', async (c) => {
  const userId = c.req.param('userId');
  const updates = await c.req.json();
  
  const allowedFields = ['categories', 'experience_years', 'hourly_rate', 'availability', 'skills', 'portfolio_url'];
  const setClause = Object.keys(updates)
    .filter(k => allowedFields.includes(k))
    .map(k => `${k} = ?`)
    .join(', ');
  
  if (setClause) {
    const values = Object.keys(updates)
      .filter(k => allowedFields.includes(k))
      .map(k => typeof updates[k] === 'object' ? JSON.stringify(updates[k]) : updates[k]);
    
    db.prepare(`UPDATE freelancer_profiles SET ${setClause} WHERE user_id = ?`)
      .run(...values, userId);
  }
  
  const profile = db.prepare('SELECT * FROM freelancer_profiles WHERE user_id = ?').get(userId);
  return c.json(profile);
});

// ============ PROJECT ROUTES ============

app.post('/projects', async (c) => {
  const { buyerId, title, description, category, budget, milestones } = await c.req.json();
  
  const projectId = generateId();
  
  db.prepare(`
    INSERT INTO projects (id, buyer_id, title, description, category, budget)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(projectId, buyerId, title, description, category, budget);
  
  // Create milestones if provided
  if (milestones && Array.isArray(milestones)) {
    const insertMilestone = db.prepare(`
      INSERT INTO milestones (id, project_id, title, description, amount, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    for (const m of milestones) {
      insertMilestone.run(generateId(), projectId, m.title, m.description, m.amount, m.dueDate);
    }
  }
  
  // Create activity
  db.prepare(`
    INSERT INTO activities (id, user_id, type, title, description, metadata)
    VALUES (?, ?, 'project_created', 'New Project Posted', ?, ?)
  `).run(generateId(), buyerId, title, JSON.stringify({ projectId, budget }));
  
  // Trigger matching algorithm
  await triggerMatching(projectId, category);
  
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  return c.json(project);
});

app.get('/projects', (c) => {
  const buyerId = c.req.query('buyerId');
  const freelancerId = c.req.query('freelancerId');
  const status = c.req.query('status');
  
  let query = 'SELECT * FROM projects WHERE 1=1';
  const params: any[] = [];
  
  if (buyerId) {
    query += ' AND buyer_id = ?';
    params.push(buyerId);
  }
  
  if (freelancerId) {
    query += ' AND freelancer_id = ?';
    params.push(freelancerId);
  }
  
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const projects = db.prepare(query).all(...params);
  return c.json(projects);
});

app.get('/projects/:id', (c) => {
  const id = c.req.param('id');
  
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
  
  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }
  
  // Get milestones
  const milestones = db.prepare('SELECT * FROM milestones WHERE project_id = ?').all(id);
  
  // Get deliverables
  const deliverables = db.prepare('SELECT * FROM deliverables WHERE project_id = ?').all(id);
  
  // Get buyer and freelancer info
  const buyer = db.prepare('SELECT id, name, avatar FROM users WHERE id = ?').get(project.buyer_id);
  const freelancer = project.freelancer_id 
    ? db.prepare('SELECT id, name, avatar FROM users WHERE id = ?').get(project.freelancer_id)
    : null;
  
  return c.json({ ...project, milestones, deliverables, buyer, freelancer });
});

app.patch('/projects/:id', async (c) => {
  const id = c.req.param('id');
  const updates = await c.req.json();
  
  const allowedFields = ['status', 'freelancer_id'];
  const setClause = Object.keys(updates)
    .filter(k => allowedFields.includes(k))
    .map(k => `${k} = ?`)
    .join(', ');
  
  if (setClause) {
    const values = Object.keys(updates)
      .filter(k => allowedFields.includes(k))
      .map(k => updates[k]);
    
    db.prepare(`UPDATE projects SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(...values, id);
  }
  
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  return c.json(project);
});

// ============ MATCHING ROUTES ============

async function triggerMatching(projectId: string, category: string) {
  // Get online freelancers in the category
  const freelancers = db.prepare(`
    SELECT u.id, u.is_online, fp.categories, fp.rating, fp.total_jobs, fp.jobs_completed
    FROM users u
    JOIN freelancer_profiles fp ON u.id = fp.user_id
    WHERE u.role = 'freelancer' AND u.is_online = 1
  `).all() as any[];
  
  // Calculate match scores
  for (const freelancer of freelancers) {
    const categories = jsonParse<string[]>(freelancer.categories) || [];
    
    // Category fit (40%)
    const categoryFit = categories.includes(category) ? 100 : 50;
    
    // Availability (30%)
    const availabilityScore = freelancer.is_online ? 100 : 0;
    
    // Rating (30%)
    const ratingScore = (freelancer.rating || 0) * 20; // Convert 0-5 to 0-100
    
    // New freelancer boost (2x for first 10 jobs)
    const isNew = (freelancer.total_jobs || 0) < 10;
    const boost = isNew ? 2 : 1;
    
    // Check consecutive matches (rotation)
    const recentMatches = db.prepare(`
      SELECT COUNT(*) as count FROM matches 
      WHERE freelancer_id = ? AND status = 'accepted'
      AND created_at > datetime('now', '-7 days')
    `).get(freelancer.id) as any;
    
    const rotationPenalty = recentMatches.count >= 3 ? 0.5 : 1;
    
    // Calculate final score
    const matchScore = (
      (categoryFit * 0.4) +
      (availabilityScore * 0.3) +
      (ratingScore * 0.3)
    ) * boost * rotationPenalty;
    
    // Create match record
    db.prepare(`
      INSERT INTO matches (id, project_id, freelancer_id, match_score, category_fit, availability_score, rating_score)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(generateId(), projectId, freelancer.id, matchScore, categoryFit, availabilityScore, ratingScore);
    
    // Create activity for freelancer
    db.prepare(`
      INSERT INTO activities (id, user_id, type, title, description, metadata)
      VALUES (?, ?, 'match', 'New Match Available', 'You have a new project match!', ?)
    `).run(generateId(), freelancer.id, JSON.stringify({ projectId, matchScore }));
  }
}

app.get('/matches', (c) => {
  const freelancerId = c.req.query('freelancerId');
  const projectId = c.req.query('projectId');
  const status = c.req.query('status');
  
  let query = `
    SELECT m.*, p.title as project_title, p.description as project_description, 
           p.budget, p.category, u.name as buyer_name, u.avatar as buyer_avatar
    FROM matches m
    JOIN projects p ON m.project_id = p.id
    JOIN users u ON p.buyer_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];
  
  if (freelancerId) {
    query += ' AND m.freelancer_id = ?';
    params.push(freelancerId);
  }
  
  if (projectId) {
    query += ' AND m.project_id = ?';
    params.push(projectId);
  }
  
  if (status) {
    query += ' AND m.status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY m.match_score DESC, m.created_at DESC';
  
  const matches = db.prepare(query).all(...params);
  return c.json(matches);
});

app.patch('/matches/:id', async (c) => {
  const id = c.req.param('id');
  const { status } = await c.req.json();
  
  db.prepare('UPDATE matches SET status = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(status, id);
  
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(id) as any;
  
  // If accepted, update project
  if (status === 'accepted') {
    db.prepare('UPDATE projects SET freelancer_id = ?, status = ? WHERE id = ?')
      .run(match.freelancer_id, 'in_progress', match.project_id);
    
    // Decline other matches for this project
    db.prepare('UPDATE matches SET status = ? WHERE project_id = ? AND id != ?')
      .run('declined', match.project_id, id);
    
    // Create conversation
    const project = db.prepare('SELECT buyer_id FROM projects WHERE id = ?').get(match.project_id) as any;
    db.prepare(`
      INSERT INTO conversations (id, project_id, participant_ids)
      VALUES (?, ?, ?)
    `).run(generateId(), match.project_id, JSON.stringify([project.buyer_id, match.freelancer_id]));
  }
  
  return c.json(match);
});

// ============ MILESTONE ROUTES ============

app.patch('/milestones/:id', async (c) => {
  const id = c.req.param('id');
  const { status } = await c.req.json();
  
  db.prepare('UPDATE milestones SET status = ? WHERE id = ?').run(status, id);
  
  if (status === 'completed') {
    db.prepare('UPDATE milestones SET completed_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
  }
  
  const milestone = db.prepare('SELECT * FROM milestones WHERE id = ?').get(id);
  return c.json(milestone);
});

// ============ DELIVERABLE ROUTES ============

app.post('/deliverables', async (c) => {
  const { projectId, milestoneId, name, fileUrl, fileType, fileSize } = await c.req.json();
  
  const id = generateId();
  
  // Get current version
  const existing = db.prepare(`
    SELECT MAX(version) as max_version FROM deliverables 
    WHERE project_id = ? AND name = ?
  `).get(projectId, name) as any;
  
  const version = (existing?.max_version || 0) + 1;
  
  db.prepare(`
    INSERT INTO deliverables (id, project_id, milestone_id, name, file_url, file_type, file_size, version)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, projectId, milestoneId, name, fileUrl, fileType, fileSize, version);
  
  const deliverable = db.prepare('SELECT * FROM deliverables WHERE id = ?').get(id);
  return c.json(deliverable);
});

app.patch('/deliverables/:id', async (c) => {
  const id = c.req.param('id');
  const { status } = await c.req.json();
  
  db.prepare('UPDATE deliverables SET status = ? WHERE id = ?').run(status, id);
  
  const deliverable = db.prepare('SELECT * FROM deliverables WHERE id = ?').get(id);
  return c.json(deliverable);
});

// ============ MESSAGE ROUTES ============

app.get('/conversations', (c) => {
  const userId = c.req.query('userId');
  
  if (!userId) {
    return c.json({ error: 'userId required' }, 400);
  }
  
  const conversations = db.prepare(`
    SELECT c.*, 
           (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
           (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND read = 0 AND sender_id != ?) as unread_count
    FROM conversations c
    WHERE c.participant_ids LIKE ?
    ORDER BY c.last_message_at DESC
  `).all(userId, `%${userId}%`);
  
  return c.json(conversations);
});

app.get('/conversations/:id/messages', (c) => {
  const id = c.req.param('id');
  
  const messages = db.prepare(`
    SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = ?
    ORDER BY m.created_at ASC
  `).all(id);
  
  return c.json(messages);
});

app.post('/conversations/:id/messages', async (c) => {
  const conversationId = c.req.param('id');
  const { senderId, content } = await c.req.json();
  
  const id = generateId();
  
  db.prepare(`
    INSERT INTO messages (id, conversation_id, sender_id, content)
    VALUES (?, ?, ?, ?)
  `).run(id, conversationId, senderId, content);
  
  db.prepare('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(conversationId);
  
  const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
  return c.json(message);
});

app.patch('/messages/:id/read', (c) => {
  const id = c.req.param('id');
  db.prepare('UPDATE messages SET read = 1 WHERE id = ?').run(id);
  return c.json({ success: true });
});

// ============ REVIEW ROUTES ============

app.post('/reviews', async (c) => {
  const { projectId, reviewerId, revieweeId, overallRating, categories, feedback } = await c.req.json();
  
  const id = generateId();
  
  db.prepare(`
    INSERT INTO reviews (id, project_id, reviewer_id, reviewee_id, overall_rating, 
                        communication_rating, quality_rating, timeliness_rating, 
                        clarity_rating, payment_rating, feedback)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, projectId, reviewerId, revieweeId, overallRating,
    categories?.communication, categories?.quality, categories?.timeliness,
    categories?.clarity, categories?.payment, feedback
  );
  
  // Update freelancer rating
  const reviews = db.prepare(`
    SELECT AVG(overall_rating) as avg_rating, COUNT(*) as count
    FROM reviews WHERE reviewee_id = ?
  `).get(revieweeId) as any;
  
  db.prepare(`
    UPDATE freelancer_profiles SET rating = ?, total_reviews = ? WHERE user_id = ?
  `).run(reviews.avg_rating, reviews.count, revieweeId);
  
  // Create activity
  db.prepare(`
    INSERT INTO activities (id, user_id, type, title, description, metadata)
    VALUES (?, ?, 'rating', 'New Review Received', 'You received a new review!', ?)
  `).run(generateId(), revieweeId, JSON.stringify({ rating: overallRating, projectId }));
  
  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
  return c.json(review);
});

app.get('/reviews', (c) => {
  const userId = c.req.query('userId');
  
  if (!userId) {
    return c.json({ error: 'userId required' }, 400);
  }
  
  const reviews = db.prepare(`
    SELECT r.*, u.name as reviewer_name, u.avatar as reviewer_avatar, p.title as project_title
    FROM reviews r
    JOIN users u ON r.reviewer_id = u.id
    JOIN projects p ON r.project_id = p.id
    WHERE r.reviewee_id = ?
    ORDER BY r.created_at DESC
  `).all(userId);
  
  return c.json(reviews);
});

// ============ TRANSACTION ROUTES ============

app.get('/transactions', (c) => {
  const userId = c.req.query('userId');
  const type = c.req.query('type');
  
  if (!userId) {
    return c.json({ error: 'userId required' }, 400);
  }
  
  let query = `
    SELECT t.*, p.title as project_title
    FROM transactions t
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE t.user_id = ?
  `;
  const params: any[] = [userId];
  
  if (type && type !== 'all') {
    query += ' AND t.type = ?';
    params.push(type);
  }
  
  query += ' ORDER BY t.created_at DESC';
  
  const transactions = db.prepare(query).all(...params);
  return c.json(transactions);
});

app.get('/transactions/summary', (c) => {
  const userId = c.req.query('userId');
  
  if (!userId) {
    return c.json({ error: 'userId required' }, 400);
  }
  
  const summary = db.prepare(`
    SELECT 
      SUM(CASE WHEN type = 'payout' AND status = 'completed' THEN amount ELSE 0 END) as total_earnings,
      SUM(CASE WHEN type = 'payment' AND status = 'completed' THEN amount ELSE 0 END) as total_spent,
      SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount
    FROM transactions WHERE user_id = ?
  `).get(userId);
  
  return c.json(summary);
});

// ============ PAYMENT ROUTES (POLAR) ============

app.post('/payments/checkout', async (c) => {
  if (!polar) {
    return c.json({ error: 'Polar not configured' }, 500);
  }
  
  const { projectId, milestoneId, amount, buyerId } = await c.req.json();
  
  try {
    const checkout = await polar.checkouts.custom.create({
      productPriceId: process.env.POLAR_PRODUCT_PRICE_ID!,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://45bd3b33-5536-42bd-b6b1-84883acb7ee9.canvases.tempo.build'}/workspace?success=true`,
      metadata: {
        projectId,
        milestoneId,
        buyerId,
      },
    });
    
    return c.json({ checkoutUrl: checkout.url });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.post('/payments/webhook', async (c) => {
  const payload = await c.req.json();
  
  // Handle Polar webhook events
  if (payload.type === 'checkout.completed') {
    const { projectId, milestoneId, buyerId } = payload.data.metadata;
    
    // Create transaction record
    db.prepare(`
      INSERT INTO transactions (id, user_id, project_id, milestone_id, type, amount, status, polar_transaction_id, description)
      VALUES (?, ?, ?, ?, 'payment', ?, 'completed', ?, 'Milestone payment')
    `).run(generateId(), buyerId, projectId, milestoneId, payload.data.amount / 100, payload.data.id);
    
    // Update milestone status
    if (milestoneId) {
      db.prepare('UPDATE milestones SET status = ? WHERE id = ?').run('paid', milestoneId);
    }
  }
  
  return c.json({ received: true });
});

app.post('/payments/release', async (c) => {
  const { milestoneId, freelancerId, amount } = await c.req.json();
  
  const milestone = db.prepare('SELECT * FROM milestones WHERE id = ?').get(milestoneId) as any;
  
  if (!milestone) {
    return c.json({ error: 'Milestone not found' }, 404);
  }
  
  // Create payout transaction
  const transactionId = generateId();
  const fee = amount * 0.03; // 3% platform fee
  
  db.prepare(`
    INSERT INTO transactions (id, user_id, project_id, milestone_id, type, amount, fee, status, description)
    VALUES (?, ?, ?, ?, 'payout', ?, ?, 'completed', 'Milestone payout')
  `).run(transactionId, freelancerId, milestone.project_id, milestoneId, amount - fee, fee);
  
  // Update milestone
  db.prepare('UPDATE milestones SET status = ? WHERE id = ?').run('released', milestoneId);
  
  // Create activity
  db.prepare(`
    INSERT INTO activities (id, user_id, type, title, description, metadata)
    VALUES (?, ?, 'payment', 'Payment Received', 'You received a milestone payment!', ?)
  `).run(generateId(), freelancerId, JSON.stringify({ amount: amount - fee, milestoneId }));
  
  return c.json({ success: true, transactionId });
});

// ============ ACTIVITY ROUTES ============

app.get('/activities', (c) => {
  const userId = c.req.query('userId');
  const limit = parseInt(c.req.query('limit') || '20');
  
  if (!userId) {
    return c.json({ error: 'userId required' }, 400);
  }
  
  const activities = db.prepare(`
    SELECT * FROM activities WHERE user_id = ?
    ORDER BY created_at DESC LIMIT ?
  `).all(userId, limit);
  
  return c.json(activities.map((a: any) => ({
    ...a,
    metadata: jsonParse(a.metadata),
    timestamp: a.created_at,
  })));
});

// ============ KYC ROUTES ============

app.post('/kyc/upload', async (c) => {
  const { userId, documentType, fileUrl } = await c.req.json();
  
  const id = generateId();
  
  db.prepare(`
    INSERT INTO kyc_documents (id, user_id, document_type, file_url)
    VALUES (?, ?, ?, ?)
  `).run(id, userId, documentType, fileUrl);
  
  // Check if all documents uploaded
  const docs = db.prepare(`
    SELECT document_type FROM kyc_documents WHERE user_id = ?
  `).all(userId) as any[];
  
  const requiredDocs = ['id_front', 'id_back', 'selfie', 'proof_of_address'];
  const uploadedTypes = docs.map(d => d.document_type);
  const allUploaded = requiredDocs.every(t => uploadedTypes.includes(t));
  
  if (allUploaded) {
    db.prepare('UPDATE users SET kyc_status = ? WHERE id = ?').run('pending', userId);
  }
  
  return c.json({ success: true, allUploaded });
});

app.get('/kyc/status/:userId', (c) => {
  const userId = c.req.param('userId');
  
  const user = db.prepare('SELECT kyc_status FROM users WHERE id = ?').get(userId) as any;
  const documents = db.prepare('SELECT * FROM kyc_documents WHERE user_id = ?').all(userId);
  
  return c.json({ status: user?.kyc_status, documents });
});

// ============ COURSE ROUTES ============

app.get('/courses', (c) => {
  const category = c.req.query('category');
  
  let query = 'SELECT * FROM courses';
  const params: any[] = [];
  
  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }
  
  const courses = db.prepare(query).all(...params);
  return c.json(courses.map((c: any) => ({
    ...c,
    modules: jsonParse(c.modules),
  })));
});

app.get('/courses/:id', (c) => {
  const id = c.req.param('id');
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id) as any;
  
  if (!course) {
    return c.json({ error: 'Course not found' }, 404);
  }
  
  return c.json({
    ...course,
    modules: jsonParse(course.modules),
  });
});

app.get('/courses/progress/:userId', (c) => {
  const userId = c.req.param('userId');
  
  const progress = db.prepare(`
    SELECT cp.*, c.title, c.category
    FROM course_progress cp
    JOIN courses c ON cp.course_id = c.id
    WHERE cp.user_id = ?
  `).all(userId);
  
  return c.json(progress.map((p: any) => ({
    ...p,
    completed_modules: jsonParse(p.completed_modules),
  })));
});

app.post('/courses/:courseId/enroll', async (c) => {
  const courseId = c.req.param('courseId');
  const { userId } = await c.req.json();
  
  const id = generateId();
  
  db.prepare(`
    INSERT INTO course_progress (id, user_id, course_id)
    VALUES (?, ?, ?)
  `).run(id, userId, courseId);
  
  return c.json({ success: true });
});

app.patch('/courses/progress/:id', async (c) => {
  const id = c.req.param('id');
  const { progress, completedModules } = await c.req.json();
  
  db.prepare(`
    UPDATE course_progress SET progress = ?, completed_modules = ? WHERE id = ?
  `).run(progress, JSON.stringify(completedModules), id);
  
  // Check if completed
  if (progress >= 100) {
    db.prepare('UPDATE course_progress SET completed_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    
    // Award certification
    const cp = db.prepare('SELECT * FROM course_progress WHERE id = ?').get(id) as any;
    const course = db.prepare('SELECT title FROM courses WHERE id = ?').get(cp.course_id) as any;
    
    db.prepare(`
      INSERT INTO certifications (id, user_id, course_id, badge_name)
      VALUES (?, ?, ?, ?)
    `).run(generateId(), cp.user_id, cp.course_id, `${course.title} Certified`);
    
    // Create activity
    db.prepare(`
      INSERT INTO activities (id, user_id, type, title, description)
      VALUES (?, ?, 'course_completed', 'Course Completed', ?)
    `).run(generateId(), cp.user_id, `You completed ${course.title}!`);
  }
  
  return c.json({ success: true });
});

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
