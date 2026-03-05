import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ── Types ──────────────────────────────────────────────────────────────────

export type SkillLevel = "Beginner" | "Intermediate" | "Advanced";
export type TutorialCategory = "Animals" | "Flowers" | "Geometric" | "Modular";
export type SuggestionStatus =
  | "Pending"
  | "Under Consideration"
  | "Coming Soon"
  | "Dismissed";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  skillLevel: SkillLevel;
  category: string;
  imageUrl?: string;
}

export interface TutorialStep {
  step: number;
  instruction: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: SkillLevel;
  category: TutorialCategory;
  estimatedTime: string;
  steps: TutorialStep[];
  imageUrl?: string;
}

export interface GalleryEntry {
  id: string;
  title: string;
  description: string;
  submitterName: string;
  imageUrl?: string;
  likes: number;
  likedByUser: boolean;
}

export interface Suggestion {
  id: string;
  submitterName: string;
  text: string;
  status: SuggestionStatus;
  createdAt: string;
}

interface AppData {
  products: Product[];
  tutorials: Tutorial[];
  gallery: GalleryEntry[];
  suggestions: Suggestion[];
}

interface AppContextType {
  products: Product[];
  tutorials: Tutorial[];
  gallery: GalleryEntry[];
  suggestions: Suggestion[];

  // Products
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Omit<Product, "id">) => void;
  deleteProduct: (id: string) => void;

  // Tutorials
  addTutorial: (t: Omit<Tutorial, "id">) => void;
  updateTutorial: (id: string, t: Omit<Tutorial, "id">) => void;
  deleteTutorial: (id: string) => void;

  // Gallery
  addGalleryEntry: (
    e: Omit<GalleryEntry, "id" | "likes" | "likedByUser">,
  ) => void;
  toggleLike: (id: string) => void;
  deleteGalleryEntry: (id: string) => void;

  // Suggestions
  addSuggestion: (s: Omit<Suggestion, "id" | "status" | "createdAt">) => void;
  updateSuggestionStatus: (id: string, status: SuggestionStatus) => void;
  deleteSuggestion: (id: string) => void;
}

// ── Sample Data ────────────────────────────────────────────────────────────

