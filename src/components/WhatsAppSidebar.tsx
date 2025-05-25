
import { useState } from "react";
import { useAuth } from "../App";
import { Chat, User } from "../types";
import { 
  MessageCircle, 
  Home, 
  Users, 
  Archive, 
  Star, 
  Settings, 
  MoreHorizontal,
  Search,
  Filter,
  Plus,
  Phone,
  ChevronDown,
  LogOut,
  Trash2
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import messageService from "../services/messageService";
import { toast } from "@/hooks/use-toast";

interface WhatsAppSidebarProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onDeleteChat: (chatId: string) => void;
  currentUser: User;
  users: User[];
}

const WhatsAppSidebar = ({ 
  chats, 
  selectedChat, 
  onSelectChat, 
  onDeleteChat, 
  currentUser,
  users 
}: WhatsAppSidebarProps) => {
  const { logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);

  const sidebarItems = [
    { icon: Home, label: "Home", active: false },
    { icon: MessageCircle, label: "Chats", active: true, count: 12 },
    { icon: Users, label: "Groups", active: false },
    { icon: Archive, label: "Archive", active: false },
    { icon: Star, label: "Starred", active: false },
    { icon: Settings, label: "Settings", active: false },
  ];

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please enter a group name and select at least one participant.",
        variant: "destructive",
      });
      return;
    }

    const participants = [currentUser.id, ...selectedUsers];
    messageService.createChat(participants, groupName, true, currentUser.id);
    
    setGroupName("");
    setSelectedUsers([]);
    setIsGroupDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Group chat created successfully!",
    });
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const formatTime = (timeString: string) => {
    if (timeString === "now") return "now";
    return timeString;
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

  const handleLogout = () => {
    logout();
  };

  const availableUsers = users.filter(user => user.id !== currentUser.id);

  return (
    <div className="flex h-screen bg-white">
      {/* Left Navigation */}
      <div className="w-16 bg-gray-100 border-r border-gray-300 flex flex-col items-center py-4">
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-6">
          <FaWhatsapp className="text-white text-lg" />
        </div>
        
        {sidebarItems.map((item, index) => (
          <div key={index} className="relative mb-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 ${
              item.active ? 'bg-green-100 text-green-600' : 'text-gray-600'
            }`}>
              <item.icon className="w-4 h-4" />
            </div>
            {item.count && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">{item.count}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chat List */}
      <div className="w-80 bg-white border-r border-gray-300 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-xl font-semibold text-gray-800">chats</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </div>
            <Menubar className="border-0 bg-transparent p-0 h-auto">
              <MenubarMenu>
                <MenubarTrigger className="p-0 h-auto bg-transparent border-0 hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
                  <MoreHorizontal className="w-4 h-4 text-gray-500 cursor-pointer" />
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
                    <LogOut className="w-3 h-3" />
                    <span className="text-sm">Logout</span>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>

          {/* Custom Filter and Group Chat Button */}
          <div className="flex items-center justify-between mb-4">
            <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded-full flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Custom filter</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Group Chat</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="groupName">Group Name</Label>
                    <Input
                      id="groupName"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Enter group name"
                    />
                  </div>
                  <div>
                    <Label>Select Participants</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {availableUsers.map((user) => (
                        <div key={user.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={user.id}
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                          />
                          <label htmlFor={user.id} className="text-sm font-medium">
                            {user.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateGroup} className="bg-green-500 hover:bg-green-600">
                      Create Group
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex items-center space-x-2">
              <Button variant="outline" className="text-sm px-3 py-1">
                Save
              </Button>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Search className="w-3 h-3" />
                <span>Search</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Filter className="w-3 h-3" />
                <span>Filtered</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        {/* Chat List */}
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
                  <div className="relative mr-3">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {chat.isGroup && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-500 rounded-full border-2 border-white flex items-center justify-center">
                        <Users className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 truncate text-sm">{chat.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Demo</span>
                        {chat.isGroup && <span className="text-xs text-green-500">internal</span>}
                        <span className="text-xs text-gray-400">{formatTime(chat.lastMessageTime || "")}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {chat.unreadCount > 0 && (
                          <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem 
                  onClick={() => handleDeleteChat(chat)}
                  className="flex items-center space-x-2 text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete Chat</span>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      </div>

      {/* Delete Chat Confirmation Dialog */}
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

export default WhatsAppSidebar;
