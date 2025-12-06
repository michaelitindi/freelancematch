import db, { generateId } from './db';

// Seed data for development
export function seedDatabase() {
  // Check if already seeded
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
  if (existingUsers.count > 0) {
    console.log('Database already seeded');
    return;
  }

  console.log('Seeding database...');

  // Create users
  const users = [
    {
      id: generateId(),
      email: 'sarah@example.com',
      name: 'Sarah Chen',
      role: 'freelancer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
      bio: 'Senior UI/UX Designer with 5+ years of experience',
      kyc_status: 'approved',
      is_online: 1,
    },
    {
      id: generateId(),
      email: 'alex@example.com',
      name: 'Alex Rivera',
      role: 'freelancer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
      bio: 'Full-stack developer specializing in React and Node.js',
      kyc_status: 'approved',
      is_online: 1,
    },
    {
      id: generateId(),
      email: 'maya@example.com',
      name: 'Maya Patel',
      role: 'freelancer',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
      bio: 'Content strategist and copywriter',
      kyc_status: 'pending',
      is_online: 0,
    },
    {
      id: generateId(),
      email: 'techstartup@example.com',
      name: 'TechStartup Inc.',
      role: 'buyer',
      avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&q=80',
      bio: 'Building the future of fintech',
      kyc_status: 'approved',
      is_online: 1,
    },
    {
      id: generateId(),
      email: 'creativeco@example.com',
      name: 'Creative Co.',
      role: 'buyer',
      avatar: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&q=80',
      bio: 'Digital marketing agency',
      kyc_status: 'approved',
      is_online: 1,
    },
  ];

  const passwordHash = Buffer.from('password123').toString('base64');

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, avatar, bio, kyc_status, is_online)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const user of users) {
    insertUser.run(
      user.id, user.email, passwordHash, user.name, user.role,
      user.avatar, user.bio, user.kyc_status, user.is_online
    );
  }

  // Create freelancer profiles
  const freelancerProfiles = [
    {
      user_id: users[0].id,
      categories: JSON.stringify(['UI/UX Design', 'Graphic Design']),
      experience_years: 5,
      hourly_rate: 85,
      availability: 'Full-time',
      skills: JSON.stringify(['Figma', 'Sketch', 'Adobe XD', 'Prototyping']),
      rating: 4.9,
      total_reviews: 47,
      total_jobs: 52,
      jobs_completed: 50,
    },
    {
      user_id: users[1].id,
      categories: JSON.stringify(['Web Development', 'Mobile Development']),
      experience_years: 7,
      hourly_rate: 120,
      availability: 'Part-time',
      skills: JSON.stringify(['React', 'Node.js', 'TypeScript', 'PostgreSQL']),
      rating: 4.8,
      total_reviews: 38,
      total_jobs: 42,
      jobs_completed: 40,
    },
    {
      user_id: users[2].id,
      categories: JSON.stringify(['Content Writing', 'Marketing']),
      experience_years: 3,
      hourly_rate: 60,
      availability: 'Limited',
      skills: JSON.stringify(['SEO', 'Copywriting', 'Content Strategy', 'Social Media']),
      rating: 4.7,
      total_reviews: 23,
      total_jobs: 25,
      jobs_completed: 24,
    },
  ];

  const insertFreelancerProfile = db.prepare(`
    INSERT INTO freelancer_profiles (id, user_id, categories, experience_years, hourly_rate, availability, skills, rating, total_reviews, total_jobs, jobs_completed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const profile of freelancerProfiles) {
    insertFreelancerProfile.run(
      generateId(), profile.user_id, profile.categories, profile.experience_years,
      profile.hourly_rate, profile.availability, profile.skills, profile.rating,
      profile.total_reviews, profile.total_jobs, profile.jobs_completed
    );
  }

  // Create buyer profiles
  const buyerProfiles = [
    {
      user_id: users[3].id,
      company_name: 'TechStartup Inc.',
      company_type: 'Startup',
      hiring_needs: JSON.stringify(['Web Development', 'UI/UX Design']),
      budget_range: '$5,000 - $10,000',
      total_spent: 25000,
      total_projects: 8,
    },
    {
      user_id: users[4].id,
      company_name: 'Creative Co.',
      company_type: 'Agency',
      hiring_needs: JSON.stringify(['Content Writing', 'Graphic Design', 'Marketing']),
      budget_range: '$1,000 - $5,000',
      total_spent: 15000,
      total_projects: 12,
    },
  ];

  const insertBuyerProfile = db.prepare(`
    INSERT INTO buyer_profiles (id, user_id, company_name, company_type, hiring_needs, budget_range, total_spent, total_projects)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const profile of buyerProfiles) {
    insertBuyerProfile.run(
      generateId(), profile.user_id, profile.company_name, profile.company_type,
      profile.hiring_needs, profile.budget_range, profile.total_spent, profile.total_projects
    );
  }

  // Create projects
  const projectId1 = generateId();
  const projectId2 = generateId();

  db.prepare(`
    INSERT INTO projects (id, buyer_id, freelancer_id, title, description, category, budget, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    projectId1, users[3].id, users[0].id,
    'E-commerce Dashboard Redesign',
    'Complete redesign of the admin dashboard with modern UI/UX patterns and real-time analytics.',
    'UI/UX Design', 5000, 'in_progress'
  );

  db.prepare(`
    INSERT INTO projects (id, buyer_id, freelancer_id, title, description, category, budget, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    projectId2, users[4].id, users[1].id,
    'Mobile App Development',
    'Build a cross-platform mobile app for our e-commerce platform.',
    'Mobile Development', 12000, 'in_progress'
  );

  // Create milestones
  const milestones = [
    { project_id: projectId1, title: 'Initial Design Phase', amount: 1500, status: 'paid' },
    { project_id: projectId1, title: 'Development Phase', amount: 2500, status: 'in_progress' },
    { project_id: projectId1, title: 'Testing & Launch', amount: 1000, status: 'pending' },
    { project_id: projectId2, title: 'UI/UX Design', amount: 3000, status: 'completed' },
    { project_id: projectId2, title: 'Frontend Development', amount: 5000, status: 'in_progress' },
    { project_id: projectId2, title: 'Backend Integration', amount: 4000, status: 'pending' },
  ];

  const insertMilestone = db.prepare(`
    INSERT INTO milestones (id, project_id, title, amount, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const milestone of milestones) {
    insertMilestone.run(generateId(), milestone.project_id, milestone.title, milestone.amount, milestone.status);
  }

  // Create conversations
  const convId1 = generateId();
  db.prepare(`
    INSERT INTO conversations (id, project_id, participant_ids, last_message_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `).run(convId1, projectId1, JSON.stringify([users[3].id, users[0].id]));

  // Create messages
  const messages = [
    { conversation_id: convId1, sender_id: users[3].id, content: 'Hi Sarah! Excited to work with you on this project.' },
    { conversation_id: convId1, sender_id: users[0].id, content: 'Thanks! I\'ve reviewed the requirements and have some initial ideas.' },
    { conversation_id: convId1, sender_id: users[3].id, content: 'Great! Can we schedule a call to discuss?' },
  ];

  const insertMessage = db.prepare(`
    INSERT INTO messages (id, conversation_id, sender_id, content)
    VALUES (?, ?, ?, ?)
  `);

  for (const msg of messages) {
    insertMessage.run(generateId(), msg.conversation_id, msg.sender_id, msg.content);
  }

  // Create reviews
  db.prepare(`
    INSERT INTO reviews (id, project_id, reviewer_id, reviewee_id, overall_rating, communication_rating, quality_rating, timeliness_rating, feedback)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    generateId(), projectId1, users[3].id, users[0].id,
    5, 5, 5, 5, 'Sarah delivered exceptional work! Her attention to detail and communication were outstanding.'
  );

  // Create transactions
  const transactionData = [
    { user_id: users[0].id, project_id: projectId1, type: 'payout', amount: 1455, fee: 45, status: 'completed', description: 'Milestone 1 payout' },
    { user_id: users[3].id, project_id: projectId1, type: 'payment', amount: 1500, status: 'completed', description: 'Milestone 1 payment' },
  ];

  const insertTransaction = db.prepare(`
    INSERT INTO transactions (id, user_id, project_id, type, amount, fee, status, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const tx of transactionData) {
    insertTransaction.run(generateId(), tx.user_id, tx.project_id, tx.type, tx.amount, tx.fee || 0, tx.status, tx.description);
  }

  // Create activities
  const activityData = [
    { user_id: users[0].id, type: 'match', title: 'New Match', description: 'You matched with TechStartup Inc.' },
    { user_id: users[0].id, type: 'payment', title: 'Payment Received', description: 'You received $1,455 for Milestone 1' },
    { user_id: users[0].id, type: 'rating', title: 'New Review', description: 'TechStartup Inc. left you a 5-star review' },
    { user_id: users[3].id, type: 'job_completed', title: 'Milestone Completed', description: 'Initial Design Phase completed' },
  ];

  const insertActivity = db.prepare(`
    INSERT INTO activities (id, user_id, type, title, description)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const activity of activityData) {
    insertActivity.run(generateId(), activity.user_id, activity.type, activity.title, activity.description);
  }

  // Create courses
  const courseData = [
    {
      title: 'UI/UX Design Fundamentals',
      description: 'Learn the basics of user interface and user experience design',
      category: 'Design',
      duration_hours: 8,
      modules: JSON.stringify([
        { id: '1', title: 'Introduction to UI/UX', duration: 60 },
        { id: '2', title: 'Design Principles', duration: 90 },
        { id: '3', title: 'Wireframing', duration: 120 },
        { id: '4', title: 'Prototyping', duration: 120 },
        { id: '5', title: 'User Testing', duration: 90 },
      ]),
    },
    {
      title: 'React Development Masterclass',
      description: 'Master React.js from beginner to advanced',
      category: 'Development',
      duration_hours: 20,
      modules: JSON.stringify([
        { id: '1', title: 'React Basics', duration: 120 },
        { id: '2', title: 'Components & Props', duration: 150 },
        { id: '3', title: 'State Management', duration: 180 },
        { id: '4', title: 'Hooks Deep Dive', duration: 200 },
        { id: '5', title: 'Advanced Patterns', duration: 150 },
      ]),
    },
    {
      title: 'Freelance Business Essentials',
      description: 'Build a successful freelance career',
      category: 'Business',
      duration_hours: 5,
      modules: JSON.stringify([
        { id: '1', title: 'Setting Your Rates', duration: 60 },
        { id: '2', title: 'Client Communication', duration: 60 },
        { id: '3', title: 'Contracts & Invoicing', duration: 60 },
        { id: '4', title: 'Building Your Portfolio', duration: 60 },
        { id: '5', title: 'Marketing Yourself', duration: 60 },
      ]),
    },
  ];

  const insertCourse = db.prepare(`
    INSERT INTO courses (id, title, description, category, duration_hours, modules)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const course of courseData) {
    insertCourse.run(generateId(), course.title, course.description, course.category, course.duration_hours, course.modules);
  }

  console.log('Database seeded successfully!');
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}
