import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { createDBWrapper, generateId, jsonParse } from '@/lib/db-wrapper';
import { generateToken, verifyToken, hashPassword, verifyPassword, cookieOptions } from '@/lib/auth';

type Variables = {
  user: { userId: string; email: string; role: string } | null;
  db: ReturnType<typeof createDBWrapper>;
};

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Variables: Variables; Bindings: Bindings }>().basePath('/api');

// Middleware
app.use('*', cors({
  origin: '*',
  credentials: true,
}));

const COOKIE_NAME = 'fm_session';

// DB middleware
async function dbMiddleware(c: any, next: () => Promise<void>) {
  c.set('db', createDBWrapper(c.env.DB));
  await next();
}

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

// Apply middleware
app.use('*', dbMiddleware);
app.use('*', authMiddleware);

// ============ AUTH ROUTES ============

app.post('/auth/register', async (c) => {
  const db = c.get('db');
  const { email, password, name, role } = await c.req.json();
  
  const id = generateId();
  const passwordHash = hashPassword(password);
  
  try {
    await db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, email, passwordHash, name, role || 'freelancer');
    
    // Create profile based on role
    if (role === 'buyer') {
      await db.prepare(`
        INSERT INTO buyer_profiles (id, user_id)
        VALUES (?, ?)
      `).run(generateId(), id);
    } else {
      await db.prepare(`
        INSERT INTO freelancer_profiles (id, user_id)
        VALUES (?, ?)
      `).run(generateId(), id);
    }
    
    // Create activity
    await db.prepare(`
      INSERT INTO activities (id, user_id, type, title, description)
      VALUES (?, ?, 'account_created', 'Account Created', 'Welcome to FreelanceMatch!')
    `).run(generateId(), id);
    
    const user = await db.prepare('SELECT id, email, name, role, avatar, kyc_status FROM users WHERE id = ?').get(id) as any;
    
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
  const db = c.get('db');
  const { email, password } = await c.req.json();
  
  const user = await db.prepare(`
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
  const db = c.get('db');
  deleteCookie(c, COOKIE_NAME, { path: '/' });
  return c.json({ success: true });
});

app.get('/auth/me', async (c) => {
  const db = c.get('db');
  const authUser = c.get('user');
  
  if (!authUser) {
    return c.json({ success: false, error: 'Not authenticated' }, 401);
  }
  
  const user = await db.prepare(`
    SELECT id, email, name, role, avatar, kyc_status, is_online
    FROM users WHERE id = ?
  `).get(authUser.userId);
  
  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404);
  }
  
  return c.json({ success: true, user });
});

app.post('/auth/refresh', async (c) => {
  const db = c.get('db');
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

// List all users (for debugging)
app.get('/users', async (c) => {
  const db = c.get('db');
  const users = await db.prepare(`
    SELECT id, email, name, role, avatar, bio, kyc_status, is_online, created_at
    FROM users
  `).all();
  
  return c.json(users);
});

app.get('/users/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const user = await db.prepare(`
    SELECT id, email, name, role, avatar, bio, kyc_status, is_online, created_at
    FROM users WHERE id = ?
  `).get(id);
  
  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }
  
  return c.json(user);
});

app.patch('/users/:id', async (c) => {
  const db = c.get('db');
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
  
  await db.prepare(`UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
    .run(...values, id);
  
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return c.json(user);
});

app.patch('/users/:id/availability', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const { isOnline } = await c.req.json();
  
  await db.prepare('UPDATE users SET is_online = ? WHERE id = ?').run(isOnline ? 1 : 0, id);
  
  return c.json({ success: true, isOnline });
});

// ============ FREELANCER PROFILE ROUTES ============

app.get('/freelancers', async (c) => {
  const db = c.get('db');
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
  
  const freelancers = await db.prepare(query).all(...params);
  return c.json(freelancers);
});

app.get('/freelancers/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');
  
  const profile = await db.prepare(`
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
  const db = c.get('db');
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
    
    await db.prepare(`UPDATE freelancer_profiles SET ${setClause} WHERE user_id = ?`)
      .run(...values, userId);
  }
  
  const profile = await db.prepare('SELECT * FROM freelancer_profiles WHERE user_id = ?').get(userId);
  return c.json(profile);
});

// ============ PROJECT ROUTES ============

app.post('/projects', async (c) => {
  const db = c.get('db');
  const { buyerId, title, description, category, budget, milestones } = await c.req.json();
  
  const projectId = generateId();
  
  await db.prepare(`
    INSERT INTO projects (id, buyer_id, title, description, category, budget)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(projectId, buyerId, title, description, category, budget);
  
  // Create milestones if provided
  if (milestones && Array.isArray(milestones)) {
    const insertMilestone = await db.prepare(`
      INSERT INTO milestones (id, project_id, title, description, amount, due_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    for (const m of milestones) {
      insertMilestone.run(generateId(), projectId, m.title, m.description, m.amount, m.dueDate);
    }
  }
  
  // Create activity
  await db.prepare(`
    INSERT INTO activities (id, user_id, type, title, description, metadata)
    VALUES (?, ?, 'project_created', 'New Project Posted', ?, ?)
  `).run(generateId(), buyerId, title, JSON.stringify({ projectId, budget }));
  
  // Trigger matching algorithm
  const matchingResult = await triggerMatching(projectId, category);
  
  const project = await db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  return c.json({ 
    ...project as object, 
    matchingResult 
  });
});

app.get('/projects', async (c) => {
  const db = c.get('db');
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
  
  const projects = await db.prepare(query).all(...params);
  return c.json(projects);
});

app.get('/projects/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  
  const project = await db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as any;
  
  if (!project) {
    return c.json({ error: 'Project not found' }, 404);
  }
  
  // Get milestones
  const milestones = await db.prepare('SELECT * FROM milestones WHERE project_id = ?').all(id);
  
  // Get deliverables
  const deliverables = await db.prepare('SELECT * FROM deliverables WHERE project_id = ?').all(id);
  
  // Get buyer and freelancer info
  const buyer = await db.prepare('SELECT id, name, avatar FROM users WHERE id = ?').get(project.buyer_id);
  const freelancer = project.freelancer_id 
    ? await db.prepare('SELECT id, name, avatar FROM users WHERE id = ?').get(project.freelancer_id)
    : null;
  
  return c.json({ ...project, milestones, deliverables, buyer, freelancer });
});

app.patch('/projects/:id', async (c) => {
  const db = c.get('db');
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
    
    await db.prepare(`UPDATE projects SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(...values, id);
  }
  
  const project = await db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  return c.json(project);
});