const SAMPLE_DATA: AppData = {
  products: [
    {
      id: "p1",
      name: "Washi Paper Variety Pack",
      description:
        "100 sheets of premium Japanese washi paper in 50 traditional patterns — cherry blossom, waves, koi fish, and geometric motifs. Perfect for beginners exploring folding.",
      price: 18.99,
      skillLevel: "Beginner",
      category: "Paper",
      imageUrl: "/assets/generated/product-washi-paper.dim_400x300.jpg",
    },
    {
      id: "p2",
      name: "Precision Folding Kit",
      description:
        "Professional-grade bone folder, micro-tweezers, metal ruler, and scoring tool. All the essentials for clean, crisp folds on complex models.",
      price: 34.5,
      skillLevel: "Intermediate",
      category: "Tools",
      imageUrl: "/assets/generated/product-folding-kit.dim_400x300.jpg",
    },
    {
      id: "p3",
      name: "Kami Rainbow Collection",
      description:
        "200 sheets of classic kami paper in 20 vibrant colors, 15cm × 15cm. The go-to paper for traditional origami models with excellent crease retention.",
      price: 12.99,
      skillLevel: "Beginner",
      category: "Paper",
      imageUrl: "/assets/generated/product-paper-pack.dim_400x300.jpg",
    },
    {
      id: "p4",
      name: "Modular Origami Master Kit",
      description:
        "Curated selection of metallic, duo, and foil papers ideal for advanced modular constructions. Includes 300 sheets and step-by-step guide for 12 geometric polyhedra.",
      price: 47.0,
      skillLevel: "Advanced",
      category: "Kit",
      imageUrl: "/assets/generated/product-paper-pack.dim_400x300.jpg",
    },
  ],
  tutorials: [
    {
      id: "t1",
      title: "Classic Paper Crane",
      description:
        "Learn the iconic tsuru — a symbol of peace and longevity. This timeless model is the perfect first project for anyone starting their origami journey.",
      difficulty: "Beginner",
      category: "Animals",
      estimatedTime: "15 min",
      steps: [
        {
          step: 1,
          instruction:
            "Start with a square sheet, colored side down. Fold in half diagonally to form a triangle, then unfold.",
        },
        {
          step: 2,
          instruction:
            "Fold diagonally in the other direction, then unfold. Flip the paper over.",
        },
        {
          step: 3,
          instruction:
            "Fold in half horizontally and vertically, unfolding after each fold.",
        },
        {
          step: 4,
          instruction:
            "Collapse the paper into a small square using the existing creases (book fold).",
        },
        {
          step: 5,
          instruction:
            "Fold the top flaps to the center line on both sides. Fold the top triangle down and unfold all.",
        },
        {
          step: 6,
          instruction:
            "Open the top layer and squash fold upward using the creases you just made.",
        },
        { step: 7, instruction: "Repeat step 6 on the back side." },
        {
          step: 8,
          instruction:
            "Fold the side points to the center on both front and back to form a kite shape.",
        },
        {
          step: 9,
          instruction:
            "Reverse fold the two bottom points upward to create the neck and tail.",
        },
        {
          step: 10,
          instruction:
            "Reverse fold one tip to form the head. Gently pull the wings apart to inflate the body.",
        },
      ],
    },
    {
      id: "t2",
      title: "Lotus Flower",
      description:
        "Fold a stunning multi-layered lotus blossom with elegantly curled petals. A meditative project that makes a beautiful decorative centerpiece.",
      difficulty: "Intermediate",
      category: "Flowers",
      estimatedTime: "30 min",
      steps: [
        {
          step: 1,
          instruction:
            "Begin with a large square (20cm+). Fold all four corners to the center point.",
        },
        {
          step: 2,
          instruction:
            "Flip the paper over. Fold all four corners to the center again.",
        },
        {
          step: 3,
          instruction: "Fold all four corners to the center one more time.",
        },
        {
          step: 4,
          instruction:
            "Flip the paper over. You will see four flaps — pull each one out from behind to reveal petal shapes.",
        },
        {
          step: 5,
          instruction:
            "Gently pull the remaining four triangular flaps from behind, shaping them into outer petals.",
        },
        {
          step: 6,
          instruction:
            "Curl each petal by rolling it around a pencil or your finger for a natural look.",
        },
      ],
    },
    {
      id: "t3",
      title: "Sonobe Cube",
      description:
        "Construct a perfect cube from six identical Sonobe units. This introduction to modular origami teaches you how separate pieces interlock into a solid 3D structure.",
      difficulty: "Intermediate",
      category: "Modular",
      estimatedTime: "45 min",
      steps: [
        {
          step: 1,
          instruction:
            "Fold one sheet in half, unfold. Fold both long edges to the center crease.",
        },
        {
          step: 2,
          instruction:
            "Fold both short ends to the center horizontally, then unfold.",
        },
        {
          step: 3,
          instruction:
            "Fold the top-right corner down to the center crease, and the bottom-left corner up.",
        },
        {
          step: 4,
          instruction:
            "Fold in half along the long axis. This creates one Sonobe unit.",
        },
        { step: 5, instruction: "Make five more identical Sonobe units." },
        {
          step: 6,
          instruction:
            "Insert the pointed flap of one unit into the pocket of another. Connect all six units in a triangular pattern to form the cube.",
        },
      ],
    },
    {
      id: "t4",
      title: "Kawasaki Rose",
      description:
        "The Kawasaki rose is the pinnacle of origami floristry — a breathtakingly realistic flower that showcases the full expressive potential of folded paper.",
      difficulty: "Advanced",
      category: "Flowers",
      estimatedTime: "60 min",
      steps: [
        {
          step: 1,
          instruction:
            "Start with a 20cm square. Create a 4×4 grid of creases by folding into quarters both ways.",
        },
        {
          step: 2,
          instruction:
            "Make diagonal creases across each grid square to create the twist base.",
        },
        {
          step: 3,
          instruction:
            "Collapse the paper using the twist fold technique — this forms the rose center.",
        },
        {
          step: 4,
          instruction:
            "Carefully pull out each of the four outer petals, shaping them with gentle curves.",
        },
        {
          step: 5,
          instruction:
            "Fold back the corners of each petal slightly to add depth and realism.",
        },
        {
          step: 6,
          instruction:
            "Optional: fold a separate square into a calyx base and attach it to the back of the rose.",
        },
      ],
    },
  ],
  gallery: [
    {
      id: "g1",
      title: "Golden Crane Shrine",
      description:
        "A thousand paper cranes (senbazuru) folded over three months from hand-dyed mulberry paper. Inspired by the Japanese legend that grants one wish to whoever completes the thousand.",
      submitterName: "Yuki Tanaka",
      imageUrl: "/assets/generated/gallery-golden-crane.dim_400x300.jpg",
      likes: 47,
      likedByUser: false,
    },
    {
      id: "g2",
      title: "Coral Modular Sphere",
      description:
        "A 270-unit modular sphere built from interlocking Sonobe units in coral pink, navy, and cream. Took 11 hours across two weekends and floats perfectly balanced.",
      submitterName: "Marco Ferreira",
      imageUrl: "/assets/generated/gallery-modular-ball.dim_400x300.jpg",
      likes: 32,
      likedByUser: false,
    },
  ],
  suggestions: [
    {
      id: "s1",
      submitterName: "Priya Sharma",
      text: "Can you add a tutorial for the inflatable bunny? It's great for kids and I can't find a clear guide anywhere.",
      status: "Under Consideration",
      createdAt: "2026-02-18",
    },
    {
      id: "s2",
      submitterName: "Tom Okafor",
      text: "Would love to see tissue foil paper in the shop — it's essential for wet-folding complex sculptures like the Koi fish.",
      status: "Coming Soon",
      createdAt: "2026-02-25",
    },
  ],
};

