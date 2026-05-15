export type Post = {
  id: number;
  urlId: string;
  title: string;
  content: string;
  description: string;
  imageUrl: string;
  date: Date;
  category: string;
  priceAud?: number;
  stockQuantity?: number;
  views: number;
  likes: number;
  tags: string;
  active: boolean;
};

const productContent = ({
  overview,
  features,
  warranty,
}: {
  overview: string;
  features: string[];
  warranty: string;
}) => `
  # Product details

  ${overview}

  ## Key features

  ${features.map((feature) => `- ${feature}`).join("\n  ")}

  ## Warranty and returns

  ${warranty}
`;

export const posts: Post[] = [
  {
    id: 1,
    title: "AeroBook 14 Pro Laptop",
    urlId: "boost-your-conversion-rate",
    description:
      "A lightweight 14-inch productivity laptop with a bright display, fast SSD storage, and all-day battery life for work, study, and travel.",
    content: productContent({
      overview:
        "The AeroBook 14 Pro is built for everyday productivity with a slim aluminium chassis, responsive keyboard, and enough performance for multitasking across documents, browser tabs, video calls, and creative apps.",
      features: [
        "14-inch high-resolution anti-glare display",
        "16GB memory and 512GB SSD storage",
        "USB-C charging with up to 12 hours of battery life",
        "Backlit keyboard and fingerprint sign-in",
      ],
      warranty:
        "Includes a 2-year Australian warranty and 30-day change-of-mind returns when the product is unused and in original packaging.",
    }),
    imageUrl:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80",
    date: new Date("Apr 18, 2022"),
    category: "Electronics",
    priceAud: 1299,
    stockQuantity: 18,
    tags: "Laptops,Productivity",
    views: 684,
    likes: 73,
    active: true,
  },
  {
    id: 2,
    title: "PulseWave Noise-Cancelling Headphones",
    urlId: "better-front-ends-with-fatboy-slim",
    description:
      "Wireless over-ear headphones with adaptive noise cancellation, rich bass, clear call microphones, and up to 35 hours of listening time.",
    content: productContent({
      overview:
        "PulseWave headphones are tuned for commuting, focused work, and long listening sessions, combining active noise cancellation with soft memory-foam ear cushions.",
      features: [
        "Adaptive active noise cancellation and transparency mode",
        "Bluetooth multipoint pairing for laptop and phone",
        "35-hour battery life with fast USB-C charging",
        "Fold-flat travel design with carry case included",
      ],
      warranty:
        "Covered by a 2-year Australian warranty against manufacturing defects. Ear cushions and accessories are replaceable.",
    }),
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    date: new Date("Mar 16, 2020"),
    category: "Audio",
    priceAud: 349,
    stockQuantity: 42,
    tags: "Headphones,Wireless",
    views: 512,
    likes: 48,
    active: true,
  },
  {
    id: 3,
    title: "Vertex RGB Mechanical Keyboard",
    urlId: "no-front-end-framework-is-the-best",
    description:
      "A compact mechanical gaming keyboard with hot-swappable switches, per-key RGB lighting, and a durable aluminium top plate.",
    content: productContent({
      overview:
        "The Vertex RGB keyboard gives gamers and power users a responsive typing feel in a compact layout that leaves more desk space for mouse movement.",
      features: [
        "Hot-swappable linear switches",
        "Per-key RGB lighting with onboard profiles",
        "Detachable braided USB-C cable",
        "Compact 75 percent layout with dedicated arrow keys",
      ],
      warranty:
        "Includes a 12-month warranty. Switches and keycaps can be replaced without soldering.",
    }),
    imageUrl:
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1200&q=80",
    date: new Date("Dec 16, 2024"),
    category: "Gaming",
    priceAud: 189,
    stockQuantity: 27,
    tags: "Keyboards,RGB",
    views: 431,
    likes: 34,
    active: true,
  },
  {
    id: 4,
    title: "ErgoLift Monitor Stand",
    urlId: "visual-basic-is-the-future",
    description:
      "A sturdy aluminium monitor stand that raises your display to a comfortable height while creating extra storage space on your desk.",
    content: productContent({
      overview:
        "ErgoLift helps keep office setups cleaner and more ergonomic with a wide platform for monitors, laptops, and compact all-in-one displays.",
      features: [
        "Supports monitors up to 27 inches",
        "Anodised aluminium finish",
        "Open shelf space for keyboard, notebook, or accessories",
        "Non-slip silicone feet protect desk surfaces",
      ],
      warranty:
        "Includes a 12-month warranty and ships in recyclable packaging.",
    }),
    imageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    date: new Date("Dec 16, 2012"),
    category: "Office",
    priceAud: 79,
    stockQuantity: 64,
    tags: "Desk Setup,Ergonomics",
    views: 96,
    likes: 12,
    active: false,
  },
  {
    id: 5,
    title: "MagDock 3-in-1 Charging Station",
    urlId: "magdock-3-in-1-charging-station",
    description:
      "A compact bedside or desktop charger for a phone, wireless earbuds, and smartwatch with magnetic alignment and a single USB-C power input.",
    content: productContent({
      overview:
        "MagDock keeps everyday devices organised and charged without cable clutter, making it a practical addition to desks, nightstands, and travel bags.",
      features: [
        "Charges phone, earbuds, and smartwatch at the same time",
        "Magnetic phone alignment for quick placement",
        "Weighted base with soft-touch finish",
        "Includes USB-C cable and 30W wall adapter",
      ],
      warranty:
        "Includes a 2-year Australian warranty. Compatible with most Qi-enabled phones and earbuds.",
    }),
    imageUrl:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=1200&q=80",
    date: new Date("Aug 8, 2025"),
    category: "Accessories",
    priceAud: 119,
    stockQuantity: 35,
    tags: "Chargers,Desk Setup",
    views: 238,
    likes: 29,
    active: true,
  },
];
