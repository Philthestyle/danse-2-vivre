import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

/**
 * SERVER-ONLY. Ne jamais importer depuis un composant client.
 *
 * Renvoie un POST pré-signé S3, avec conditions strictes :
 * - taille max
 * - MIME whitelist
 * - clé imposée (non prédictible, générée côté serveur)
 * - durée courte (5 min par défaut)
 */

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Env ${name} manquant`);
  return v;
}

export interface PresignInput {
  key: string;
  contentType: string;
  maxBytes: number;
}

export async function presignUpload(input: PresignInput) {
  const bucket = requireEnv("S3_BUCKET");
  const region = requireEnv("AWS_REGION");

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId: requireEnv("AWS_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("AWS_SECRET_ACCESS_KEY"),
    },
  });

  const { url, fields } = await createPresignedPost(client, {
    Bucket: bucket,
    Key: input.key,
    Conditions: [
      ["content-length-range", 0, input.maxBytes],
      ["eq", "$Content-Type", input.contentType],
    ],
    Fields: {
      "Content-Type": input.contentType,
    },
    Expires: 300, // 5 minutes
  });

  return { url, fields, key: input.key };
}