// ============ MATCHING ROUTES ============

async function triggerMatching(projectId: string, category: string): Promise<{ matchesCreated: number; freelancersAvailable: number }> {
  // Get online freelancers in the category
  const freelancers = await db.prepare(`
    SELECT u.id, u.is_online, fp.categories, fp.rating, fp.total_jobs, fp.jobs_completed
    FROM users u
    JOIN freelancer_profiles fp ON u.id = fp.user_id
    WHERE u.role = 'freelancer' AND u.is_online = 1
  `).all() as any[];
  
  if (freelancers.length === 0) {
    return { matchesCreated: 0, freelancersAvailable: 0 };
  }
  
  let matchesCreated = 0;
  
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
    const recentMatches = await db.prepare(`
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
    const matchId = generateId();
    await db.prepare(`
      INSERT INTO matches (id, project_id, freelancer_id, match_score, category_fit, availability_score, rating_score)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(matchId, projectId, freelancer.id, matchScore, categoryFit, availabilityScore, ratingScore);
    
    matchesCreated++;
    
    // Create activity for freelancer
    await db.prepare(`
      INSERT INTO activities (id, user_id, type, title, description, metadata)
      VALUES (?, ?, 'match', 'New Match Available', 'You have a new project match!', ?)
    `).run(generateId(), freelancer.id, JSON.stringify({ projectId, matchScore }));
    
    // Create real-time event for freelancer
    await db.prepare(`
      INSERT INTO realtime_events (id, user_id, event_type, payload)
      VALUES (?, ?, 'new_match', ?)
    `).run(generateId(), freelancer.id, JSON.stringify({ matchId, projectId, matchScore }));
  }
  
  return { matchesCreated, freelancersAvailable: freelancers.length };
}

app.get('/matches', async (c) => {
  const db = c.get('db');
  const freelancerId = c.req.query('freelancerId');
  const projectId = c.req.query('projectId');
  const buyerId = c.req.query('buyerId');
  const status = c.req.query('status');
  
  let query = `
    SELECT m.*, p.title as project_title, p.description as project_description, 
           p.budget, p.category, u.name as buyer_name, u.avatar as buyer_avatar,
           fu.name as freelancer_name, fu.avatar as freelancer_avatar
    FROM matches m
    JOIN projects p ON m.project_id = p.id
    JOIN users u ON p.buyer_id = u.id
    JOIN users fu ON m.freelancer_id = fu.id
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
  
  // If buyer is requesting, hide declined matches (they shouldn't see who declined)
  if (buyerId) {
    query += ' AND p.buyer_id = ? AND m.status != ?';
    params.push(buyerId, 'declined');
  }
  
  if (status) {
    query += ' AND m.status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY m.match_score DESC, m.created_at DESC';
  
  const matches = await db.prepare(query).all(...params);
  return c.json(matches);
});

app.patch('/matches/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const { status } = await c.req.json();
  
  await db.prepare('UPDATE matches SET status = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(status, id);
  
  const match = await db.prepare('SELECT * FROM matches WHERE id = ?').get(id) as any;
  const project = await db.prepare('SELECT buyer_id, title FROM projects WHERE id = ?').get(match.project_id) as any;
  
  // If accepted, update project
  if (status === 'accepted') {
    await db.prepare('UPDATE projects SET freelancer_id = ?, status = ? WHERE id = ?')
      .run(match.freelancer_id, 'in_progress', match.project_id);
    
    // Decline other matches for this project
    await db.prepare('UPDATE matches SET status = ? WHERE project_id = ? AND id != ?')
      .run('declined', match.project_id, id);
    
    // Create conversation
    await db.prepare(`
      INSERT INTO conversations (id, project_id, participant_ids)
      VALUES (?, ?, ?)
    `).run(generateId(), match.project_id, JSON.stringify([project.buyer_id, match.freelancer_id]));
    
    // Create real-time event for buyer
    await db.prepare(`
      INSERT INTO realtime_events (id, user_id, event_type, payload)
      VALUES (?, ?, 'match_accepted', ?)
    `).run(generateId(), project.buyer_id, JSON.stringify({ 
      matchId: id, 
      projectId: match.project_id, 
      freelancerId: match.freelancer_id,
      projectTitle: project.title 
    }));
    
    // Create activity for buyer
    await db.prepare(`
      INSERT INTO activities (id, user_id, type, title, description, metadata)
      VALUES (?, ?, 'match', 'Freelancer Accepted', 'A freelancer has accepted your project!', ?)
    `).run(generateId(), project.buyer_id, JSON.stringify({ projectId: match.project_id, matchId: id }));
  }
  
  return c.json(match);
});

// ============ MILESTONE ROUTES ============

app.patch('/milestones/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const { status } = await c.req.json();
  
  await db.prepare('UPDATE milestones SET status = ? WHERE id = ?').run(status, id);
  
  if (status === 'completed') {
    await db.prepare('UPDATE milestones SET completed_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
  }
  
  const milestone = await db.prepare('SELECT * FROM milestones WHERE id = ?').get(id);
  return c.json(milestone);
});

// ============ DELIVERABLE ROUTES ============

app.post('/deliverables', async (c) => {
  const db = c.get('db');
  const { projectId, milestoneId, name, fileUrl, fileType, fileSize } = await c.req.json();
  
  const id = generateId();
  
  // Get current version
  const existing = await db.prepare(`
    SELECT MAX(version) as max_version FROM deliverables 
    WHERE project_id = ? AND name = ?
  `).get(projectId, name) as any;
  
  const version = (existing?.max_version || 0) + 1;
  
  await db.prepare(`
    INSERT INTO deliverables (id, project_id, milestone_id, name, file_url, file_type, file_size, version)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, projectId, milestoneId, name, fileUrl, fileType, fileSize, version);
  
  const deliverable = await db.prepare('SELECT * FROM deliverables WHERE id = ?').get(id);
  return c.json(deliverable);
});

