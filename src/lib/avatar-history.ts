import type { SupabaseClient } from '@supabase/supabase-js';

interface AvatarHistoryRecord {
  image_path?: string | null;
}

export async function addSignedAvatarUrls<T extends AvatarHistoryRecord>(
  records: T[],
  client: Pick<SupabaseClient, 'storage'>,
): Promise<Array<T & { image_url?: string }>> {
  const paths = Array.from(
    new Set(records.map((record) => record.image_path).filter(Boolean)),
  ) as string[];

  if (paths.length === 0) return records;

  try {
    const { data, error } = await client.storage
      .from('generated-avatars')
      .createSignedUrls(paths, 3600);

    if (error || !data) return records;

    const urls = new Map(
      data
        .filter((item) => item.path && item.signedUrl && !item.error)
        .map((item) => [item.path, item.signedUrl]),
    );

    return records.map((record) => {
      const url = record.image_path ? urls.get(record.image_path) : undefined;
      return url ? { ...record, image_url: url } : record;
    });
  } catch {
    return records;
  }
}
