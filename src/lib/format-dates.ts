export function stringFromDateOrText(value: string | null, text: string) {
  if (!value) {
    return text;
  }

  return new Date(value).toLocaleString();
}
