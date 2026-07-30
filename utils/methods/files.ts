export function isFile(variable: unknown): variable is File {
  return variable instanceof File;
}
