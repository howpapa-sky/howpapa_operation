import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import EvaluateForm from "./pages/EvaluateForm";
import Dashboard from "./pages/Dashboard";
import Samples from "./pages/Samples";
import SampleDetail from "./pages/SampleDetail";
import SampleForm from "./pages/SampleForm";
import Evaluate from "./pages/Evaluate";
import Admin from "./pages/Admin";
import Projects from "./pages/Projects";
import ProjectForm from "./pages/ProjectForm";
import ProjectDetail from "./pages/ProjectDetail";
import Vendors from "./pages/Vendors";
import AIAssistant from "./pages/AIAssistant";
import Accounts from "./pages/Accounts";
import AccountForm from "./pages/AccountForm";
import MyTasks from "./pages/MyTasks";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/home"} component={Home} />
      <Route path={"/my-tasks"} component={MyTasks} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/projects"} component={Projects} />
      <Route path={"/projects/new"} component={ProjectForm} />
      <Route path={"/projects/:id"} component={ProjectDetail} />
      <Route path={"/projects/:id/edit"} component={ProjectForm} />
      <Route path={"/vendors"} component={Vendors} />
      <Route path={"/ai-assistant"} component={AIAssistant} />
      <Route path={"/accounts"} component={Accounts} />
      <Route path={"/accounts/new"} component={AccountForm} />
      <Route path={"/accounts/:id/edit"} component={AccountForm} />
      <Route path={"/samples/:id/evaluate"} component={EvaluateForm} />
      <Route path={"/404"} component={NotFound} />
      <Route path={"/samples"} component={Samples} />
      <Route path={"/samples/new"} component={SampleForm} />
      <Route path={"/samples/:id"} component={SampleDetail} />
      <Route path={"/samples/:id/edit"} component={SampleForm} />
      <Route path={"/evaluate/:sampleId"} component={Evaluate} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
