'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical,
  Search,
  Check,
  CheckCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';

export function MessagesView() {
  const { conversations, currentUser } = useApp();
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]?.id || '');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConvo = conversations.find(c => c.id === selectedConversation);
  const otherParticipant = selectedConvo?.participants.find(p => p.id !== currentUser?.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: `msg${Date.now()}`,
      senderId: currentUser?.id || 'f1',
      senderName: currentUser?.name || 'You',
      senderAvatar: currentUser?.avatar,
      content: message,
      timestamp: new Date(),
      read: false,
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  const filteredConversations = conversations.filter(c => {
    const other = c.participants.find(p => p.id !== currentUser?.id);
    return other?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString();
  };

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      <Card className="h-full card-shadow overflow-hidden">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className={cn(
            "w-full md:w-80 border-r flex flex-col",
            selectedConversation && "hidden md:flex"
          )}>
            <CardHeader className="border-b p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <ScrollArea className="flex-1">
              <div className="p-2">
                {filteredConversations.map((convo) => {
                  const other = convo.participants.find(p => p.id !== currentUser?.id);
                  const isSelected = convo.id === selectedConversation;
                  
                  return (
                    <button
                      key={convo.id}
                      onClick={() => setSelectedConversation(convo.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                        isSelected ? "bg-[#00B8A9]/10" : "hover:bg-muted/50"
                      )}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={other?.avatar} />
                          <AvatarFallback>{other?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {convo.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#FF6B6B] text-[10px] font-bold text-white flex items-center justify-center">
                            {convo.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn(
                            "font-medium truncate",
                            convo.unreadCount > 0 && "font-semibold"
                          )}>
                            {other?.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {convo.lastMessage && formatTime(convo.lastMessage.timestamp)}
                          </span>
                        </div>
                        <p className={cn(
                          "text-sm truncate",
                          convo.unreadCount > 0 ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {convo.lastMessage?.content}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className={cn(
            "flex-1 flex flex-col",
            !selectedConversation && "hidden md:flex"
          )}>
            {selectedConvo ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setSelectedConversation('')}
                    >
                      ←
                    </Button>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={otherParticipant?.avatar} />
                      <AvatarFallback>{otherParticipant?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{otherParticipant?.name}</h3>
                      <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg, index) => {
                      const isOwn = msg.senderId === currentUser?.id;
                      const showDate = index === 0 || 
                        formatDate(messages[index - 1].timestamp) !== formatDate(msg.timestamp);
                      
                      return (
                        <React.Fragment key={msg.id}>
                          {showDate && (
                            <div className="flex items-center justify-center my-4">
                              <Badge variant="secondary" className="text-xs">
                                {formatDate(msg.timestamp)}
                              </Badge>
                            </div>
                          )}
                          <div className={cn(
                            "flex gap-3",
                            isOwn && "flex-row-reverse"
                          )}>
                            {!isOwn && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={msg.senderAvatar} />
                                <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                            <div className={cn(
                              "max-w-[70%] space-y-1",
                              isOwn && "items-end"
                            )}>
                              <div className={cn(
                                "rounded-2xl px-4 py-2",
                                isOwn 
                                  ? "bg-[#00B8A9] text-white rounded-br-md" 
                                  : "bg-muted rounded-bl-md"
                              )}>
                                <p className="text-sm">{msg.content}</p>
                              </div>
                              <div className={cn(
                                "flex items-center gap-1 text-xs text-muted-foreground",
                                isOwn && "justify-end"
                              )}>
                                <span>{formatTime(msg.timestamp)}</span>
                                {isOwn && (
                                  msg.read 
                                    ? <CheckCheck className="h-3 w-3 text-[#00B8A9]" />
                                    : <Check className="h-3 w-3" />
                                )}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      className="bg-[#00B8A9] hover:bg-[#00A89A] text-white"
                      disabled={!message.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Select a Conversation</h3>
                  <p className="text-muted-foreground">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
