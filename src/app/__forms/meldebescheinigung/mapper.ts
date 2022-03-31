export const mapper = {
  'betroffeneranschrift.wohnort': {
    transform: function (value, src, dest, key) {
      dest.betroffeneranschrift = dest.betroffeneranschrift || {};
      const list: Array<string> = splitZipcodeAndCity(value);
      if ((list || []).length) {
        dest.betroffeneranschrift.postleitzahl = list[0];
        src.betroffeneranschrift.wohnort = dest.betroffeneranschrift.wohnort = list[1]
      }
    }
  }
};

function splitZipcodeAndCity(zipCodeAndCity: string): Array<string> {
  if (zipCodeAndCity) {
    const merge_trimmed = zipCodeAndCity.trim();
    const match = merge_trimmed.match(new RegExp('[1-9][0-9]{4}'));
    if (match) {
      return [match[0], (match.input.substring(match.index + match[0].length, match.input.length) || '').trim()]
    }
    return null
  }
}

