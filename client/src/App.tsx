import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";

// Use base URL from environment or default to '/' for local development
const base = import.meta.env.VITE_BASE_URL || '/';

function Router() {
  // Custom hook to handle base path
  const [location, setLocation] = useLocation();

  // Remove base path from location for internal routing
  const currentPath = location.startsWith(base) ? location.slice(base.length) || '/' : location;

  return (
    <Switch base={base}>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;