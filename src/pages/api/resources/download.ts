import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(req, res);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { pack } = req.query;

    if (!pack || typeof pack !== 'string') {
      return res.status(400).json({ error: 'Resource pack ID is required' });
    }

    if (!['design-pack', 'scribbles-pack'].includes(pack)) {
      return res.status(400).json({ error: 'Invalid resource pack ID' });
    }

    // Check if user has purchased this resource pack
    const { data: purchase, error: purchaseError } = await supabase
      .from('resource_purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('resource_pack_id', pack)
      .single();

    if (purchaseError || !purchase) {
      return res.status(403).json({
        error: 'You have not purchased this resource pack',
      });
    }

    // Generate signed URL for the resource file
    const fileName = `${pack}.zip`;

    // Use service client to generate signed URL
    const { createServiceClient } = await import('@/lib/supabase/server');
    const serviceClient = createServiceClient();

    // Check if service client is properly configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
      return res.status(500).json({
        error: 'Server configuration error: Service role key missing',
      });
    }

    // Check if file exists first
    const { data: fileList, error: listError } = await serviceClient.storage
      .from('resources')
      .list();

    if (listError) {
      console.error('Error listing files in storage:', listError);
      return res.status(500).json({
        error: `Storage bucket error: ${
          listError.message || 'Failed to access storage'
        }`,
      });
    }

    const fileExists = fileList?.some((file) => file.name === fileName);
    if (!fileExists) {
      console.error(`File not found in storage: ${fileName}`);
      return res.status(404).json({
        error: `Resource file not found: ${fileName}`,
      });
    }

    const { data: signedUrlData, error: signedUrlError } =
      await serviceClient.storage
        .from('resources')
        .createSignedUrl(fileName, 3600); // 1 hour expiry

    if (signedUrlError || !signedUrlData) {
      console.error('Error generating signed URL:', signedUrlError);
      return res.status(500).json({
        error: `Failed to generate download link: ${
          signedUrlError?.message || 'Unknown error'
        }`,
      });
    }

    // Return the signed URL for the client to handle
    return res.status(200).json({ url: signedUrlData.signedUrl });
  } catch (error) {
    console.error('Download API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
