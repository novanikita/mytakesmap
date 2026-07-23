/**
 * One-shot import of movie pool into nikitanova account.
 * Run: node scripts/import-movie-pool.mjs
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const USER_ID = "cmrwk8i9g0000kw04favqeqn8";

/** @type {{ ru: string, title: string, year: number, director: string, description: string, watchedYear: number, x: number, y: number }[]} */
const MOVIES = [
  { ru: "Потоп", title: "The End We Start From", year: 2023, director: "Mahalia Belo", description: "A new mother flees a flooded London with her infant", watchedYear: 2026, x: 95, y: -80 },
  { ru: "Марти Великолепный", title: "Marty Supreme", year: 2025, director: "Josh Safdie", description: "Table tennis prodigy Marty Reisman chases glory at any cost", watchedYear: 2026, x: 80, y: -30 },
  { ru: "Горничная", title: "The Housemaid", year: 2025, director: "Paul Feig", description: "A housemaid enters a wealthy home and uncovers dark secrets", watchedYear: 2026, x: 80, y: 60 },
  { ru: "Обсессия", title: "Obsession", year: 2023, director: "Morgan Lloyd Malcolm", description: "Desire and control spiral into a dangerous fixation", watchedYear: 2026, x: 10, y: -50 },
  { ru: "Закулисье реальности", title: "Backrooms", year: 2026, director: "Kane Parsons", description: "A found-footage nightmare in liminal endless rooms", watchedYear: 2026, x: 20, y: -50 },
  { ru: "Великолепная поездка", title: "Driving Madeleine", year: 2022, director: "Christian Carion", description: "A taxi ride through Paris becomes a life story", watchedYear: 2026, x: -20, y: 50 },
  { ru: "Выход 8", title: "Exit 8", year: 2025, director: "Genki Kawamura", description: "Find the anomalies to escape an endless underground corridor", watchedYear: 2026, x: 100, y: -100 },
  { ru: "Мой друг дамер", title: "My Friend Dahmer", year: 2017, director: "Marc Meyers", description: "A teenager befriends Jeffrey Dahmer before the killings", watchedYear: 2026, x: -20, y: 80 },
  { ru: "Девушка с жемчужной серёжкой", title: "Girl with a Pearl Earring", year: 2003, director: "Peter Webber", description: "A maid becomes Vermeer's muse in Delft", watchedYear: 2026, x: -70, y: 50 },
  { ru: "99 франков", title: "99 Francs", year: 2007, director: "Jan Kounen", description: "An ad exec spirals through cynicism and excess", watchedYear: 2026, x: -30, y: -10 },
  { ru: "Шоколад", title: "Chocolat", year: 2000, director: "Lasse Hallström", description: "A chocolatier unsettles a French village with pleasure", watchedYear: 2026, x: 20, y: 50 },
  { ru: "Линкольн для адвоката", title: "The Lincoln Lawyer", year: 2011, director: "Brad Furman", description: "A hustling lawyer takes a case that turns deadly", watchedYear: 2026, x: 40, y: 40 },
  { ru: "Коммерсант", title: "The Merchant of Venice", year: 2004, director: "Michael Radford", description: "Shylock demands a pound of flesh in Venice", watchedYear: 2026, x: -10, y: 70 },
  { ru: "Земельвейс", title: "Semmelweis", year: 2023, director: "Lajos Koltai", description: "A doctor fights for handwashing to save mothers", watchedYear: 2026, x: -20, y: 40 },
  { ru: "Пятый элемент", title: "The Fifth Element", year: 1997, director: "Luc Besson", description: "A cabbie and a supreme being save the universe", watchedYear: 2026, x: -10, y: 10 },
  { ru: "Брат", title: "Brother", year: 1997, director: "Aleksei Balabanov", description: "A war veteran becomes a hitman in 1990s Russia", watchedYear: 2026, x: 10, y: 10 },
  { ru: "Афера доктора Нока", title: "Knock", year: 2017, director: "Lorraine Lévy", description: "A con-man doctor turns a healthy town into patients", watchedYear: 2026, x: -30, y: 60 },
  { ru: "Глубже", title: "Deeper", year: 2025, director: "Unknown", description: "A dive into desire and submerged secrets", watchedYear: 2026, x: 15, y: 15 },
  { ru: "Няньки", title: "The Babysitters", year: 2007, director: "David Ross", description: "Teen babysitters blur lines of power and money", watchedYear: 2026, x: -50, y: 50 },
  { ru: "100 вещей и ничего лишнего", title: "100 Things", year: 2018, director: "Florian David Fitz", description: "Two friends give up their possessions for 100 days", watchedYear: 2026, x: 30, y: 30 },
  { ru: "Чего хотят женщины", title: "What Women Want", year: 2000, director: "Nancy Meyers", description: "A chauvinist hears women's thoughts after an accident", watchedYear: 2026, x: 80, y: 40 },
  { ru: "Бронкская история", title: "A Bronx Tale", year: 1993, director: "Robert De Niro", description: "A boy is torn between his father and a mob boss", watchedYear: 2026, x: 85, y: 20 },
  { ru: "Нэчжа 1", title: "Ne Zha", year: 2019, director: "Jiaozi", description: "A demon child fights fate to become a hero", watchedYear: 2026, x: -81, y: 91 },
  { ru: "Нэчжа 2", title: "Ne Zha 2", year: 2025, director: "Jiaozi", description: "Ne Zha returns for a larger mythic battle", watchedYear: 2026, x: -93, y: 96 },
  { ru: "Мавританец", title: "The Mauritanian", year: 2021, director: "Kevin Macdonald", description: "A Guantanamo detainee fights for justice", watchedYear: 2025, x: 87, y: -40 },
  { ru: "Худший человек на свете", title: "The Worst Person in the World", year: 2021, director: "Joachim Trier", description: "A young woman navigates love and identity in Oslo", watchedYear: 2025, x: -80, y: 80 },
  { ru: "Пирамида", title: "The Pyramid", year: 2014, director: "Grégory Levasseur", description: "Explorers enter a three-sided pyramid of horror", watchedYear: 2025, x: -50, y: 40 },
  { ru: "Сноуден", title: "Snowden", year: 2016, director: "Oliver Stone", description: "Edward Snowden exposes mass surveillance", watchedYear: 2025, x: -20, y: -20 },
  { ru: "Большая сделка", title: "The Big Short", year: 2015, director: "Adam McKay", description: "Outsiders bet against the housing market crash", watchedYear: 2025, x: -40, y: 10 },
  { ru: "Дело Коллини", title: "The Collini Case", year: 2019, director: "Marco Kreuzpaintner", description: "A young lawyer uncovers a buried Nazi crime", watchedYear: 2025, x: -70, y: 20 },
  { ru: "Чемпион мира", title: "World Champion", year: 2021, director: "Aleksey Sidorov", description: "Karpov and Kasparov clash for the chess crown", watchedYear: 2025, x: 10, y: 70 },
  { ru: "Гонка", title: "Rush", year: 2013, director: "Ron Howard", description: "Hunt and Lauda duel in 1970s Formula 1", watchedYear: 2025, x: 50, y: 50 },
  { ru: "Материалистка", title: "Materialists", year: 2025, director: "Celine Song", description: "A matchmaker weighs love against money", watchedYear: 2025, x: 75, y: 30 },
  { ru: "Телефонные мошенники", title: "I Care a Lot", year: 2020, director: "J Blakeson", description: "A legal guardian cons the elderly for profit", watchedYear: 2025, x: 30, y: -60 },
  { ru: "Она", title: "Her", year: 2013, director: "Spike Jonze", description: "A lonely writer falls for his OS companion", watchedYear: 2025, x: -13, y: 12 },
  { ru: "Вторая жизнь Уве", title: "A Man Called Ove", year: 2015, director: "Hannes Holm", description: "A grumpy widower finds purpose through neighbors", watchedYear: 2025, x: -46, y: -67 },
  { ru: "Король Говорит", title: "The King's Speech", year: 2010, director: "Tom Hooper", description: "George VI battles a stammer with a therapist", watchedYear: 2025, x: 41, y: 43 },
  { ru: "Ла-ла-ленд", title: "La La Land", year: 2016, director: "Damien Chazelle", description: "A jazz pianist and an actress chase dreams in L.A.", watchedYear: 2025, x: -70, y: 70 },
  { ru: "Груз 200", title: "Cargo 200", year: 2007, director: "Aleksei Balabanov", description: "Late-Soviet violence closes in on a young woman", watchedYear: 2025, x: 95, y: -82 },
  { ru: "Ненависть", title: "La Haine", year: 1995, director: "Mathieu Kassovitz", description: "Three friends face a powder-keg day in the banlieue", watchedYear: 2025, x: -40, y: -95 },
  { ru: "Охота", title: "The Hunt", year: 2012, director: "Thomas Vinterberg", description: "A teacher's life collapses after a false accusation", watchedYear: 2025, x: -35, y: 50 },
  { ru: "Дангал", title: "Dangal", year: 2016, director: "Nitesh Tiwari", description: "A wrestler trains his daughters to win gold", watchedYear: 2025, x: -15, y: 40 },
  { ru: "Операция Мясной фарш", title: "Operation Mincemeat", year: 2021, director: "John Madden", description: "British intelligence fakes papers to fool the Nazis", watchedYear: 2025, x: 76, y: 30 },
  { ru: "Искупление", title: "Atonement", year: 2007, director: "Joe Wright", description: "A child's lie shatters two lovers across war", watchedYear: 2025, x: -70, y: 15 },
  { ru: "Звук свободы", title: "Sound of Freedom", year: 2023, director: "Alejandro Monteverde", description: "An agent hunts child traffickers after resigning", watchedYear: 2025, x: 30, y: -40 },
  { ru: "Олдбой", title: "Oldboy", year: 2003, director: "Park Chan-wook", description: "A man seeks revenge after 15 years of captivity", watchedYear: 2025, x: 96, y: -96 },
  { ru: "Шоссе в никуда", title: "Lost Highway", year: 1997, director: "David Lynch", description: "Identity fractures on a nightmarish L.A. road", watchedYear: 2025, x: -10, y: -90 },
  { ru: "Субстанция", title: "The Substance", year: 2024, director: "Coralie Fargeat", description: "A fading star takes a drug that births a younger self", watchedYear: 2025, x: 27, y: -27 },
  { ru: "Оружейный барон", title: "Lord of War", year: 2005, director: "Andrew Niccol", description: "An arms dealer thrives on global conflict", watchedYear: 2025, x: 60, y: 40 },
  { ru: "Стать Джоном Ленноном", title: "Nowhere Boy", year: 2009, director: "Sam Taylor-Johnson", description: "Young John Lennon finds music and family turmoil", watchedYear: 2025, x: -20, y: 20 },
  { ru: "Достучатся до небес", title: "Knockin' on Heaven's Door", year: 1997, director: "Thomas Jahn", description: "Two terminally ill men steal a car for the sea", watchedYear: 2025, x: 45, y: 46 },
  { ru: "Трасса 60", title: "Interstate 60", year: 2002, director: "Bob Gale", description: "A road trip along a highway that shouldn't exist", watchedYear: 2025, x: -30, y: 97 },
  { ru: "Одна жизнь", title: "One Life", year: 2023, director: "James Hawes", description: "Nicholas Winton recalls saving children from the Nazis", watchedYear: 2025, x: 80, y: 29 },
  { ru: "Кто убил Блекберри", title: "Blackberry", year: 2023, director: "Matt Johnson", description: "The rise and fall of the Blackberry phone empire", watchedYear: 2025, x: -44, y: 50 },
  { ru: "Как взломать экзамен", title: "The Perfect Score", year: 2004, director: "Brian Robbins", description: "Teens plot to steal SAT answers", watchedYear: 2025, x: -70, y: 80 },
  { ru: "Человек который взломал бесконечность", title: "The Man Who Knew Infinity", year: 2015, director: "Matthew Brown", description: "Ramanujan brings radical math to Cambridge", watchedYear: 2025, x: -5, y: 5 },
  { ru: "Ворошиловский стрелок", title: "Voroshilov Sharpshooter", year: 1999, director: "Stanislav Govorukhin", description: "A grandfather takes justice into his own hands", watchedYear: 2025, x: 20, y: -20 },
  { ru: "Пианист", title: "The Pianist", year: 2002, director: "Roman Polanski", description: "A Jewish pianist survives the Warsaw ghetto", watchedYear: 2025, x: 99, y: -99 },
  { ru: "Отель Мумбаи", title: "Hotel Mumbai", year: 2018, director: "Anthony Maras", description: "Staff and guests endure the 2008 Mumbai attacks", watchedYear: 2025, x: -30, y: 60 },
  { ru: "Джентельмены", title: "The Gentlemen", year: 2019, director: "Guy Ritchie", description: "A cannabis empire draws rival claims in London", watchedYear: 2025, x: 87, y: 65 },
  { ru: "Учитель на замену", title: "Detachment", year: 2011, director: "Tony Kaye", description: "A substitute teacher faces a broken school system", watchedYear: 2025, x: 88, y: -88 },
  { ru: "Дом который построил Джек", title: "The House That Jack Built", year: 2018, director: "Lars von Trier", description: "A serial killer recounts his crimes to Virgil", watchedYear: 2025, x: -40, y: -98 },
  { ru: "Анора", title: "Anora", year: 2024, director: "Sean Baker", description: "A Brooklyn sex worker's fairy tale turns chaotic", watchedYear: 2025, x: -20, y: 30 },
  { ru: "Догвиль", title: "Dogville", year: 2003, director: "Lars von Trier", description: "A fugitive woman tests a town's moral limits", watchedYear: 2025, x: -44, y: -84 },
  { ru: "Эйфель", title: "Eiffel", year: 2021, director: "Martin Bourboulon", description: "Gustave Eiffel builds a tower and revisits love", watchedYear: 2025, x: -60, y: 66 },
  { ru: "От кутюр", title: "Haute Couture", year: 2021, director: "Sylvie Ohayon", description: "A Dior seamstress mentors a troubled teen", watchedYear: 2025, x: -80, y: 50 },
  { ru: "Дефолт", title: "Default", year: 2018, director: "Choi Kook-hee", description: "Officials race to stop South Korea's financial collapse", watchedYear: 2025, x: 20, y: 10 },
  { ru: "Билли Эллиот", title: "Billy Elliot", year: 2000, director: "Stephen Daldry", description: "A miner's son discovers ballet during a strike", watchedYear: 2025, x: -48, y: 77 },
  { ru: "Мальчик и птица", title: "The Boy and the Heron", year: 2023, director: "Hayao Miyazaki", description: "A boy enters a fantastical world after loss", watchedYear: 2025, x: 71, y: -76 },
  { ru: "Области тьмы", title: "Limitless", year: 2011, director: "Neil Burger", description: "A pill unlocks full brain power and deadly stakes", watchedYear: 2024, x: -58, y: 34 },
  { ru: "Аалто", title: "Aalto", year: 2020, director: "Virpi Suutari", description: "A portrait of architects Alvar and Aino Aalto", watchedYear: 2024, x: -10, y: 5 },
  { ru: "Побег из претории", title: "Escape from Pretoria", year: 2020, director: "Francis Annan", description: "Anti-apartheid prisoners plan a daring jailbreak", watchedYear: 2024, x: 62, y: 29 },
  { ru: "Максин ХХХ", title: "MaXXXine", year: 2024, director: "Ti West", description: "Maxine seeks stardom as bodies pile up in 80s L.A.", watchedYear: 2024, x: 33, y: -71 },
  { ru: "Шахматист", title: "The Chess Player", year: 2017, director: "Luis Oliveros", description: "A chess genius navigates war and identity", watchedYear: 2024, x: -26, y: 81 },
  { ru: "Игра в имитацию", title: "The Imitation Game", year: 2014, director: "Morten Tyldum", description: "Alan Turing cracks Enigma and faces persecution", watchedYear: 2024, x: 49, y: 67 },
  { ru: "1+1", title: "The Intouchables", year: 2011, director: "Olivier Nakache", description: "A quadriplegic aristocrat hires an unlikely carer", watchedYear: 2024, x: 74, y: 98 },
  { ru: "Амели", title: "Amélie", year: 2001, director: "Jean-Pierre Jeunet", description: "A shy waitress secretly improves Parisian lives", watchedYear: 2024, x: -89, y: 25 },
  { ru: "Середина 90х", title: "Mid90s", year: 2018, director: "Jonah Hill", description: "A lonely kid finds belonging with skateboarders", watchedYear: 2023, x: 10, y: 70 },
  { ru: "Бойцовский клуб", title: "Fight Club", year: 1999, director: "David Fincher", description: "An insomniac and a soap maker start underground fights", watchedYear: 2023, x: 96, y: -91 },
  { ru: "Королевский гамбит", title: "The Queen's Gambit", year: 2020, director: "Scott Frank", description: "An orphaned prodigy rises through competitive chess", watchedYear: 2023, x: -61, y: 33 },
  { ru: "Дворецкий", title: "The Butler", year: 2013, director: "Lee Daniels", description: "A White House butler witnesses decades of change", watchedYear: 2023, x: 92, y: -83 },
  { ru: "Великий", title: "The Great", year: 2020, director: "Tony McNamara", description: "Catherine plots against Peter in satirical Russia", watchedYear: 2023, x: -30, y: -31 },
  { ru: "Как убили Джона Кеннеди", title: "JFK", year: 1991, director: "Oliver Stone", description: "A DA digs into the conspiracy around Kennedy's death", watchedYear: 2023, x: -10, y: 3 },
  { ru: "Дьявол носит Прада", title: "The Devil Wears Prada", year: 2006, director: "David Frankel", description: "A young assistant survives a ruthless fashion editor", watchedYear: 2023, x: -22, y: 69 },
  { ru: "Таксист", title: "Taxi Driver", year: 1976, director: "Martin Scorsese", description: "A lonely cabbie descends into violent obsession", watchedYear: 2022, x: 77, y: -59 },
  { ru: "Уроки фарси", title: "Persian Lessons", year: 2020, director: "Vadim Perelman", description: "A prisoner invents a language to survive a camp", watchedYear: 2022, x: 70, y: 69 },
  { ru: "Достать ножи", title: "Knives Out", year: 2019, director: "Rian Johnson", description: "A detective untangles a wealthy family's murder", watchedYear: 2022, x: 66, y: 88 },
  { ru: "Достать ножи 2", title: "Glass Onion", year: 2022, director: "Rian Johnson", description: "Benoit Blanc crashes a tech billionaire's island party", watchedYear: 2022, x: 70, y: 40 },
  { ru: "Достать ножи 3", title: "Wake Up Dead Man", year: 2025, director: "Rian Johnson", description: "Benoit Blanc investigates a murder in a small parish", watchedYear: 2022, x: 40, y: 30 },
  { ru: "Валли", title: "WALL·E", year: 2008, director: "Andrew Stanton", description: "A lonely robot finds love while cleaning Earth", watchedYear: 2022, x: 89, y: 97 },
  { ru: "Марсианин", title: "The Martian", year: 2015, director: "Ridley Scott", description: "A stranded astronaut science-hacks survival on Mars", watchedYear: 2022, x: 76, y: 35 },
  { ru: "Рейв в Иране", title: "Raving Iran", year: 2016, director: "Susanne Regina Meures", description: "Two Tehran DJs chase techno under theocratic ban", watchedYear: 2022, x: 49, y: -82 },
  { ru: "Столетний старик который вылез через окно", title: "The 100-Year-Old Man Who Climbed Out the Window and Disappeared", year: 2013, director: "Felix Herngren", description: "A centenarian escapes his home into wild adventure", watchedYear: 2022, x: -49, y: 31 },
  { ru: "Баския: взрыв реальности", title: "Basquiat", year: 1996, director: "Julian Schnabel", description: "Jean-Michel Basquiat rises through New York art", watchedYear: 2022, x: 15, y: 20 },
  { ru: "Сахар", title: "Sugar", year: 2008, director: "Anna Boden", description: "A Dominican pitcher chases baseball in America", watchedYear: 2022, x: -78, y: -10 },
  { ru: "Экстаз", title: "Irvine Welsh's Ecstasy", year: 2011, director: "Rob Heydon", description: "A club kid's high lifestyle turns dangerous", watchedYear: 2022, x: -20, y: -96 },
  { ru: "Превратности разума", title: "The Father", year: 2020, director: "Florian Zeller", description: "Dementia reorders a father's grip on reality", watchedYear: 2022, x: -67, y: 20 },
  { ru: "Вселенная Стивена хоккинга", title: "The Theory of Everything", year: 2014, director: "James Marsh", description: "Stephen Hawking's life of love and cosmology", watchedYear: 2022, x: -23, y: 25 },
  { ru: "Все деньги мира", title: "All the Money in the World", year: 2017, director: "Ridley Scott", description: "A Getty heir's kidnapping tests a fortune's limits", watchedYear: 2022, x: -10, y: 17 },
];