app.patch('/deliverables/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const { status } = await c.req.json();
  
  await db.prepare('UPDATE deliverables SET status = ? WHERE id = ?').run(status, id);
  
  const deliverable = await db.prepare('SELECT * FROM deliverables WHERE id = ?').get(id);
  return c.json(deliverable);
});

// ============ MESSAGE ROUTES ============

app.get('/conversations', async (c) => {
  const db = c.get('db');
  const userId = c.req.query('userId');
  
  if (!userId) {
    return c.json({ error: 'userId required' }, 400);
  }
  
  const conversations = await db.prepare(`
    SELECT c.*, 
           (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
           (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND read = 0 AND sender_id != ?) as unread_count
    FROM conversations c
    WHERE c.participant_ids LIKE ?
    ORDER BY c.last_message_at DESC
  `).all(userId, `%${userId}%`);
  
  return c.json(conversations);
});

app.get('/conversations/:id/messages', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  
  const messages = await db.prepare(`
    SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = ?
    ORDER BY m.created_at ASC
  `).all(id);
  
  return c.json(messages);
});

app.post('/conversations/:id/messages', async (c) => {
  const db = c.get('db');
  const conversationId = c.req.param('id');
  const { senderId, content } = await c.req.json();
  
  const id = generateId();
  
  await db.prepare(`
    INSERT INTO messages (id, conversation_id, sender_id, content)
    VALUES (?, ?, ?, ?)
  `).run(id, conversationId, senderId, content);
  
  await db.prepare('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(conversationId);
  
  // Get conversation to find other participants
  const conversation = await db.prepare('SELECT participant_ids FROM conversations WHERE id = ?').get(conversationId) as any;
  const participantIds = jsonParse<string[]>(conversation.participant_ids) || [];
  
  // Create real-time event for other participants
  for (const participantId of participantIds) {
    if (participantId !== senderId) {
      await db.prepare(`
        INSERT INTO realtime_events (id, user_id, event_type, payload)
        VALUES (?, ?, 'new_message', ?)
      `).run(generateId(), participantId, JSON.stringify({ 
        messageId: id, 
        conversationId, 
        senderId,
        preview: content.substring(0, 50) 
      }));
    }
  }
  
  const message = await db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
  return c.json(message);
});

app.patch('/messages/:id/read', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  await db.prepare('UPDATE messages SET read = 1 WHERE id = ?').run(id);
  return c.json({ success: true });
});

// ============ REVIEW ROUTES ============

// Check for inappropriate content in reviews
function checkForInappropriateContent(feedback: string): { flagged: boolean; reason: string | null } {
  const inappropriatePatterns = [
    /\b(scam|fraud|cheat|steal|thief)\b/i,
    /\b(hate|racist|sexist)\b/i,
    /\b(threat|kill|harm|attack)\b/i,
    /personal\s*(info|information|details)/i,
    /\b(phone|email|address)\s*:?\s*[\d@]/i,
  ];
  
  for (const pattern of inappropriatePatterns) {
    if (pattern.test(feedback)) {
      return { flagged: true, reason: 'Potentially inappropriate content detected' };
    }
  }
  
  // Flag extremely negative reviews for manual check
  return { flagged: false, reason: null };
}

