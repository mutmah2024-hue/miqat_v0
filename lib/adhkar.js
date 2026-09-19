import morningEveningData from "../data/adhkar.json";
import generalAdhkarData from "../data/generaladhkar.json";

export function getAdhkar(category) {
  if (category === "morning") {
    return morningEveningData.filter(
      (item) =>
        item.type === 0 ||
        item.type === 1
    );
  }

  if (category === "evening") {
    return morningEveningData.filter(
      (item) =>
        item.type === 0 ||
        item.type === 2
    );
  }

  const chapter =
    generalAdhkarData.chapters.find(
      (item) => item.id === category
    );

  if (!chapter) {
    return [];
  }

  return generalAdhkarData.entries
    .filter(
      (entry) =>
        entry.chapterId === chapter.id
    )
    .map((entry) => {
      const dua =
        entry.variations?.[0]
          ?.steps?.[0]
          ?.items?.[0]
          ?.dua;

      return {
        id: entry.id,
        title: entry.title,
        arabic: dua?.arabic || "",
        transliteration:
          dua?.transliteration || "",
        translation:
          dua?.translation || "",
        audio:
          entry.variations?.[0]
            ?.steps?.[0]
            ?.recordings?.[0]
            ?.url || "",
        sourceReference:
          entry.sourceReference || "",
      };
    });
}