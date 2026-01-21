const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

async function main() {
  console.log("Starting seed...");

  // Create admin user
  const adminPassword = process.env.ADMIN_PASSWORD || "whutmovie2024";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  console.log("Creating admin user...");
  const admin = await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: { passwordHash },
    create: {
      username: "admin",
      passwordHash,
    },
  });
  console.log(`  - Admin user created/updated: ${admin.username}`);

  // Create genres
  const genresData = [
    "Action", "Adventure", "Animation", "Comedy", "Crime",
    "Documentary", "Drama", "Fantasy", "Horror", "Mystery",
    "Romance", "Sci-Fi", "Thriller", "Western",
  ];

  console.log("Creating genres...");
  const genres = {};
  for (const name of genresData) {
    const slug = slugify(name);
    const genre = await prisma.genre.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
    genres[slug] = genre;
  }
  console.log(`  - Created ${Object.keys(genres).length} genres`);

  // Create movies with whutSummary
  const moviesData = [
    {
      title: "When Harry Met Sally",
      slug: "when-harry-met-sally",
      year: 1989,
      whutSummary: "Two people spend 12 years being annoying about whether men and women can be friends, then finally kiss in a deli. Features the most famous fake orgasm in cinema history, which is somehow wholesome.",
      description: "Harry and Sally have known each other for years, and are very good friends, but they fear sex would ruin the friendship.",
      genres: ["comedy", "romance", "drama"],
    },
    {
      title: "The Proposal",
      slug: "the-proposal",
      year: 2009,
      whutSummary: "Sandra Bullock bullies Ryan Reynolds into a fake marriage for visa purposes. They go to Alaska, she falls in a lake, there's a dog, and somehow this constitutes character development. It works though.",
      description: "A pushy boss forces her young assistant to marry her in order to keep her visa status in the U.S. and avoid deportation to Canada.",
      genres: ["comedy", "romance"],
    },
    {
      title: "Mr. & Mrs. Smith",
      slug: "mr-and-mrs-smith",
      year: 2005,
      whutSummary: "A married couple discovers they're both assassins hired to kill each other, which is somehow less dramatic than most marriages. They solve their problems by shooting at each other and then making out. Therapy is expensive, I guess.",
      description: "A bored married couple is surprised to learn that they are both assassins hired by competing agencies to kill each other.",
      genres: ["action", "comedy", "romance", "thriller"],
    },
    {
      title: "About Time",
      slug: "about-time",
      year: 2013,
      whutSummary: "British guy discovers men in his family can time travel. Instead of fixing literally any world problem, he uses it to get a girlfriend and replay nice moments with his dad. Honestly? Valid choice.",
      description: "At the age of 21, Tim discovers he can travel in time and change what happens and has happened in his own life.",
      genres: ["comedy", "romance", "fantasy", "drama"],
    },
    {
      title: "The Shawshank Redemption",
      slug: "the-shawshank-redemption",
      year: 1994,
      whutSummary: "A banker goes to prison for a crime he didn't commit and spends 20 years being patient about it. Contains the most satisfying escape scene ever filmed and Morgan Freeman's voice doing what Morgan Freeman's voice does best.",
      description: "Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.",
      genres: ["drama"],
    },
    {
      title: "Inception",
      slug: "inception",
      year: 2010,
      whutSummary: "Leonardo DiCaprio steals ideas from people's dreams, which requires explaining the rules for 40 minutes, then breaking all of them. You'll either love the ending or be mad about a spinning top for years.",
      description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      genres: ["action", "sci-fi", "thriller"],
    },
    {
      title: "The Dark Knight",
      slug: "the-dark-knight",
      year: 2008,
      whutSummary: "Batman fights a clown who just wants to watch the world burn and has way too many backup plans. Heath Ledger creates a villain so iconic that every movie villain since has been compared to him unfavorably.",
      description: "When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological tests.",
      genres: ["action", "crime", "drama", "thriller"],
    },
    {
      title: "Spirited Away",
      slug: "spirited-away",
      year: 2001,
      whutSummary: "A 10-year-old girl's parents get turned into pigs because they ate too much at an abandoned theme park. She then has to work at a bathhouse for spirits to save them. Japanese animation is wild and beautiful.",
      description: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.",
      genres: ["animation", "adventure", "fantasy"],
    },
    {
      title: "Pulp Fiction",
      slug: "pulp-fiction",
      year: 1994,
      whutSummary: "Multiple criminals in LA have interconnected bad days, presented out of order because Tarantino. Features a dance scene, a briefcase we never see inside, and way too much discussion about hamburgers.",
      description: "The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in tales of violence and redemption.",
      genres: ["crime", "drama", "thriller"],
    },
  ];

  console.log("Creating movies...");
  const movies = {};
  for (const movieData of moviesData) {
    const genreConnections = movieData.genres
      .filter((slug) => genres[slug])
      .map((slug) => ({ id: genres[slug].id }));

    const movie = await prisma.movie.upsert({
      where: { slug: movieData.slug },
      update: {
        title: movieData.title,
        whutSummary: movieData.whutSummary,
        description: movieData.description,
        year: movieData.year,
        genres: { set: genreConnections },
      },
      create: {
        title: movieData.title,
        slug: movieData.slug,
        whutSummary: movieData.whutSummary,
        description: movieData.description,
        year: movieData.year,
        genres: { connect: genreConnections },
      },
    });
    movies[movieData.slug] = movie;
    console.log(`  - ${movie.title}`);
  }

  // Create categories with over-explained descriptions
  const categoriesData = [
    {
      title: "Rom-coms (but with problems)",
      slug: "romcoms-but-with-problems",
      description: `Look, we all know the formula: two attractive people meet, hate each other, then realize they're soulmates after a grand gesture involving running through an airport or standing in the rain. But what if we told you the best rom-coms are the ones where something is actively wrong?

Maybe she's his boss and it's definitely an HR violation. Maybe they're literally trying to kill each other. Maybe time travel is involved because why not. The point is, love is complicated, and these movies get that.

These aren't your grandma's romance movies (unless your grandma is cool, in which case, hi grandma).`,
      picks: [
        { movieSlug: "when-harry-met-sally", rank: 1 },
        { movieSlug: "mr-and-mrs-smith", rank: 2 },
        { movieSlug: "about-time", rank: 3 },
      ],
    },
    {
      title: "Movies Everyone Says Are Perfect",
      slug: "movies-everyone-says-are-perfect",
      description: `You know those movies that always end up on "best of all time" lists? The ones film students won't shut up about? The ones your dad quotes at dinner?

Yeah, turns out they're actually that good. We checked. Multiple times.

These are the movies that somehow live up to the hype. They're the reason the hype exists. If you haven't seen them, you're missing out on being able to nod knowingly when someone references them at parties.`,
      picks: [
        { movieSlug: "the-shawshank-redemption", rank: 1 },
        { movieSlug: "the-dark-knight", rank: 2 },
        { movieSlug: "pulp-fiction", rank: 3 },
      ],
    },
    {
      title: "Movies That Will Make You Think (Too Much)",
      slug: "movies-that-will-make-you-think-too-much",
      description: `Sometimes you want to watch a movie and then immediately go to sleep. These are not those movies.

These are the ones that will have you staring at the ceiling at 2 AM, reading Reddit theories, and annoying your friends with "but what do you think it MEANS?" for weeks afterward.

Consider yourself warned. Also, good luck explaining any of these plots to your parents.`,
      picks: [
        { movieSlug: "inception", rank: 1 },
        { movieSlug: "spirited-away", rank: 2 },
        { movieSlug: "the-proposal", rank: 3 },
      ],
    },
  ];

  console.log("Creating categories...");
  for (const categoryData of categoriesData) {
    // Create or update category
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {
        title: categoryData.title,
        description: categoryData.description,
      },
      create: {
        title: categoryData.title,
        slug: categoryData.slug,
        description: categoryData.description,
      },
    });
    console.log(`  - ${category.title}`);

    // Clear existing assignments for this category
    await prisma.categoryAssignment.deleteMany({
      where: { categoryId: category.id },
    });

    // Create new assignments
    for (const pick of categoryData.picks) {
      const movie = movies[pick.movieSlug];
      if (movie) {
        await prisma.categoryAssignment.create({
          data: {
            categoryId: category.id,
            movieId: movie.id,
            rank: pick.rank,
          },
        });
        console.log(`    - #${pick.rank}: ${movie.title}`);
      }
    }
  }

  console.log("\n✓ Seed completed successfully!");
  console.log("\nAdmin credentials:");
  console.log(`  Username: admin`);
  console.log(`  Password: ${adminPassword}`);
  console.log("\n(Change ADMIN_PASSWORD env var for a different password)");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
