export const suffixName = (initialName: string) => {
  return initialName.substring(initialName.lastIndexOf('.') + 1);
};

export const lowerCaseFirstLetter = (letter: string) => {
  return letter.charAt(0).toLowerCase() + letter.slice(1);
};

export const upperCaseFirstLetter = (letter: string) => {
  return letter.charAt(0).toUpperCase() + letter.slice(1);
};
