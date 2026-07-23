/**
 * Second movie pool import for nikitanova.
 * node --env-file=.env scripts/import-movie-pool-2.mjs
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const USER_ID = "cmrwk8i9g0000kw04favqeqn8";

const COLORS = [
  "#c45c26", "#2a6f97", "#52796f", "#9b2226", "#bc6c25",
  "#415a77", "#6d597a", "#355070", "#b56576", "#4a5759",
];

/** @type {{ title: string, year: number, director: string, description: string, watchedYear: number, x: number, y: number }[]} */
const MOVIES = [
  { title: "Never Look Away", year: 2018, director: "Florian Henckel von Donnersmarck", description: "An East German artist rebuilds a life and a myth of authorship", watchedYear: 2022, x: 68, y: 59 },
  { title: "On the Basis of Sex", year: 2018, director: "Mimi Leder", description: "Young Ruth Bader Ginsburg takes on gender discrimination", watchedYear: 2022, x: 48, y: 42 },
  { title: "12 Years a Slave", year: 2013, director: "Steve McQueen", description: "Solomon Northup endures years of slavery in the South", watchedYear: 2022, x: 83, y: 8 },
  { title: "Catch Me If You Can", year: 2002, director: "Steven Spielberg", description: "A young con artist outruns the FBI across America", watchedYear: 2022, x: 87, y: 94 },
  { title: "Bohemian Rhapsody", year: 2018, director: "Bryan Singer", description: "Freddie Mercury and Queen rise to rock immortality", watchedYear: 2022, x: -31, y: 38 },
  { title: "Dallas Buyers Club", year: 2013, director: "Jean-Marc Vallée", description: "A cowboy smuggles AIDS drugs to save himself and others", watchedYear: 2022, x: 79, y: 83 },
  { title: "Green Book", year: 2018, director: "Peter Farrelly", description: "A driver and a pianist tour the segregated South", watchedYear: 2022, x: 68, y: 72 },
  { title: "It", year: 2017, director: "Andy Muschietti", description: "Kids face a shape-shifting clown in Derry", watchedYear: 2022, x: 49, y: -30 },
  { title: "Alesha Popovich and Tugarin the Dragon", year: 2004, director: "Konstantin Bronzit", description: "A Russian bogatyr battles a greedy dragon", watchedYear: 2022, x: 49, y: 78 },
  { title: "Shrek", year: 2001, director: "Andrew Adamson", description: "An ogre's swamp quest upends fairy-tale rules", watchedYear: 2022, x: 73, y: 67 },
  { title: "Shrek 2", year: 2004, director: "Andrew Adamson", description: "Shrek meets Fiona's royal parents in Far Far Away", watchedYear: 2022, x: 38, y: 65 },
  { title: "Shrek the Third", year: 2007, director: "Chris Miller", description: "Shrek seeks an heir while Charming plots a coup", watchedYear: 2022, x: 20, y: 75 },
  { title: "Shrek Forever After", year: 2010, director: "Mike Mitchell", description: "A deal with Rumpelstiltskin erases Shrek's life", watchedYear: 2022, x: 53, y: 50 },
  { title: "The Man Who Stole Banksy", year: 2018, director: "Marco Flavio Cirillo", description: "A scavenger hunts Banksy murals across Palestine", watchedYear: 2022, x: -30, y: -21 },
  { title: "The Electrical Life of Louis Wain", year: 2021, director: "Will Sharpe", description: "An artist turns cats into a Victorian sensation", watchedYear: 2021, x: -76, y: 68 },
  { title: "War of the Worlds", year: 2005, director: "Steven Spielberg", description: "A father flees an alien invasion with his kids", watchedYear: 2021, x: -43, y: 30 },
  { title: "The Maze Runner", year: 2014, director: "Wes Ball", description: "Teens wake in a deadly maze with no memories", watchedYear: 2021, x: 85, y: 73 },
  { title: "Maze Runner: The Scorch Trials", year: 2015, director: "Wes Ball", description: "Escapees face a scorched world beyond the maze", watchedYear: 2021, x: -67, y: 30 },
  { title: "Maze Runner: The Death Cure", year: 2018, director: "Wes Ball", description: "The Gladers storm the city for a final cure", watchedYear: 2021, x: -50, y: 30 },
  { title: "Capital in the Twenty-First Century", year: 2019, director: "Justin Pemberton", description: "A documentary on wealth inequality after Piketty", watchedYear: 2021, x: 33, y: -21 },
  { title: "Flipped", year: 2010, director: "Rob Reiner", description: "Two kids see first love from opposite sides", watchedYear: 2021, x: -68, y: 33 },
  { title: "Marina Abramović: The Artist Is Present", year: 2012, director: "Matthew Akers", description: "Abramović sits silent with MoMA visitors", watchedYear: 2021, x: 78, y: -20 },
  { title: "The Art of War", year: 2000, director: "Christian Duguay", description: "A UN operative is framed in a conspiracy thriller", watchedYear: 2021, x: -16, y: 32 },
  { title: "Deep Web", year: 2015, director: "Alex Winter", description: "A look into Silk Road and the darknet economy", watchedYear: 2021, x: -10, y: 5 },
  { title: "Keep Your Hands Off Eizouken!", year: 2020, director: "Masaaki Yuasa", description: "Three girls build an anime club from scratch", watchedYear: 2021, x: 100, y: -100 },
  { title: "Abstract: The Art of Design", year: 2017, director: "Various", description: "A series on the craft behind iconic design", watchedYear: 2021, x: 38, y: -50 },
  { title: "Studio 54", year: 2018, director: "Matt Tyrnauer", description: "The rise and fall of the legendary nightclub", watchedYear: 2021, x: 73, y: -63 },
  { title: "Kedi", year: 2016, director: "Ceyda Torun", description: "Street cats and the people who love them in Istanbul", watchedYear: 2021, x: 41, y: 79 },
  { title: "Woodstock", year: 1970, director: "Michael Wadleigh", description: "Three days that defined a generation of music", watchedYear: 2021, x: 28, y: -80 },
  { title: "Everybody's Everything", year: 2019, director: "Sebastian Jones", description: "A portrait of Lil Peep's brief, blazing career", watchedYear: 2021, x: 10, y: -10 },
  { title: "Why Are We Creative?", year: 2018, director: "Hermann Vaske", description: "Artists and thinkers on the impulse to create", watchedYear: 2021, x: 30, y: -20 },
  { title: "Exit Through the Gift Shop", year: 2010, director: "Banksy", description: "Street art, fame, and a filmmaker's obsession", watchedYear: 2021, x: 67, y: 19 },
  { title: "The Universe of Keith Haring", year: 2008, director: "Christina Clausen", description: "Keith Haring's life as a street-art wunderkind", watchedYear: 2021, x: 40, y: 10 },
  { title: "The Peanut Butter Falcon", year: 2019, director: "Tyler Nilson", description: "A young man with Down syndrome flees for wrestling dreams", watchedYear: 2021, x: -34, y: 29 },
  { title: "Wonder", year: 2017, director: "Stephen Chbosky", description: "A boy with facial difference starts mainstream school", watchedYear: 2021, x: -40, y: 50 },
  { title: "Gifted", year: 2017, director: "Marc Webb", description: "An uncle fights for a math prodigy's childhood", watchedYear: 2021, x: -60, y: 33 },
  { title: "The Hobbit: An Unexpected Journey", year: 2012, director: "Peter Jackson", description: "Bilbo joins dwarves on a quest to reclaim Erebor", watchedYear: 2021, x: -90, y: 10 },
  { title: "The Geographer Drank His Globe Away", year: 2013, director: "Alexander Veledinsky", description: "A failed academic finds meaning teaching geography", watchedYear: 2021, x: -61, y: 30 },
  { title: "The Courier", year: 2020, director: "Dominic Cooke", description: "A salesman becomes a Cold War courier for MI6", watchedYear: 2021, x: -15, y: 87 },
  { title: "Midnight in Paris", year: 2011, director: "Woody Allen", description: "A writer slips into 1920s Paris each midnight", watchedYear: 2021, x: -48, y: 36 },
  { title: "Another Round", year: 2020, director: "Thomas Vinterberg", description: "Teachers test constant mild intoxication", watchedYear: 2021, x: 20, y: 78 },
  { title: "Arrival", year: 2016, director: "Denis Villeneuve", description: "A linguist learns an alien language to stop war", watchedYear: 2021, x: -10, y: 51 },
  { title: "The Revenant", year: 2015, director: "Alejandro G. Iñárritu", description: "A frontiersman crawls back from betrayal and the wild", watchedYear: 2021, x: 78, y: 93 },
  { title: "Brokeback Mountain", year: 2005, director: "Ang Lee", description: "Two cowboys hide a lifelong forbidden love", watchedYear: 2021, x: 39, y: -84 },
  { title: "Ford v Ferrari", year: 2019, director: "James Mangold", description: "Ford races to beat Ferrari at Le Mans", watchedYear: 2021, x: 73, y: 68 },
  { title: "Filth", year: 2013, director: "Jon S. Baird", description: "A corrupt detective spirals through drugs and scheming", watchedYear: 2020, x: 41, y: 37 },
  { title: "Irreversible", year: 2002, director: "Gaspar Noé", description: "A revenge night told in reverse chronology", watchedYear: 2021, x: -9, y: -98 },
  { title: "Enter the Void", year: 2009, director: "Gaspar Noé", description: "A spirit drifts through Tokyo after death", watchedYear: 2021, x: 37, y: -99 },
  { title: "Love", year: 2015, director: "Gaspar Noé", description: "A man recalls an all-consuming erotic relationship", watchedYear: 2021, x: 15, y: -95 },
  { title: "The Brutalist", year: 2024, director: "Brady Corbet", description: "An immigrant architect builds a monumental American dream", watchedYear: 2025, x: 49, y: -78 },
  { title: "Se7en", year: 1995, director: "David Fincher", description: "Detectives hunt a killer staging the seven sins", watchedYear: 2025, x: 92, y: -55 },
  { title: "The Experiment", year: 2001, director: "Oliver Hirschbiegel", description: "A prison role-play study turns violently real", watchedYear: 2025, x: 83, y: -69 },
  { title: "The Grand Budapest Hotel", year: 2014, director: "Wes Anderson", description: "A concierge and lobby boy chase a stolen painting", watchedYear: 2023, x: 72, y: 48 },
  { title: "Houdini", year: 2014, director: "Uli Edel", description: "Harry Houdini rises from immigrant to escape legend", watchedYear: 2025, x: -30, y: 30 },
  { title: "The Retreat", year: 2021, director: "Pat Mills", description: "A weekend getaway turns into a survival nightmare", watchedYear: 2025, x: -47, y: 20 },
  { title: "Mystic River", year: 2003, director: "Clint Eastwood", description: "Childhood friends are torn by a murder in Boston", watchedYear: 2025, x: -30, y: -10 },
  { title: "Michael", year: 2011, director: "Markus Schleinzer", description: "A pedophile's double life with a captive boy", watchedYear: 2026, x: 27, y: 62 },
  { title: "The Basketball Diaries", year: 1995, director: "Scott Kalvert", description: "A teenage poet sinks into heroin on New York streets", watchedYear: 2025, x: 38, y: -48 },
  { title: "Don't Look Up", year: 2021, director: "Adam McKay", description: "Scientists fail to warn the world of a killer comet", watchedYear: 2024, x: 84, y: 10 },
  { title: "The Great Gatsby", year: 2013, director: "Baz Luhrmann", description: "A mysterious millionaire chases a green-light dream", watchedYear: 2021, x: 61, y: 46 },
  { title: "Cube", year: 1997, director: "Vincenzo Natali", description: "Strangers wake in a lethal puzzle of rooms", watchedYear: 2018, x: -70, y: -39 },
  { title: "Titanic", year: 1997, director: "James Cameron", description: "A shipboard romance meets disaster at sea", watchedYear: 2026, x: -28, y: 58 },
  { title: "The Wolf of Wall Street", year: 2013, director: "Martin Scorsese", description: "A stockbroker's excess empire rises and collapses", watchedYear: 2020, x: 65, y: 94 },
  { title: "The Departed", year: 2006, director: "Martin Scorsese", description: "A cop and a mole hunt each other in Boston crime", watchedYear: 2025, x: 92, y: 15 },
  { title: "Forrest Gump", year: 1994, director: "Robert Zemeckis", description: "An earnest man wanders through American history", watchedYear: 2018, x: 63, y: 31 },
  { title: "Shutter Island", year: 2010, director: "Martin Scorsese", description: "A marshal investigates a vanished patient and himself", watchedYear: 2018, x: -42, y: 54 },
  { title: "Toy Story", year: 1995, director: "John Lasseter", description: "Toys come alive when humans leave the room", watchedYear: 2018, x: 89, y: 96 },
  { title: "Toy Story 2", year: 1999, director: "John Lasseter", description: "Woody is stolen and learns what collectors want", watchedYear: 2018, x: 47, y: 82 },
  { title: "Toy Story 3", year: 2010, director: "Lee Unkrich", description: "Toys face daycare and goodbye as Andy grows up", watchedYear: 2018, x: 65, y: 85 },
  { title: "Toy Story 4", year: 2019, director: "Josh Cooley", description: "Woody finds a new purpose beyond Andy's room", watchedYear: 2019, x: 16, y: 75 },
  { title: "Monsters, Inc.", year: 2001, director: "Pete Docter", description: "Monsters harvest kids' screams for energy", watchedYear: 2007, x: 19, y: 91 },
  { title: "Monsters University", year: 2013, director: "Dan Scanlon", description: "Mike and Sulley become rivals then partners at school", watchedYear: 2013, x: 39, y: 79 },
  { title: "The Holop", year: 2019, director: "Klim Shipenko", description: "A spoiled heir is sent to fake serfdom for a lesson", watchedYear: 2019, x: -66, y: 39 },
  { title: "Charlie and the Chocolate Factory", year: 2005, director: "Tim Burton", description: "A golden ticket opens Wonka's strange factory", watchedYear: 2007, x: -18, y: 89 },
  { title: "21 Jump Street", year: 2012, director: "Phil Lord", description: "Cops go undercover as high-school students", watchedYear: 2010, x: -30, y: 71 },
  { title: "Fantastic Beasts and Where to Find Them", year: 2016, director: "David Yates", description: "Newt Scamander's creatures loose in 1920s New York", watchedYear: 2016, x: -24, y: 57 },
  { title: "Fantastic Beasts: The Crimes of Grindelwald", year: 2018, director: "David Yates", description: "Newt is pulled into Grindelwald's rising war", watchedYear: 2018, x: -49, y: 30 },
  { title: "Murder on the Orient Express", year: 2017, director: "Kenneth Branagh", description: "Poirot solves a killing aboard a snowbound train", watchedYear: 2017, x: -21, y: 59 },
  { title: "Bullet Train", year: 2022, director: "David Leitch", description: "Assassins collide on a high-speed train to Kyoto", watchedYear: 2025, x: 94, y: 87 },
  { title: "Secret Window", year: 2004, director: "David Koepp", description: "A writer is stalked by a man claiming plagiarism", watchedYear: 2020, x: 28, y: -34 },
  { title: "F1", year: 2025, director: "Joseph Kosinski", description: "A veteran driver returns to Formula 1 glory", watchedYear: 2025, x: 28, y: 62 },
  { title: "Movie 43", year: 2013, director: "Various", description: "A messy anthology of raunchy comic sketches", watchedYear: 2025, x: -19, y: -43 },
  { title: "Now You See Me", year: 2013, director: "Louis Leterrier", description: "Illusionists rob banks as entertainment", watchedYear: 2013, x: 82, y: 76 },
  { title: "Now You See Me 2", year: 2016, director: "Jon M. Chu", description: "The Four Horsemen are forced into a new heist", watchedYear: 2016, x: 51, y: 70 },
  { title: "Now You See Me: Now You Don't", year: 2025, director: "Ruben Fleischer", description: "The Horsemen return for another grand illusion", watchedYear: 2025, x: 72, y: 68 },
];

