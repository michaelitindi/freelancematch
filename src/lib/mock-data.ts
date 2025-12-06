import type {
  User,
  Match,
  MatchRequest,
  Conversation,
  Message,
  Project,
  Course,
  Activity,
  FreelancerAnalytics,
  BuyerAnalytics,
} from '@/types';

// Mock Users
export const mockFreelancers: User[] = [
  {
    id: 'f1',
    email: 'sarah@example.com',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    role: 'freelancer',
    createdAt: new Date('2024-01-15'),
    kycStatus: 'approved',
    isOnline: true,
    rating: 4.9,
    totalJobs: 47,
    categories: ['Web Development', 'UI/UX Design'],
    bio: 'Full-stack developer with 5+ years of experience building scalable web applications.',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Figma'],
    hourlyRate: 85,
  },
  {
    id: 'f2',
    email: 'marcus@example.com',
    name: 'Marcus Johnson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    role: 'freelancer',
    createdAt: new Date('2024-02-20'),
    kycStatus: 'approved',
    isOnline: true,
    rating: 4.7,
    totalJobs: 32,
    categories: ['Mobile Development', 'Web Development'],
    bio: 'Mobile app specialist creating beautiful iOS and Android experiences.',
    skills: ['React Native', 'Swift', 'Kotlin', 'Firebase'],
    hourlyRate: 95,
  },
  {
    id: 'f3',
    email: 'elena@example.com',
    name: 'Elena Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    role: 'freelancer',
    createdAt: new Date('2024-03-10'),
    kycStatus: 'approved',
    isOnline: false,
    rating: 4.8,
    totalJobs: 28,
    categories: ['Graphic Design', 'UI/UX Design'],
    bio: 'Creative designer passionate about brand identity and user experience.',
    skills: ['Adobe Creative Suite', 'Figma', 'Sketch', 'Illustration'],
    hourlyRate: 75,
  },
];

export const mockBuyers: User[] = [
  {
    id: 'b1',
    email: 'techstartup@example.com',
    name: 'TechStartup Inc.',
    avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&q=80',
    role: 'buyer',
    createdAt: new Date('2024-01-10'),
    rating: 4.8,
    totalJobs: 15,
  },
  {
    id: 'b2',
    email: 'creativeco@example.com',
    name: 'Creative Co.',
    avatar: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&q=80',
    role: 'buyer',
    createdAt: new Date('2024-02-05'),
    rating: 4.6,
    totalJobs: 8,
  },
];

// Mock Match Requests
export const mockMatchRequests: MatchRequest[] = [
  {
    id: 'mr1',
    buyerId: 'b1',
    buyerName: 'TechStartup Inc.',
    buyerAvatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&q=80',
    title: 'React Dashboard Development',
    category: 'Web Development',
    description: 'Need a React developer to build a customer dashboard with real-time analytics.',
    budget: 5000,
    createdAt: new Date(),
    status: 'pending',
  },
  {
    id: 'mr2',
    buyerId: 'b2',
    buyerName: 'Creative Co.',
    buyerAvatar: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&q=80',
    title: 'Mobile App Redesign',
    category: 'UI/UX Design',
    description: 'Looking for a designer to redesign our mobile app interface.',
    budget: 3000,
    createdAt: new Date(Date.now() - 3600000),
    status: 'matched',
  },
];

// Mock Matches
export const mockMatches: Match[] = [
  {
    id: 'm1',
    requestId: 'mr1',
    freelancerId: 'f1',
    freelancerName: 'Sarah Chen',
    freelancerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    freelancerRating: 4.9,
    buyerId: 'b1',
    buyerName: 'TechStartup Inc.',
    buyerAvatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&q=80',
    category: 'Web Development',
    description: 'Need a React developer to build a customer dashboard with real-time analytics.',
    matchReason: {
      categoryFit: 95,
      availability: 100,
      ratingTier: 98,
    },
    status: 'pending',
    createdAt: new Date(),
  },
];

