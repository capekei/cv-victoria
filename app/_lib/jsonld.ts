import { victoriaZeder } from "@/app/_lib/artist";

export const SITE_URL = "https://victoriazeder.com";
export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/* Escape sequences that could break out of a <script> tag or be
   misinterpreted by HTML parsers. Safe for inline JSON-LD blocks. */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function buildPerson() {
  const cv = victoriaZeder;
  return {
    "@type": ["Person", "VisualArtist"],
    "@id": PERSON_ID,
    name: cv.name,
    givenName: "Victoria",
    familyName: "Zeder",
    jobTitle: "Visual Artist",
    description:
      "Formally trained visual artist exploring biomorphic biomimicry and Jungian expression through 24k gold leaf, acrylic ink, thread, and encaustic. Based in Miami, born in the Dominican Republic (1991).",
    url: SITE_URL,
    image: `${SITE_URL}/victoria-portrait.jpg`,
    email: `mailto:${cv.contact.email}`,
    gender: "Female",
    nationality: { "@type": "Country", name: "Dominican Republic" },
    birthPlace: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressCountry: "DO" },
    },
    homeLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Miami",
        addressRegion: "FL",
        addressCountry: "US",
      },
    },
    workLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Miami",
        addressRegion: "FL",
        addressCountry: "US",
      },
    },
    alumniOf: cv.education.map((e) => {
      const [locality, region] = e.location.split(",").map((s) => s.trim());
      return {
        "@type": "CollegeOrUniversity",
        name: e.institution,
        address: {
          "@type": "PostalAddress",
          addressLocality: locality,
          addressRegion: region,
          addressCountry: "US",
        },
      };
    }),
    knowsAbout: [
      "Biomorphic art",
      "Jungian expression",
      "Gold leaf painting",
      "Encaustic painting",
      "Mixed media",
      "Fine art painting",
      "Pareidolia",
      "Contemporary art",
      "Thread and textile art",
      "Process-driven abstraction",
    ],
    hasOccupation: {
      "@type": "Occupation",
      name: "Visual Artist",
      occupationLocation: { "@type": "City", name: "Miami" },
    },
    sameAs: ["https://www.instagram.com/victoriazeder.art/"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "commissions and inquiries",
      email: cv.contact.email,
      url: `${SITE_URL}/contact`,
      availableLanguage: ["English", "Spanish"],
    },
  };
}

function buildWebsite() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: victoriaZeder.name,
    description: `${victoriaZeder.name} — visual artist based in Miami. Portfolio, CV, and commissions.`,
    publisher: { "@id": PERSON_ID },
    inLanguage: "en-US",
  };
}

function buildProfilePage() {
  return {
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/#profilepage`,
    url: SITE_URL,
    name: `${victoriaZeder.name} — Artist CV`,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": PERSON_ID },
    mainEntity: { "@id": PERSON_ID },
    inLanguage: "en-US",
  };
}

function buildArtworks() {
  return victoriaZeder.gallery.map((piece) => ({
    "@type": "VisualArtwork",
    name: piece.title,
    creator: { "@id": PERSON_ID },
    artMedium: piece.medium,
    artworkSurface: "Canvas",
    artform: "Painting",
    dateCreated: String(piece.year),
    width: piece.dimensions,
    image: `${SITE_URL}${piece.image}`,
    url: SITE_URL,
  }));
}

function buildEvents() {
  return victoriaZeder.exhibitions
    .filter((e) => e.type === "upcoming")
    .map((ex) => {
      const base = {
        "@type": "ExhibitionEvent",
        name: ex.title,
        performer: { "@id": PERSON_ID },
        location: { "@type": "Place", name: ex.location, address: ex.location },
        description: ex.dates
          ? `${ex.title} featuring work by ${victoriaZeder.name}. ${ex.dates}, ${ex.year}.`
          : `${ex.title} featuring work by ${victoriaZeder.name}. ${ex.year}.`,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      };
      if (ex.title === "Hamptons Fine Art Fair") {
        return { ...base, startDate: "2026-07-09", endDate: "2026-07-12" };
      }
      return { ...base, startDate: String(ex.year) };
    });
}

export function buildPersonGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildPerson(),
      buildWebsite(),
      buildProfilePage(),
      ...buildArtworks(),
      ...buildEvents(),
    ],
  };
}

export function buildContactPageGraph() {
  const cv = victoriaZeder;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${SITE_URL}/contact#page`,
        url: `${SITE_URL}/contact`,
        name: `Contact ${cv.name}`,
        description:
          "Commission a painting, discuss an exhibition, or explore a collaboration with Victoria Zeder.",
        inLanguage: "en-US",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": PERSON_ID },
        mainEntity: { "@id": PERSON_ID },
      },
      /* Reference the Person so crawlers that only read this page still
         get the full entity context. */
      buildPerson(),
    ],
  };
}