app.post('/reviews', async (c) => {
  const db = c.get('db');
  const { projectId, reviewerId, revieweeId, overallRating, categories, feedback } = await c.req.json();
  
  const id = generateId();
  
  // Check for inappropriate content
  const contentCheck = checkForInappropriateContent(feedback || '');
  const isFlagged = contentCheck.flagged || overallRating === 1;
  const flagReason = contentCheck.reason || (overallRating === 1 ? 'Very low rating - manual review recommended' : null);
  const status = isFlagged ? 'pending_moderation' : 'published';
  
  await db.prepare(`
    INSERT INTO reviews (id, project_id, reviewer_id, reviewee_id, overall_rating, 
                        communication_rating, quality_rating, timeliness_rating, 
                        clarity_rating, payment_rating, feedback, status, is_flagged, flag_reason)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, projectId, reviewerId, revieweeId, overallRating,
    categories?.communication, categories?.quality, categories?.timeliness,
    categories?.clarity, categories?.payment, feedback, status, isFlagged ? 1 : 0, flagReason
  );
  
  // Only update ratings if review is published (not flagged)
  if (!isFlagged) {
    const reviews = await db.prepare(`
      SELECT AVG(overall_rating) as avg_rating, COUNT(*) as count
      FROM reviews WHERE reviewee_id = ? AND status = 'published'
    `).get(revieweeId) as any;
    
    await db.prepare(`
      UPDATE freelancer_profiles SET rating = ?, total_reviews = ? WHERE user_id = ?
    `).run(reviews.avg_rating, reviews.count, revieweeId);
    
    // Create activity
    await db.prepare(`
      INSERT INTO activities (id, user_id, type, title, description, metadata)
      VALUES (?, ?, 'rating', 'New Review Received', 'You received a new review!', ?)
    `).run(generateId(), revieweeId, JSON.stringify({ rating: overallRating, projectId }));
    
    // Create real-time event
    await db.prepare(`
      INSERT INTO realtime_events (id, user_id, event_type, payload)
      VALUES (?, ?, 'new_review', ?)
    `).run(generateId(), revieweeId, JSON.stringify({ reviewId: id, rating: overallRating }));
  }
  
  const review = await db.prepare('SELECT * FROM reviews WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  return c.json({ ...(review || {}), flagged: isFlagged });
});

app.get('/reviews', async (c) => {
  const db = c.get('db');
  const userId = c.req.query('userId');
  const status = c.req.query('status');
  
  if (!userId) {
    return c.json({ error: 'userId required' }, 400);
  }
  
  let query = `
    SELECT r.*, u.name as reviewer_name, u.avatar as reviewer_avatar, p.title as project_title
    FROM reviews r
    JOIN users u ON r.reviewer_id = u.id
    JOIN projects p ON r.project_id = p.id
    WHERE r.reviewee_id = ?
  `;
  const params: any[] = [userId];
  
  if (status) {
    query += ' AND r.status = ?';
    params.push(status);
  } else {
    // By default, only show published reviews
    query += ' AND r.status = ?';
    params.push('published');
  }
  
  query += ' ORDER BY r.created_at DESC';
  
  const reviews = await db.prepare(query).all(...params);
  return c.json(reviews);
});

// ============ REVIEW MODERATION ROUTES ============

app.get('/moderation/reviews', async (c) => {
  const db = c.get('db');
  const reviews = await db.prepare(`
    SELECT r.*, 
           reviewer.name as reviewer_name, reviewer.avatar as reviewer_avatar,
           reviewee.name as reviewee_name, reviewee.avatar as reviewee_avatar,
           p.title as project_title
    FROM reviews r
    JOIN users reviewer ON r.reviewer_id = reviewer.id
    JOIN users reviewee ON r.reviewee_id = reviewee.id
    JOIN projects p ON r.project_id = p.id
    WHERE r.is_flagged = 1 OR r.status = 'pending_moderation'
    ORDER BY r.created_at DESC
  `).all();
  
  return c.json(reviews);
});

app.patch('/moderation/reviews/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const { action, moderationNotes, moderatorId } = await c.req.json();
  
  const review = await db.prepare('SELECT * FROM reviews WHERE id = ?').get(id) as any;
  
  if (!review) {
    return c.json({ error: 'Review not found' }, 404);
  }
  
  if (action === 'approve') {
    await db.prepare(`
      UPDATE reviews SET status = 'published', is_flagged = 0, moderation_notes = ?, 
                        moderated_by = ?, moderated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(moderationNotes, moderatorId, id);
    
    // Now update the reviewee's rating
    const reviews = await db.prepare(`
      SELECT AVG(overall_rating) as avg_rating, COUNT(*) as count
      FROM reviews WHERE reviewee_id = ? AND status = 'published'
    `).get(review.reviewee_id) as any;
    
    await db.prepare(`
      UPDATE freelancer_profiles SET rating = ?, total_reviews = ? WHERE user_id = ?
    `).run(reviews.avg_rating, reviews.count, review.reviewee_id);
    
    // Create activity for reviewee
    await db.prepare(`
      INSERT INTO activities (id, user_id, type, title, description, metadata)
      VALUES (?, ?, 'rating', 'New Review Received', 'You received a new review!', ?)
    `).run(generateId(), review.reviewee_id, JSON.stringify({ rating: review.overall_rating, projectId: review.project_id }));
    
  } else if (action === 'reject') {
    await db.prepare(`
      UPDATE reviews SET status = 'rejected', moderation_notes = ?, 
                        moderated_by = ?, moderated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(moderationNotes, moderatorId, id);
    
    // Notify reviewer that their review was rejected
    await db.prepare(`
      INSERT INTO activities (id, user_id, type, title, description)
      VALUES (?, ?, 'review_rejected', 'Review Not Published', 'Your review did not meet our community guidelines.')
    `).run(generateId(), review.reviewer_id);
  }
  
  return c.json({ success: true });
});

// ============ TRANSACTION ROUTES ============

app.get('/transactions', async (c) => {
  const db = c.get('db');
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
  
  const transactions = await db.prepare(query).all(...params);
  return c.json(transactions);
});

app.get('/transactions/summary', async (c) => {
  const db = c.get('db');
  const userId = c.req.query('userId');
  
  if (!userId) {
    return c.json({ error: 'userId required' }, 400);
  }
  
  const summary = await db.prepare(`
    SELECT 
      SUM(CASE WHEN type = 'payout' AND status = 'completed' THEN amount ELSE 0 END) as total_earnings,
      SUM(CASE WHEN type = 'payment' AND status = 'completed' THEN amount ELSE 0 END) as total_spent,
      SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount
    FROM transactions WHERE user_id = ?
  `).get(userId);
  
  return c.json(summary);
});

// ============ PAYMENT ROUTES (SIMULATED) ============

app.post('/payments/checkout', async (c) => {
  const db = c.get('db');
  const { projectId, milestoneId, amount, buyerId } = await c.req.json();
  
  // Simulate payment checkout - create pending transaction
  const transactionId = generateId();
  
  await db.prepare(`
    INSERT INTO transactions (id, user_id, project_id, milestone_id, type, amount, status, description)
    VALUES (?, ?, ?, ?, 'payment', ?, 'pending', 'Milestone payment')
  `).run(transactionId, buyerId, projectId, milestoneId, amount);
  
  // Return simulated checkout URL
  return c.json({ 
    checkoutUrl: `/payments/simulate/${transactionId}`,
    transactionId,
    message: 'Simulated payment - will auto-complete in 2 seconds'
  });
});

app.get('/payments/simulate/:transactionId', async (c) => {
  const db = c.get('db');
  const transactionId = c.req.param('transactionId');
  
  // Get transaction
  const transaction = await db.prepare('SELECT * FROM transactions WHERE id = ?').get(transactionId) as any;
  
  if (!transaction) {
    return c.json({ error: 'Transaction not found' }, 404);
  }
  
  // Auto-complete the payment
  await db.prepare('UPDATE transactions SET status = ? WHERE id = ?').run('completed', transactionId);
  
  // Update milestone status
  if (transaction.milestone_id) {
    await db.prepare('UPDATE milestones SET status = ? WHERE id = ?').run('paid', transaction.milestone_id);
  }
  
  // Create activity
  await db.prepare(`
    INSERT INTO activities (id, user_id, type, title, description, metadata)
    VALUES (?, ?, 'payment', 'Payment Completed', 'Your payment was successful!', ?)
  `).run(generateId(), transaction.user_id, JSON.stringify({ amount: transaction.amount, transactionId }));
  
  return c.json({ 
    success: true, 
    message: 'Payment completed successfully!',
    transaction 
  });
});

app.post('/payments/webhook', async (c) => {
  // Webhook endpoint for future real payment integration
  return c.json({ received: true });
});

app.post('/payments/release', async (c) => {
  const db = c.get('db');
  const { milestoneId, freelancerId, amount } = await c.req.json();
  
  const milestone = await db.prepare('SELECT * FROM milestones WHERE id = ?').get(milestoneId) as any;
  
  if (!milestone) {
    return c.json({ error: 'Milestone not found' }, 404);
  }
  
  // Create payout transaction
  const transactionId = generateId();
  const fee = amount * 0.03; // 3% platform fee
  
  await db.prepare(`
    INSERT INTO transactions (id, user_id, project_id, milestone_id, type, amount, fee, status, description)
    VALUES (?, ?, ?, ?, 'payout', ?, ?, 'completed', 'Milestone payout')
  `).run(transactionId, freelancerId, milestone.project_id, milestoneId, amount - fee, fee);
  
  // Update milestone
  await db.prepare('UPDATE milestones SET status = ? WHERE id = ?').run('released', milestoneId);
  
  // Create activity
  await db.prepare(`
    INSERT INTO activities (id, user_id, type, title, description, metadata)
    VALUES (?, ?, 'payment', 'Payment Received', 'You received a milestone payment!', ?)
  `).run(generateId(), freelancerId, JSON.stringify({ amount: amount - fee, milestoneId }));
  
  // Create real-time event for freelancer
  await db.prepare(`
    INSERT INTO realtime_events (id, user_id, event_type, payload)
    VALUES (?, ?, 'payment_released', ?)
  `).run(generateId(), freelancerId, JSON.stringify({ 
    transactionId, 
    amount: amount - fee, 
    milestoneId,
    projectId: milestone.project_id 
  }));
  
  return c.json({ success: true, transactionId });
});

// ============ ACTIVITY ROUTES ============

app.get('/activities', async (c) => {
  const db = c.get('db');
  const userId = c.req.query('userId');
  const limit = parseInt(c.req.query('limit') || '20');
  
  if (!userId) {
    return c.json({ error: 'userId required' }, 400);
  }
  
  const activities = await db.prepare(`
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
  const db = c.get('db');
  const { userId, documentType, fileUrl } = await c.req.json();
  
  const id = generateId();
  
  await db.prepare(`
    INSERT INTO kyc_documents (id, user_id, document_type, file_url)
    VALUES (?, ?, ?, ?)
  `).run(id, userId, documentType, fileUrl);
  
  // Check if all documents uploaded
  const docs = await db.prepare(`
    SELECT document_type FROM kyc_documents WHERE user_id = ?
  `).all(userId) as any[];
  
  const requiredDocs = ['id_front', 'id_back', 'selfie', 'proof_of_address'];
  const uploadedTypes = docs.map(d => d.document_type);
  const allUploaded = requiredDocs.every(t => uploadedTypes.includes(t));
  
  if (allUploaded) {
    await db.prepare('UPDATE users SET kyc_status = ? WHERE id = ?').run('pending', userId);
  }
  
  return c.json({ success: true, allUploaded });
});

app.get('/kyc/status/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');
  
  const user = await db.prepare('SELECT kyc_status FROM users WHERE id = ?').get(userId) as any;
  const documents = await db.prepare('SELECT * FROM kyc_documents WHERE user_id = ?').all(userId);
  
  return c.json({ status: user?.kyc_status, documents });
});

