// Run with: mongosh "mongodb://127.0.0.1:27017/dnd_su" scripts/migrations/import-official-5e14-subclasses.mongosh.js
//
// The script imports only the official part of each 5e14.dnd.su class page:
// everything before the "Unearthed Arcana & Unofficial" section. It never
// updates an existing subclass; comparison is performed by normalized name.
// Review the dry-run output first, then set DRY_RUN to false to write changes.

const { execFileSync } = require("child_process");

const DRY_RUN = false;
const DATABASE_NAME = "dnd_su";
const COLLECTION_NAME = "classes";
const SOURCE_PAGES = [
  { className: "Варвар", url: "https://5e14.dnd.su/class/87-barbarian/" },
  { className: "Бард", url: "https://5e14.dnd.su/class/88-bard/" },
  { className: "Жрец", url: "https://5e14.dnd.su/class/89-cleric/" },
  { className: "Друид", url: "https://5e14.dnd.su/class/90-druid/" },
  { className: "Воин", url: "https://5e14.dnd.su/class/91-fighter/" },
  { className: "Монах", url: "https://5e14.dnd.su/class/93-monk/" },
  { className: "Паладин", url: "https://5e14.dnd.su/class/94-paladin/" },
  { className: "Следопыт", url: "https://5e14.dnd.su/class/97-ranger/" },
  { className: "Плут", url: "https://5e14.dnd.su/class/99-rogue/" },
  { className: "Чародей", url: "https://5e14.dnd.su/class/101-sorcerer/" },
  { className: "Колдун", url: "https://5e14.dnd.su/class/104-warlock/" },
  { className: "Волшебник", url: "https://5e14.dnd.su/class/105-wizard/" },
  { className: "Изобретатель", url: "https://5e14.dnd.su/class/137-artificer/" },
];

const collection = db.getSiblingDB(DATABASE_NAME).getCollection(COLLECTION_NAME);
const curlCommand = process.platform === "win32" ? "curl.exe" : "curl";

const normalizeName = (value) =>
  value
    .toLocaleLowerCase("ru-RU")
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .trim();

const decodeHtml = (value) =>
  value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&laquo;/gi, "«")
    .replace(/&raquo;/gi, "»")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/[\t ]+/g, " ")
    .replace(/\n\s*/g, "\n")
    .trim();

const fetchPage = (url) =>
  execFileSync(
    curlCommand,
    ["--fail", "--location", "--silent", "--show-error", "--max-time", "60", url],
    { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
  );

const extractSource = (html) => {
  const sourceMatch = html.match(/Источник:\s*[«"]?([^<»"]+)/i);
  return sourceMatch ? decodeHtml(sourceMatch[1]) : "Player's Handbook";
};

const extractDescription = (html) => {
  const paragraphs = [...html.matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi)]
    .map((match) => decodeHtml(match[1]))
    .filter((paragraph) => paragraph && !/^Источник:/i.test(paragraph));

  return paragraphs[0] ?? "";
};

const extractFeatures = (html) => {
  const headings = [...html.matchAll(/<h3[^>]*class=["']smallSectionTitle["'][^>]*>([\s\S]*?)<\/h3>/gi)];

  return headings
    .map((heading, index) => {
      const start = heading.index + heading[0].length;
      const end = headings[index + 1]?.index ?? html.length;
      const block = html.slice(start, end);
      const levelMatch = decodeHtml(block).match(/(\d+)\s*[-–—]?й\s+уровень/i);

      if (!levelMatch) return null;

      return {
        name: decodeHtml(heading[1]),
        level: Number(levelMatch[1]),
        description: decodeHtml(block),
      };
    })
    .filter((feature) => feature && feature.name && feature.description);
};

const extractOfficialSubclasses = (html) => {
  const unofficialMarker = html.search(/id=["']unofficial["']/i);
  const officialHtml = unofficialMarker === -1 ? html : html.slice(0, unofficialMarker);
  const headings = [...officialHtml.matchAll(/<h2[^>]*>\s*<span\s+id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/span>\s*<\/h2>/gi)];

  return headings
    .map((heading, index) => {
      const sourceId = heading[1];
      const start = heading.index + heading[0].length;
      const end = headings[index + 1]?.index ?? officialHtml.length;
      const block = officialHtml.slice(start, end);
      const features = extractFeatures(block);

      if (!sourceId.includes(".") || features.length === 0) return null;

      return {
        id: sourceId.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, ""),
        name: decodeHtml(heading[2]),
        description: extractDescription(block),
        features,
        source: extractSource(block),
      };
    })
    .filter(Boolean);
};

const getMissingSubclasses = (classDocument, sourceSubclasses) => {
  const existingNames = new Set(
    (classDocument.subclasses ?? []).map((subclass) => normalizeName(subclass.name)),
  );

  return sourceSubclasses.filter(
    (subclass) => !existingNames.has(normalizeName(subclass.name)),
  );
};

const report = [];
const plannedUpdates = [];

for (const sourcePage of SOURCE_PAGES) {
  const classDocument = collection.findOne({ name: sourcePage.className });
  if (!classDocument) {
    throw new Error(`Класс «${sourcePage.className}» не найден в ${DATABASE_NAME}.${COLLECTION_NAME}`);
  }

  print(`Загрузка: ${sourcePage.className}`);
  const pageHtml = fetchPage(sourcePage.url);
  const sourceSubclasses = extractOfficialSubclasses(pageHtml);
  const missingSubclasses = getMissingSubclasses(classDocument, sourceSubclasses);

  report.push({
    className: sourcePage.className,
    discovered: sourceSubclasses.length,
    additions: missingSubclasses.map((subclass) => ({
      name: subclass.name,
      source: subclass.source,
      features: subclass.features.length,
    })),
  });

  if (missingSubclasses.length > 0) {
    plannedUpdates.push({
      classId: classDocument._id,
      subclasses: missingSubclasses,
    });
  }
}

printjson({ dryRun: DRY_RUN, report });

if (!DRY_RUN) {
  for (const update of plannedUpdates) {
    collection.updateOne(
      { _id: update.classId },
      { $push: { subclasses: { $each: update.subclasses } } },
    );
  }
}

if (DRY_RUN) {
  print("Проверка завершена без записи. Проверьте report, затем установите DRY_RUN = false и запустите скрипт повторно.");
} else {
  print("Импорт завершён. Повторный запуск не создаст дубликаты: подклассы сравниваются по нормализованному названию.");
}
