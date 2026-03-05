import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AdminPanel from "./components/AdminPanel";
import CommunityGallery from "./components/CommunityGallery";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import Navigation, { type Page } from "./components/Navigation";
import ProductCatalog from "./components/ProductCatalog";
import SuggestionBox from "./components/SuggestionBox";
import TutorialLibrary from "./components/TutorialLibrary";
import { AppProvider } from "./context/AppContext";

export default function App() {
  const [activePage, setActivePage] = useState<Page>("home");

  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Toaster richColors position="top-right" />
        <Navigation activePage={activePage} onNavigate={setActivePage} />

        <div className="flex-1">
          {activePage === "home" && <HomePage onNavigate={setActivePage} />}
          {activePage === "catalog" && <ProductCatalog />}
          {activePage === "tutorials" && <TutorialLibrary />}
          {activePage === "gallery" && <CommunityGallery />}
          {activePage === "suggestions" && <SuggestionBox />}
          {activePage === "admin" && <AdminPanel />}
        </div>

        <Footer />
      </div>
    </AppProvider>
  );
}