// Mock Conversations
export const mockConversations: Conversation[] = [
  {
    id: 'c1',
    participants: [
      { id: 'f1', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80' },
      { id: 'b1', name: 'TechStartup Inc.', avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&q=80' },
    ],
    lastMessage: {
      id: 'msg1',
      senderId: 'b1',
      senderName: 'TechStartup Inc.',
      content: 'Great! Looking forward to working with you.',
      timestamp: new Date(Date.now() - 1800000),
      read: false,
    },
    unreadCount: 1,
    projectId: 'p1',
  },
  {
    id: 'c2',
    participants: [
      { id: 'f1', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80' },
      { id: 'b2', name: 'Creative Co.', avatar: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&q=80' },
    ],
    lastMessage: {
      id: 'msg2',
      senderId: 'f1',
      senderName: 'Sarah Chen',
      content: 'I\'ve uploaded the first draft. Let me know your thoughts!',
      timestamp: new Date(Date.now() - 86400000),
      read: true,
    },
    unreadCount: 0,
  },
];

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: 'msg1',
    senderId: 'b1',
    senderName: 'TechStartup Inc.',
    senderAvatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&q=80',
    content: 'Hi Sarah! We\'re excited to work with you on this project.',
    timestamp: new Date(Date.now() - 7200000),
    read: true,
  },
  {
    id: 'msg2',
    senderId: 'f1',
    senderName: 'Sarah Chen',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    content: 'Thank you! I\'ve reviewed the requirements and have some questions about the analytics features.',
    timestamp: new Date(Date.now() - 5400000),
    read: true,
  },
  {
    id: 'msg3',
    senderId: 'b1',
    senderName: 'TechStartup Inc.',
    senderAvatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&q=80',
    content: 'Sure, go ahead! We\'re happy to clarify anything.',
    timestamp: new Date(Date.now() - 3600000),
    read: true,
  },
  {
    id: 'msg4',
    senderId: 'f1',
    senderName: 'Sarah Chen',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    content: 'What data sources will the dashboard need to integrate with?',
    timestamp: new Date(Date.now() - 2700000),
    read: true,
  },
  {
    id: 'msg5',
    senderId: 'b1',
    senderName: 'TechStartup Inc.',
    senderAvatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&q=80',
    content: 'Great! Looking forward to working with you.',
    timestamp: new Date(Date.now() - 1800000),
    read: false,
  },
];

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: 'p1',
    matchId: 'm1',
    title: 'Customer Analytics Dashboard',
    description: 'Build a real-time analytics dashboard for customer data visualization.',
    freelancerId: 'f1',
    buyerId: 'b1',
    status: 'in_progress',
    milestones: [
      { id: 'ms1', title: 'Design & Wireframes', amount: 1000, status: 'completed' },
      { id: 'ms2', title: 'Frontend Development', amount: 2000, status: 'in_progress' },
      { id: 'ms3', title: 'Backend Integration', amount: 1500, status: 'pending' },
      { id: 'ms4', title: 'Testing & Deployment', amount: 500, status: 'pending' },
    ],
    deliverables: [
      { id: 'd1', name: 'Wireframes.fig', url: '#', uploadedAt: new Date(Date.now() - 172800000), status: 'approved' },
    ],
    totalBudget: 5000,
    createdAt: new Date(Date.now() - 604800000),
  },
];

