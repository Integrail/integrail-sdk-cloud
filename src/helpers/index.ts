export function sanitizeFieldName(fieldName: string): string {
  return fieldName.replace(/\./g, "_");
}
