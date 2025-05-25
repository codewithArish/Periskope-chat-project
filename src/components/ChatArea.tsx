import { useState, useRef, useEffect } from "react";
import { Chat, Message, User } from "../types";
import { BsThreeDotsVertical, BsSearch, BsTelephone, BsCamera } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import { MdAttachFile, MdEmojiEmotions, MdImage, MdVideocam, MdInsertDriveFile } from "react-icons/md";
import { RiMicFill } from "react-icons/ri";
import { HiVideoCamera, HiPhone } from "react-icons/hi2";
import { FiSearch, FiMoreVertical } from "react-icons/fi";
import { AiOutlinePaperClip, AiOutlineSmile } from "react-icons/ai";
import { BsMic, BsSend } from "react-icons/bs";
import { 
  RefreshCw, 
  Edit, 
  BarChart3, 
  Menu, 
  RotateCcw, 
  Users, 
  AtSign, 
  Image as ImageIcon,
  Hash
} from "lucide-react";
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
  const [showAttachments, setShowAttachments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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
      
      toast({
        title: "File uploaded",
        description: `${fileName} has been uploaded successfully.`
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'image');
    }
    setShowAttachments(false);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'video');
    }
    setShowAttachments(false);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, 'file');
    }
    setShowAttachments(false);
  };

  const handleVoiceRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Voice recording feature is simulated in this demo."
      });
      
      setTimeout(() => {
        setIsRecording(false);
        if (selectedChat) {
          onSendMessage("Voice message", 'audio');
        }
      }, 3000);
    }
  };

  const formatMessageTime = (timestamp: Date | string) => {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      if (isNaN(date.getTime())) {
        return "now";
      }
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);
    } catch (error) {
      return "now";
    }
  };

  const getUserName = (userId: string) => {
    if (userId === currentUser.id) return currentUser.name;
    const user = users.find(u => u.id === userId);
    return user?.name || "Unknown User";
  };

  const renderMessage = (message: Message) => {
    const isOwnMessage = message.senderId === currentUser.id;
    
    return (
      <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
            isOwnMessage ? "bg-green-500 text-white" : "bg-white text-gray-900"
          }`}
        >
          {selectedChat?.isGroup && !isOwnMessage && (
            <p className="text-xs font-medium text-green-600 mb-1">
              {getUserName(message.senderId)}
            </p>
          )}
          
          {/* Render different message types */}
          {message.type === 'image' && message.fileUrl && (
            <div className="mb-2">
              <img
                src={message.fileUrl}
                alt="Shared image"
                className="max-w-full h-auto rounded-md"
              />
            </div>
          )}
          
          {message.type === 'video' && message.fileUrl && (
            <div className="mb-2">
              <video
                src={message.fileUrl}
                controls
                className="max-w-full h-auto rounded-md"
              />
            </div>
          )}
          
          {message.type === 'audio' && (
            <div className="flex items-center space-x-2 mb-2">
              <BsMic className="text-lg" />
              <span className="text-sm">Voice message</span>
            </div>
          )}
          
          {message.type === 'file' && (
            <div className="flex items-center space-x-2 mb-2">
              <MdInsertDriveFile className="text-lg" />
              <div>
                <p className="text-sm font-medium">{message.fileName}</p>
                {message.fileSize && (
                  <p className="text-xs opacity-75">
                    {(message.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
            </div>
          )}
          
          <p className="text-sm">{message.content}</p>
          <p className={`text-xs mt-1 ${
            isOwnMessage ? "text-green-100" : "text-gray-500"
          }`}>
            {formatMessageTime(message.timestamp)}
            {isOwnMessage && <span className="ml-1">✓✓</span>}
          </p>
        </div>
      </div>
    );
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 bg-[#efeae2] flex">
        <div className="flex-1 flex items-center justify-center" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260' viewBox='0 0 260 260'%3E%3Cpath fill='%23f0f0f0' fill-opacity='0.4' d='M129.5 67.5c34.5 0 62.5 28 62.5 62.5s-28 62.5-62.5 62.5-62.5-28-62.5-62.5 28-62.5 62.5-62.5zm0 5c-31.8 0-57.5 25.7-57.5 57.5s25.7 57.5 57.5 57.5 57.5-25.7 57.5-57.5-25.7-57.5-57.5-57.5z'/%3E%3Cpath fill='%23f0f0f0' fill-opacity='0.2' d='M129.5 102.5c15.2 0 27.5 12.3 27.5 27.5s-12.3 27.5-27.5 27.5-27.5-12.3-27.5-27.5 12.3-27.5 27.5-27.5zm0 5c-12.4 0-22.5 10.1-22.5 22.5s10.1 22.5 22.5 22.5 22.5-10.1 22.5-22.5-10.1-22.5-22.5-22.5z'/%3E%3C/svg%3E")`,
               backgroundRepeat: 'repeat',
               backgroundSize: '260px 260px'
             }}>
          <div className="text-center">
            <div className="w-64 h-64 mx-auto mb-8 opacity-20">
              <svg viewBox="0 0 303 172" width="360" height="200" className="text-gray-400">
                <path fill="currentColor" d="M229.565 160.229c-6.297 9.766-16.075 15.771-26.213 15.771H50.064C31.321 176 16 160.679 16 142.017V46.997C16 28.334 31.321 13.014 50.064 13.014h153.288c18.743 0 34.064 15.32 34.064 33.983v95.02c0 8.566-4.302 16.614-11.851 21.212z"></path>
                <path fill="#f1f1f2" fillRule="evenodd" d="M249.833 69.334L172.13 15.09C159.688 5.849 142.312 5.849 129.87 15.09L52.167 69.334C38.881 79.176 38.881 96.824 52.167 106.666L129.87 160.91c12.442 9.241 29.818 9.241 42.26 0l77.703-54.244c13.286-9.842 13.286-27.49 0-37.332z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-light text-gray-600 mb-2">WhatsApp Web</h2>
            <p className="text-gray-500">Send and receive messages without keeping your phone online.</p>
            <p className="text-gray-500 mt-2">Select a chat to start messaging.</p>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="w-12 bg-gray-50 border-l border-gray-300 flex flex-col items-center py-4 space-y-4">
          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded">
            <Edit className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded">
            <BarChart3 className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded">
            <Menu className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded">
            <Users className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded">
            <AtSign className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded">
            <ImageIcon className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded">
            <Hash className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-[#efeae2]">
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-[#f0f2f5] border-b border-gray-300 p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={selectedChat.avatar}
              alt={selectedChat.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-medium text-gray-900">{selectedChat.name}</h3>
              <p className="text-sm text-gray-600">
                {selectedChat.isGroup ? `${selectedChat.participants.length} participants` : "online"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <FiSearch className="text-gray-600 hover:text-gray-800 cursor-pointer w-5 h-5" />
            <HiVideoCamera className="text-gray-600 hover:text-gray-800 cursor-pointer w-5 h-5" />
            <HiPhone className="text-gray-600 hover:text-gray-800 cursor-pointer w-5 h-5" />
            <FiMoreVertical className="text-gray-600 hover:text-gray-800 cursor-pointer w-5 h-5" />
          </div>
        </div>

        {/* Messages Area with WhatsApp wallpaper */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#efeae2]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260' viewBox='0 0 260 260'%3E%3Cpath fill='%23f0f0f0' fill-opacity='0.4' d='M129.5 67.5c34.5 0 62.5 28 62.5 62.5s-28 62.5-62.5 62.5-62.5-28-62.5-62.5 28-62.5 62.5-62.5zm0 5c-31.8 0-57.5 25.7-57.5 57.5s25.7 57.5 57.5 57.5 57.5-25.7 57.5-57.5-25.7-57.5-57.5-57.5z'/%3E%3Cpath fill='%23f0f0f0' fill-opacity='0.2' d='M129.5 102.5c15.2 0 27.5 12.3 27.5 27.5s-12.3 27.5-27.5 27.5-27.5-12.3-27.5-27.5 12.3-27.5 27.5-27.5zm0 5c-12.4 0-22.5 10.1-22.5 22.5s10.1 22.5 22.5 22.5 22.5-10.1 22.5-22.5-10.1-22.5-22.5-22.5z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '260px 260px'
        }}>
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>

        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          className="hidden"
        />
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleDocumentUpload}
          className="hidden"
        />

        {/* Attachment menu */}
        {showAttachments && (
          <div className="bg-white border-t border-gray-300 p-4">
            <div className="flex items-center justify-around">
              <button
                onClick={() => imageInputRef.current?.click()}
                className="flex flex-col items-center space-y-1 p-3 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors"
              >
                <MdImage className="text-xl" />
                <span className="text-xs">Photo</span>
              </button>
              <button
                onClick={() => videoInputRef.current?.click()}
                className="flex flex-col items-center space-y-1 p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <MdVideocam className="text-xl" />
                <span className="text-xs">Video</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center space-y-1 p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                <MdInsertDriveFile className="text-xl" />
                <span className="text-xs">Document</span>
              </button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="bg-[#f0f2f5] p-4 border-t border-gray-300">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <AiOutlineSmile className="text-gray-600 hover:text-gray-800 cursor-pointer text-xl" />
            <button
              type="button"
              onClick={() => setShowAttachments(!showAttachments)}
              className="text-gray-600 hover:text-gray-800 cursor-pointer text-xl"
            >
              <AiOutlinePaperClip />
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message"
                className="w-full bg-white border border-gray-300 rounded-full px-4 py-2 pr-12 text-sm focus:outline-none focus:border-green-500"
              />
            </div>
            
            {messageInput.trim() ? (
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 transition-colors duration-200"
              >
                <BsSend className="text-lg" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleVoiceRecording}
                className={`rounded-full p-2 transition-colors duration-200 text-lg ${
                  isRecording 
                    ? "bg-red-500 text-white" 
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <BsMic />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-12 bg-gray-50 border-l border-gray-300 flex flex-col items-center py-4 space-y-4">
        <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded">
          <RefreshCw className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded">
          <Edit className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded">
          <BarChart3 className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded">
          <Menu className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded">
          <RotateCcw className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded">
          <Users className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded">
          <AtSign className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded">
          <ImageIcon className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded">
          <Hash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatArea;
