// Video meeting integrations

export type MeetingProvider = 'google-meet' | 'daily' | 'whereby';

interface MeetingRoom {
  roomId: string;
  roomUrl: string;
  roomName: string;
  provider: MeetingProvider;
}

// Generate Google Meet-style link (requires Google Calendar API in production)
export function generateGoogleMeetLink(projectId: string): MeetingRoom {
  const roomId = crypto.randomUUID();
  const code = generateMeetCode();
  
  return {
    roomId,
    roomUrl: `https://meet.google.com/${code}`,
    roomName: `FreelanceMatch-${projectId}`,
    provider: 'google-meet'
  };
}

// Generate Daily.co room (free tier)
export function generateDailyRoom(projectId: string): MeetingRoom {
  const roomId = crypto.randomUUID();
  const roomName = `fm-${projectId}-${Date.now()}`;
  
  return {
    roomId,
    roomUrl: `https://freelancematch.daily.co/${roomName}`,
    roomName,
    provider: 'daily'
  };
}

// Generate Whereby room (free tier)
export function generateWherebyRoom(projectId: string): MeetingRoom {
  const roomId = crypto.randomUUID();
  const roomName = `freelancematch-${projectId}-${Date.now()}`;
  
  return {
    roomId,
    roomUrl: `https://whereby.com/${roomName}`,
    roomName,
    provider: 'whereby'
  };
}

// Generate meet code (Google Meet style: xxx-xxxx-xxx)
function generateMeetCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${part1}-${part2}-${part3}`;
}

// Main function to create meeting room
export function createMeetingRoom(projectId: string, provider: MeetingProvider = 'google-meet'): MeetingRoom {
  switch (provider) {
    case 'google-meet':
      return generateGoogleMeetLink(projectId);
    case 'daily':
      return generateDailyRoom(projectId);
    case 'whereby':
      return generateWherebyRoom(projectId);
    default:
      return generateGoogleMeetLink(projectId);
  }
}
