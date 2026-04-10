export interface ContactInfo {
  email: string;
  website: string;
  location: string;
  instagram: string;
}

export interface Exhibition {
  year: number;
  title: string;
  location: string;
  type: "upcoming" | "selected";
  dates?: string;
  gallery?: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  location: string;
  details?: string[];
}

export interface GalleryPiece {
  title: string;
  year: number;
  medium: string;
  dimensions: string;
  image: string;
  additionalImages?: string[];
}

export interface ProcessStep {
  title: string;
  description: string;
  image: string;
}

export interface ArtistCV {
  name: string;
  discipline: string;
  contact: ContactInfo;
  statementFull: string[];
  exhibitions: Exhibition[];
  education: EducationEntry[];
  gallery: GalleryPiece[];
  process: ProcessStep[];
}

export const victoriaZeder: ArtistCV = {
  name: "Victoria Zeder",
  discipline: "Visual Artist, Painting & Mixed Media",
  contact: {
    email: "hello@victoriazeder.com",
    website: "victoriazeder.com",
    location: "Miami, Florida",
    instagram: "@victoriazeder.art",
  },
  statementFull: [
    "Victoria Zeder is a formally trained fine artist whose practice explores biomorphic biomimicry and Jungian expression. Born in the Dominican Republic in 1991 and now based in Miami, her work traces a geographic and psychological journey: from the lush maximalism of her Dominican origins, through the interior stillness of her Michigan years, to the atmospheric restraint of Living Systems, her most resolved series to date.",
    "“My work is ever-evolving, like the world and everything created within it. I engineer pareidolia through flow states, that moment when form rises from pure process and reveals something that was always there. Dominican born, Michigan interior, Miami light. Each series is a chapter of becoming.”",
    "Her current body of work, Living Systems (2026), explores the dynamics between proximity and distance, and how relationships form, expand, and converge within spatial and emotional frameworks. Each composition resists fixed form, instead reflecting systems in flux: responsive, interdependent, and continuously evolving.",
    "Her practice spans five bodies of work across the Dominican Republic, Michigan, and Miami. Working with 24k gold leaf, acrylic ink, thread, encaustic, and custom-built drip funnel tools, she moves fluidly between large-format painting, dimensional sphere sculpture, and textile-based thread work. Each series is a chapter in an evolving study of biomorphic form.",
  ],
  exhibitions: [
    {
      year: 2026,
      title: "Hamptons Fine Art Fair",
      location: "Southampton, NY",
      type: "upcoming",
      dates: "July 9–12",
    },
    {
      year: 2026,
      title: "Red Dot Miami",
      location: "Miami, FL",
      type: "upcoming",
    },
    {
      year: 2026,
      title: "Scavolini Showroom",
      location: "Miami, FL",
      type: "selected",
      gallery: "Artwork on display",
    },
    {
      year: 2025,
      title: "Riviera Country Club Art Show",
      location: "Coral Gables, FL",
      type: "selected",
      gallery: "42nd Annual",
    },
  ],
  gallery: [
    {
      title: "Living Systems",
      year: 2026,
      medium: "Gold leaf, acrylic, thread on heavyweight canvas",
      dimensions: "36 × 48 in",
      image: "/works/living-systems-1.jpg",
      additionalImages: [
        "/works/living-systems-2.jpg",
        "/works/living-systems-3.jpg",
        "/works/living-systems-4.jpg",
        "/works/living-systems-5.jpg",
      ],
    },
    {
      title: "Living Systems 3D",
      year: 2026,
      medium: "Encaustic sphere, acrylic, circles on stretched canvas",
      dimensions: "36 × 48 in",
      image: "/works/sphere-1.jpg",
      additionalImages: [
        "/works/sphere-2.jpg",
        "/works/sphere-3.jpg",
        "/works/sphere-4.jpg",
        "/works/sphere-5.jpg",
      ],
    },
    {
      title: "Pareidolia in Blue",
      year: 2025,
      medium: "Acrylic, 24k gold leaf, thread, encaustic on canvas",
      dimensions: "48 × 36 in",
      image: "/works/pareidolia-blue-1.jpg",
      additionalImages: [
        "/works/pareidolia-blue-2.jpg",
        "/works/pareidolia-blue-3.jpg",
        "/works/pareidolia-blue-4.jpg",
      ],
    },
    {
      title: "Pareidolia: Blue Mandala",
      year: 2025,
      medium: "Acrylic on canvas",
      dimensions: "30 × 40 in",
      image: "/works/mandala-1.jpg",
      additionalImages: [
        "/works/mandala-2.jpg",
        "/works/mandala-3.jpg",
        "/works/mandala-4.jpg",
        "/works/mandala-5.jpg",
      ],
    },
    {
      title: "Pareidolia Chromatic",
      year: 2024,
      medium: "Acrylic ink, 24k gold leaf, mixed media on canvas",
      dimensions: "48 × 36 in",
      image: "/works/chromatic-1.jpg",
      additionalImages: [
        "/works/chromatic-2.jpg",
        "/works/chromatic-3.jpg",
        "/works/chromatic-4.jpg",
        "/works/chromatic-5.jpg",
      ],
    },
    {
      title: "Thread on Black",
      year: 2026,
      medium: "Wool & cotton thread, dimensional forms, tassels on canvas",
      dimensions: "16 × 20 in",
      image: "/works/thread-1.jpg",
      additionalImages: [
        "/works/thread-2.jpg",
        "/works/thread-3.jpg",
        "/works/thread-4.jpg",
        "/works/thread-5.jpg",
      ],
    },
  ],
  education: [
    {
      degree: "Bachelor of Fine Arts (BFA), Visual Arts",
      institution: "Miami International University of Art & Design",
      location: "Miami, FL",
      details: [
        "Concentration in Painting and Mixed Media",
        "Interdisciplinary training in illustration and sculpture",
      ],
    },
    {
      degree: "Art History & Painting",
      institution: "Western Michigan University",
      location: "Kalamazoo, MI",
    },
  ],
  process: [
    {
      title: "The Drip Funnel",
      description:
        "Every mark begins with a custom-built tool, a precision-aperture funnel Victoria engineered herself. It deposits acrylic ink in continuous dots, spirals, and lines at speed, without direct surface contact. The canvas lies horizontal on the studio floor while the artist moves over and around it, scale felt through the body.",
      image: "/process/drip-funnel.jpg",
    },
    {
      title: "The Gold Leaf",
      description:
        "24k gold leaf is applied by hand, torn, placed, and burnished. It catches light differently at different times of day and does not tarnish. In the thread works, gold adhesive anchors the thread to canvas. In the paintings, it borders and illuminates. Gold is not decoration, it is structure.",
      image: "/process/gold-leaf.jpg",
    },
    {
      title: "The Acrylic Build",
      description:
        "Color is built in layers, never poured. Every shape is drawn by hand with the squeeze bottle, the artist reading the painting as it fills in. The colors are chosen in the moment, responsive to what the composition asks for next.",
      image: "/process/acrylic-build.jpg",
    },
    {
      title: "The Gold Pour",
      description:
        "On the Living Systems paintings, gold is poured along the canvas edges in slow, intentional lines. It seals the composition and lets the painting continue past the frame.",
      image: "/process/gold-pour.jpg",
    },
    {
      title: "The Sphere",
      description:
        "Hand-formed over a rigid armature, coated in encaustic wax, surface-poured with iridescent metallic paint and sealed. Each sphere takes several sessions. The fluid pour is a flow state process where teal, cobalt, and gold mix and move on the surface until the composition resolves.",
      image: "/process/sphere-tools.jpg",
    },
  ],
};
