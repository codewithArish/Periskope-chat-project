
export interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

export interface Chat {
  id: string;
  participants: string[];
  isGroup: boolean;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;
}
