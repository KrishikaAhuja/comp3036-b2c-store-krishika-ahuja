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
  {
    id: 6,
    title: "The Thursday Murder Club",
    urlId: "the-thursday-murder-club",
    description:
      "A witty mystery about four retirement-village friends who investigate cold cases and stumble into a fresh murder.",
    content: bookContent({
      author: "Richard Osman",
      overview:
        "Elizabeth, Joyce, Ibrahim, and Ron meet every week to examine unsolved crimes, but their hobby becomes urgent when a killing lands close to home.",
      details: [
        "Paperback edition",
        "A cosy crime favourite with sharp humour",
        "Recommended for readers who like character-led mysteries",
      ],
    }),
    imageUrl: "https://covers.openlibrary.org/b/isbn/9781984880963-L.jpg",
    date: new Date("Sep 3, 2020"),
    category: "Mystery",
    priceAud: 21,
    stockQuantity: 27,
    tags: "Adult",
    views: 189,
    likes: 22,
    active: true,
  },
  {
    id: 7,
    title: "Malibu Rising",
    urlId: "malibu-rising",
    description:
      "A sun-soaked family drama about siblings, fame, secrets, and one unforgettable party in 1980s Malibu.",
    content: bookContent({
      author: "Taylor Jenkins Reid",
      overview:
        "The Riva siblings are known for their glamour and surf-town legacy, but one summer party brings old wounds and family truths to the surface.",
      details: [
        "Paperback edition",
        "Strong pick for contemporary fiction and romance shelves",
        "Recommended for readers who enjoy emotional ensemble stories",
      ],
    }),
    imageUrl: "https://covers.openlibrary.org/b/isbn/9781524798659-L.jpg",
    date: new Date("Jun 1, 2021"),
    category: "Romance",
    priceAud: 23,
    stockQuantity: 31,
    tags: "Adult",
    views: 276,
    likes: 41,
    active: true,
  },
  {
    id: 8,
    title: "The Name of the Wind",
    urlId: "the-name-of-the-wind",
    description:
      "An epic fantasy following Kvothe, a gifted musician and magician, as he recounts the making of his own legend.",
    content: bookContent({
      author: "Patrick Rothfuss",
      overview:
        "Kvothe tells the story of his childhood, his time at the University, and the mysteries that shaped his reputation across the Four Corners.",
      details: [
        "Paperback edition",
        "Ideal for readers who like immersive worldbuilding",
        "A strong next step for fantasy fans after classic adventures",
      ],
    }),
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780756404741-L.jpg",
    date: new Date("Mar 27, 2007"),
    category: "Fantasy",
    priceAud: 26,
    stockQuantity: 16,
    tags: "Adult",
    views: 355,
    likes: 58,
    active: true,
  },
  {
    id: 9,
    title: "Matilda",
    urlId: "matilda",
    description:
      "A clever, funny children's classic about a brilliant young reader who discovers courage and a little bit of magic.",
    content: bookContent({
      author: "Roald Dahl",
      overview:
        "Matilda Wormwood loves books, thinks quickly, and refuses to be crushed by adults who underestimate her.",
      details: [
        "Paperback edition",
        "Popular with independent young readers",
        "Good fit for family reading and school libraries",
      ],
    }),
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780142410370-L.jpg",
    date: new Date("Oct 1, 1988"),
    category: "Children",
    priceAud: 14,
    stockQuantity: 45,
    tags: "Ages 9-12",
    views: 144,
    likes: 19,
    active: true,
  },
  {
    id: 10,
    title: "Becoming",
    urlId: "becoming",
    description:
      "A memoir about identity, family, public service, and the experiences that shaped Michelle Obama's life.",
    content: bookContent({
      author: "Michelle Obama",
      overview:
        "Michelle Obama reflects on her childhood in Chicago, her professional path, her family, and her years in the White House.",
      details: [
        "Paperback edition",
        "Recommended for biography and memoir readers",
        "A strong nonfiction pick for reflective reading",
      ],
    }),
    imageUrl: "https://covers.openlibrary.org/b/isbn/9781524763138-L.jpg",
    date: new Date("Nov 13, 2018"),
    category: "Nonfiction",
    priceAud: 30,
    stockQuantity: 24,
    tags: "Adult",
    views: 411,
    likes: 66,
    active: true,
  },
  {
    id: 11,
    title: "Gone Girl",
    urlId: "gone-girl",
    description:
      "A dark psychological mystery about a missing woman, a troubled marriage, and the stories people choose to tell.",
    content: bookContent({
      author: "Gillian Flynn",
      overview:
        "When Amy Dunne disappears, suspicion turns toward her husband Nick, and the investigation exposes a sharp, unsettling portrait of their marriage.",
      details: [
        "Paperback edition",
        "Best for readers who enjoy unreliable narrators",
        "A popular choice for thriller and mystery shelves",
      ],
    }),
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780307588371-L.jpg",
    date: new Date("Jun 5, 2012"),
    category: "Mystery",
    priceAud: 20,
    stockQuantity: 33,
    tags: "Adult",
    views: 522,
    likes: 80,
    active: true,
  },
  {
    id: 12,
    title: "Beach Read",
    urlId: "beach-read",
    description:
      "A contemporary romance about two writers, creative blocks, and a summer challenge that changes their stories.",
    content: bookContent({
      author: "Emily Henry",
      overview:
        "January Andrews and Augustus Everett write very different books, but neighbouring beach houses and a writing challenge pull them together.",
      details: [
        "Paperback edition",
        "Recommended for fans of witty contemporary romance",
        "Good pairing for readers who enjoyed Book Lovers",
      ],
    }),
    imageUrl: "https://covers.openlibrary.org/b/isbn/9781984806734-L.jpg",
    date: new Date("May 19, 2020"),
    category: "Romance",
    priceAud: 22,
    stockQuantity: 38,
    tags: "Adult",
    views: 298,
    likes: 52,
    active: true,
  },
  {
    id: 13,
    title: "A Wrinkle in Time",
    urlId: "a-wrinkle-in-time",
    description:
      "A science-fantasy classic about space, time, family, and a brave journey across the universe.",
    content: bookContent({
      author: "Madeleine L'Engle",
      overview:
        "Meg Murry, Charles Wallace, and Calvin O'Keefe travel through space and time to search for Meg's missing father.",
      details: [
        "Paperback edition",
        "Suitable for confident younger readers and adults",
        "A classic blend of fantasy, science fiction, and adventure",
      ],
    }),
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780312367541-L.jpg",
    date: new Date("Jan 1, 1962"),
    category: "Fantasy",
    priceAud: 16,
    stockQuantity: 29,
    tags: "Ages 12+",
    views: 221,
    likes: 37,
    active: true,
  },
  {
    id: 14,
    title: "Charlotte's Web",
    urlId: "charlottes-web",
    description:
      "A beloved children's story about friendship, loyalty, and a clever spider determined to save a pig named Wilbur.",
    content: bookContent({
      author: "E.B. White",
      overview:
        "Fern, Wilbur, and Charlotte form an unforgettable friendship in a gentle farmyard story about loyalty and care.",
      details: [
        "Paperback edition",
        "A family and classroom favourite",
        "Recommended for younger readers moving into classics",
      ],
    }),
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780064400558-L.jpg",
    date: new Date("Oct 15, 1952"),
    category: "Children",
    priceAud: 13,
    stockQuantity: 52,
    tags: "Ages 9-12",
    views: 187,
    likes: 25,
    active: true,
  },
  {
    id: 15,
    title: "Sapiens",
    urlId: "sapiens",
    description:
      "A broad nonfiction history of humankind, from early human societies to modern culture, science, and power.",
    content: bookContent({
      author: "Yuval Noah Harari",
      overview:
        "Sapiens examines how biology, storytelling, agriculture, empire, money, and technology shaped the human world.",
      details: [
        "Paperback edition",
        "Recommended for readers who enjoy big-picture history",
        "Strong pick for nonfiction and discussion groups",
      ],
    }),
    imageUrl: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
    date: new Date("Feb 10, 2015"),
    category: "Nonfiction",
    priceAud: 27,
    stockQuantity: 21,
    tags: "Adult",
    views: 463,
    likes: 71,
    active: true,
  },
];
