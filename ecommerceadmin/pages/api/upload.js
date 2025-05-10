import multiparty from 'multiparty';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import mime from 'mime-types';
import fs from 'fs';
import { mongooseConnect } from '@/lib/mongoose';

const BucketName = 'zain-next-ecommorce';

export default async function handle(req, res) {
  await mongooseConnect();
 
  try {
    const form = new multiparty.Form();
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    console.log('Files received:', files.file?.length || 0);

    // Validate environment variables
    if (!process.env.S3_ACCESS_KEY || !process.env.S3_SECRET_ACCESS_KEY) {
      console.error('Missing S3 credentials');
      return res.status(500).json({ error: 'Server configuration error: Missing S3 credentials' });
    }

    const client = new S3Client({
      region: 'eu-north-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });

    const links = [];
    for (const file of files.file) {
      const ext = file.originalFilename.split('.').pop();
      const newFilename = Date.now() + '.' + ext;

      await client.send(
        new PutObjectCommand({
          Bucket: BucketName,
          Key: newFilename,
          Body: fs.readFileSync(file.path),
          ACL: 'public-read',
          ContentType: mime.lookup(file.path),
        })
      );

      const link = `https://${BucketName}.s3.amazonaws.com/${newFilename}`;
      links.push(link);
    }

    return res.status(200).json({ links });
  } catch (error) {
    console.error('S3 Upload Error:', error);
    return res.status(500).json({ error: 'Failed to upload file to S3', message: error.message });
  }
}

export const config = {
  api: { bodyParser: false },
};