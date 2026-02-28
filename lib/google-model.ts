import { createVertex } from '@ai-sdk/google-vertex';
import { proxyFetch } from './proxy-fetch';

export const GEMINI_MODEL = 'gemini-3-flash-preview';

const vertexProject = process.env.VERTEX_PROJECT;
const vertexLocation = process.env.VERTEX_LOCATION ?? 'global';
const googleClientEmail = process.env.GCP_CLIENT_EMAIL;
const googlePrivateKey = process.env.GCP_PRIVATE_KEY;
const googlePrivateKeyId = process.env.GCP_PRIVATE_KEY_ID;

const googleAuthOptions =
  googleClientEmail && googlePrivateKey
    ? {
        credentials: {
          client_email: googleClientEmail,
          private_key: googlePrivateKey.replace(/\\n/g, '\n'),
          private_key_id: googlePrivateKeyId,
        },
      }
    : undefined;

export const google = createVertex({
  fetch: proxyFetch,
  googleAuthOptions,
  project: vertexProject,
  location: vertexLocation,
});
