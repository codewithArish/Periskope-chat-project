import { useState, useEffect } from "react";
import { useAuth } from "../App";
import WhatsAppSidebar from "../components/WhatsAppSidebar";
import ChatArea from "../components/ChatArea";
import { Chat as ChatType, Message, User } from "../types";
import authService from "../services/authService";
import messageService from "../services/messageService";
import { toast } from "@/hooks/use-toast";

const Chat = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [users, setUsers] = useState<User[]>([]);
  const [demoChatsCreated, setDemoChatsCreated] = useState(false);

  const handleDeleteChat = (chatId: string) => {
    if (!user) return;

    try {
      messageService.deleteChat(chatId, user.id);
      
      // Update local state
      setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
      setMessages(prevMessages => {
        const newMessages = { ...prevMessages };
        delete newMessages[chatId];
        return newMessages;
      });

      // If the deleted chat was selected, clear selection
      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
      }

      toast({
        title: "Chat deleted",
        description: "The chat has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadChats();
      loadUsers();
      
      const handleRealtimeUpdate = (data: any) => {
        if (data.type === 'NEW_MESSAGE') {
          setMessages(prev => ({
            ...prev,
            [data.message.chatId]: [...(prev[data.message.chatId] || []), data.message]
          }));
          
          setChats(prevChats => 
            prevChats.map(chat => 
              chat.id === data.message.chatId
                ? {
                    ...chat,
                    lastMessage: data.message.content,
                    lastMessageTime: "now",
                    unreadCount: data.message.senderId !== user.id ? chat.unreadCount + 1 : chat.unreadCount
                  }
                : chat
            )
          );
        } else if (data.type === 'NEW_CHAT') {
          setChats(prevChats => [...prevChats, data.chat]);
        }
      };

      messageService.subscribe(handleRealtimeUpdate);

      return () => {
        messageService.unsubscribe(handleRealtimeUpdate);
      };
    }
  }, [user]);

  const loadChats = () => {
    if (user) {
      const userChats = messageService.getUserChats(user.id);
      setChats(userChats);
      
      const allMessages: { [chatId: string]: Message[] } = {};
      userChats.forEach(chat => {
        const chatMessages = messageService.getChatMessages(chat.id);
        const processedMessages = chatMessages.map(msg => ({
          ...msg,
          timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp
        }));
        allMessages[chat.id] = processedMessages;
      });
      setMessages(allMessages);
    }
  };

  const loadUsers = () => {
    const allUsers = authService.getAllUsers();
    setUsers(allUsers);
    
    // Only create demo chats once and if no chats exist
    if (allUsers.length > 1 && chats.length === 0 && !demoChatsCreated) {
      createDemoChats(allUsers);
      setDemoChatsCreated(true);
    }
  };

  const createDemoChats = (allUsers: User[]) => {
    if (!user) return;
    
    const otherUsers = allUsers.filter(u => u.id !== user.id);
    
    // Check if demo chats already exist to prevent duplicates
    const existingChats = messageService.getUserChats(user.id);
    if (existingChats.length > 0) return;
    
    otherUsers.slice(0, 2).forEach((otherUser, index) => {
      const newChat = messageService.createChat(
        [user.id, otherUser.id],
        otherUser.name,
        false,
        user.id
      );
      
      // Only send one demo message per chat
      if (index === 0) {
        messageService.sendMessage({
          chatId: newChat.id,
          senderId: otherUser.id,
          content: "Hey! How are you doing?",
          type: "text"
        });
      }
    });
    
    setTimeout(() => loadChats(), 100);
  };

  const handleSelectChat = (chat: ChatType) => {
    setSelectedChat(chat);
    
    messageService.markChatAsRead(chat.id, user!.id);
    setChats(prevChats => 
      prevChats.map(c => 
        c.id === chat.id 
          ? { ...c, unreadCount: 0 }
          : c
      )
    );
  };

  const handleSendMessage = (content: string, type: 'text' | 'image' | 'video' | 'audio' | 'file' = 'text', fileData?: any) => {
    if (!selectedChat || !user) return;

    const messageData: any = {
      chatId: selectedChat.id,
      senderId: user.id,
      content,
      type
    };

    if (fileData) {
      messageData.fileName = fileData.fileName;
      messageData.fileSize = fileData.fileSize;
      messageData.fileUrl = fileData.fileUrl;
    }

    const newMessage = messageService.sendMessage(messageData);

    setMessages(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage]
    }));

    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === selectedChat.id
          ? {
              ...chat,
              lastMessage: content,
              lastMessageTime: "now"
            }
          : chat
      )
    );
  };

  if (!user) return null;

  return (
    <div className="h-screen bg-gray-100 flex">
      <WhatsAppSidebar
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        currentUser={user}
        users={users}
      />
      <ChatArea
        selectedChat={selectedChat}
        messages={messages[selectedChat?.id || ""] || []}
        onSendMessage={handleSendMessage}
        currentUser={user}
        users={users}
      />
    </div>
  );
};

export default Chat;
