import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import type { Page } from "./Navigation";

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

const sections = [
  {
    page: "catalog" as Page,
    emoji: "📦",
    title: "Products",
    description:
      "Premium papers, tools, and kits curated for every skill level.",
  },
  {
    page: "tutorials" as Page,
    emoji: "📖",
    title: "Tutorials",
    description: "Step-by-step guides from simple cranes to complex roses.",
  },
  {
    page: "gallery" as Page,
    emoji: "🎨",
    title: "Gallery",
    description: "Showcase your creations and get inspired by the community.",
  },
  {
    page: "suggestions" as Page,
    emoji: "💡",
    title: "Suggest",
    description: "Share your ideas for tutorials, products, or new features.",
  },
];

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient paper-texture">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-accent/15 text-accent mb-5 tracking-wide uppercase">
                The Art of Folding
              </span>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground leading-tight mb-5">
                World of <span className="text-primary italic">Origami</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-md">
                Discover the ancient Japanese art of paper folding. From your
                first crane to intricate modular sculptures — everything you
                need is here.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  onClick={() => onNavigate("tutorials")}
                >
                  Start Folding
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onNavigate("catalog")}
                  className="border-border hover:bg-muted/60"
                >
                  Browse Products
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
              className="hidden md:block"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-card-hover">
                <img
                  src="/assets/generated/hero-origami-cranes.dim_1200x600.jpg"
                  alt="Beautiful origami cranes"
                  className="w-full h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative fold lines */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            role="presentation"
          >
            <line
              x1="0"
              y1="0"
              x2="100"
              y2="100"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <line
              x1="50"
              y1="0"
              x2="100"
              y2="50"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <line
              x1="0"
              y1="50"
              x2="50"
              y2="100"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </svg>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="font-display text-3xl font-semibold text-foreground mb-2">
            Explore the Collection
          </h2>
          <p className="text-muted-foreground mb-8">
            Everything you need for your origami practice, in one place.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sections.map(({ page, emoji, title, description }, i) => (
            <motion.button
              key={page}
              onClick={() => onNavigate(page)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 + i * 0.08 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="group text-left p-5 bg-card rounded-xl shadow-card hover:shadow-card-hover border border-border transition-shadow"
            >
              <div className="text-3xl mb-3">{emoji}</div>
              <h3 className="font-display font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-muted-foreground text-sm leading-snug">
                {description}
              </p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Feature Strip */}
      <section className="bg-primary/5 border-y border-border py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              {
                icon: "🌸",
                title: "Japanese Heritage",
                desc: "Rooted in centuries of tradition from Edo-period Japan",
              },
              {
                icon: "🌱",
                title: "All Skill Levels",
                desc: "Guides and materials from absolute beginner to master folder",
              },
              {
                icon: "🤝",
                title: "Community Driven",
                desc: "Share your work and suggest what we create next",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center">
                <span className="text-4xl mb-3">{icon}</span>
                <h3 className="font-display font-semibold text-foreground mb-1">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
