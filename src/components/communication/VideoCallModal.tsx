'use client';

import React, { useState } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  Monitor,
  MessageSquare,
  Settings,
  Maximize2,
  Users,
  Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  projectTitle?: string;
  onRecord?: () => void;
}

export function VideoCallModal({
  isOpen,
  onClose,
  participants,
  projectTitle,
  onRecord,
}: VideoCallModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const handleEndCall = () => {
    onClose();
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
    onRecord?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full bg-[#1A2B4A]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {participants.slice(0, 3).map((p) => (
                  <Avatar key={p.id} className="h-8 w-8 border-2 border-[#1A2B4A]">
                    <AvatarImage src={p.avatar} alt={p.name} />
                    <AvatarFallback className="bg-[#00B8A9] text-white text-xs">
                      {p.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  {participants.map(p => p.name).join(', ')}
                </p>
                {projectTitle && (
                  <p className="text-white/60 text-xs">{projectTitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isRecording && (
                <Badge className="bg-[#D63031] text-white animate-pulse">
                  <Circle className="h-2 w-2 mr-1 fill-current" />
                  Recording
                </Badge>
              )}
              <Badge variant="outline" className="border-white/20 text-white/80">
                <Users className="h-3 w-3 mr-1" />
                {participants.length}
              </Badge>
            </div>
          </div>

          {/* Video Area */}
          <div className="flex-1 relative p-4">
            {/* Main Video */}
            <div className="w-full h-full rounded-xl bg-[#0A1B3A] flex items-center justify-center overflow-hidden">
              {isVideoOn ? (
                <div className="relative w-full h-full">
                  {/* Placeholder for video stream */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1A2B4A] to-[#0A1B3A]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={participants[0]?.avatar} />
                      <AvatarFallback className="bg-[#00B8A9] text-white text-4xl">
                        {participants[0]?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {/* Name overlay */}
                  <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1.5 rounded-lg">
                    <p className="text-white text-sm font-medium">{participants[0]?.name}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <VideoOff className="h-16 w-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/50">Camera is off</p>
                </div>
              )}
            </div>

            {/* Self View (Picture-in-Picture) */}
            <div className="absolute bottom-8 right-8 w-48 h-36 rounded-lg bg-[#0A1B3A] border-2 border-white/20 overflow-hidden shadow-xl">
              <div className="w-full h-full flex items-center justify-center">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-[#1A2B4A] text-white">You</AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">
                You {isMuted && '(Muted)'}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 px-4 py-4 bg-[#0A1B3A]">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full",
                isMuted
                  ? "bg-[#D63031] text-white hover:bg-[#D63031]/90"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full",
                !isVideoOn
                  ? "bg-[#D63031] text-white hover:bg-[#D63031]/90"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
              onClick={() => setIsVideoOn(!isVideoOn)}
            >
              {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full",
                isScreenSharing
                  ? "bg-[#00B8A9] text-white hover:bg-[#00B8A9]/90"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
              onClick={() => setIsScreenSharing(!isScreenSharing)}
            >
              <Monitor className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full",
                isRecording
                  ? "bg-[#D63031] text-white hover:bg-[#D63031]/90"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
              onClick={handleRecord}
            >
              <Circle className={cn("h-5 w-5", isRecording && "fill-current")} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>

            <div className="w-px h-8 bg-white/20 mx-2" />

            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-[#D63031] text-white hover:bg-[#D63031]/90"
              onClick={handleEndCall}
            >
              <Phone className="h-5 w-5 rotate-[135deg]" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Schedule Call Component
interface ScheduleCallProps {
  onSchedule: (date: Date) => void;
  participantName: string;
}

export function ScheduleCallButton({ onSchedule, participantName }: ScheduleCallProps) {
  return (
    <Button variant="outline" size="sm" className="gap-2">
      <Video className="h-4 w-4" />
      Schedule Call with {participantName}
    </Button>
  );
}
