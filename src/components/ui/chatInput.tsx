import {
  FaPaperclip,
  FaRegSmile,
  FaClock,
  FaStar,
  FaFileAlt,
  FaMicrophone,
  FaPaperPlane,
} from "react-icons/fa";

export default function ChatInput() {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
      {/* Left Icons */}
      <div className="flex items-center gap-3 text-gray-600">
        <FaPaperclip className="w-5 h-5 cursor-pointer" />
        <FaRegSmile className="w-5 h-5 cursor-pointer" />
        <FaClock className="w-5 h-5 cursor-pointer" />
        <FaStar className="w-5 h-5 cursor-pointer" />
        <FaFileAlt className="w-5 h-5 cursor-pointer" />
        <FaMicrophone className="w-5 h-5 cursor-pointer" />
      </div>

      {/* Input Box */}
      <input
        type="text"
        placeholder="Message..."
        className="flex-1 mx-4 px-4 py-2 rounded-full border border-gray-300 focus:outline-none"
      />

      {/* Send Button */}
      <button className="bg-green-500 p-2 rounded-full text-white hover:bg-green-600">
        <FaPaperPlane className="w-4 h-4" />
      </button>
    </div>
  );
}
