import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export type Page =
  | "home"
  | "catalog"
  | "tutorials"
  | "gallery"
  | "suggestions"
  | "admin";

interface NavigationProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { page: Page; label: string; ocid: string }[] = [
  { page: "home", label: "Home", ocid: "nav.home_link" },
  { page: "catalog", label: "Products", ocid: "nav.catalog_link" },
  { page: "tutorials", label: "Tutorials", ocid: "nav.tutorials_link" },
  { page: "gallery", label: "Gallery", ocid: "nav.gallery_link" },
  { page: "suggestions", label: "Suggestions", ocid: "nav.suggestions_link" },
  { page: "admin", label: "Admin", ocid: "nav.admin_link" },
];

export default function Navigation({
  activePage,
  onNavigate,
}: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 group"
          >
            <span className="text-2xl">🕊️</span>
            <span className="font-display text-lg font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors">
              World of Origami
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ page, label, ocid }) => (
              <button
                type="button"
                key={page}
                data-ocid={ocid}
                onClick={() => onNavigate(page)}
                className={[
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors relative",
                  page === "admin"
                    ? activePage === "admin"
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                    : activePage === page
                      ? "text-primary bg-primary/8 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                ].join(" ")}
              >
                {label}
                {activePage === page && page !== "admin" && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-in">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {navItems.map(({ page, label, ocid }) => (
              <button
                type="button"
                key={page}
                data-ocid={ocid}
                onClick={() => {
                  onNavigate(page);
                  setMobileOpen(false);
                }}
                className={[
                  "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  page === "admin"
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : activePage === page
                      ? "text-primary bg-primary/8 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