const COLORS = [
  "#c45c26", "#2a6f97", "#52796f", "#9b2226", "#bc6c25",
  "#415a77", "#6d597a", "#355070", "#b56576", "#4a5759",
];

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

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
  const existing = await prisma.item.findMany({
    where: { userId: USER_ID },
    select: { title: true, id: true },
  });
  const haveTitle = new Set(existing.map((i) => i.title.toLowerCase()));
  const haveId = new Set(existing.map((i) => i.id));

  const toCreate = MOVIES.filter((m) => !haveTitle.has(m.title.toLowerCase()));
  console.log(`pool ${MOVIES.length}, already have ${existing.length}, creating ${toCreate.length}`);

  const rows = toCreate.map((m, i) => {
    let id = slugId(m.title);
    if (haveId.has(id)) id = `${id}-${m.watchedYear}-${i}`;
    haveId.add(id);
    return {
      id,
      userId: USER_ID,
      type: "movie",
      title: m.title,
      year: m.year,
      director: m.director === "Unknown" ? "" : m.director,
      coverUrl: "",
      description: m.description,
      x: m.x,
      y: m.y,
      watchedYear: m.watchedYear,
      color: COLORS[i % COLORS.length],
    };
  });

  const BATCH = 20;
  let created = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const result = await prisma.item.createMany({ data: chunk, skipDuplicates: true });
    created += result.count;
    console.log(`batch ${Math.floor(i / BATCH) + 1}: +${result.count} (total created ${created})`);
  }

  const total = await prisma.item.count({ where: { userId: USER_ID } });
  console.log(`done. created=${created}, total for nikitanova=${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
