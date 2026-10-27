// STAR WARS CANON ARCHIVE — DATA
// Only official canon: the Skywalker Saga, anthology films, and canon
// animated/live-action series. No Legends/EU material, no non-canon anthologies.

const SW_DATA = [

  // ===================== SKYWALKER SAGA =====================
  {
    id: "tpm",
    title: "The Phantom Menace",
    subtitle: "Episode I",
    year: 1999,
    type: "movie",
    era: "prequel",
    order: 1,
    runtime: "136 min",
    director: "George Lucas",
    summary: "A Jedi Master and his apprentice are sent to resolve a trade dispute that hides a far larger conspiracy. On Tatooine they discover a gifted slave boy named Anakin Skywalker, while a young queen fights to free her homeworld of Naboo from occupation.",
    tags: ["Jedi Order", "Naboo", "Sith Return"]
  },
  {
    id: "aotc",
    title: "Attack of the Clones",
    subtitle: "Episode II",
    year: 2002,
    type: "movie",
    era: "prequel",
    order: 2,
    runtime: "142 min",
    director: "George Lucas",
    summary: "A decade later, Anakin Skywalker has grown into a headstrong Jedi apprentice. As a separatist movement threatens the Republic, he is assigned to protect Senator Padmé Amidala — and a secret army of clones is revealed to be waiting in the shadows.",
    tags: ["Clone Army", "Separatists", "Forbidden Love"]
  },
  {
    id: "rots",
    title: "Revenge of the Sith",
    subtitle: "Episode III",
    year: 2005,
    type: "movie",
    era: "prequel",
    order: 3,
    runtime: "140 min",
    director: "George Lucas",
    summary: "The Clone Wars rage across the galaxy as Chancellor Palpatine tightens his grip on power. Consumed by fear and ambition, Anakin Skywalker falls to the dark side, becoming Darth Vader, as the Jedi Order is destroyed and the Empire rises.",
    tags: ["Order 66", "Fall of Anakin", "Birth of the Empire"]
  },
  {
    id: "anh",
    title: "A New Hope",
    subtitle: "Episode IV",
    year: 1977,
    type: "movie",
    era: "original",
    order: 4,
    runtime: "121 min",
    director: "George Lucas",
    summary: "The film that started it all. A farm boy on a desert planet finds a droid carrying stolen plans, meets an old Jedi hermit, and joins a smuggler and a princess in a desperate attempt to destroy the Empire's ultimate weapon: the Death Star.",
    tags: ["Death Star", "Rebellion", "Origin"]
  },
  {
    id: "esb",
    title: "The Empire Strikes Back",
    subtitle: "Episode V",
    year: 1980,
    type: "movie",
    era: "original",
    order: 5,
    runtime: "124 min",
    director: "Irvin Kershner",
    summary: "The Empire hunts the scattered Rebel fleet across the galaxy. Luke Skywalker travels to a remote swamp world to train with the Jedi Master Yoda, while his friends are betrayed on Cloud City and Luke learns a truth that will change everything.",
    tags: ["Yoda", "Cloud City", "The Reveal"]
  },
  {
    id: "rotj",
    title: "Return of the Jedi",
    subtitle: "Episode VI",
    year: 1983,
    type: "movie",
    era: "original",
    order: 6,
    runtime: "131 min",
    director: "Richard Marquand",
    summary: "Luke Skywalker returns to rescue Han Solo from Jabba the Hutt before facing his final test: confronting Darth Vader and the Emperor himself, as the Rebel fleet launches an all-out assault on the second Death Star above the forest moon of Endor.",
    tags: ["Redemption", "Endor", "Second Death Star"]
  },
  {
    id: "tfa",
    title: "The Force Awakens",
    subtitle: "Episode VII",
    year: 2015,
    type: "movie",
    era: "sequel",
    order: 7,
    runtime: "138 min",
    director: "J.J. Abrams",
    summary: "Thirty years after the fall of the Empire, a scavenger named Rey, a defected stormtrooper named Finn, and ace pilot Poe Dameron are drawn into a new conflict against the First Order and its enforcer, the conflicted Kylo Ren.",
    tags: ["First Order", "New Heroes", "Legacy"]
  },
  {
    id: "tlj",
    title: "The Last Jedi",
    subtitle: "Episode VIII",
    year: 2017,
    type: "movie",
    era: "sequel",
    order: 8,
    runtime: "152 min",
    director: "Rian Johnson",
    summary: "Rey seeks out the self-exiled Luke Skywalker, hoping he will help her find a way to restore hope to a galaxy in crisis. Meanwhile the Resistance, badly outgunned, fights a desperate rearguard retreat from the ruthless First Order.",
    tags: ["Luke's Exile", "Resistance", "Sacrifice"]
  },
  {
    id: "tros",
    title: "The Rise of Skywalker",
    subtitle: "Episode IX",
    year: 2019,
    type: "movie",
    era: "sequel",
    order: 9,
    runtime: "142 min",
    director: "J.J. Abrams",
    summary: "The surviving Resistance faces the First Order once more as the reemergence of a long-thought-dead enemy sends Rey, Finn, and Poe on a race across the galaxy to uncover the truth of Rey's past and end the conflict once and for all.",
    tags: ["Palpatine Returns", "Final Battle", "Saga's End"]
  },

  // ===================== ANTHOLOGY FILMS =====================
  {
    id: "rogueone",
    title: "Rogue One: A Star Wars Story",
    subtitle: "Anthology Film",
    year: 2016,
    type: "movie",
    era: "anthology",
    order: 3.9,
    runtime: "133 min",
    director: "Gareth Edwards",
    summary: "A ragtag group of Rebel agents, led by Jyn Erso, undertake a desperate mission to steal the plans for the Empire's new superweapon — a mission that sets the events of A New Hope directly into motion.",
    tags: ["Death Star Plans", "Rebel Sacrifice", "Precedes A New Hope"]
  },
  {
    id: "solo",
    title: "Solo: A Star Wars Story",
    subtitle: "Anthology Film",
    year: 2018,
    type: "movie",
    era: "anthology",
    order: 3.4,
    runtime: "135 min",
    director: "Ron Howard",
    summary: "A young Han Solo falls in with a crew of smugglers, meets Chewbacca and Lando Calrissian, and makes the legendary Kessel Run — the origin story of the galaxy's most famous scoundrel.",
    tags: ["Han's Origin", "Kessel Run", "Chewbacca & Lando"]
  },
  {
    id: "tcw-film",
    title: "Star Wars: The Clone Wars",
    subtitle: "Animated Film",
    year: 2008,
    type: "movie",
    era: "prequel",
    order: 2.5,
    runtime: "98 min",
    director: "Dave Filoni",
    summary: "Anakin Skywalker takes on a new Jedi Padawan, Ahsoka Tano, and the pair are sent to rescue Jabba the Hutt's kidnapped son — a mission that doubled as the theatrical pilot for the long-running animated series.",
    tags: ["Ahsoka Introduced", "Clone Wars Era"]
  },

  {
    id: "mandogrogu",
    title: "The Mandalorian and Grogu",
    subtitle: "Feature Film",
    year: 2026,
    type: "movie",
    era: "newrepublic",
    order: 9.5,
    runtime: "132 min",
    director: "Jon Favreau",
    summary: "Din Djarin and Grogu now work for the New Republic, hunting the neo-imperialist warlords carving up the galaxy's remnants. A job to retrieve Rotta the Hutt in exchange for intelligence turns awkward when Rotta, now a celebrated gladiator, has no interest in being rescued.",
    tags: ["Din & Grogu", "New Republic", "Neo-Imperial Warlords"]
  },

  // ===================== ANIMATED SERIES =====================
  {
    id: "series-tcw",
    title: "Star Wars: The Clone Wars",
    subtitle: "Animated Series",
    year: "2008–2020",
    type: "series",
    era: "prequel",
    order: 2.7,
    seasons: "7 Seasons",
    creator: "Dave Filoni",
    summary: "The definitive chronicle of the Clone Wars, following Anakin Skywalker, Obi-Wan Kenobi, and Ahsoka Tano through the war that will ultimately consume the Republic — widely regarded as essential viewing for understanding Anakin's fall.",
    tags: ["Ahsoka Tano", "Republic vs. Separatists"]
  },
  {
    id: "series-rebels",
    title: "Star Wars Rebels",
    subtitle: "Animated Series",
    year: "2014–2018",
    type: "series",
    era: "original",
    order: 3.7,
    seasons: "4 Seasons",
    creator: "Dave Filoni",
    summary: "Set in the years before A New Hope, a small crew aboard the starship Ghost — led by the Jedi Kanan Jarrus and his Padawan Ezra Bridger — becomes one of the sparks that ignites the galaxy-wide Rebellion against the Empire.",
    tags: ["Early Rebellion", "Ghost Crew", "Thrawn"]
  },
  {
    id: "series-resistance",
    title: "Star Wars Resistance",
    subtitle: "Animated Series",
    year: "2018–2020",
    type: "series",
    era: "sequel",
    order: 6.5,
    seasons: "2 Seasons",
    creator: "Dave Filoni",
    summary: "Young pilot Kazuda Xiono goes undercover for the Resistance at a remote outpost, gathering intelligence on the growing First Order threat in the years leading up to The Force Awakens.",
    tags: ["First Order Spies", "Pre-Force Awakens"]
  },
  {
    id: "series-badbatch",
    title: "Star Wars: The Bad Batch",
    subtitle: "Animated Series",
    year: "2021–2024",
    type: "series",
    era: "prequel",
    order: 3.1,
    seasons: "3 Seasons",
    creator: "Dave Filoni",
    summary: "In the immediate aftermath of Order 66, an elite squad of genetically unique clones — Clone Force 99 — struggles to find their place in a galaxy now ruled by the newborn Empire.",
    tags: ["Clone Force 99", "Early Empire"]
  },
  {
    id: "series-totj",
    title: "Tales of the Jedi",
    subtitle: "Animated Anthology",
    year: 2022,
    type: "series",
    era: "prequel",
    order: 2.3,
    seasons: "1 Season, 6 Shorts",
    creator: "Dave Filoni",
    summary: "A collection of animated shorts exploring pivotal moments in the lives of Ahsoka Tano and Count Dooku, from a Jedi's earliest days as a Youngling to a fateful turn toward the dark side.",
    tags: ["Origin Stories", "Ahsoka & Dooku"]
  },
  {
    id: "series-tote",
    title: "Tales of the Empire",
    subtitle: "Animated Anthology",
    year: 2024,
    type: "series",
    era: "original",
    order: 3.8,
    seasons: "1 Season, 6 Shorts",
    creator: "Dave Filoni",
    summary: "Short stories following Morgan Elsbeth's path from conquered Nightsister to Imperial agent, and former Jedi Barriss Offee's uneasy survival under the Empire's watchful eye.",
    tags: ["Imperial Agents", "Fallen Jedi"]
  },
  {
    id: "series-totu",
    title: "Tales of the Underworld",
    subtitle: "Animated Anthology",
    year: 2025,
    type: "series",
    era: "prequel",
    order: 3.2,
    seasons: "1 Season, 6 Shorts",
    creator: "Dave Filoni",
    summary: "Six shorts split between two survivors of the Clone Wars: former dark side assassin Asajj Ventress, handed an unlikely second chance at life, and bounty hunter Cad Bane, forced to face his own past when an old friend turns up wearing a marshal's badge.",
    tags: ["Asajj Ventress", "Cad Bane", "Criminal Underworld"]
  },
  {
    id: "series-maul",
    title: "Star Wars: Maul – Shadow Lord",
    subtitle: "Animated Series",
    year: 2026,
    type: "series",
    era: "original",
    order: 3.3,
    seasons: "1 Season, 10 Episodes",
    creator: "Dave Filoni",
    summary: "About a year after the Clone Wars, the former Sith Lord Maul rebuilds his criminal empire on the world of Janix and hunts for an apprentice of his own — all while the newborn Galactic Empire tightens its grip on the galaxy around him.",
    tags: ["Maul", "Shadow Collective", "Early Empire"]
  },
  {
    id: "series-fod",
    title: "Star Wars Forces of Destiny",
    subtitle: "Animated Shorts",
    year: "2017–2018",
    type: "series",
    era: "anthology",
    order: 9.9,
    seasons: "2 Seasons, 32 Shorts",
    creator: "Lucasfilm Animation",
    summary: "A canon micro-series of two- to three-minute shorts spanning every era of the saga, spotlighting the small choices that shape the destinies of heroines like Leia, Ahsoka, Rey, Jyn, and Padmé. Listed last because it ranges across the whole timeline rather than sitting at one point on it.",
    tags: ["Cross-Era", "Micro-Series", "Heroines"]
  },

  {
    id: "series-yja",
    title: "Star Wars: Young Jedi Adventures",
    subtitle: "Animated Series",
    year: "2023–",
    type: "series",
    era: "highrepublic",
    order: 0.5,
    seasons: "Ongoing",
    creator: "James Waugh",
    summary: "Set during the High Republic era, this series for younger viewers follows a group of Jedi Younglings learning the ways of the Force at the Jedi Temple on Tenoo, generations before the Skywalker saga begins.",
    tags: ["High Republic", "Young Audience"]
  },

  {
    id: "series-acolyte",
    title: "The Acolyte",
    subtitle: "Live-Action Series",
    year: 2024,
    type: "series",
    era: "highrepublic",
    order: 0.8,
    seasons: "1 Season",
    creator: "Leslye Headland",
    summary: "Set in the final days of the High Republic, a former Padawan is pulled back into conflict with her old Jedi Master when a mysterious assailant begins targeting Jedi across the galaxy, unearthing secrets from her past.",
    tags: ["High Republic", "Jedi Investigation"]
  },

  // ===================== LIVE-ACTION SERIES =====================
  {
    id: "series-mando",
    title: "The Mandalorian",
    subtitle: "Live-Action Series",
    year: "2019–",
    type: "series",
    era: "newrepublic",
    order: 9.1,
    seasons: "3 Seasons",
    creator: "Jon Favreau",
    summary: "A lone bounty hunter operating on the outer reaches of the galaxy takes on a mysterious job that leads him to a small, Force-sensitive foundling — and a fierce determination to protect him at any cost.",
    tags: ["Grogu", "Bounty Hunter", "New Republic Era"]
  },
  {
    id: "series-bobf",
    title: "The Book of Boba Fett",
    subtitle: "Live-Action Series",
    year: 2021,
    type: "series",
    era: "newrepublic",
    order: 9.2,
    seasons: "1 Season",
    creator: "Jon Favreau",
    summary: "The legendary bounty hunter Boba Fett and mercenary Fennec Shand stake their claim on the criminal underworld of Tatooine, attempting to rule the territory once controlled by Jabba the Hutt.",
    tags: ["Tatooine", "Criminal Underworld"]
  },
  {
    id: "series-obiwan",
    title: "Obi-Wan Kenobi",
    subtitle: "Limited Series",
    year: 2022,
    type: "series",
    era: "original",
    order: 3.5,
    seasons: "1 Season",
    director: "Deborah Chow",
    creator: "Joby Harold",
    summary: "Ten years after the fall of the Jedi Order, a haunted and self-exiled Obi-Wan Kenobi watches over young Luke Skywalker from afar — until a mission draws him into a direct confrontation with his former apprentice, Darth Vader.",
    tags: ["Vader Rematch", "Exile"]
  },
  {
    id: "series-andor",
    title: "Andor",
    subtitle: "Live-Action Series",
    year: "2022–2025",
    type: "series",
    era: "original",
    order: 3.6,
    seasons: "2 Seasons",
    creator: "Tony Gilroy",
    summary: "A grounded, espionage-driven look at how the Rebellion against the Empire truly began, following small-time thief Cassian Andor as he is pulled into a growing resistance movement — leading directly into the events of Rogue One.",
    tags: ["Rebel Origins", "Espionage", "Precedes Rogue One"]
  },
  {
    id: "series-ahsoka",
    title: "Ahsoka",
    subtitle: "Live-Action Series",
    year: "2023–",
    type: "series",
    era: "newrepublic",
    order: 9.3,
    seasons: "1 Season",
    creator: "Dave Filoni",
    summary: "Former Jedi Ahsoka Tano investigates a growing threat to the fragile New Republic, uncovering a plot to bring back the exiled Grand Admiral Thrawn from the far reaches of the galaxy.",
    tags: ["Thrawn Returns", "New Republic Threats"]
  },
  {
    id: "series-skeletoncrew",
    title: "Star Wars: Skeleton Crew",
    subtitle: "Live-Action Series",
    year: "2024–2025",
    type: "series",
    era: "newrepublic",
    order: 9.4,
    seasons: "1 Season",
    creator: "Jon Watts & Christopher Ford",
    summary: "Four kids from a quiet suburban planet stumble onto a buried starship and find themselves lost in a strange and dangerous galaxy, desperately trying to find their way back home.",
    tags: ["Kids on an Adventure", "New Republic Era"]
  },
];

