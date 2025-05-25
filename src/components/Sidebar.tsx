import { useState } from "react";
import { useAuth } from "../App";
import { Chat, User } from "../types";
import { BsThreeDotsVertical, BsChatLeft, BsFilter } from "react-icons/bs";
import { IoMdRefresh } from "react-icons/io";
import { FaWhatsapp } from "react-icons/fa";
import { LogOut, Trash2 } from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SidebarProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onDeleteChat: (chatId: string) => void;
  currentUser: User;
}

const Sidebar = ({ chats, selectedChat, onSelectChat, onDeleteChat, currentUser }: SidebarProps) => {
  const { logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timeString: string) => {
    if (timeString === "now") return "now";
    return timeString;
  };

  const handleLogout = () => {
    logout();
  };

  const handleDeleteChat = (chat: Chat) => {
    setChatToDelete(chat);
  };

  const confirmDeleteChat = () => {
    if (chatToDelete) {
      onDeleteChat(chatToDelete.id);
      setChatToDelete(null);
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
      <div className="bg-gray-100 p-4 border-b border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <FaWhatsapp className="text-white text-xl" />
            </div>
            <span className="font-medium text-gray-800">{currentUser.name}</span>
          </div>
          <div className="flex items-center space-x-3">
            <BsChatLeft className="text-gray-600 hover:text-gray-800 cursor-pointer" />
            
            <Menubar className="border-0 bg-transparent p-0 h-auto">
              <MenubarMenu>
                <MenubarTrigger className="p-0 h-auto bg-transparent border-0 hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
                  <BsThreeDotsVertical className="text-gray-600 hover:text-gray-800 cursor-pointer" />
                </MenubarTrigger>
                <MenubarContent className="bg-white border border-gray-200 shadow-lg rounded-md z-50">
                  <MenubarItem className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 cursor-pointer">
                    <span className="text-sm text-gray-700">New Group</span>
                  </MenubarItem>
                  <MenubarItem className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 cursor-pointer">
                    <span className="text-sm text-gray-700">Settings</span>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-green-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <BsFilter className="text-gray-600" />
          <span className="text-sm text-gray-600">Filters</span>
        </div>
        <IoMdRefresh className="text-gray-600 hover:text-gray-800 cursor-pointer" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
          <ContextMenu key={chat.id}>
            <ContextMenuTrigger>
              <div
                onClick={() => onSelectChat(chat)}
                className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                  selectedChat?.id === chat.id ? 'bg-gray-100' : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {chat.isGroup && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs">G</span>
                    </div>
                  )}
                </div>
                
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">{chat.name}</h3>
                    <span className="text-xs text-gray-500">{formatTime(chat.lastMessageTime || "")}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                    {chat.unreadCount > 0 && (
                      <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem 
                onClick={() => handleDeleteChat(chat)}
                className="flex items-center space-x-2 text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Chat</span>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>

      <AlertDialog open={!!chatToDelete} onOpenChange={() => setChatToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the chat with "{chatToDelete?.name}"? This action cannot be undone and all messages will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteChat}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Sidebar;
