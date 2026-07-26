const NUMBER_WORDS: Record<string, number> = {
  один: 1,
  два: 2,
  три: 3,
  четыре: 4,
};

export const getBackgroundLanguageChoiceCount = (languages: string[]) =>
  languages.reduce((count, language) => {
    const normalized = language.toLocaleLowerCase('ru-RU');
    const match = normalized.match(/(один|два|три|четыре|\d+)\s+(?:язык\w*\s+)?на\s+ваш\s+выбор/);

    if (!match) return count;

    return count + (NUMBER_WORDS[match[1]] ?? Number(match[1]));
  }, 0);
