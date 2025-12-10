// Use environment variable or default to local worker
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787').replace(/\/$/, '');
console.log('🔧 API_BASE:', API_BASE);
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include', // Include cookies
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' })) as { error?: string };
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

// Auth
export const auth = {
  register: (data: { email: string; password: string; name: string; role: string }) =>
    fetchApi<{ success: boolean; user: any; token: string }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  
  login: (data: { email: string; password: string }) =>
    fetchApi<{ success: boolean; user: any; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  
  logout: () =>
    fetchApi<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  
  me: () =>
    fetchApi<{ success: boolean; user: any }>('/auth/me'),
  
  refresh: () =>
    fetchApi<{ success: boolean; token: string }>('/auth/refresh', { method: 'POST' }),
};

// Users
export const users = {
  get: (id: string) => fetchApi(`/users/${id}`),
  
  update: (id: string, data: Partial<{ name: string; avatar: string; bio: string }>) =>
    fetchApi(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  
  setAvailability: (id: string, isOnline: boolean) =>
    fetchApi(`/users/${id}/availability`, { method: 'PATCH', body: JSON.stringify({ isOnline }) }),
};

// Freelancers
export const freelancers = {
  list: (params?: { category?: string; online?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.online) searchParams.set('online', 'true');
    return fetchApi(`/freelancers?${searchParams}`);
  },
  
  get: (userId: string) => fetchApi(`/freelancers/${userId}`),
  
  update: (userId: string, data: any) =>
    fetchApi(`/freelancers/${userId}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// Projects
export const projects = {
  create: (data: {
    buyerId: string;
    title: string;
    description: string;
    category: string;
    budget: number;
    milestones?: { title: string; description?: string; amount: number; dueDate?: string }[];
  }) => fetchApi('/projects', { method: 'POST', body: JSON.stringify(data) }),
  
  list: (params?: { buyerId?: string; freelancerId?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.buyerId) searchParams.set('buyerId', params.buyerId);
    if (params?.freelancerId) searchParams.set('freelancerId', params.freelancerId);
    if (params?.status) searchParams.set('status', params.status);
    return fetchApi(`/projects?${searchParams}`);
  },
  
  get: (id: string) => fetchApi(`/projects/${id}`),
  
  update: (id: string, data: { status?: string; freelancer_id?: string }) =>
    fetchApi(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// Matches
export const matches = {
  list: (params?: { freelancerId?: string; projectId?: string; buyerId?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.freelancerId) searchParams.set('freelancerId', params.freelancerId);
    if (params?.projectId) searchParams.set('projectId', params.projectId);
    if (params?.buyerId) searchParams.set('buyerId', params.buyerId);
    if (params?.status) searchParams.set('status', params.status);
    return fetchApi(`/matches?${searchParams}`);
  },
  
  respond: (id: string, status: 'accepted' | 'declined') =>
    fetchApi(`/matches/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// Milestones
export const milestones = {
  update: (id: string, data: { status: string }) =>
    fetchApi(`/milestones/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// Deliverables
export const deliverables = {
  create: (data: {
    projectId: string;
    milestoneId?: string;
    name: string;
    fileUrl: string;
    fileType: string;
    fileSize: string;
  }) => fetchApi('/deliverables', { method: 'POST', body: JSON.stringify(data) }),
  
  update: (id: string, data: { status: string }) =>
    fetchApi(`/deliverables/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// Conversations & Messages
export const conversations = {
  list: (userId: string) => fetchApi(`/conversations?userId=${userId}`),
  
  getMessages: (id: string) => fetchApi(`/conversations/${id}/messages`),
  
  sendMessage: (id: string, data: { senderId: string; content: string }) =>
    fetchApi(`/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify(data) }),
  
  markRead: (messageId: string) =>
    fetchApi(`/messages/${messageId}/read`, { method: 'PATCH' }),
};

// Reviews
export const reviews = {
  create: (data: {
    projectId: string;
    reviewerId: string;
    revieweeId: string;
    overallRating: number;
    categories?: Record<string, number>;
    feedback?: string;
  }) => fetchApi('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  
  list: (userId: string) => fetchApi(`/reviews?userId=${userId}`),
};

// Transactions
export const transactions = {
  list: (userId: string, type?: string) => {
    const searchParams = new URLSearchParams({ userId });
    if (type) searchParams.set('type', type);
    return fetchApi(`/transactions?${searchParams}`);
  },
  
  getSummary: (userId: string) => fetchApi(`/transactions/summary?userId=${userId}`),
};

// Payments
export const payments = {
  createCheckout: (data: {
    projectId: string;
    milestoneId: string;
    amount: number;
    buyerId: string;
  }) => fetchApi('/payments/checkout', { method: 'POST', body: JSON.stringify(data) }),
  
  release: (data: { milestoneId: string; freelancerId: string; amount: number }) =>
    fetchApi('/payments/release', { method: 'POST', body: JSON.stringify(data) }),
};

// Activities
export const activities = {
  list: (userId: string, limit?: number) => {
    const searchParams = new URLSearchParams({ userId });
    if (limit) searchParams.set('limit', limit.toString());
    return fetchApi(`/activities?${searchParams}`);
  },
};

// KYC
export const kyc = {
  upload: (data: { userId: string; documentType: string; fileUrl: string }) =>
    fetchApi('/kyc/upload', { method: 'POST', body: JSON.stringify(data) }),
  
  getStatus: (userId: string) => fetchApi(`/kyc/status/${userId}`),
};

// Courses
export const courses = {
  list: (category?: string) => {
    const searchParams = category ? `?category=${category}` : '';
    return fetchApi(`/courses${searchParams}`);
  },
  
  get: (id: string) => fetchApi(`/courses/${id}`),
  
  getProgress: (userId: string) => fetchApi(`/courses/progress/${userId}`),
  
  enroll: (courseId: string, userId: string) =>
    fetchApi(`/courses/${courseId}/enroll`, { method: 'POST', body: JSON.stringify({ userId }) }),
  
  updateProgress: (progressId: string, data: { progress: number; completedModules: string[] }) =>
    fetchApi(`/courses/progress/${progressId}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// Smart Categorization
export const categorization = {
  suggest: (description: string) =>
    fetchApi('/categorize', { method: 'POST', body: JSON.stringify({ description }) }),
};

// Real-time Events
export const events = {
  poll: (userId: string) => fetchApi(`/events/${userId}`),
  
  create: (data: { userId: string; eventType: string; payload: any }) =>
    fetchApi('/events', { method: 'POST', body: JSON.stringify(data) }),
};

// Video Calls
export const video = {
  createRoom: (data: { projectId: string; createdBy: string; participantIds: string[] }) =>
    fetchApi('/video/create-room', { method: 'POST', body: JSON.stringify(data) }),
  
  getRooms: (projectId: string) => fetchApi(`/video/rooms/${projectId}`),
  
  endRoom: (roomId: string, recordingUrl?: string) =>
    fetchApi(`/video/rooms/${roomId}/end`, { method: 'PATCH', body: JSON.stringify({ recordingUrl }) }),
};

// Review Moderation
export const moderation = {
  getReviews: () => fetchApi('/moderation/reviews'),
  
  moderateReview: (reviewId: string, data: { action: 'approve' | 'reject'; moderationNotes?: string; moderatorId: string }) =>
    fetchApi(`/moderation/reviews/${reviewId}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

export default {
  auth,
  users,
  freelancers,
  projects,
  matches,
  milestones,
  deliverables,
  conversations,
  reviews,
  transactions,
  payments,
  activities,
  kyc,
  courses,
  categorization,
  events,
  video,
  moderation,
};