// ============ COURSE ROUTES ============

app.get('/courses', async (c) => {
  const db = c.get('db');
  const category = c.req.query('category');
  
  let query = 'SELECT * FROM courses';
  const params: any[] = [];
  
  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }
  
  const courses = await db.prepare(query).all(...params);
  return c.json(courses.map((c: any) => ({
    ...c,
    modules: jsonParse(c.modules),
  })));
});

app.get('/courses/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const course = await db.prepare('SELECT * FROM courses WHERE id = ?').get(id) as any;
  
  if (!course) {
    return c.json({ error: 'Course not found' }, 404);
  }
  
  return c.json({
    ...course,
    modules: jsonParse(course.modules),
  });
});

app.get('/courses/progress/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');
  
  const progress = await db.prepare(`
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
  const db = c.get('db');
  const courseId = c.req.param('courseId');
  const { userId } = await c.req.json();
  
  const id = generateId();
  
  await db.prepare(`
    INSERT INTO course_progress (id, user_id, course_id)
    VALUES (?, ?, ?)
  `).run(id, userId, courseId);
  
  return c.json({ success: true });
});

app.patch('/courses/progress/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const { progress, completedModules } = await c.req.json();
  
  await db.prepare(`
    UPDATE course_progress SET progress = ?, completed_modules = ? WHERE id = ?
  `).run(progress, JSON.stringify(completedModules), id);
  
  // Check if completed
  if (progress >= 100) {
    await db.prepare('UPDATE course_progress SET completed_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    
    // Award certification
    const cp = await db.prepare('SELECT * FROM course_progress WHERE id = ?').get(id) as any;
    const course = await db.prepare('SELECT title FROM courses WHERE id = ?').get(cp.course_id) as any;
    
    await db.prepare(`
      INSERT INTO certifications (id, user_id, course_id, badge_name)
      VALUES (?, ?, ?, ?)
    `).run(generateId(), cp.user_id, cp.course_id, `${course.title} Certified`);
    
    // Create activity
    await db.prepare(`
      INSERT INTO activities (id, user_id, type, title, description)
      VALUES (?, ?, 'course_completed', 'Course Completed', ?)
    `).run(generateId(), cp.user_id, `You completed ${course.title}!`);
  }
  
  return c.json({ success: true });
});

// Health check
app.get('/health', async (c) => {
  const db = c.get('db');
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ SMART CATEGORIZATION (AI-POWERED) ============

const categoryKeywords: Record<string, string[]> = {
  'Web Development': ['website', 'web', 'react', 'vue', 'angular', 'frontend', 'backend', 'fullstack', 'html', 'css', 'javascript', 'typescript', 'node', 'express', 'nextjs', 'api', 'database', 'sql', 'mongodb', 'wordpress', 'shopify', 'ecommerce', 'landing page', 'responsive'],
  'Mobile Development': ['app', 'mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin', 'iphone', 'smartphone', 'tablet', 'play store', 'app store'],
  'UI/UX Design': ['design', 'ui', 'ux', 'user interface', 'user experience', 'wireframe', 'prototype', 'figma', 'sketch', 'adobe xd', 'mockup', 'usability', 'interaction'],
  'Graphic Design': ['logo', 'brand', 'branding', 'graphic', 'illustration', 'poster', 'flyer', 'banner', 'business card', 'visual identity', 'photoshop', 'illustrator', 'vector'],
  'Content Writing': ['content', 'blog', 'article', 'write', 'writing', 'copywriting', 'copy', 'seo content', 'technical writing', 'documentation', 'ebook', 'whitepaper', 'press release'],
  'Digital Marketing': ['marketing', 'seo', 'ads', 'social media', 'facebook', 'instagram', 'google ads', 'ppc', 'email marketing', 'campaign', 'analytics', 'conversion', 'traffic', 'lead generation'],
  'Video Production': ['video', 'animation', 'motion graphics', 'editing', 'youtube', 'explainer', 'promotional', 'after effects', 'premiere', 'cinematography'],
  'Data Science': ['data', 'analytics', 'machine learning', 'ai', 'artificial intelligence', 'python', 'statistics', 'visualization', 'tableau', 'power bi', 'prediction', 'model'],
};

function suggestCategories(description: string): { category: string; confidence: number; keywords: string[] }[] {
  const desc = description.toLowerCase();
  const suggestions: { category: string; confidence: number; keywords: string[] }[] = [];
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const matchedKeywords = keywords.filter(kw => desc.includes(kw.toLowerCase()));
    if (matchedKeywords.length > 0) {
      const confidence = Math.min(matchedKeywords.length / 3, 1); // Max confidence at 3+ matches
      suggestions.push({ category, confidence, keywords: matchedKeywords });
    }
  }
  
  // Sort by confidence
  suggestions.sort((a, b) => b.confidence - a.confidence);
  
  return suggestions.slice(0, 3); // Return top 3 suggestions
}

app.post('/categorize', async (c) => {
  const db = c.get('db');
  const { description } = await c.req.json();
  
  if (!description) {
    return c.json({ error: 'Description required' }, 400);
  }
  
  const suggestions = suggestCategories(description);
  
  return c.json({
    suggestions,
    primaryCategory: suggestions[0]?.category || null,
    confidence: suggestions[0]?.confidence || 0,
  });
});

// ============ REAL-TIME EVENTS (SSE) ============

app.get('/events/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');
  
  // Set headers for SSE
  c.header('Content-Type', 'text/event-stream');
  c.header('Cache-Control', 'no-cache');
  c.header('Connection', 'keep-alive');
  
  // Get unread events
  const events = await db.prepare(`
    SELECT * FROM realtime_events 
    WHERE user_id = ? AND is_read = 0
    ORDER BY created_at ASC
  `).all(userId) as any[];
  
  // Mark events as read
  if (events.length > 0) {
    const eventIds = events.map(e => e.id);
    await db.prepare(`UPDATE realtime_events SET is_read = 1 WHERE id IN (${eventIds.map(() => '?').join(',')})`).run(...eventIds);
  }
  
  // Return events as JSON (for polling approach)
  return c.json(events.map(e => ({
    ...e,
    payload: jsonParse(e.payload),
  })));
});

// Create a real-time event
app.post('/events', async (c) => {
  const db = c.get('db');
  const { userId, eventType, payload } = await c.req.json();
  
  const id = generateId();
  
  await db.prepare(`
    INSERT INTO realtime_events (id, user_id, event_type, payload)
    VALUES (?, ?, ?, ?)
  `).run(id, userId, eventType, JSON.stringify(payload));
  
  return c.json({ success: true, eventId: id });
});

// ============ VIDEO CALL ROUTES ============

app.post('/video/create-room', async (c) => {
  const db = c.get('db');
  const { projectId, createdBy, participantIds, provider = 'jitsi' } = await c.req.json();
  
  const roomId = generateId();
  let roomUrl: string;
  let roomName: string;
  
  // Generate meeting link based on provider
  if (provider === 'jitsi') {
    // Jitsi - works immediately, no API needed!
    roomName = `FreelanceMatch-${projectId}-${Date.now()}`;
    roomUrl = `https://meet.jit.si/${roomName}`;
  } else if (provider === 'google-meet') {
    const code = Array.from({ length: 10 }, () => 
      'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
    ).join('').match(/.{1,3}/g)?.join('-') || 'xxx-xxxx-xxx';
    roomUrl = `https://meet.google.com/${code}`;
    roomName = `FreelanceMatch-${projectId}`;
  } else if (provider === 'whereby') {
    roomName = `freelancematch-${projectId}-${Date.now()}`;
    roomUrl = `https://whereby.com/${roomName}`;
  } else {
    // Default to Jitsi (free, no setup)
    roomName = `FreelanceMatch-${projectId}-${Date.now()}`;
    roomUrl = `https://meet.jit.si/${roomName}`;
  }
  
  await db.prepare(`
    INSERT INTO video_rooms (id, project_id, room_url, room_name, created_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(roomId, projectId, roomUrl, roomName, createdBy);
  
  // Notify participants
  for (const participantId of participantIds) {
    if (participantId !== createdBy) {
      await db.prepare(`
        INSERT INTO realtime_events (id, user_id, event_type, payload)
        VALUES (?, ?, 'video_call_invite', ?)
      `).run(generateId(), participantId, JSON.stringify({ roomId, roomUrl, projectId, provider }));
      
      await db.prepare(`
        INSERT INTO activities (id, user_id, type, title, description, metadata)
        VALUES (?, ?, 'video_call', 'Video Call Started', 'You have been invited to a video call', ?)
      `).run(generateId(), participantId, JSON.stringify({ roomId, roomUrl, provider }));
    }
  }
  
  return c.json({ roomId, roomUrl, roomName, provider });
});

app.get('/video/rooms/:projectId', async (c) => {
  const db = c.get('db');
  const projectId = c.req.param('projectId');
  
  const rooms = await db.prepare(`
    SELECT * FROM video_rooms WHERE project_id = ? ORDER BY started_at DESC
  `).all(projectId);
  
  return c.json(rooms);
});

app.patch('/video/rooms/:id/end', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const { recordingUrl } = await c.req.json();
  
  await db.prepare(`
    UPDATE video_rooms SET status = 'ended', ended_at = CURRENT_TIMESTAMP, recording_url = ?
    WHERE id = ?
  `).run(recordingUrl || null, id);
  
  return c.json({ success: true });
});

// ============ ADMIN MIDDLEWARE ============

async function adminOnly(c: any, next: () => Promise<void>) {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }
  await next();
}

// ============ ADMIN ROUTES ============

app.post('/admin/courses', adminOnly, async (c) => {
  const { title, description, category, durationHours, modules } = await c.req.json();
  const id = generateId();
  
  await db.prepare(`
    INSERT INTO courses (id, title, description, category, duration_hours, modules)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, title, description, category, durationHours, JSON.stringify(modules));
  
  return c.json({ id, success: true });
});