// Era metadata for filtering & visual theming
const SW_ERAS = {
  highrepublic: { label: "High Republic", color: "#7dd3fc" },
  prequel:      { label: "Prequel Era",     color: "#e8c468" },
  original:     { label: "Original Trilogy", color: "#4fc3f7" },
  anthology:    { label: "Anthology",       color: "#ff8c42" },
  newrepublic:  { label: "New Republic Era", color: "#8fd694" },
  sequel:       { label: "Sequel Era",       color: "#ff5c5c" },
};

// =========================================================
// TIMELINE DATA
// Positions are "year index" numbers: n BBY → -n, n ABY → +n,
// and each year occupies [index, index + 1). The fraction places
// things *within* a year (0.0 = start, 0.9 = late in the year) so
// stories set in the same year (e.g. everything around 9 ABY) can
// still be shown in their relative order. 0 BBY and 0 ABY are the
// same year: the year of the Battle of Yavin.
// =========================================================

// Segment kinds: main · flashback · crossover · epilogue · range
// `approx: true` marks dates Lucasfilm hasn't pinned down exactly.
const SW_SPANS = {
  "series-yja":   { approx: true, segments: [{ s: -231.8, e: -231.2, label: "Tenoo", kind: "main" }],
                    note: "Set during the High Republic, roughly two centuries before the Skywalker Saga." },
  "series-acolyte": { segments: [
                    { s: -115.7, e: -115.6, label: "Brendok", kind: "flashback" },
                    { s: -99.7, e: -99.5, label: "Main story", kind: "main" }],
                    note: "Episode 3 flashes back 16 years to the witches of Brendok." },
  "series-totj":  { approx: true, segments: [
                    { s: -41.5, e: -31.8, label: "Dooku's arc", kind: "main" },
                    { s: -35.7, e: -35.6, label: "Ahsoka's birth", kind: "flashback" },
                    { s: -18.7, e: -18.6, label: "Ahsoka after Order 66", kind: "epilogue" }],
                    note: "Six shorts that jump decades, from Dooku's years as a Jedi to Ahsoka's survival of the purge." },
  "tpm":          { segments: [{ s: -31.6, e: -31.5, kind: "main" }] },
  "aotc":         { segments: [{ s: -21.8, e: -21.75, kind: "main" }] },
  "tcw-film":     { segments: [{ s: -21.7, e: -21.65, kind: "main" }] },
  "series-tcw":   { segments: [{ s: -21.72, e: -18.68, label: "The Clone Wars, 22–19 BBY", kind: "main" }],
                    note: "Spans the whole war. The final arc (Siege of Mandalore) plays alongside Revenge of the Sith." },
  "rots":         { segments: [{ s: -18.72, e: -18.66, kind: "main" }] },
  "series-badbatch": { segments: [{ s: -18.66, e: -17.2, label: "S1–S3", kind: "main" }],
                    note: "Begins during Order 66 and runs through the first year or so of the Empire." },
  "series-totu":  { approx: true, segments: [{ s: -18.6, e: -17.8, kind: "main" }] },
  "series-tote":  { approx: true, segments: [{ s: -19.5, e: -17.5, kind: "main" }],
                    note: "Morgan Elsbeth's story starts in the last days of the Clone Wars; Barriss Offee's follows the early Empire." },
  "series-maul":  { approx: true, segments: [{ s: -17.8, e: -17.2, kind: "main" }] },
  "solo":         { segments: [
                    { s: -12.6, e: -12.5, label: "Prologue", kind: "flashback" },
                    { s: -9.6, e: -9.4, label: "Kessel Run", kind: "main" }] },
  "series-obiwan": { segments: [{ s: -8.6, e: -8.4, kind: "main" }] },
  "series-rebels": { segments: [
                    { s: -4.9, e: 0.2, label: "S1–S4", kind: "main" },
                    { s: 4.6, e: 4.8, label: "Epilogue", kind: "epilogue" }],
                    note: "The epilogue takes place after the Battle of Endor." },
  "series-andor": { segments: [
                    { s: -4.9, e: -4.1, label: "S1", kind: "main" },
                    { s: -3.9, e: 0.24, label: "S2 · one arc per year", kind: "main" }],
                    note: "Season 2 jumps a year between each three-episode arc, ending days before Rogue One." },
  "rogueone":     { segments: [{ s: 0.25, e: 0.3, kind: "main" }] },
  "anh":          { segments: [{ s: 0.31, e: 0.35, kind: "main" }] },
  "esb":          { segments: [{ s: 3.3, e: 3.45, kind: "main" }] },
  "rotj":         { segments: [{ s: 4.4, e: 4.45, kind: "main" }] },
  "series-mando": { segments: [
                    { s: 9.02, e: 9.26, label: "S1", kind: "main" },
                    { s: 9.29, e: 9.52, label: "S2", kind: "main" },
                    { s: 9.78, e: 9.98, label: "S3", kind: "main" }],
                    note: "Seasons 1 and 2 run back to back. Then there's a gap, filled by The Book of Boba Fett (which Din Djarin joins partway through), before Season 3 picks up." },
  "series-bobf":  { segments: [
                    { s: 4.45, e: 8.9, label: "Flashbacks: Sarlacc → Tuskens", kind: "flashback" },
                    { s: 9.53, e: 9.76, label: "Present day", kind: "main" },
                    { s: 9.62, e: 9.71, label: "Ch. 5–7 · Din & Grogu", kind: "crossover" }],
                    note: "Starts in The Mandalorian S2's post-credits scene. Chapters 5–7 are effectively Mandalorian episodes, and its finale leads straight into Mandalorian S3." },
  "series-skeletoncrew": { approx: true, segments: [{ s: 9.5, e: 9.8, kind: "main" }],
                    note: "Lucasfilm places it concurrent with The Mandalorian and Ahsoka; the exact year is kept loose." },
  "series-ahsoka": { approx: true, segments: [{ s: 9.85, e: 10.6, kind: "main" }],
                    note: "Usually dated c. 9–11 ABY, around the same time as Mandalorian S3." },
  "mandogrogu":   { approx: true, segments: [{ s: 10.05, e: 10.3, kind: "main" }],
                    note: "Follows Mandalorian S3, with Din now working for the New Republic." },
  "series-resistance": { segments: [{ s: 33.7, e: 34.45, label: "S1–S2", kind: "main" }],
                    note: "Season 1 begins about six months before The Force Awakens; Season 2 runs alongside The Last Jedi." },
  "tfa":          { segments: [{ s: 34.3, e: 34.33, kind: "main" }] },
  "tlj":          { segments: [{ s: 34.34, e: 34.37, kind: "main" }] },
  "tros":         { segments: [{ s: 35.4, e: 35.45, kind: "main" }] },
  "series-fod":   { segments: [{ s: -31.6, e: 35.45, label: "Shorts across every era", kind: "range" }] },
};

