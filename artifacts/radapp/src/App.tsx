import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ForgotPassword from "@/pages/forgot-password";
import Dashboard from "@/pages/dashboard";
import Upload from "@/pages/upload";
import ReportResults from "@/pages/report-results";
import SharedReport from "@/pages/shared-report";
import Chat from "@/pages/chat";
import About from "@/pages/about";

// Inject x-user-id header into every API request
setAuthTokenGetter(() => null); // keep existing auth logic

// Monkey-patch fetch to inject x-user-id from localStorage
const _origFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : (input as Request).url;
  if (url.startsWith("/api")) {
    const stored = localStorage.getItem("radapp_user");
    const userId = stored ? JSON.parse(stored).id : null;
    if (userId) {
      const headers = new Headers((init as RequestInit).headers);
      headers.set("x-user-id", userId);
      return _origFetch(input, { ...init, headers });
    }
  }
  return _origFetch(input, init);
};

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/upload" component={Upload} />
      <Route path="/reports/:id" component={ReportResults} />
      <Route path="/shared/:token" component={SharedReport} />
      <Route path="/chat" component={Chat} />
      <Route path="/about" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="radapp-theme">
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthProvider>
              <Router />
            </AuthProvider>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
