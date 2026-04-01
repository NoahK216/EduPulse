export function stringFromDateOrText(value: string | null, text: string) {
  if (!value) {
    return text;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function shortDateFromDateOrText(value: string | null, text: string) {
  if (!value) {
    return text;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}