app.patch('/admin/courses/:id', adminOnly, async (c) => {
  const id = c.req.param('id');
  const { title, description, category, durationHours, modules } = await c.req.json();
  
  await db.prepare(`
    UPDATE courses SET title = ?, description = ?, category = ?, duration_hours = ?, modules = ?
    WHERE id = ?
  `).run(title, description, category, durationHours, JSON.stringify(modules), id);
  
  return c.json({ success: true });
});

app.delete('/admin/courses/:id', adminOnly, async (c) => {
  const id = c.req.param('id');
  await db.prepare('DELETE FROM courses WHERE id = ?').run(id);
  return c.json({ success: true });
});

app.patch('/admin/kyc/:userId/approve', adminOnly, async (c) => {
  const userId = c.req.param('userId');
  
  await db.prepare('UPDATE users SET kyc_status = ? WHERE id = ?').run('approved', userId);
  await db.prepare('UPDATE kyc_documents SET status = ?, reviewed_at = CURRENT_TIMESTAMP WHERE user_id = ?').run('approved', userId);
  
  await db.prepare(`
    INSERT INTO activities (id, user_id, type, title, description)
    VALUES (?, ?, 'kyc_approved', 'KYC Approved', 'Your identity verification has been approved')
  `).run(generateId(), userId);
  
  return c.json({ success: true });
});

