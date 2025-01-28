import { Switch, Route, BaseLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";

// Use base URL from environment or default to '/' for local development
const base = import.meta.env.VITE_BASE_URL || '/';

// Create a base location that handles the repository name in the path
const baseLocation = () => {
  const path = window.location.pathname;
  // Remove the base path if it exists at the start of the pathname
  const location = base !== '/' && path.startsWith(base) 
    ? path.slice(base.length) || '/'
    : path;
  return location;
};

function Router() {
  return (
    <Switch base={base} location={baseLocation}>
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