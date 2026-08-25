export function isRealFoodImage(value: string | null | undefined) {
  const source = value?.trim() ?? "";
  return /^https:\/\//i.test(source) || source.startsWith("/storage/");
}