app.patch('/admin/kyc/:userId/reject', adminOnly, async (c) => {
  const userId = c.req.param('userId');
  const { reason } = await c.req.json();
  
  await db.prepare('UPDATE users SET kyc_status = ? WHERE id = ?').run('rejected', userId);
  await db.prepare('UPDATE kyc_documents SET status = ?, reviewed_at = CURRENT_TIMESTAMP WHERE user_id = ?').run('rejected', userId);
  
  await db.prepare(`
    INSERT INTO activities (id, user_id, type, title, description)
    VALUES (?, ?, 'kyc_rejected', 'KYC Rejected', ?)
  `).run(generateId(), userId, reason || 'Your identity verification was rejected');
  
  return c.json({ success: true });
});

app.get('/admin/kyc/pending', adminOnly, (c) => {
  const pending = await db.prepare(`
    SELECT u.id, u.name, u.email, u.avatar, u.kyc_status, u.created_at,
           (SELECT COUNT(*) FROM kyc_documents WHERE user_id = u.id) as doc_count
    FROM users u
    WHERE u.kyc_status = 'pending'
    ORDER BY u.created_at DESC
  `).all();
  
  return c.json(pending);
});

app.patch('/admin/reviews/:id/moderate', adminOnly, async (c) => {
  const id = c.req.param('id');
  const { status, notes } = await c.req.json();
  const adminUser = c.get('user');
  
  await db.prepare(`
    UPDATE reviews SET status = ?, moderation_notes = ?, moderated_by = ?, moderated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status, notes, adminUser.userId, id);
  
  if (status === 'rejected') {
    const review = await db.prepare('SELECT reviewee_id FROM reviews WHERE id = ?').get(id) as any;
    await db.prepare(`
      INSERT INTO activities (id, user_id, type, title, description)
      VALUES (?, ?, 'review_rejected', 'Review Moderated', ?)
    `).run(generateId(), review.reviewee_id, notes || 'A review about you was removed by moderation');
  }
  
  return c.json({ success: true });
});

app.get('/admin/reviews/flagged', adminOnly, (c) => {
  const flagged = await db.prepare(`
    SELECT r.*, 
           reviewer.name as reviewer_name, reviewer.avatar as reviewer_avatar,
           reviewee.name as reviewee_name, reviewee.avatar as reviewee_avatar,
           p.title as project_title
    FROM reviews r
    JOIN users reviewer ON r.reviewer_id = reviewer.id
    JOIN users reviewee ON r.reviewee_id = reviewee.id
    JOIN projects p ON r.project_id = p.id
    WHERE r.is_flagged = 1 AND r.status = 'published'
    ORDER BY r.created_at DESC
  `).all();
  
  return c.json(flagged);
});

app.get('/admin/stats', adminOnly, (c) => {
  const stats = {
    totalUsers: await db.prepare('SELECT COUNT(*) as count FROM users').get() as any,
    totalProjects: db.prepare('SELECT COUNT(*) as count FROM projects').get() as any,
    pendingKyc: db.prepare("SELECT COUNT(*) as count FROM users WHERE kyc_status = 'pending'").get() as any,
    flaggedReviews: db.prepare('SELECT COUNT(*) as count FROM reviews WHERE is_flagged = 1').get() as any,
    totalRevenue: db.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'platform_fee'").get() as any,
  };
  
  return c.json({
    totalUsers: stats.totalUsers.count,
    totalProjects: stats.totalProjects.count,
    pendingKyc: stats.pendingKyc.count,
    flaggedReviews: stats.flaggedReviews.count,
    totalRevenue: stats.totalRevenue.total || 0,
  });
});

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
