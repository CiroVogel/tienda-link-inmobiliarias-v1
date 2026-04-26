import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

import Home from "./pages/Home";
import Booking from "./pages/Booking";
import PropertyDetail from "./pages/PropertyDetail";
import PropertyList from "./pages/PropertyList";
import LegalResponsabilidadComercial from "./pages/LegalResponsabilidadComercial";
import LegalMiniWebServicios from "./pages/LegalMiniWebServicios";

import LocalLogin from "./pages/LocalLogin";

import AdminBookings from "./pages/admin/AdminBookings";
import AdminInterested from "./pages/admin/AdminInterested";
import AdminInterestedDetail from "./pages/admin/AdminInterestedDetail";
import AdminSavedSearches from "./pages/admin/AdminSavedSearches";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminServices from "./pages/admin/AdminServices";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminAvailability from "./pages/admin/AdminAvailability";
import AdminCreatePage from "./pages/admin/AdminCreatePage";

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/admin-login" component={LocalLogin} />

      <Route path="/admin" component={AdminBookings} />
      <Route path="/admin/interesados" component={AdminInterested} />
      <Route path="/admin/interesados/:requestId" component={AdminInterestedDetail} />
      <Route path="/admin/busquedas-guardadas" component={AdminSavedSearches} />
      <Route path="/admin/profile" component={AdminProfile} />
      <Route path="/admin/services" component={AdminServices} />
      <Route path="/admin/gallery" component={AdminGallery} />
      <Route path="/admin/availability" component={AdminAvailability} />
      <Route path="/admin/create-page" component={AdminCreatePage} />
      <Route path="/admin/nueva-inmobiliaria" component={AdminCreatePage} />

      <Route
        path="/"
        component={() => <Home forcedSlug="clave-urbana-propiedades" />}
      />

      <Route
        path="/:slug/legal/responsabilidad-comercial"
        component={LegalResponsabilidadComercial}
      />
      <Route
        path="/:slug/legal/mini-web-servicios"
        component={LegalMiniWebServicios}
      />
      <Route path="/:slug" component={() => <Home />} />
      <Route path="/:slug/propiedades" component={PropertyList} />
      <Route path="/:slug/propiedades/:propertyId" component={PropertyDetail} />
      <Route path="/:slug/solicitar-visita/:propertyId" component={Booking} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <ScrollToTop />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
