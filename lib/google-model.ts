import { createVertex } from '@ai-sdk/google-vertex';
import { proxyFetch } from './proxy-fetch';

const vertexProject = process.env.GOOGLE_VERTEX_PROJECT;
const vertexLocation = process.env.GOOGLE_VERTEX_LOCATION ?? 'global';
const googleClientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const googlePrivateKey = process.env.GOOGLE_PRIVATE_KEY;
const googlePrivateKeyId = process.env.GOOGLE_PRIVATE_KEY_ID;

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