// Key in-universe events. `major` events get a guide line through every lane.
const SW_EVENTS = [
  { y: -231.5, label: "Great Hyperspace Disaster", approx: true },
  { y: -40.5, label: "Anakin Skywalker born" },
  { y: -31.55, label: "Battle of Naboo · Sith revealed" },
  { y: -21.77, label: "Battle of Geonosis · Clone Wars begin", major: true },
  { y: -18.69, label: "Order 66 · Empire declared", major: true },
  { y: -18.6, label: "Luke & Leia born" },
  { y: -9.5, label: "The Kessel Run" },
  { y: -1.6, label: "Ghorman Massacre" },
  { y: -1.3, label: "Rebel Alliance formed" },
  { y: 0.28, label: "Battle of Scarif" },
  { y: 0.34, label: "Battle of Yavin · Death Star destroyed", major: true },
  { y: 3.35, label: "Battle of Hoth" },
  { y: 4.43, label: "Battle of Endor · Emperor & Vader fall", major: true },
  { y: 5.5, label: "Battle of Jakku · Galactic Concordance" },
  { y: 9.96, label: "Liberation of Mandalore", approx: true },
  { y: 28.5, label: "Luke's Jedi temple destroyed", approx: true },
  { y: 34.31, label: "Starkiller Base destroys the Hosnian system", major: true },
  { y: 34.36, label: "Battle of Crait" },
  { y: 35.44, label: "Battle of Exegol", major: true },
];

