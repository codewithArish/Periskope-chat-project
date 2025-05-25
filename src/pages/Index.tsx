
import { useAuth } from "../App";
import Login from "./Login";
import Chat from "./Chat";

const Index = () => {
  const { user } = useAuth();
  
  return user ? <Chat /> : <Login />;
};

export default Index;