// Mock Courses
export const mockCourses: Course[] = [
  {
    id: 'course1',
    title: 'React Fundamentals',
    description: 'Master the basics of React including components, hooks, and state management.',
    category: 'Web Development',
    modules: [
      { id: 'mod1', title: 'Introduction to React', content: 'Learn what React is and why it\'s popular.', duration: '30 min', completed: true },
      { id: 'mod2', title: 'Components & Props', content: 'Understanding React components and props.', duration: '45 min', completed: true },
      { id: 'mod3', title: 'State & Hooks', content: 'Managing state with useState and useEffect.', duration: '60 min', completed: false },
      { id: 'mod4', title: 'Advanced Patterns', content: 'Context, reducers, and custom hooks.', duration: '90 min', completed: false },
    ],
    duration: '4 hours',
    difficulty: 'beginner',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&q=80',
    badge: '🎯',
  },
  {
    id: 'course2',
    title: 'UI/UX Design Principles',
    description: 'Learn the fundamentals of user interface and experience design.',
    category: 'UI/UX Design',
    modules: [
      { id: 'mod5', title: 'Design Thinking', content: 'Introduction to design thinking methodology.', duration: '40 min', completed: false },
      { id: 'mod6', title: 'User Research', content: 'Conducting effective user research.', duration: '50 min', completed: false },
      { id: 'mod7', title: 'Wireframing', content: 'Creating wireframes and prototypes.', duration: '60 min', completed: false },
    ],
    duration: '3 hours',
    difficulty: 'beginner',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80',
    badge: '🎨',
  },
  {
    id: 'course3',
    title: 'Advanced TypeScript',
    description: 'Deep dive into TypeScript for professional development.',
    category: 'Web Development',
    modules: [
      { id: 'mod8', title: 'Type System Deep Dive', content: 'Understanding TypeScript\'s type system.', duration: '60 min', completed: false },
      { id: 'mod9', title: 'Generics', content: 'Working with generic types.', duration: '45 min', completed: false },
      { id: 'mod10', title: 'Utility Types', content: 'Using built-in utility types.', duration: '30 min', completed: false },
    ],
    duration: '2.5 hours',
    difficulty: 'advanced',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&q=80',
    badge: '⚡',
  },
];

// Mock Activities
export const mockActivities: Activity[] = [
  {
    id: 'a1',
    type: 'match',
    title: 'New Match!',
    description: 'You\'ve been matched with TechStartup Inc. for a Web Development project.',
    timestamp: new Date(),
  },
  {
    id: 'a2',
    type: 'message',
    title: 'New Message',
    description: 'TechStartup Inc. sent you a message.',
    timestamp: new Date(Date.now() - 1800000),
  },
  {
    id: 'a3',
    type: 'payment',
    title: 'Payment Received',
    description: 'You received $1,000 for completing the Design & Wireframes milestone.',
    timestamp: new Date(Date.now() - 86400000),
  },
  {
    id: 'a4',
    type: 'rating',
    title: 'New Review',
    description: 'Creative Co. left you a 5-star review!',
    timestamp: new Date(Date.now() - 172800000),
  },
  {
    id: 'a5',
    type: 'course_completed',
    title: 'Course Completed',
    description: 'You completed "React Fundamentals" and earned a badge!',
    timestamp: new Date(Date.now() - 259200000),
  },
];

// Mock Analytics
export const mockFreelancerAnalytics: FreelancerAnalytics = {
  totalRevenue: 24500,
  revenueByMonth: [
    { month: 'Jan', amount: 3200 },
    { month: 'Feb', amount: 4100 },
    { month: 'Mar', amount: 3800 },
    { month: 'Apr', amount: 5200 },
    { month: 'May', amount: 4500 },
    { month: 'Jun', amount: 3700 },
  ],
  completionRate: 98,
  averageRating: 4.9,
  ratingTrend: [
    { month: 'Jan', rating: 4.7 },
    { month: 'Feb', rating: 4.8 },
    { month: 'Mar', rating: 4.8 },
    { month: 'Apr', rating: 4.9 },
    { month: 'May', rating: 4.9 },
    { month: 'Jun', rating: 4.9 },
  ],
  responseTime: 2.5,
  totalJobs: 47,
  activeJobs: 3,
};

export const mockBuyerAnalytics: BuyerAnalytics = {
  totalSpent: 18500,
  spendingByMonth: [
    { month: 'Jan', amount: 2500 },
    { month: 'Feb', amount: 3200 },
    { month: 'Mar', amount: 2800 },
    { month: 'Apr', amount: 4000 },
    { month: 'May', amount: 3500 },
    { month: 'Jun', amount: 2500 },
  ],
  projectsCompleted: 12,
  activeProjects: 2,
  categoryBreakdown: [
    { category: 'Web Development', amount: 8500 },
    { category: 'UI/UX Design', amount: 5000 },
    { category: 'Mobile Development', amount: 3500 },
    { category: 'Content Writing', amount: 1500 },
  ],
  favoriteFreelancers: mockFreelancers.slice(0, 2),
};
