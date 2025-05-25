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
  isRead: boolean;
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
  createdBy: string;
  createdAt: string;
}

class MessageService {
  private static instance: MessageService;
  private readonly CHATS_KEY = 'whatsapp_chats';
  private readonly MESSAGES_KEY = 'whatsapp_messages';
  private listeners: Array<(data: any) => void> = [];

  static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  private getChats(): Chat[] {
    const stored = localStorage.getItem(this.CHATS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveChats(chats: Chat[]): void {
    localStorage.setItem(this.CHATS_KEY, JSON.stringify(chats));
  }

  private getMessages(): { [chatId: string]: Message[] } {
    const stored = localStorage.getItem(this.MESSAGES_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  private saveMessages(messages: { [chatId: string]: Message[] }): void {
    localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(messages));
  }

  getUserChats(userId: string): Chat[] {
    const chats = this.getChats();
    return chats.filter(chat => chat.participants.includes(userId));
  }

  getChatMessages(chatId: string): Message[] {
    const messages = this.getMessages();
    return messages[chatId] || [];
  }

  deleteChat(chatId: string, userId: string): void {
    // Remove chat from chats list
    const chats = this.getChats();
    const filteredChats = chats.filter(chat => 
      chat.id !== chatId || !chat.participants.includes(userId)
    );
    this.saveChats(filteredChats);

    // Remove messages for this chat
    const messages = this.getMessages();
    delete messages[chatId];
    this.saveMessages(messages);

    // Notify listeners
    this.notifyListeners({ type: 'CHAT_DELETED', chatId, userId });
  }

  sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'isRead'>): Message {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
      isRead: false
    };

    const messages = this.getMessages();
    if (!messages[message.chatId]) {
      messages[message.chatId] = [];
    }
    messages[message.chatId].push(newMessage);
    this.saveMessages(messages);

    // Update chat last message
    const chats = this.getChats();
    const chatIndex = chats.findIndex(c => c.id === message.chatId);
    if (chatIndex !== -1) {
      chats[chatIndex].lastMessage = message.content;
      chats[chatIndex].lastMessageTime = 'now';
      
      // Update unread count for other participants
      chats[chatIndex].participants.forEach(participantId => {
        if (participantId !== message.senderId) {
          chats[chatIndex].unreadCount++;
        }
      });
      
      this.saveChats(chats);
    }

    // Simulate real-time by notifying listeners
    this.notifyListeners({ type: 'NEW_MESSAGE', message: newMessage });
    
    return newMessage;
  }

  createChat(participants: string[], name: string, isGroup: boolean, createdBy: string): Chat {
    const newChat: Chat = {
      id: Date.now().toString(),
      participants,
      isGroup,
      name,
      avatar: isGroup 
        ? `https://api.dicebear.com/7.x/shapes/svg?seed=${name}`
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${participants[1]}`,
      unreadCount: 0,
      createdBy,
      createdAt: new Date().toISOString()
    };

    const chats = this.getChats();
    chats.push(newChat);
    this.saveChats(chats);

    this.notifyListeners({ type: 'NEW_CHAT', chat: newChat });
    return newChat;
  }

  markChatAsRead(chatId: string, userId: string): void {
    const chats = this.getChats();
    const chatIndex = chats.findIndex(c => c.id === chatId);
    if (chatIndex !== -1) {
      chats[chatIndex].unreadCount = 0;
      this.saveChats(chats);
    }

    const messages = this.getMessages();
    if (messages[chatId]) {
      messages[chatId] = messages[chatId].map(msg => 
        msg.senderId !== userId ? { ...msg, isRead: true } : msg
      );
      this.saveMessages(messages);
    }
  }

  uploadFile(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // In a real app, this would upload to a server
        // For demo, we'll use data URL
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  // Simulate real-time messaging
  subscribe(callback: (data: any) => void): void {
    this.listeners.push(callback);
  }

  unsubscribe(callback: (data: any) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private notifyListeners(data: any): void {
    // Simulate network delay
    setTimeout(() => {
      this.listeners.forEach(listener => listener(data));
    }, 100);
  }
}

export default MessageService.getInstance();
