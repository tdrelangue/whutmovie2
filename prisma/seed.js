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
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Fantasy",
    "Horror",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Thriller",
    "Western",
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
  // Note: Keep slugs stable. If you rename titles later, prefer updating title only.
  const moviesData = [
    // === Think too much ===
    {
      title: "Inception",
      slug: "inception",
      year: 2010,
      whutSummary:
        "Dream heist movie that spends 40 minutes teaching rules, then speedruns breaking them. You will either love the ending or argue about a spinning top for years.",
      description:
        "A professional thief who steals secrets from dreams is offered a chance to clear his past by planting an idea inside a target’s mind.",
      genres: ["action", "sci-fi", "thriller"],
    },
    {
      title: "Interstellar",
      slug: "interstellar",
      year: 2014,
      whutSummary:
        "Space, time dilation, crying, and a soundtrack that makes your chest vibrate. The science is serious, the feelings are louder, and the ending is a philosophical jump-scare.",
      description:
        "A team of explorers travels through a wormhole in search of a new home for humanity as time and distance stop behaving politely.",
      genres: ["adventure", "drama", "sci-fi"],
    },
    {
      title: "Eternal Sunshine of the Spotless Mind",
      slug: "eternal-sunshine-of-the-spotless-mind",
      year: 2004,
      whutSummary:
        "You ever wished to forget your ex even existed... Breakup movie where the solution is deleting the relationship from your brain. Spoiler: the brain keeps receipts.",
      description:
        "After a painful breakup, a man undergoes a procedure to erase memories of his ex, and learns why that’s a terrible idea.",
      genres: ["drama", "romance", "sci-fi"],
    },

    // === Perfect movies ===
    {
      title: "The Shawshank Redemption",
      slug: "the-shawshank-redemption",
      year: 1994,
      whutSummary:
        "A man goes to prison for a crime he may or may not have commited and responds with patience, friendship, and the most satisfying long game ever filmed.",
      description:
        "Two prisoners form a lasting friendship as one quietly builds a path toward freedom and meaning.",
      genres: ["drama"],
    },
    {
      title: "Pulp Fiction",
      slug: "pulp-fiction",
      year: 1994,
      whutSummary:
        "Crime anthology presented out of order because Tarantino. Contains a dance scene, a mystery briefcase, and a suspicious amount of philosophical hamburger talk.",
      description:
        "Interwoven stories of criminals and accidents collide in stylized violence, dark comedy, and strange redemption arcs.",
      genres: ["crime", "drama", "thriller"],
    },
    {
      title: "Schindler’s List",
      slug: "schindlers-list",
      year: 1993,
      whutSummary:
        "A film so heavy it changes the air in the room. Not ‘fun’, not ‘easy’, but essential if you want your humanity to stay calibrated.",
      description:
        "During WWII, Oskar Schindler saves more than a thousand Jewish refugees by employing them in his factories.",
      genres: ["drama", "history"].filter(Boolean), // if you later add History genre
    },

    // === Time is a lie ===
    {
      title: "Groundhog Day",
      slug: "groundhog-day",
      year: 1993,
      whutSummary:
        "An absolute c*nt of a man relives the same day until he becomes a better person. It’s therapy, but with a time loop and way more snow.",
      description:
        "A cynical weatherman is trapped repeating the same day in a small town until he changes himself.",
      genres: ["comedy", "fantasy", "romance"],
    },
    {
      title: "Looper",
      slug: "looper",
      year: 2012,
      whutSummary:
        "Time travel crime movie where the worst assignment is ‘kill your future self’. Clean premise, messy consequences, great vibes.",
      description:
        "A hitman who kills targets sent from the future is forced to confront his older self.",
      genres: ["action", "crime", "sci-fi", "thriller"],
    },
    {
      title: "A Dog’s Purpose",
      slug: "a-dogs-purpose",
      year: 2017,
      whutSummary:
        "Reincarnation, but fluffy. If you are emotionally stable, this movie will test that claim.",
      description:
        "A dog is reborn across several lives and learns what his purpose is through the humans he loves.",
      genres: ["drama", "family", "fantasy"].filter(Boolean), // if you later add Family genre
    },
    {
      title: "Palm Springs",
      slug: "palm-springs",
      year: 2020,
      whutSummary:
        "Time loop rom-com where the loop is not the problem. The problem is being yourself forever. Somehow hilarious.",
      description:
        "Two wedding guests get stuck reliving the same day and decide to make it everyone else’s problem too.",
      genres: ["comedy", "romance", "sci-fi"],
    },
    {
      title: "Boss Level",
      slug: "boss-level",
      year: 2020,
      whutSummary:
        "Groundhog Day, but with assassins. Dying repeatedly becomes a strategy. Video game logic, surprisingly watchable.",
      description:
        "A retired soldier relives the day of his death and fights to escape a loop engineered against him.",
      genres: ["action", "thriller", "sci-fi"],
    },
    {
      title: "The Adam Project",
      slug: "the-adam-project",
      year: 2022,
      whutSummary:
        "Time travel, family trauma, and Ryan Reynolds being Ryan Reynolds. It’s a hug wrapped in sci-fi.",
      description:
        "A time-traveling pilot teams up with his younger self to confront the past and save the future.",
      genres: ["action", "adventure", "comedy", "sci-fi"],
    },

    // === Reality is not what you think ===
    {
      title: "The Truman Show",
      slug: "the-truman-show",
      year: 1998,
      whutSummary:
        "Man discovers his entire life is a TV show. It’s funny until it isn’t, then it’s terrifying, then it’s inspiring. Jim Carrey in serious mode.",
      description:
        "A man raised inside a giant TV set begins to suspect the world around him is staged.",
      genres: ["comedy", "drama", "sci-fi"],
    },
    {
      title: "Blade Runner",
      slug: "blade-runner",
      year: 1982,
      whutSummary:
        "Neon rain, existential dread, and the question ‘what counts as human?’ If you like vibes, this movie is a full meal.",
      description:
        "A blade runner hunts bioengineered beings while questioning what identity and humanity mean.",
      genres: ["sci-fi", "thriller"],
    },
    {
      title: "Gattaca",
      slug: "gattaca",
      year: 1997,
      whutSummary:
        "A world where your DNA is your resume. One guy fakes his genetics and tries not to get caught by people who can literally test your eyelashes. It's like having sex with your neighbour on live telly and expecting your spouse not to hear about it.",
      description:
        "A man with inferior genetics assumes another identity to pursue his dream of space travel.",
      genres: ["drama", "sci-fi", "thriller"],
    },
    {
      title: "2001: A Space Odyssey",
      slug: "2001-a-space-odyssey",
      year: 1968,
      whutSummary:
        "A slow, hypnotic masterpiece that feels like watching the universe think. Not a plot, an experience. HAL is polite and terrifying.",
      description:
        "A space mission is disrupted by an AI as humanity confronts forces beyond comprehension.",
      genres: ["sci-fi", "mystery"],
    },

    // === Destroy you ===
    {
      title: "The Green Mile",
      slug: "the-green-mile",
      year: 1999,
      whutSummary:
        "Prison drama that gently convinces you everything is unfair, then finishes the job. You will not be the same after the final scene. It's the story of the hero we will never diserve.",
      description:
        "A death row guard encounters a prisoner with a mysterious gift and a tragic fate.",
      genres: ["crime", "drama", "fantasy"],
    },
    {
      title: "The Perks of Being a Wallflower",
      slug: "the-perks-of-being-a-wallflower",
      year: 2012,
      whutSummary:
        "Teen movie that looks soft, then punches you in the childhood, guts your trust in people and makes you realise one or two individuals might still be worth living. Friendship, trauma, healing, and a soundtrack that hurts in the best way.",
      description:
        "An introverted teen navigates friendship, love, and trauma during his first year of high school.",
      genres: ["drama", "romance"],
    },
    {
      title: "Good Will Hunting",
      slug: "good-will-hunting",
      year: 1997,
      whutSummary:
        "Genius janitor meets therapist and learns that being smart doesn’t fix being scared. ‘It’s not your fault’ becomes a weapon.",
      description:
        "A gifted but troubled man is pushed to confront his past and potential through therapy and mentorship.",
      genres: ["drama", "romance"],
    },
    {
      title: "Meet Joe Black",
      slug: "meet-joe-black",
      year: 1998,
      whutSummary:
        "Death itself decide to go on holyday. Does it go to the Bahamas like any basic bitch? Nope! Maybe Cabo like like every other primordial concept that rule existance? Niet! Death borrows Brad Pitt’s face and learns about love, life, and peanut butter. Slow, romantic, weirdly sincere.",
      description:
        "Death takes human form and spends time with a family while questioning what living really means.",
      genres: ["drama", "fantasy", "romance"],
    },
    {
      title: "Pay It Forward",
      slug: "pay-it-forward",
      year: 2000,
      whutSummary:
        "A kid invents ‘be nice to people’ as a social system and the movie dares you not to cry about it. Emotional damage, but purposeful.",
      description:
        "A boy’s school project inspires a chain of kindness that spreads far beyond his town.",
      genres: ["drama"],
    },

    // === Humanity seems hopeless ===
    {
      title: "A Man Called Otto",
      slug: "a-man-called-otto",
      year: 2022,
      whutSummary:
        "Grumpy man tries to be left alone but keeps accidentally becoming a decent human. The neighborhood refuses to let him self-destruct in peace.",
      description:
        "A stubborn widower’s life changes when new neighbors crash into his routines and his grief.",
      genres: ["comedy", "drama"],
    },
    {
      title: "The Terminal",
      slug: "the-terminal",
      year: 2004,
      whutSummary:
        "Man gets stuck in an airport and responds by building a life out of snacks, friendships, and pure persistence. Surprisingly warm.",
      description:
        "A traveler is stranded in an airport terminal and must survive while his country’s status is unresolved.",
      genres: ["comedy", "drama", "romance"],
    },
    {
      title: "Freedom Writers",
      slug: "freedom-writers",
      year: 2007,
      whutSummary:
        "Teacher fights chaos with notebooks and empathy. A bit idealized, but it lands if you’re in the mood for hope with a side of anger. Plus it actually is a tru  story.",
      description:
        "A teacher inspires her students to tell their stories and overcome violence and division through writing.",
      genres: ["biography", "crime", "drama"].filter(Boolean),
    },
    {
      title: "Stand and Deliver",
      slug: "stand-and-deliver",
      year: 1988,
      whutSummary:
        "Math teacher goes to war with low expectations and wins. It’s not magic. It’s math. That’s why it hits.",
      description:
        "A dedicated teacher pushes his underprivileged students to succeed in advanced math against all odds.",
      genres: ["drama"],
    },
    {
      title: "Intouchables",
      slug: "intouchables",
      year: 2011,
      whutSummary:
        "Two men from different worlds become friends and accidentally re-teach each other how to live. Funny, warm, and annoyingly effective.",
      description:
        "A wealthy quadriplegic hires a caregiver from a very different background, and both lives change.",
      genres: ["comedy", "drama"],
    },

    // === Rom-coms but with problems ===
    {
      title: "Notting Hill",
      slug: "notting-hill",
      year: 1999,
      whutSummary:
        "A boring guy meets a famous actress and somehow it stays charming instead of unbearable. Peak comfort rom-com.",
      description:
        "A bookstore owner’s life flips when he falls for a world-famous actress.",
      genres: ["comedy", "romance", "drama"],
    },
    {
      title: "Mr. & Mrs. Smith",
      slug: "mr-and-mrs-smith",
      year: 2005,
      whutSummary:
        "Married couple discovers they’re both assassins hired to kill each other. They handle it like adults: with gunfights and flirting.",
      description:
        "A bored married couple learns they’re rival assassins and their relationship becomes a literal battleground.",
      genres: ["action", "comedy", "romance", "thriller"],
    },
    {
      title: "Pretty Woman",
      slug: "pretty-woman",
      year: 1990,
      whutSummary:
        "Rich guy hires a woman for a week and accidentally falls in love. And people still think women are the ones who can't have sex without catching feelings. It’s glossy, iconic, and absolutely not subtle.",
      description:
        "A businessman and a woman from very different worlds form an unlikely bond over a week in Los Angeles.",
      genres: ["comedy", "romance"],
    },
    {
      title: "Forever My Girl",
      slug: "forever-my-girl",
      year: 2018,
      whutSummary:
        "Deadbeat country star dad returns home to face the consequences of leaving. In his defence he didn't know he had a kid but still a dick move. Oh and Brian Cranston is there but no cancer yet. Romance + guilt + small-town emotional cleanup.",
      description:
        "A musician returns to his hometown and reconnects with the woman he left behind.",
      genres: ["drama", "romance"],
    },
    {
      title: "Can’t Buy Me Love",
      slug: "cant-buy-me-love",
      year: 1987,
      whutSummary:
        "Teen pays a popular girl to pretend-date him and learns popularity is a scam. Classic ‘social status is fake’ rom-com energy.",
      description:
        "A high school outcast pays a popular girl to date him, leading to unexpected consequences.",
      genres: ["comedy", "romance"],
    },

    // === Rom-com snack pack ===
    {
      title: "Hitch",
      slug: "hitch",
      year: 2005,
      whutSummary:
        "Dating coach who knows everything about love discovers he knows nothing about love. Smooth, easy, and weirdly rewatchable.",
      description:
        "A dating consultant falls for a journalist while helping a shy client pursue romance.",
      genres: ["comedy", "romance"],
    },
    {
      title: "The Girl Next Door",
      slug: "the-girl-next-door",
      year: 2004,
      whutSummary:
        "Teen thinks he found the perfect girl next door, then learns adulthood is complicated. Trashy? A bit. Fun? Also yes.",
      description:
        "A straight-laced teen’s life changes when he falls for his new neighbor with a secret past.",
      genres: ["comedy", "romance"],
    },
    {
      title: "Puppy Love",
      slug: "puppy-love",
      year: 2023,
      whutSummary:
        "Two disasters have a bad first date and then their dogs force them into a second chance. Dogs are better matchmakers than humans.",
      description:
        "After a disastrous first date, two people keep running into each other because their dogs refuse to cooperate.",
      genres: ["comedy", "romance"],
    },
    {
      title: "A Beautiful Life",
      slug: "a-beautiful-life",
      year: 2023,
      whutSummary:
        "Singer meets producer, talent meets life, romance meets reality. Pretty good songs. Warm, fuzzy, musical, and not afraid to be emotional.",
      description:
        "A young fisherman with a gift for singing is discovered and pulled into a new life where love and ambition collide.",
      genres: ["drama", "romance"],
    },

    // === Spy movies ===
    {
      title: "Tinker Tailor Soldier Spy",
      slug: "tinker-tailor-soldier-spy",
      year: 2011,
      whutSummary:
        "Spying without gadgets, explosions, or charisma bonuses. Everyone is tired, suspicious, and lying to everyone else. If James Bond is fantasy, this is the paperwork.",
      description:
        "In the bleak world of Cold War espionage, a retired intelligence officer is tasked with uncovering a Soviet mole hiding at the top of British Intelligence.",
      genres: ["thriller", "drama", "mystery"],
    },

    {
      title: "Dr. No",
      slug: "dr-no",
      year: 1962,
      whutSummary:
        "Bond in the early days: simple mission, iconic vibe, and fewer cinematic-universe headaches. Clean spy comfort food.",
      description:
        "James Bond investigates a mysterious island plot that threatens global security.",
      genres: ["action", "adventure", "thriller"],
    },
    {
      title: "Casino Royale",
      slug: "casino-royale",
      year: 2006,
      whutSummary:
        "Bond reboot where the punches hurt and the poker is life-or-death because cinema logic. Peak modern spy movie.",
      description:
        "James Bond takes on a high-stakes mission in a casino that becomes personal and brutal.",
      genres: ["action", "adventure", "thriller"],
    },
    {
      title: "Kingsman: The Secret Service",
      slug: "kingsman-the-secret-service",
      year: 2014,
      whutSummary:
        "Spy movie with style turned up to 11. Suit violence, umbrella violence, british word violence and a church scene that made people pause the movie.",
      description:
        "A street kid is recruited into a secret spy organization and thrown into absurdly stylish chaos.",
      genres: ["action", "adventure", "comedy", "thriller"],
    },
    {
      title: "The Tourist",
      slug: "the-tourist",
      year: 2010,
      whutSummary:
        "Vacation accidentally becomes spy nonsense. Pretty locations, light intrigue, and vibes doing most of the work.",
      description:
        "A tourist is pulled into a web of intrigue after meeting a mysterious woman in Europe.",
      genres: ["action", "romance", "thriller"],
    },
    {
      title: "The Gray Man",
      slug: "the-gray-man",
      year: 2022,
      whutSummary:
        "Two extremely attractive people sprint through explosions for two hours. Plot exists. Mostly it’s running and gunfire.",
      description:
        "A CIA operative becomes a target after uncovering secrets and is hunted across the globe.",
      genres: ["action", "thriller"],
    },
    {
      title: "Central Intelligence",
      slug: "central-intelligence",
      year: 2016,
      whutSummary:
        "High school reunion meets spy chaos. Comedy first, spying second. Exactly what it says on the tin.",
      description:
        "A mild accountant is dragged into an espionage mess by an old classmate turned CIA agent.",
      genres: ["action", "comedy", "crime"],
    },
    {
      title: "Men in Black",
      slug: "men-in-black",
      year: 1997,
      whutSummary:
        "Secret agency but with aliens, memory wipes, and the best deadpan partner dynamic. Sci-fi comedy that still works.",
      description:
        "A street-smart recruit joins a secret organization policing extraterrestrials on Earth.",
      genres: ["action", "adventure", "comedy", "sci-fi"],
    },
    {
      title: "The Family Plan",
      slug: "the-family-plan",
      year: 2023,
      whutSummary:
        "Family road trip, except dad used to be lethal. It’s the classic contradiction between parents forbidding fun and the shit they did when they were your age.",
      description:
        "A former assassin’s quiet family life unravels and turns into a high-speed escape.",
      genres: ["action", "comedy"],
    },

    // === Superheroes with no homework ===
    {
      title: "The Dark Knight",
      slug: "the-dark-knight",
      year: 2008,
      whutSummary:
        "Batman vs Joker, but filmed like a crime epic. It’s the superhero movie people cite when they want to sound serious. Fair enough.",
      description:
        "Batman faces the Joker, who turns Gotham into a moral experiment with explosive consequences.",
      genres: ["action", "crime", "drama", "thriller"],
    },
    {
      title: "Iron Man",
      slug: "iron-man",
      year: 2008,
      whutSummary:
        "The one Marvel movie that works perfectly standalone. A rich guy builds a suit, gets humbled, and becomes weirdly lovable.",
      description:
        "A weapons manufacturer builds a powered suit and redefines himself as a hero.",
      genres: ["action", "adventure", "sci-fi"],
    },
    {
      title: "Hancock",
      slug: "hancock",
      year: 2008,
      whutSummary:
        "A superhero with zero PR skills tries to become a decent person. Messy, funny, and refreshingly not sacred about heroism.",
      description:
        "A troubled superhero seeks redemption with the help of a public relations expert.",
      genres: ["action", "comedy", "drama"],
    },
    {
      title: "Deadpool",
      slug: "deadpool",
      year: 2016,
      whutSummary:
        "Superhero movie that hates superhero movies and narrates its own chaos. Violent, meta, and somehow heartfelt.",
      description:
        "A mercenary with accelerated healing becomes Deadpool and seeks revenge with maximum sarcasm.",
      genres: ["action", "comedy"],
    },
    {
      title: "Superhero Movie (satirical)",
      slug: "superhero-movie-satirical",
      year: 2008,
      whutSummary:
        "Parody that exists to bully superhero tropes. Stupid on purpose. Sometimes that’s the point.",
      description:
        "A spoof comedy that riffs on popular superhero film tropes and clichés.",
      genres: ["comedy"],
    },

    // === Criminal underworld codes ===
    {
      title: "The Godfather",
      slug: "the-godfather",
      year: 1972,
      whutSummary:
        "The mafia movie that became the mafia blueprint. Family, power, and the slow realization that everyone is trapped in the code.",
      description:
        "The aging patriarch of a crime dynasty transfers control to his reluctant son.",
      genres: ["crime", "drama"],
    },
    {
      title: "John Wick",
      slug: "john-wick",
      year: 2014,
      whutSummary:
        "Why di they have to kill the dog ? Stop killing dogs people! A man goes on a revenge rampage and reveals an entire underworld with rules, hotels, and professionalism. Assassin mafia, basically.",
      description:
        "A retired hitman returns to action to avenge a loss and collides with the criminal underworld.",
      genres: ["action", "crime", "thriller"],
    },
    {
      title: "Catch Me If You Can",
      slug: "catch-me-if-you-can",
      year: 2002,
      whutSummary:
        "A charming fraudster runs circles around the FBI. It’s crime, but with charisma, momentum, and surprisingly tender moments.",
      description:
        "A young con artist successfully forges and scams his way across the world while pursued by an FBI agent.",
      genres: ["crime", "drama"],
    },
    {
      title: "BlacKkKlansman",
      slug: "blackkklansman",
      year: 2018,
      whutSummary:
        "A Black detective infiltrates the KKK by phone, and his colleague does the in-person part. Funny until it’s not.",
      description:
        "An undercover investigation targets the Ku Klux Klan with an operation that becomes increasingly dangerous.",
      genres: ["biography", "comedy", "crime", "drama"].filter(Boolean),
    },

    // === Real-world systems are rotten ===
    {
      title: "The Big Short",
      slug: "the-big-short",
      year: 2015,
      whutSummary:
        "Financial crisis explained like a heist movie, except the heist is legal and everyone gets away with it. You will learn and you will get angry.",
      description:
        "A group of outsiders predicts the housing bubble collapse and bets against the market.",
      genres: ["biography", "comedy", "drama"].filter(Boolean),
    },
    {
      title: "Erin Brockovich",
      slug: "erin-brockovich",
      year: 2000,
      whutSummary:
        "No matter what you do DO NOT piss of a single mom. A woman with zero patience and maximum conviction takes on a corporation and wins. Pure ‘system vs stubborn human’ energy.",
      description:
        "A legal assistant helps bring down a utility company accused of polluting a town’s water supply.",
      genres: ["biography", "drama"].filter(Boolean),
    },

    // === Sports that actually motivate ===
    {
      title: "Coach Carter",
      slug: "coach-carter",
      year: 2005,
      whutSummary:
        "Basketball movie that insists school matters and backs it up with consequences. Motivation with teeth.",
      description:
        "A coach demands discipline and academic commitment from his team, challenging the community’s priorities.",
      genres: ["drama", "sport"].filter(Boolean),
    },
    {
      title: "Moneyball",
      slug: "moneyball",
      year: 2011,
      whutSummary:
        "Baseball, but the real sport is fighting tradition with spreadsheets. If you like strategy, this is a thriller in disguise.",
      description:
        "A baseball manager uses data analytics to build a competitive team on a limited budget.",
      genres: ["biography", "drama", "sport"].filter(Boolean),
    },
    {
      title: "Ford v Ferrari",
      slug: "ford-v-ferrari",
      year: 2019,
      whutSummary:
        "Car racing movie that turns engineering obsession into cinema. You will care about Le Mans even if you don’t know what Le Mans is.",
      description:
        "An American team builds a revolutionary race car to challenge Ferrari at Le Mans.",
      genres: ["action", "biography", "drama"].filter(Boolean),
    },
    {
      title: "Eddie the Eagle",
      slug: "eddie-the-eagle",
      year: 2016,
      whutSummary:
        "Ski jumping underdog story. It’s pure stubborn joy with enough humiliation to feel earned.",
      description:
        "An unlikely athlete pursues Olympic ski jumping despite being wildly unprepared.",
      genres: ["biography", "comedy", "drama"].filter(Boolean),
    },
    {
      title: "12 Mighty Orphans",
      slug: "12-mighty-orphans",
      year: 2021,
      whutSummary:
        "Underdog football team from an orphanage goes against the world. It’s straightforward, sincere, and built for motivation.",
      description:
        "An orphanage football team rises through discipline and community support in Depression-era America.",
      genres: ["drama", "sport"].filter(Boolean),
    },
    {
      title: "The Blind Side",
      slug: "the-blind-side",
      year: 2009,
      whutSummary:
        "A family supports a kid with huge potential and the movie turns that into a feel-good sports arc. Effective, if a bit polished.",
      description:
        "A teenager’s life changes when he is taken in by a family who helps him succeed in football and life.",
      genres: ["biography", "drama", "sport"].filter(Boolean),
    },

    // === Smart people biopics ===
    {
      title: "A Beautiful Mind",
      slug: "a-beautiful-mind",
      year: 2001,
      whutSummary:
        "Genius isn’t the problem. The problem is what genius costs. Brilliant, heartbreaking, and not as simple as it looks.",
      description:
        "The life of mathematician John Nash and his struggle with mental illness and achievement.",
      genres: ["biography", "drama"].filter(Boolean),
    },
    {
      title: "The Theory of Everything",
      slug: "the-theory-of-everything",
      year: 2014,
      whutSummary:
        "Love story wearing a physics coat. It’s about time, illness, stubbornness, and the price of brilliance.",
      description:
        "The relationship of Stephen Hawking and Jane Wilde unfolds alongside his scientific work and illness.",
      genres: ["biography", "drama", "romance"].filter(Boolean),
    },
    {
      title: "The Imitation Game",
      slug: "the-imitation-game",
      year: 2014,
      whutSummary:
        "Codebreaking, war pressure, and a man who changed history while being punished by the same society he saved. Infuriating and necessary.",
      description:
        "Alan Turing’s work to crack the Enigma code and the personal consequences that followed.",
      genres: ["biography", "drama", "thriller"].filter(Boolean),
    },
    {
      title: "Ed Wood",
      slug: "ed-wood",
      year: 1994,
      whutSummary:
        "A love letter to a man who made terrible movies with maximum passion. It’s weirdly wholesome: failure, but with style and friends.",
      description:
        "A filmmaker’s dedication to making movies persists despite a complete lack of conventional talent.",
      genres: ["biography", "comedy", "drama"].filter(Boolean),
    },

    // === French humour (dumb) ===
    {
      title: "OSS 117: Cairo, Nest of Spies",
      slug: "oss-117-cairo-nest-of-spies",
      year: 2006,
      whutSummary:
        "A spy who is confidently wrong about everything. Elegant stupidity, perfectly executed.",
      description:
        "A clueless French spy is sent to Cairo and causes maximum damage with maximum confidence.",
      genres: ["comedy"],
    },
    {
      title: "OSS 117: Lost in Rio",
      slug: "oss-117-lost-in-rio",
      year: 2009,
      whutSummary:
        "Same spy. Same arrogance. New continent. Still a disaster. Still hilarious.",
      description:
        "OSS 117 heads to South America and continues being a beautifully useless agent of chaos.",
      genres: ["comedy"],
    },
    {
      title: "Astérix & Obélix: Mission Cleopatra",
      slug: "asterix-obelix-mission-cleopatra",
      year: 2002,
      whutSummary:
        "French comedy chaos with quotable lines for decades. A national monument disguised as a dumb movie.",
      description:
        "Astérix and Obélix help build a palace in Egypt while annoying Romans with style.",
      genres: ["comedy", "adventure"],
    },
    {
      title: "Brice de Nice",
      slug: "brice-de-nice",
      year: 2005,
      whutSummary:
        "A man whose entire personality is ‘surf’ despite living nowhere near surf. Pure idiocy. Somehow iconic.",
      description:
        "A spoiled beach-obsessed man chases meaning through vanity, accidents, and a lot of ‘cool’ poses.",
      genres: ["comedy"],
    },
    {
      title: "Brice de Nice 2",
      slug: "brice-de-nice-2",
      year: 2016,
      whutSummary:
        "More Brice. More delusion. If you liked the first, you know what you’re signing up for.",
      description:
        "Brice returns for more misguided adventures fueled by ego and accidental slapstick.",
      genres: ["comedy"],
    },
    {
      title: "RRRrrrr!!!",
      slug: "rrrrrrr",
      year: 2004,
      whutSummary:
        "Prehistoric murder mystery with jokes so dumb they loop back to genius. French absurdity at full power.",
      description:
        "Two rival tribes face a mysterious ‘crime’ in prehistoric times with maximum nonsense.",
      genres: ["comedy"],
    },
    {
      title: "La Cité de la Peur",
      slug: "la-cite-de-la-peur",
      year: 1994,
      whutSummary:
        "Meta parody, deadpan stupidity, and jokes that shouldn’t work but do. Cult status earned.",
      description:
        "A series of murders during a film festival becomes the excuse for nonstop parody and absurd investigation.",
      genres: ["comedy", "crime"],
    },

    // === French humour (smart) ===
    {
      title: "Qu’est-ce qu’on a fait au Bon Dieu ?",
      slug: "quest-ce-quon-a-fait-au-bon-dieu",
      year: 2014,
      whutSummary:
        "A family comedy that pokes at stereotypes and social tension with a big mainstream smile. It lands more often than it misses.",
      description:
        "A couple’s daughters marry men from different backgrounds, forcing everyone to confront their biases.",
      genres: ["comedy"],
    },
    {
      title: "Qu’est-ce qu’on a encore fait au Bon Dieu ?",
      slug: "quest-ce-quon-a-encore-fait-au-bon-dieu",
      year: 2019,
      whutSummary:
        "Same family, new chaos. It doubles down on the ‘everyone is uncomfortable’ engine.",
      description:
        "The family faces new tensions and misunderstandings as life changes around them.",
      genres: ["comedy"],
    },
    {
      title: "Les Bronzés",
      slug: "les-bronzes",
      year: 1978,
      whutSummary:
        "Vacation comedy that captures group stupidity with surgical precision. The jokes are old, the cringe is eternal.",
      description:
        "Holidaymakers collide in misunderstandings, flirting, and social awkwardness at a vacation resort.",
      genres: ["comedy"],
    },
    {
      title: "Les Bronzés font du ski",
      slug: "les-bronzes-font-du-ski",
      year: 1979,
      whutSummary:
        "Same people, ski trip, even worse decisions. French comedy canon.",
      description:
        "A friend group goes skiing and turns basic survival into chaos.",
      genres: ["comedy"],
    },
    {
      title: "La Septième Compagnie",
      slug: "la-septieme-compagnie",
      year: 1973,
      whutSummary:
        "War comedy where incompetence is the strategy. Lightweight, but remarkably effective at being charming.",
      description:
        "A group of soldiers stumbles through WWII with mishaps and accidental heroism.",
      genres: ["comedy", "war"].filter(Boolean),
    },
    {
      title: "Bienvenue chez les Ch’tis",
      slug: "bienvenue-chez-les-chtis",
      year: 2008,
      whutSummary:
        "A man fears the North of France, discovers humans live there. Comfort comedy with regional heart.",
      description:
        "A postal worker is transferred to Northern France and learns his prejudices were ridiculous.",
      genres: ["comedy"],
    },

    // === French movies (not primarily comedy) ===
    {
      title: "The Big Blue",
      slug: "the-big-blue",
      year: 1988,
      whutSummary:
        "Two divers obsess over the ocean like it’s a religion. Beautiful, melancholic, and aggressively blue.",
      description:
        "A lifelong rivalry and friendship unfolds around free diving and the call of the sea.",
      genres: ["drama", "romance"],
    },
    {
      title: "Hiroshima mon amour",
      slug: "hiroshima-mon-amour",
      year: 1959,
      whutSummary:
        "Love, memory, and trauma in dialogue form. It doesn’t hold your hand. It asks you to sit with the weight.",
      description:
        "A brief relationship in Hiroshima becomes a meditation on memory, loss, and history.",
      genres: ["drama", "romance"],
    },

    // === Zombies ===
    {
      title: "Shaun of the Dead",
      slug: "shaun-of-the-dead",
      year: 2004,
      whutSummary:
        "A zombie movie that’s funny, then smart, then unexpectedly sincere. Edgar Wright flexes both comedy and craft. Plus the camera work is heavenly, if you want to nerd out about thought out camera shots this is the one.",
      description:
        "A man tries to fix his life during a zombie outbreak while protecting friends and family.",
      genres: ["comedy", "horror"],
    },
    {
      title: "Dawn of the Dead",
      slug: "dawn-of-the-dead",
      year: 2004,
      whutSummary:
        "The mall becomes a fortress. The zombies are fast. The vibes are tense. Classic modern zombie chaos.",
      description:
        "Survivors take refuge in a shopping mall during a zombie outbreak and face escalating threats.",
      genres: ["horror", "action"],
    },
    {
      title: "Zombieland",
      slug: "zombieland",
      year: 2009,
      whutSummary:
        "Zombie apocalypse road trip with rules, jokes, and weirdly sweet character arcs. Comedy first, survival second.",
      description:
        "A group of survivors travels across the U.S. and tries not to die while arguing about snacks.",
      genres: ["comedy", "horror"],
    },
    {
      title: "Night of the Living Dead",
      slug: "night-of-the-living-dead",
      year: 1968,
      whutSummary:
        "The zombie blueprint. Low-budget, high impact, and still uncomfortable in the best way.",
      description:
        "A group of people hides in a farmhouse while the dead rise and society collapses outside.",
      genres: ["horror"],
    },
    {
      title: "Scout’s Guide to the Zombie Apocalypse",
      slug: "scouts-guide-to-the-zombie-apocalypse",
      year: 2015,
      whutSummary:
        "Teen zombie comedy that knows exactly what it is. Dumb, energetic, and surprisingly committed.",
      description:
        "Three scouts team up to survive a zombie outbreak and rescue their town.",
      genres: ["comedy", "horror"],
    },

    // === So bad it becomes a sport ===
    {
      title: "The VelociPastor",
      slug: "the-velocipastor",
      year: 2018,
      whutSummary:
        "A pastor turns into a dinosaur and fights crime. If you accept that sentence, you will enjoy the movie.",
      description:
        "A priest gains the ability to transform into a dinosaur and uses it to fight criminals.",
      genres: ["comedy", "horror"],
    },
    {
      title: "Birdemic: Shock and Terror",
      slug: "birdemic-shock-and-terror",
      year: 2010,
      whutSummary:
        "So bad it becomes performance art. Birds attack. CGI panics. Humans also attack acting.",
      description:
        "A small town faces an inexplicable bird attack in a film famous for its low-budget execution.",
      genres: ["horror", "romance"].filter(Boolean),
    },
    {
      title: "Anna vs Zombie Apocalypse",
      slug: "anna-vs-zombie-apocalypse",
      year: 2017,
      whutSummary:
        "Teen zombie Christmas chaos with ‘how is this real?’ energy. It’s weird, it’s fun, it belongs here.",
      description:
        "A teen navigates a zombie outbreak during the holidays and tries to survive with friends.",
      genres: ["comedy", "horror"],
    },
    {
      title: "Zombieladen (trailer only)",
      slug: "zombieladen-trailer-only",
      year: null,
      whutSummary:
        "It’s a fake movie trailer. % mins of pure joy that will stay you forever. It's a masterpiece and it’s already more honest than some full films. It counts as a joke and that’s the point.",
      description:
        "A notorious fake trailer reference. Included as a cultural artifact, not a real watch list item.",
      genres: ["comedy"],
    },

    // === Action / adrenaline ===
    {
      title: "Crank (Hyper Tension)",
      slug: "crank-hyper-tension",
      year: 2006,
      whutSummary:
        "A man must keep his adrenaline up or die, so the movie becomes two hours of unhinged sprinting. Loud, dumb, and committed.",
      description:
        "A hitman is poisoned and must keep his heart rate up to stay alive while seeking revenge.",
      genres: ["action", "crime", "thriller"],
    },

    // === Music but not a musical ===
    {
      title: "Footloose",
      slug: "footloose",
      year: 1984,
      whutSummary:
        "Dance as rebellion. Small-town pressure. Pure 80s energy. Nobody sings to advance the plot. They just move.",
      description:
        "A teen challenges a town’s ban on dancing and brings music back into people’s lives.",
      genres: ["drama", "music"].filter(Boolean),
    },
    {
      title: "8 Mile",
      slug: "8-mile",
      year: 2002,
      whutSummary:
        "Music as survival. Rap battles as identity. Raw, grounded, and surprisingly tight.",
      description:
        "A young rapper tries to find his voice and break out of his circumstances through battle rap.",
      genres: ["drama", "music"].filter(Boolean),
    },
    {
      title: "School of Rock",
      slug: "school-of-rock",
      year: 2003,
      whutSummary:
        "Jack Black weaponizes rock music to teach kids confidence. It’s loud, joyful, and weirdly wholesome.",
      description:
        "A struggling musician becomes a substitute teacher and turns his class into a rock band.",
      genres: ["comedy", "music"].filter(Boolean),
    },
    {
      title: "Whiplash",
      slug: "whiplash",
      year: 2014,
      whutSummary:
        "Jazz as violence. Practice as obsession. The drum solo is basically a fistfight with time.",
      description:
        "A young drummer is pushed to extremes by an abusive instructor in pursuit of greatness.",
      genres: ["drama", "music"].filter(Boolean),
    },
    {
      title: "Step Up",
      slug: "step-up",
      year: 2006,
      whutSummary:
        "Dance movie with zero shame. Training, rhythm, and social bridge-building through movement. It earns its place.",
      description:
        "A troublemaker finds purpose after joining a dance school and training for a showcase.",
      genres: ["crime", "drama", "romance", "music"].filter(Boolean),
    },

    // === Jim Carrey category ===
    {
      title: "Yes Man",
      slug: "yes-man",
      year: 2008,
      whutSummary:
        "Man says yes to everything and accidentally becomes alive again. It’s a self-help book, but funnier and with fewer scams.",
      description:
        "A man adopts a philosophy of saying yes to opportunities, changing his life in chaotic ways.",
      genres: ["comedy", "romance"],
    },
    {
      title: "The Mask",
      slug: "the-mask",
      year: 1994,
      whutSummary:
        "A magical mask turns a shy guy into a cartoon tornado. The physics are illegal and that’s why it works.",
      description:
        "A man finds a mask that transforms him into an unpredictable, superhuman trickster.",
      genres: ["comedy", "fantasy", "crime"],
    },
    {
      title: "How the Grinch Stole Christmas",
      slug: "how-the-grinch-stole-christmas",
      year: 2000,
      whutSummary:
        "Green hater tries to cancel Christmas, learns feelings exist. Jim Carrey’s face does things no face should do.",
      description:
        "A bitter creature attempts to ruin Christmas for a town, but gets emotionally compromised.",
      genres: ["comedy", "family", "fantasy"].filter(Boolean),
    },
    {
      title: "Dumb and Dumber",
      slug: "dumb-and-dumber",
      year: 1994,
      whutSummary:
        "Two idiots go on a road trip and lower the average IQ of every scene they enter. It’s disgusting. It’s classic.",
      description:
        "Two well-meaning but clueless friends travel cross-country and stumble into crime and chaos.",
      genres: ["comedy"],
    },
    {
      title: "Ace Ventura: Pet Detective",
      slug: "ace-ventura-pet-detective",
      year: 1994,
      whutSummary:
        "A man who is basically a noise machine solves animal cases. Peak Carrey chaos. Not subtle. Never subtle.",
      description:
        "An eccentric pet detective investigates the disappearance of a football team’s mascot.",
      genres: ["comedy", "crime"],
    },
    {
      title: "Me, Myself & Irene",
      slug: "me-myself-irene",
      year: 2000,
      whutSummary:
        "A gentle cop develops an aggressive alter ego and everything becomes a disaster. Extremely 2000s. Extremely committed.",
      description:
        "A mild-mannered man with split personalities goes on the run with a woman and chaos follows.",
      genres: ["comedy", "crime"],
    },

    // === Sports you’ve heard of but never really watched ===
    {
      title: "Rasta Rockets (Cool Runnings)",
      slug: "rasta-rockets-cool-runnings",
      year: 1993,
      whutSummary:
        "Jamaican bobsleigh team decides gravity is optional. You come for the laughs, you stay for the surprisingly real heart.",
      description:
        "A group of Jamaican athletes trains to compete in Olympic bobsleigh against all expectations.",
      genres: ["comedy", "sport"].filter(Boolean),
    },
    {
      title: "Eddie the Eagle",
      slug: "eddie-the-eagle",
      year: 2016,
      whutSummary:
        "Ski jumping underdog story. It’s pure stubborn joy with enough humiliation to feel earned. If you need motivation with a side of winter chaos, this is it.",
      description:
        "An unlikely British athlete pursues Olympic ski jumping despite lacking resources, experience, and basically every advantage.",
      genres: ["biography", "comedy", "drama"],
    },
    {
      title: "I, Tonya",
      slug: "i-tonya",
      year: 2017,
      whutSummary:
        "Figure skating meets chaos. Darkly funny, brutally human, and allergic to polite biopic storytelling.",
      description:
        "A controversial figure skater’s rise and scandal unfold through an unflinching, darkly comedic lens.",
      genres: ["biography", "comedy", "drama"].filter(Boolean),
    },
    {
      title: "Billy Elliot",
      slug: "billy-elliot",
      year: 2000,
      whutSummary:
        "A kid chooses ballet in a world that wants him to choose anything else. It’s discipline, identity, and liberation in one package.",
      description:
        "A boy discovers a passion for ballet and confronts family and social expectations.",
      genres: ["drama"],
    },

    // === Full trilogy night ===
    {
      title: "The Lord of the Rings (Trilogy)",
      slug: "the-lord-of-the-rings-trilogy",
      year: 2001,
      whutSummary:
        "One of the only trilogies that feels like a single, coherent epic. You will commit a full weekend and you will not regret it. But for heaven sake don't forget to pause the movie to say that Viggo Mortensen actually broke his foot kicking the helmet!",
      description:
        "A compiled entry representing the full Lord of the Rings trilogy viewing experience.",
      genres: ["adventure", "fantasy"],
    },
    {
      title: "Star Wars (Original Trilogy)",
      slug: "star-wars-original-trilogy",
      year: 1977,
      whutSummary:
        "The pop myth trilogy. Lasers, family drama, and the blueprint for modern blockbuster culture. Watch it in release order and enjoy.",
      description:
        "A compiled entry representing Episodes IV–VI as a single trilogy viewing experience.",
      genres: ["adventure", "sci-fi"],
    },
    {
      title: "Jurassic Park (Trilogy)",
      slug: "jurassic-park-trilogy",
      year: 1993,
      whutSummary:
        "Dinosaurs + humans being overconfident. It’s the franchise where science says ‘don’t’ and business says ‘do it anyway’.",
      description:
        "A compiled entry representing the Jurassic Park trilogy viewing experience.",
      genres: ["adventure", "sci-fi", "thriller"],
    },

    // === Time does weird things ===
    {
      title: "The Curious Case of Benjamin Button",
      slug: "benjamin-button",
      year: 2008,
      whutSummary:
        "A man ages backwards, and the movie quietly asks what ‘a life’ even means when time refuses to cooperate.",
      description:
        "A man experiences life aging in reverse, complicating love, identity, and meaning over decades.",
      genres: ["drama", "fantasy", "romance"],
    },
    {
      title: "The Lake House",
      slug: "the-lake-house",
      year: 2006,
      whutSummary:
        "Two people fall in love through a mailbox that refuses linear time. It’s romantic sci-fi, but gentle and strangely calming.",
      description:
        "A doctor and an architect communicate through a mysterious mailbox that connects them across time.",
      genres: ["drama", "romance", "fantasy"],
    },
    {
      title: "Tenet",
      slug: "tenet",
      year: 2020,
      whutSummary:
        "Time inversion spy action where the soundtrack is a panic attack and the plot is a puzzle box. Don’t try to ‘get it’. Let it happen.",
      description:
        "An operative fights a threat beyond time itself using inversion technology and global espionage.",
      genres: ["action", "sci-fi", "thriller"],
    },
  ];

  console.log("Creating movies...");
  const movies = {};
  for (const movieData of moviesData) {
    // Normalize: allow null year
    const year = typeof movieData.year === "number" ? movieData.year : null;

    // Connect only existing genre slugs (your Genre table is controlled by genresData above).
    // If you want extra genres like "music", "sport", "family", "history", add them to genresData.
    const genreConnections = (movieData.genres || [])
      .map((g) => slugify(g))
      .filter((slug) => genres[slug])
      .map((slug) => ({ id: genres[slug].id }));

    const movie = await prisma.movie.upsert({
      where: { slug: movieData.slug },
      update: {
        title: movieData.title,
        whutSummary: movieData.whutSummary,
        description: movieData.description,
        year,
        genres: { set: genreConnections },
      },
      create: {
        title: movieData.title,
        slug: movieData.slug,
        whutSummary: movieData.whutSummary,
        description: movieData.description,
        year,
        genres: { connect: genreConnections },
      },
    });

    movies[movieData.slug] = movie;
    console.log(`  - ${movie.title}`);
  }

  // Create categories with over-explained descriptions
  const categoriesData = [
    {
      title: "Movies That Will Make You Think (Too Much)",
      slug: "movies-that-will-make-you-think-too-much",
      description: `Sometimes you want to watch a movie and then immediately go to sleep. These are not those movies.

These are the films that make your brain keep running after the credits. You will stare at the ceiling. You will Google one thing “just to be sure”. You will become the person who says “but what does it MEAN though?” in a group chat.

If you wanted ‘easy’, you took a wrong turn. If you wanted ‘good’, you’re exactly where you should be.`,
      picks: [
        { movieSlug: "inception", rank: 1 },
        { movieSlug: "interstellar", rank: 2 },
        { movieSlug: "eternal-sunshine-of-the-spotless-mind", rank: 3 },
      ],
      honorableMentions: [],
    },
    {
      title: "Movies Everyone Says Are Perfect",
      slug: "movies-everyone-says-are-perfect",
      description: `You know those movies that always end up on “best of all time” lists? The ones people mention with a serious face like they’re reciting scripture?

Yeah. Annoyingly, they deserve it.

These are the films that somehow live up to the hype. If you haven’t seen them, you’re missing out on being able to nod wisely when someone references them at dinner.`,
      picks: [
        { movieSlug: "the-shawshank-redemption", rank: 1 },
        { movieSlug: "pulp-fiction", rank: 2 },
        { movieSlug: "schindlers-list", rank: 3 },
      ],
      honorableMentions: [],
    },
    {
      title: "Time Is a Lie",
      slug: "time-is-a-lie",
      description: `In normal life, time is linear. In these movies, time is a suggestion.

Loops. Jumps. Bad decisions repeated until someone learns something. Or until someone stops learning and starts panicking.

If you like neat timelines and clean causality, this category will disrespect you.`,
      picks: [
        { movieSlug: "groundhog-day", rank: 1 },
        { movieSlug: "about-time", rank: 2 },
        { movieSlug: "a-dogs-purpose", rank: 3 },
      ],
      honorableMentions: [
        { movieSlug: "palm-springs" },
        { movieSlug: "boss-level" },
        { movieSlug: "looper" },
        { movieSlug: "the-adam-project" },
      ],
    },
    {
      title: "Reality Is Not What You Think It Is",
      slug: "reality-is-not-what-you-think-it-is",
      description: `These movies look like reality for about five minutes. Then they politely remove the floor.

Simulation. Identity. “What if everything you know is staged?” It’s the category for people who enjoy that specific kind of existential itch.

Also a great way to ruin your ability to trust your own perception. Enjoy.`,
      picks: [
        { movieSlug: "the-truman-show", rank: 1 },
        { movieSlug: "blade-runner", rank: 2 },
        { movieSlug: "gattaca", rank: 3 },
      ],
      honorableMentions: [{ movieSlug: "2001-a-space-odyssey" }],
    },
    {
      title: "Movies That Will Destroy You",
      slug: "movies-that-will-destroy-you",
      description: `You are not “watching a movie” here. You are consenting to emotional implosion.

This category is for films that take something tender, press on it, and refuse to stop until you feel things you didn’t schedule for tonight.

If you’re already fragile, pick carefully. If you’re numb, this is medicine.`,
      picks: [
        { movieSlug: "the-green-mile", rank: 1 },
        { movieSlug: "the-perks-of-being-a-wallflower", rank: 2 },
        { movieSlug: "good-will-hunting", rank: 3 },
      ],
      honorableMentions: [{ movieSlug: "meet-joe-black" }, { movieSlug: "pay-it-forward" }],
    },
    {
      title: "Watch Me When Humanity Seems Hopeless",
      slug: "watch-me-when-humanity-seems-hopeless",
      description: `This is the category for days when you’ve had enough of people.

These movies won’t lie to you about the world being hard. They just insist that small decency still exists, and that it still matters.

It’s not optimism. It’s recovery.`,
      picks: [
        { movieSlug: "pay-it-forward", rank: 1},
        { movieSlug: "stand-and-deliver", rank: 2 },
        { movieSlug: "a-man-called-otto", rank: 3 },
      ],
      honorableMentions: [{ movieSlug: "the-terminal" },{ movieSlug: "freedom-writers"}, { movieSlug: "intouchables" }],
    },
    {
      title: "Rom-coms (but with problems)",
      slug: "rom-coms-but-with-problems",
      description: `Yes, it’s romance. No, it’s not simple.

Sometimes the problem is existential. Sometimes the problem is time travel. Sometimes the problem is that they’re literally trying to kill each other.

The point is: love is great. Life is messy. These movies don’t pretend otherwise.`,
      picks: [
        { movieSlug: "notting-hill", rank: 1 },
        { movieSlug: "about-time", rank: 2 },
        { movieSlug: "mr-and-mrs-smith", rank: 3 },
      ],
      honorableMentions: [
        { movieSlug: "pretty-woman" },
        { movieSlug: "forever-my-girl" },
        { movieSlug: "cant-buy-me-love" },
      ],
    },
    {
      title: "Rom-com Snack Pack",
      slug: "rom-com-snack-pack",
      description: `Sometimes you don’t want emotional complexity. You want charm, jokes, and a guaranteed happy landing.

This category is for when your brain is tired and your standards are still alive, but flexible.

It’s not “trash”. It’s “efficient.”`,
      picks: [
        { movieSlug: "hitch", rank: 1 },
        { movieSlug: "puppy-love", rank: 2 },
        { movieSlug: "the-girl-next-door", rank: 3 },
      ],
      honorableMentions: [{ movieSlug: "a-beautiful-life" }],
    },
    {
      title: "Are you the double agent or am I",
      slug: "spy-movies",
      description: `Suits. Gadgets. Lies. One-liners. The joy of watching professionals do illegal things with excellent posture.

These are the spy movies that hit different tones: classic, modern, and stylishly ridiculous.

Pick your flavor. Keep your alibi.`,
      picks: [
        { movieSlug: "dr-no", rank: 1 },
        { movieSlug: "kingsman-the-secret-service", rank: 2 },
        { movieSlug:"tinker-tailor-soldier-spy", rank: 3},
      ],
      honorableMentions: [{ movieSlug: "casino-royale" },{ movieSlug: "the-tourist" }, { movieSlug: "the-gray-man" } ],
    },
    {
      title: "Spy Movies (but goofy / family / off-brand)",
      slug: "spy-movies-goofy-family-off-brand",
      description: `Spy energy, but not spy seriousness.

This is the category for “I want chases and secrets, but I also want to laugh and not take anything personally.”

It’s espionage, but with snacks.`,
      picks: [
        { movieSlug: "men-in-black", rank: 1 },
        { movieSlug: "the-family-plan", rank: 2 },
        { movieSlug: "central-intelligence", rank: 3}
      ],
      honorableMentions: [],
    },
    {
      title: "Superhero Movies With No Homework",
      slug: "superhero-movies-with-no-homework",
      description: `Capes, powers, explosions. No syllabus.

No cinematic-universe spreadsheet. No “you need to watch these 14 things first”. You can just press play and enjoy the concept: a person is super, and the movie commits to that.

That’s it. That’s the dream.`,
      picks: [
        { movieSlug: "the-dark-knight", rank: 1 },
        { movieSlug: "iron-man", rank: 2 },
        { movieSlug: "hancock", rank: 3 },
      ],
      honorableMentions: [{ movieSlug: "superhero-movie-satirical" }, { movieSlug: "deadpool" }],
    },
    {
      title: "Criminal Underworld Codes",
      slug: "criminal-underworld-codes",
      description: `Crime stories where the real plot is the rules.

Some are old-school mafia. Some are modern assassin guilds with hotel policies. But the theme is the same: there is a code, and breaking it costs blood.

If you like your violence organized and your loyalty expensive, you’re home.`,
      picks: [
        { movieSlug: "the-godfather", rank: 1 },
        { movieSlug: "john-wick", rank: 2 },
        { movieSlug: "catch-me-if-you-can", rank: 3 },
      ],
      honorableMentions: [{ movieSlug: "blackkklansman" }],
    },
    {
      title: "Real-world Systems Are Rotten so fuck the free world",
      slug: "real-world-systems-are-rotten-so-fuck-the-free-world",
      description: `This category is for when you want to watch something and get furious at the fact it’s real.

Fraud. Corruption. “Legal” disasters. Systems built to protect themselves.

Great movies. Terrible reassurance.`,
      picks: [
        { movieSlug: "blackkklansman", rank: 1 },
        { movieSlug: "the-big-short", rank: 2 },
        { movieSlug: "erin-brockovich", rank: 3 },
      ],
      honorableMentions: [],
    },
    {
      title: "Sports Movies That Actually Motivate",
      slug: "sports-movies-that-actually-motivate",
      description: `Not “sports are fun”. Not “teamwork makes the dream work”.

These are the sports movies that make you stand up, reset your life, and maybe run two kilometers out of spite.

Different sports. Same outcome: you feel like doing something hard.`,
      picks: [
        { movieSlug: "coach-carter", rank: 1 },
        { movieSlug: "moneyball", rank: 2 },
        { movieSlug: "ford-v-ferrari", rank: 3 },
      ],
      honorableMentions: [{ movieSlug: "eddie-the-eagle" }, { movieSlug: "12-mighty-orphans" }, { movieSlug: "the-blind-side" }],
    },
    {
      title: "Smart People, Big Brains, Big Problems",
      slug: "smart-people-big-brains-big-problems",
      description: `Genius is not a vibe. It’s a burden.

These are the biopics where intelligence changes history, but also breaks people. Expect brilliance, pressure, and consequences.

You will feel both impressed and uncomfortable. Correct. After you'll be like me: proud of your own stupidity.`,
      picks: [
        { movieSlug: "a-beautiful-mind", rank: 1 },
        { movieSlug: "the-theory-of-everything", rank: 2 },
        { movieSlug: "the-imitation-game", rank: 3 },
      ],
      honorableMentions: [{ movieSlug: "ed-wood" }],
    },
    {
      title: "French Humour (Dumb as Fuck)",
      slug: "french-humour-dumb-as-fuck",
      description: `French comedy where intelligence is optional and commitment is mandatory.

These movies are dumb on purpose, and they execute the dumbness with craftsmanship. Plus it's french so of course we'll make fun of it!

If you’ve never laughed at something stupid with pride, welcome.`,
      picks: [
        { movieSlug: "oss-117-cairo-nest-of-spies", rank: 1 },
        { movieSlug: "asterix-obelix-mission-cleopatra", rank: 2 },
        { movieSlug: "brice-de-nice", rank: 3 },
      ],
      honorableMentions: [{ movieSlug: "rrrrrrr" }, { movieSlug: "la-cite-de-la-peur" }],
    },
    {
      title: "French Humour (smart)",
      slug: "french-humour-smart",
      description: `Same country, different weapon: social observation.

These are the comedies that are funny because they’re accurate. They don’t need explosions. They just need people being people, badly.

If you like humor with teeth, pick here.`,
      picks: [
        { movieSlug: "quest-ce-quon-a-fait-au-bon-dieu", rank: 1 },
        { movieSlug: "les-bronzes", rank: 2 },
        { movieSlug: "la-septieme-compagnie", rank: 3 },
      ],
      honorableMentions: [{ movieSlug: "bienvenue-chez-les-chtis" }],
    },
    {
      title: "French Movies taht are surprisingly good",
      slug: "french-movies-not-primarily-comedy",
      description: `France is not only jokes. Sometimes it’s melancholy, memory, and the sea calling you personally.

These are good French films with mood. Slow burn. Texture. Aftertaste.

Watch when you want cinema, not dopamine.`,
      picks: [
        { movieSlug: "intouchables", rank: 1 },
        { movieSlug: "the-big-blue", rank: 2 },
        { movieSlug: "hiroshima-mon-amour", rank: 3 },
      ],
      honorableMentions: [],
    },
    {
      title: "Zombies, But Make It Fun",
      slug: "zombies-but-make-it-fun",
      description: `Zombies are already stressful. So we add jokes.

This category is the sweet spot: comedy, horror, and surprisingly solid filmmaking. Pick based on vibe: clever, classic chaos, or pure entertainment.

Yes, the apocalypse can be funny.`,
      picks: [
        { movieSlug: "shaun-of-the-dead", rank: 1 },
        { movieSlug: "dawn-of-the-dead", rank: 2 },
        { movieSlug: "zombieland", rank: 3 },
      ],
      honorableMentions: [{ movieSlug: "night-of-the-living-dead" }, { movieSlug: "scouts-guide-to-the-zombie-apocalypse" }],
    },
    {
      title: "So Bad It Becomes a Sport",
      slug: "so-bad-it-becomes-a-sport",
      description: `These movies are not “good”. They are “an event”.

You don’t watch them quietly. You watch them with friends, snacks, and the understanding that you are here to witness chaos.

You will laugh. You will suffer. You will quote lines you shouldn’t.`,
      picks: [
        { movieSlug: "anna-vs-zombie-apocalypse", rank: 1 },
        { movieSlug: "the-velocipastor", rank: 2 },
        { movieSlug: "birdemic-shock-and-terror", rank: 3 },
      ],
      honorableMentions: [{ movieSlug: "zombieladen-trailer-only" },{ movieSlug: "crank-hyper-tension"}],
    },
// TODO
//     {
//       title: "Action / Adrenaline, no thinking",
//       slug: "action-adrenaline-no-thinking",
//       description: `You don’t come here for plot. You come here to feel your pulse.

// This category is for pure momentum: running, yelling, crashing, surviving. The story is “keep going”.

// If your brain wants a nap, give it one.`,
//       picks: [{ movieSlug: "", rank: 1 }],
//       honorableMentions: [],
//     },
    {
      title: "Movies with a fuck ton of songs but is NOT a musical",
      slug: "movies-with-a-fuck-ton-of-songs-but-is-not-a-musical",
      description: `Musicals are when characters sing to advance the story.

This is not that.

This is music everywhere because the world is loud: rehearsals, performances, dance floors, stages, garages. You’ll leave with songs stuck in your head without ever watching a “musical number”.`,
      picks: [
        { movieSlug: "footloose", rank: 1 },
        { movieSlug: "8-mile", rank: 2 },
        { movieSlug: "school-of-rock", rank: 3 },
      ],
      honorableMentions: [{ movieSlug: "whiplash" }, { movieSlug: "step-up" }],
    },
    {
      title: "The Jim FUCKING Carrey Category",
      slug: "the-jim-fucking-carrey-category",
      description: `Some actors act. Jim Carrey commits crimes against subtlety.

This category is for when you want elastic-face chaos, emotional whiplash, and jokes that should not work but do.

He is a genre. Deal with it.`,
      picks: [
        { movieSlug: "yes-man", rank: 1 },
        { movieSlug: "the-mask", rank: 2 },
        { movieSlug: "how-the-grinch-stole-christmas", rank: 3 },
      ],
      honorableMentions: [{ movieSlug: "dumb-and-dumber" }, { movieSlug: "ace-ventura-pet-detective" }, { movieSlug: "me-myself-irene" }],
    },
    {
      title: "Classics That Don’t Need a Category",
      slug: "classics-that-dont-need-a-category",
      description: `Some movies don’t need a label. They just exist on the shelf like “yeah, obviously”.

This category is for classics that aren’t trying to be clever about their place in cinema. They’re just solid, memorable, and worth keeping around.

You get it i haven't found a name for the categorie yet, sue me (please don't i am broke).`,
      picks: [
        { movieSlug: "rasta-rockets-cool-runnings", rank: 1 },
        { movieSlug: "eddie-the-eagle", rank: 2 },
        { movieSlug: "i-tonya", rank: 3 },
      ],
      honorableMentions: [],
    },
    {
      title: "When you want to see a full trilogy",
      slug: "when-you-want-to-see-a-full-trilogy",
      description: `Sometimes you don’t want a movie. You want a commitment.

This category is for nights where you accept that the story deserves time, snacks, and maybe a second blanket.

Three picks. Three universes. One weekend gone.`,
      picks: [
        { movieSlug: "the-lord-of-the-rings-trilogy", rank: 1 },
        { movieSlug: "star-wars-original-trilogy", rank: 2 },
        { movieSlug: "jurassic-park-trilogy", rank: 3 },
      ],
      honorableMentions: [],
    },
    {
      title: "Time Does Weird Things",
      slug: "time-does-weird-things",
      description: `Not time travel. Not time loops. Just… time behaving like it’s drunk.

These movies treat time as mood, metaphor, or emotional weapon. You’ll understand the feeling even when you don’t understand the math.`,
      picks: [
        { movieSlug: "benjamin-button", rank: 1 },
        { movieSlug: "the-lake-house", rank: 2 },
        { movieSlug: "tenet", rank: 3 },
      ],
      honorableMentions: [],
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

    // Create new assignments for ranked picks
    for (const pick of categoryData.picks || []) {
      const movie = movies[pick.movieSlug];
      if (!movie) {
        console.warn(`    ! Missing movie for pick: ${pick.movieSlug}`);
        continue;
      }

      await prisma.categoryAssignment.create({
        data: {
          categoryId: category.id,
          movieId: movie.id,
          rank: pick.rank,
          isHonorableMention: false,
        },
      });
      console.log(`    - #${pick.rank}: ${movie.title}`);
    }

    // Create honorable mentions if present
    for (const mention of categoryData.honorableMentions || []) {
      const movie = movies[mention.movieSlug];
      if (!movie) {
        console.warn(`    ! Missing movie for honorable mention: ${mention.movieSlug}`);
        continue;
      }

      await prisma.categoryAssignment.create({
        data: {
          categoryId: category.id,
          movieId: movie.id,
          rank: null,
          isHonorableMention: true,
        },
      });
      console.log(`    - Honorable mention: ${movie.title}`);
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
