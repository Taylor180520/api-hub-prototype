import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import AppLayout from "./components/AppLayout";
import MarketplacePage from "./pages/MarketplacePage";
import ApiDetailPage from "./pages/ApiDetailPage";
import WorkspacePage from "./pages/WorkspacePage";

function Router() {
  const [location] = useLocation();
  // API Console is full-screen (no sidebar), detected by view state inside ApiDetailPage
  // We always show sidebar for detail page itself; the console overlay handles its own header
  return (
    <AppLayout>
      <Switch>
        <Route path={"/"} component={MarketplacePage} />
        <Route path={"/api/:id"} component={ApiDetailPage} />
        <Route path={"/workspace"} component={WorkspacePage} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <SubscriptionProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </SubscriptionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
