// User Types
export type UserRole = 'freelancer' | 'buyer';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
  kycStatus?: 'pending' | 'approved' | 'rejected';
  isOnline?: boolean;
  rating?: number;
  totalJobs?: number;
  categories?: string[];
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
}

// Match Types
export interface MatchRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  title: string;
  category: string;
  description: string;
  budget?: number;
  createdAt: Date;
  status: 'pending' | 'matched' | 'accepted' | 'declined' | 'completed';
}

export interface Match {
  id: string;
  requestId: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar?: string;
  freelancerRating: number;
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  category: string;
  description: string;
  matchReason: {
    categoryFit: number;
    availability: number;
    ratingTier: number;
  };
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: Date;
}

// Message Types
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  read: boolean;
  attachments?: string[];
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  projectId?: string;
}

// Project Types
export interface Project {
  id: string;
  matchId: string;
  title: string;
  description: string;
  freelancerId: string;
  buyerId: string;
  status: 'in_progress' | 'review' | 'revision' | 'completed';
  milestones: Milestone[];
  deliverables: Deliverable[];
  totalBudget: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface Milestone {
  id: string;
  title: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'paid';
  dueDate?: Date;
}

export interface Deliverable {
  id: string;
  name: string;
  url: string;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'revision_requested';
}

// Rating Types
export interface Rating {
  id: string;
  projectId: string;
  fromUserId: string;
  toUserId: string;
  overall: number;
  communication: number;
  quality: number;
  timeliness: number;
  feedback: string;
  createdAt: Date;
}

// Course Types
export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  modules: CourseModule[];
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  badge?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  content: string;
  duration: string;
  completed?: boolean;
}

export interface CourseProgress {
  courseId: string;
  userId: string;
  completedModules: string[];
  assessmentPassed: boolean;
  certificateEarned: boolean;
  startedAt: Date;
  completedAt?: Date;
}

// Analytics Types
export interface FreelancerAnalytics {
  totalRevenue: number;
  revenueByMonth: { month: string; amount: number }[];
  completionRate: number;
  averageRating: number;
  ratingTrend: { month: string; rating: number }[];
  responseTime: number;
  totalJobs: number;
  activeJobs: number;
}

export interface BuyerAnalytics {
  totalSpent: number;
  spendingByMonth: { month: string; amount: number }[];
  projectsCompleted: number;
  activeProjects: number;
  categoryBreakdown: { category: string; amount: number }[];
  favoriteFreelancers: User[];
}

// Activity Types
export interface Activity {
  id: string;
  type: 'match' | 'message' | 'job_completed' | 'rating' | 'payment' | 'course_completed';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Category Types
export const SERVICE_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Content Writing',
  'Digital Marketing',
  'Video Editing',
  'Data Analysis',
  'Virtual Assistant',
  'Translation',
] as const;

export type ServiceCategory = typeof SERVICE_CATEGORIES[number];
