export interface ContactInfo {
  email: string;
  website: string;
  location: string;
}

export interface Artwork {
  title: string;
  year: number;
  medium: string;
  dimensions: string;
}

export interface Exhibition {
  year: number;
  title: string;
  location: string;
  type: "upcoming" | "selected";
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
}

export interface ArtistCV {
  name: string;
  discipline: string;
  contact: ContactInfo;
  statementExcerpt: string;
  statementFull: string[];
  professionalProfile: string;
  selectedWorks: Artwork[];
  exhibitions: Exhibition[];
  education: EducationEntry[];
  gallery: GalleryPiece[];
}

export const victoriaZeder: ArtistCV = {
  name: "Victoria Zeder",
  discipline: "Visual Artist — Painting & Mixed Media",
  contact: {
    email: "hello@victoriazeder.com",
    website: "victoriazeder.com",
    location: "Miami, Florida",
  },
  statementExcerpt:
    "Victoria Zeder is a Miami-based visual artist working with gold leaf and line. Her practice investigates the invisible systems that structure connection, movement, and emotional continuity.",
  statementFull: [
    "Victoria Zeder is a Miami-based visual artist working with gold leaf and line.",
    "Her practice investigates the invisible systems that structure connection, movement, and emotional continuity. Through a process grounded in material sensitivity and compositional restraint, she constructs fields in which line operates as both gesture and network, and gold functions as a site of tension, simultaneously dividing and connecting space.",
    "Her current body of work, Living Systems (2026), explores the dynamics between proximity and distance, examining how relationships form, expand, and converge within spatial and emotional frameworks. Each composition resists fixed form, instead reflecting systems in flux — responsive, interdependent, and continuously evolving.",
  ],
  professionalProfile:
    "Victoria Zeder is a professionally trained visual artist whose practice is rooted in contemporary abstraction and material-based inquiry. Her formal training spans painting, illustration, and sculpture, informing a multidisciplinary approach to composition, surface, and spatial relationships.",
  selectedWorks: [
    {
      title: "Held in Distance I",
      year: 2026,
      medium: "Gold leaf and acrylic on canvas",
      dimensions: "24 × 23 in",
    },
    {
      title: "Expansion I",
      year: 2026,
      medium: "Gold leaf and acrylic on canvas",
      dimensions: "24 × 23 in",
    },
    {
      title: "Convergence I",
      year: 2026,
      medium: "Gold leaf and acrylic on canvas",
      dimensions: "24 × 23 in",
    },
  ],
  exhibitions: [
    {
      year: 2026,
      title: "Hamptons Fine Art Fair",
      location: "Hamptons, NY",
      type: "upcoming",
    },
    {
      year: 2026,
      title: "Red Dot Miami",
      location: "Miami, FL",
      type: "upcoming",
    },
    {
      year: 2025,
      title: "Riviera Country Club Art Show",
      location: "Coral Gables, FL",
      type: "selected",
    },
  ],
  gallery: [
    {
      title: "Held in Distance I",
      year: 2026,
      medium: "Gold leaf and acrylic on canvas",
      dimensions: "24 × 23 in",
      image: "/artwork-expansion.jpg",
    },
    {
      title: "Expansion I",
      year: 2026,
      medium: "Gold leaf and acrylic on canvas",
      dimensions: "24 × 23 in",
      image: "/artwork-expansion.jpg", // placeholder — replace with actual image
    },
    {
      title: "Convergence I",
      year: 2026,
      medium: "Gold leaf and acrylic on canvas",
      dimensions: "24 × 23 in",
      image: "/artwork-expansion.jpg", // placeholder — replace with actual image
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
      degree: "Additional Studies in Art History and Painting",
      institution: "Western Michigan University",
      location: "Kalamazoo, MI",
    },
  ],
};
