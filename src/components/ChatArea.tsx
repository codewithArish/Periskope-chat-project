import { useState, useRef, useEffect } from "react";
import { Chat, Message, User } from "../types";
import { FiMoreVertical, FiSearch } from "react-icons/fi";
import { HiVideoCamera, HiPhone } from "react-icons/hi2";
import { IoMdSend } from "react-icons/io";
import { MdEmojiEmotions, MdImage, MdInsertDriveFile, MdVideocam } from "react-icons/md";
import { RiMicFill } from "react-icons/ri";
import { toast } from "@/hooks/use-toast";
import messageService from "../services/messageService";

interface ChatAreaProps {
  selectedChat: Chat | null;
  messages: Message[];
  onSendMessage: (content: string, type?: 'text' | 'image' | 'video' | 'audio' | 'file', fileData?: any) => void;
  currentUser: User;
  users: User[];
}

const ChatArea = ({ selectedChat, messages, onSendMessage, currentUser, users }: ChatAreaProps) => {
  const [messageInput, setMessageInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && selectedChat) {
      onSendMessage(messageInput.trim());
      setMessageInput("");
    }
  };

  const handleFileUpload = async (file: File, type: 'image' | 'video' | 'file') => {
    if (!selectedChat) return;
    try {
      const fileUrl = await messageService.uploadFile(file);
      const fileSize = file.size;
      const fileName = file.name;

      onSendMessage(fileName, type, { fileUrl, fileSize, fileName });
      toast({ title: "File uploaded", description: `${fileName} has been uploaded successfully.` });
    } catch {
      toast({ title: "Upload failed", description: "Failed to upload file. Please try again.", variant: "destructive" });
    }
  };

  const formatMessageTime = (timestamp: Date | string) => {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
    } catch {
      return "now";
    }
  };

  const renderMessage = (message: Message) => {
    const isOwn = message.senderId === currentUser.id;
    return (
      <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-xs px-4 py-2 rounded-lg ${isOwn ? "bg-green-500 text-white" : "bg-white text-gray-900"}`}>
          {selectedChat?.isGroup && !isOwn && <p className="text-xs text-green-600 mb-1">{users.find(u => u.id === message.senderId)?.name}</p>}
          {message.type === 'image' && <img src={message.fileUrl} alt="image" className="max-w-full h-auto rounded-md mb-2" />}
          {message.type === 'video' && <video src={message.fileUrl} controls className="max-w-full h-auto rounded-md mb-2" />}
          {message.type === 'audio' && <div className="flex items-center space-x-2 mb-2"><RiMicFill /><span>Voice message</span></div>}
          {message.type === 'file' && (
            <div className="flex items-center space-x-2 mb-2">
              <MdInsertDriveFile className="text-lg" />
              <div>
                <p className="text-sm font-medium">{message.fileName}</p>
                <p className="text-xs">{(message.fileSize / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          )}
          <p className="text-sm">{message.content}</p>
          <p className="text-xs mt-1 text-right">{formatMessageTime(message.timestamp)} {isOwn && "✓✓"}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#efeae2]">
      {selectedChat ? (
        <>
          <div className="bg-[#f0f2f5] border-b p-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={selectedChat.avatar} alt={selectedChat.name} className="w-10 h-10 rounded-full" />
              <div>
                <h3 className="font-medium">{selectedChat.name}</h3>
                <p className="text-sm text-gray-600">{selectedChat.isGroup ? `${selectedChat.participants.length} participants` : "online"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <FiSearch className="w-5 h-5 cursor-pointer" />
              <HiVideoCamera className="w-5 h-5 cursor-pointer" />
              <HiPhone className="w-5 h-5 cursor-pointer" />
              <FiMoreVertical className="w-5 h-5 cursor-pointer" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ backgroundImage: `url('/whatsapp-bg.svg')` }}>
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 flex items-center bg-[#f0f2f5]">
            <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2"><MdImage /></button>
            <input type="file" ref={imageInputRef} className="hidden" onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'image')} />
            <button type="button" onClick={() => videoInputRef.current?.click()} className="p-2"><MdVideocam /></button>
            <input type="file" ref={videoInputRef} className="hidden" onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'video')} />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2"><MdInsertDriveFile /></button>
            <input type="file" ref={fileInputRef} className="hidden" onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'file')} />
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message"
              className="flex-1 mx-2 px-4 py-2 rounded-full bg-white border border-gray-300"
            />
            <button type="submit" className="p-2 text-green-600"><IoMdSend size={24} /></button>
          </form>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a chat to start messaging.
        </div>
      )}
    </div>
  );
};

export default ChatArea;
