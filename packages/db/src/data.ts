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

const bookContent = ({
  author,
  overview,
  details,
}: {
  author: string;
  overview: string;
  details: string[];
}) => `
  # Book details

  **Author:** ${author}

  ${overview}

  ## Edition notes

  ${details.map((item) => `- ${item}`).join("\n  ")}
`;

export const posts: Post[] = [
  {
    id: 1,
    title: "The Silent Patient",
    urlId: "the-silent-patient",
    description:
      "A psychological thriller about a famous painter who stops speaking after a shocking act of violence.",
    content: bookContent({
      author: "Alex Michaelides",
      overview:
        "Alicia Berenson's silence turns a family tragedy into a public obsession. A criminal psychotherapist becomes determined to uncover the truth behind her refusal to speak.",
      details: [
        "Paperback edition",
        "Best suited to readers who enjoy twisty, fast-paced suspense",
        "A strong pick for thriller and mystery shelves",
      ],
    }),
    imageUrl: "https://covers.openlibrary.org/b/isbn/9781250301697-L.jpg",
    date: new Date("Feb 5, 2019"),
    category: "Mystery",
    priceAud: 24,
    stockQuantity: 18,
    tags: "Adult",
    views: 684,
    likes: 73,
    active: true,
  },
  {
    id: 2,
    title: "Book Lovers",
    urlId: "book-lovers",
    description:
      "A sharp, warm romantic comedy about a literary agent, a small town, and an editor who keeps crossing her path.",
    content: bookContent({
      author: "Emily Henry",
      overview:
        "Nora Stephens knows every story trope, but her own life gets complicated when a work trip places her opposite Charlie Lastra again and again.",
      details: [
        "Paperback edition",
        "Ideal for contemporary romance readers",
        "Recommended for readers who like witty dialogue and publishing-world settings",
      ],
    }),
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780593334836-L.jpg",
    date: new Date("May 3, 2022"),
    category: "Romance",
    priceAud: 22,
    stockQuantity: 42,
    tags: "Adult",
    views: 512,
    likes: 48,
    active: true,
  },
  {
    id: 3,
    title: "The Hobbit",
    urlId: "the-hobbit",
    description:
      "A classic fantasy adventure following Bilbo Baggins through riddles, dragons, treasure, and an unexpected journey.",
    content: bookContent({
      author: "J.R.R. Tolkien",
      overview:
        "Bilbo Baggins is pulled from his comfortable home into a quest with dwarves, a wizard, and dangers far beyond the Shire.",
      details: [
        "Paperback edition",
        "A gateway fantasy classic",
        "Suitable for confident younger readers and adults",
      ],
    }),
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg",
    date: new Date("Sep 21, 1937"),
    category: "Fantasy",
    priceAud: 19,
    stockQuantity: 0,
    tags: "Ages 12+",
    views: 431,
    likes: 34,
    active: true,
  },
  {
    id: 4,
    title: "Wonder",
    urlId: "wonder",
    description:
      "A moving middle-grade novel about kindness, school, friendship, and choosing empathy when it matters.",
    content: bookContent({
      author: "R.J. Palacio",
      overview:
        "Auggie Pullman starts mainstream school for the first time and changes how the people around him understand courage and kindness.",
      details: [
        "Paperback edition",
        "Popular with middle-grade readers and families",
        "Currently hidden from the customer storefront for admin visibility testing",
      ],
    }),
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780375869020-L.jpg",
    date: new Date("Dec 16, 2012"),
    category: "Children",
    priceAud: 17,
    stockQuantity: 64,
    tags: "Ages 9-12",
    views: 96,
    likes: 12,
    active: false,
  },
  {
    id: 5,
    title: "Atomic Habits",
    urlId: "atomic-habits",
    description:
      "A practical nonfiction guide to building better habits through small, repeatable behaviour changes.",
    content: bookContent({
      author: "James Clear",
      overview:
        "Atomic Habits explains how tiny improvements compound over time and gives readers practical systems for changing everyday routines.",
      details: [
        "Paperback edition",
        "Useful for study, work, and personal development",
        "One of the most requested nonfiction titles in store",
      ],
    }),
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
    date: new Date("Oct 16, 2018"),
    category: "Nonfiction",
    priceAud: 28,
    stockQuantity: 35,
    tags: "Adult",
    views: 238,
    likes: 29,
    active: true,
  },
];
