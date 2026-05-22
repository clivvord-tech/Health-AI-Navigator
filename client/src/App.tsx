import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ForgotPassword from "@/pages/forgot-password";
import Dashboard from "@/pages/dashboard";
import Upload from "@/pages/upload";
import Reports from "@/pages/reports";
import ReportResults from "@/pages/report-results";
import SharedReport from "@/pages/shared-report";
import Chat from "@/pages/chat";
import About from "@/pages/about";
import SymptomChecker from "@/pages/symptom-checker";
import ClinicFinder from "@/pages/clinic-finder";
import CostEstimator from "@/pages/cost-estimator";
import InsurancePlans from "@/pages/insurance-plans";
import PaymentPlans from "@/pages/payment-plans";
import Pricing from "@/pages/pricing";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="medinav-theme">
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") ?? ""}>
          <AuthProvider>
            <Switch>
              {/* Core */}
              <Route path="/" component={Landing} />
              <Route path="/login" component={Login} />
              <Route path="/signup" component={Signup} />
              <Route path="/forgot-password" component={ForgotPassword} />
              <Route path="/dashboard" component={Dashboard} />
              {/* Radiology — original core feature */}
              <Route path="/upload" component={Upload} />
              <Route path="/reports" component={Reports} />
              <Route path="/reports/:id" component={ReportResults} />
              <Route path="/shared/:token" component={SharedReport} />
              {/* AI Chat */}
              <Route path="/chat" component={Chat} />
              {/* New health finance features */}
              <Route path="/symptom-checker" component={SymptomChecker} />
              <Route path="/clinic-finder" component={ClinicFinder} />
              <Route path="/cost-estimator" component={CostEstimator} />
              <Route path="/insurance-plans" component={InsurancePlans} />
              <Route path="/payment-plans" component={PaymentPlans} />
              <Route path="/pricing" component={Pricing} />
              {/* About */}
              <Route path="/about" component={About} />
              <Route component={NotFound} />
            </Switch>
          </AuthProvider>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
