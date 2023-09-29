// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stringFormat = (format: string, ...args: any[]) => {
  return format.replace(/{(\d+)}/g, (match: string, number: number) => {
    return typeof args[number] != 'undefined' ? args[number] : match;
  });
};

const removeCommandText = (text: string) => {
  return text.startsWith('*thongbao') ? text.substring(10) : text;
};
const removeSpecialCharsUseRegularExpression = (text: string) => {
  const arrPattern = [
    {
      regex: /[-]+[ ]+[<]+[A-Za-z0-9 :@&^%$#]+[>]+[ ]+[-]/g,
      replace: '-',
    },
    {
      regex: /[<]+[A-Za-z0-9 :@&^%$#]+[>]/g,
      replace: '',
    },
  ];

  arrPattern.forEach((p) => {
    let match;
    while ((match = p.regex.exec(text)) !== null) {
      text = text.replace(match[0], p.replace);
    }
  });

  return text;
};

const removeSpecialChar = (text: string) => {
  const special_char = ['***', '~~', '```', '__', '_', '**', '*'];
  special_char.forEach((item) => {
    text = text.replace(item, '');
  });

  return text;
};

const convertTextLinkToHtml = (text: string) => {
  const re =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g;
  let match,
    arrMatch = [];
  while ((match = re.exec(text)) !== null) {
    arrMatch.push({ value: match[0], index: re.lastIndex });
  }

  if (arrMatch.length) {
    arrMatch = arrMatch.sort((x, y) => y.index - x.index);
    arrMatch.forEach((a) => {
      text =
        text.slice(0, a.index - a.value.length) +
        `<a href='${a.value}' target='_blank'>${a.value}</a>` +
        text.slice(a.index);
    });
  }

  return text;
};

const removeSpecialChars = (text: string, kt: string) => {
  const dicSpecialCharToReplaceText: { [key in string]: string } = {
    '***': '<b><i>{0}</i></b>',
    '**': '<b>{0}</b>',
    '*': '<i>{0}</i>',
    __: '<u>{0}</u>',
    _: '<i>{0}</i>',
    '```': `<p style='background-color: #606060;color: #fff;margin-top: 1.4px; padding:10px;border-radius: 5px;line-height: 19.5px'>{0}</p>`,
    '~~': '<s>{0}</s>',
  };

  const special_char: string[] = ['***', '~~', '```', '__', '_', '**', '*'];
  special_char.forEach((item) => {
    const res = text.split(item);
    res.forEach((x) => {
      if (
        dicSpecialCharToReplaceText[kt] !== undefined &&
        !x.startsWith('\n') &&
        !x.endsWith('\n')
      ) {
        text = text.replace(
          kt + x + kt,
          stringFormat(dicSpecialCharToReplaceText[kt], x),
        );
      }
    });
  });

  return text;
};

export const convertHoverText = (text: string) => {
  text = removeCommandText(text);
  text = removeSpecialCharsUseRegularExpression(text);

  const special_char = ['***', '~~', '```', '__', '_', '**', '*'];
  special_char.forEach((item) => {
    text = text.replace(item, '');
  });
  return text;
};

export const convertDiscordTextToHtml = (text: string) => {
  try {
    text = removeCommandText(text);

    text = convertTextLinkToHtml(text);

    text = removeSpecialCharsUseRegularExpression(text);

    const special_char: string[] = ['***', '~~', '```', '__', '_', '**', '*'];

    special_char.forEach((item) => {
      text = removeSpecialChars(text, item);
    });

    return `<p style='margin-top: 10px'>${text}</p>`;
  } catch (err) {
    return text;
  }
};
