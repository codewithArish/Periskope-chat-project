
import { useState } from "react";
import { useAuth } from "../App";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "@/hooks/use-toast";
import authService from "../services/authService";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const recentUsers = authService.getRecentUsers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match",
            variant: "destructive"
          });
          return;
        }

        const result = authService.signup({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });

        if (result.success && result.user) {
          toast({
            title: "Success",
            description: "Account created successfully!"
          });
          
          login({
            id: result.user.id,
            name: result.user.name,
            phone: result.user.phone
          });
          navigate("/chat");
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive"
          });
        }
      } else {
        const result = authService.login(formData.email, formData.password);
        
        if (result.success && result.user) {
          login({
            id: result.user.id,
            name: result.user.name,
            phone: result.user.phone
          });
          navigate("/chat");
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (user: any) => {
    login({
      id: user.id,
      name: user.name,
      phone: user.phone
    });
    navigate("/chat");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <FaWhatsapp className="text-6xl text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-800">WhatsApp Web</h1>
          <p className="text-gray-600 mt-2">
            {isSignup ? "Create your account" : "Sign in to continue"}
          </p>
        </div>

        {/* Recent Users Quick Login */}
        {!isSignup && recentUsers.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">Quick login:</p>
            <div className="space-y-2">
              {recentUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleQuickLogin(user)}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="text-left">
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 border-t pt-4" />
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          {isSignup && (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your phone number"
                required
              />
            </div>
          )}
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {isSignup && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Confirm your password"
                required
              />
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors duration-200 font-medium disabled:opacity-50"
          >
            {loading ? "Please wait..." : (isSignup ? "Create Account" : "Sign In")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            {isSignup ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