// Note: Detachment / Учитель на замену already exists — skipped by title match

function slugId(title) {
  return (
    "movie-" +
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40)
  );
}

async function main() {
  let prisma = new PrismaClient();
  const existing = await prisma.item.findMany({
    where: { userId: USER_ID },
    select: { title: true, id: true },
  });
  const haveTitle = new Set(existing.map((i) => i.title.toLowerCase()));
  const haveId = new Set(existing.map((i) => i.id));

  // Also skip if Russian-mapped English already there under close names
  const toCreate = MOVIES.filter((m) => !haveTitle.has(m.title.toLowerCase()));
  console.log(`pool ${MOVIES.length}, have ${existing.length}, creating ${toCreate.length}`);

  let created = 0;
  for (let i = 0; i < toCreate.length; i++) {
    const m = toCreate[i];
    let id = slugId(m.title);
    if (haveId.has(id)) id = `${id}-${m.watchedYear}-${i}`;
    haveId.add(id);

    const data = {
      id,
      userId: USER_ID,
      type: "movie",
      title: m.title,
      year: m.year,
      director: m.director,
      coverUrl: "",
      description: m.description,
      x: m.x,
      y: m.y,
      watchedYear: m.watchedYear,
      color: COLORS[i % COLORS.length],
    };

    try {
      await prisma.item.create({ data });
      created++;
    } catch (e) {
      console.error("fail", m.title, e.code || e.message);
      await prisma.$disconnect().catch(() => {});
      prisma = new PrismaClient();
      try {
        await prisma.item.create({ data });
        created++;
        console.log("retry ok", m.title);
      } catch (e2) {
        console.error("retry fail", m.title, e2.code || e2.message);
      }
    }

    if ((i + 1) % 10 === 0) {
      console.log(`progress ${i + 1}/${toCreate.length}, created ${created}`);
      await prisma.$disconnect().catch(() => {});
      prisma = new PrismaClient();
    }
  }

  const total = await prisma.item.count({ where: { userId: USER_ID } });
  console.log(`done created=${created} total=${total}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
