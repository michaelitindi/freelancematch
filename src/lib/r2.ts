export async function uploadToR2(
  bucket: R2Bucket,
  file: File | Blob,
  path: string,
  filename: string
): Promise<string> {
  const key = `${path}/${Date.now()}-${filename}`;
  await bucket.put(key, file);
  return key;
}

export async function getFromR2(
  bucket: R2Bucket,
  key: string
): Promise<R2ObjectBody | null> {
  return await bucket.get(key);
}

export async function deleteFromR2(
  bucket: R2Bucket,
  key: string
): Promise<void> {
  await bucket.delete(key);
}

export function getPublicUrl(key: string, accountId: string): string {
  return `https://pub-${accountId}.r2.dev/${key}`;
}