// ── Storage Helpers ────────────────────────────────────────────────────────

const STORAGE_KEY = "world-of-origami-data";

function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppData;
  } catch {
    // fall through
  }
  return SAMPLE_DATA;
}

function saveData(data: AppData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Context ────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const setProducts = useCallback((fn: (prev: Product[]) => Product[]) => {
    setData((d) => ({ ...d, products: fn(d.products) }));
  }, []);

  const setTutorials = useCallback((fn: (prev: Tutorial[]) => Tutorial[]) => {
    setData((d) => ({ ...d, tutorials: fn(d.tutorials) }));
  }, []);

  const setGallery = useCallback(
    (fn: (prev: GalleryEntry[]) => GalleryEntry[]) => {
      setData((d) => ({ ...d, gallery: fn(d.gallery) }));
    },
    [],
  );

  const setSuggestions = useCallback(
    (fn: (prev: Suggestion[]) => Suggestion[]) => {
      setData((d) => ({ ...d, suggestions: fn(d.suggestions) }));
    },
    [],
  );

  // Products
  const addProduct = useCallback(
    (p: Omit<Product, "id">) => {
      setProducts((prev) => [...prev, { ...p, id: uid() }]);
    },
    [setProducts],
  );

  const updateProduct = useCallback(
    (id: string, p: Omit<Product, "id">) => {
      setProducts((prev) =>
        prev.map((item) => (item.id === id ? { ...p, id } : item)),
      );
    },
    [setProducts],
  );

  const deleteProduct = useCallback(
    (id: string) => {
      setProducts((prev) => prev.filter((item) => item.id !== id));
    },
    [setProducts],
  );

  // Tutorials
  const addTutorial = useCallback(
    (t: Omit<Tutorial, "id">) => {
      setTutorials((prev) => [...prev, { ...t, id: uid() }]);
    },
    [setTutorials],
  );

  const updateTutorial = useCallback(
    (id: string, t: Omit<Tutorial, "id">) => {
      setTutorials((prev) =>
        prev.map((item) => (item.id === id ? { ...t, id } : item)),
      );
    },
    [setTutorials],
  );

  const deleteTutorial = useCallback(
    (id: string) => {
      setTutorials((prev) => prev.filter((item) => item.id !== id));
    },
    [setTutorials],
  );

  // Gallery
  const addGalleryEntry = useCallback(
    (e: Omit<GalleryEntry, "id" | "likes" | "likedByUser">) => {
      setGallery((prev) => [
        ...prev,
        { ...e, id: uid(), likes: 0, likedByUser: false },
      ]);
    },
    [setGallery],
  );

  const toggleLike = useCallback(
    (id: string) => {
      setGallery((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                likes: item.likedByUser ? item.likes - 1 : item.likes + 1,
                likedByUser: !item.likedByUser,
              }
            : item,
        ),
      );
    },
    [setGallery],
  );

  const deleteGalleryEntry = useCallback(
    (id: string) => {
      setGallery((prev) => prev.filter((item) => item.id !== id));
    },
    [setGallery],
  );

  // Suggestions
  const addSuggestion = useCallback(
    (s: Omit<Suggestion, "id" | "status" | "createdAt">) => {
      setSuggestions((prev) => [
        ...prev,
        {
          ...s,
          id: uid(),
          status: "Pending",
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ]);
    },
    [setSuggestions],
  );

  const updateSuggestionStatus = useCallback(
    (id: string, status: SuggestionStatus) => {
      setSuggestions((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item)),
      );
    },
    [setSuggestions],
  );

  const deleteSuggestion = useCallback(
    (id: string) => {
      setSuggestions((prev) => prev.filter((item) => item.id !== id));
    },
    [setSuggestions],
  );

  return (
    <AppContext.Provider
      value={{
        products: data.products,
        tutorials: data.tutorials,
        gallery: data.gallery,
        suggestions: data.suggestions,
        addProduct,
        updateProduct,
        deleteProduct,
        addTutorial,
        updateTutorial,
        deleteTutorial,
        addGalleryEntry,
        toggleLike,
        deleteGalleryEntry,
        addSuggestion,
        updateSuggestionStatus,
        deleteSuggestion,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
