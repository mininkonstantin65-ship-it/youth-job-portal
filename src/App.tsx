
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ActivityProvider } from "@/contexts/ActivityContext";
import "@/utils/clearLocalStorage";
import { checkAndUpdateVersion } from "@/utils/versionCheck";

checkAndUpdateVersion();
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterEmployer from "./pages/RegisterEmployer";
import SubscriptionSelect from "./pages/SubscriptionSelect";
import UserSubscription from "./pages/UserSubscription";
import Profile from "./pages/Profile";
import EmployerProfile from "./pages/EmployerProfile";
import CreateJob from "./pages/CreateJob";
import Test from "./pages/Test";
import Vacancies from "./pages/Vacancies";
import JobDetails from "./pages/JobDetails";
import Chat from "./pages/Chat";
import MyChats from "./pages/MyChats";
import SavedJobs from "./pages/SavedJobs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ActivityProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register-employer" element={<RegisterEmployer />} />
              <Route path="/subscription-select" element={<SubscriptionSelect />} />
              <Route path="/user-subscription" element={<UserSubscription />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/employer-profile" element={<EmployerProfile />} />
              <Route path="/create-job" element={<CreateJob />} />
              <Route path="/test" element={<Test />} />
              <Route path="/vacancies" element={<Vacancies />} />
              <Route path="/job/:id" element={<JobDetails />} />
              <Route path="/chat/:id" element={<Chat />} />
              <Route path="/my-chats" element={<MyChats />} />
              <Route path="/saved-jobs" element={<SavedJobs />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ActivityProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;