// Lucasfilm Publishing's official named eras.
const SW_CANON_ERAS = [
  { s: -240, e: -99.5, label: "The High Republic", note: "c. 500–100 BBY" },
  { s: -32, e: -18.69, label: "Fall of the Jedi" },
  { s: -18.69, e: -5, label: "Reign of the Empire" },
  { s: -5, e: 4.45, label: "Age of Rebellion" },
  { s: 4.45, e: 28.5, label: "The New Republic" },
  { s: 28.5, e: 36.5, label: "Rise of the First Order" },
];

// Ways of counting years. BBY/ABY is the official one; the others are the
// relative reckonings characters, scripts and marketing use ("five years
// after Return of the Jedi", "thirty years after the fall of the Empire").
// `fmt` receives the integer year index (BBY negative).
const SW_SCALES = {
  yavin: {
    label: "BBY / ABY",
    desc: "Before / After the Battle of Yavin, the official dating system. Year 0 is the year of A New Hope and the first Death Star's destruction. There's no gap between 0 BBY and 0 ABY: they're the same year.",
    fmt: y => y === 0 ? "0 · Yavin" : (y < 0 ? `${-y} BBY` : `${y} ABY`),
  },
  endor: {
    label: "Years from Endor",
    desc: "Counted from the Battle of Endor (4 ABY), the Empire's fall. This is how the New Republic era is usually described, e.g. The Mandalorian is \"five years after Return of the Jedi.\"",
    fmt: y => { const d = y - 4; return d === 0 ? "Endor" : (d < 0 ? `${-d} before` : `+${d}`); },
  },
  empire: {
    label: "Years of the Empire",
    desc: "Counted from the Declaration of a New Order (19 BBY). Luke and Leia were born the same year, so this number is also their age.",
    fmt: y => { const d = y + 19; return d === 0 ? "Empire" : (d < 0 ? `${-d} before` : `Yr ${d}`); },
  },
  naboo: {
    label: "Years from Naboo",
    desc: "Counted from The Phantom Menace (32 BBY). Handy for the prequels: Attack of the Clones is \"ten years later\", Revenge of the Sith thirteen.",
    fmt: y => { const d = y + 32; return d === 0 ? "Naboo" : (d < 0 ? `${-d} before` : `+${d}`); },
  },
};
