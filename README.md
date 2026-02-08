# VOD AWS MVP

A video-on-demand streaming MVP. Users upload videos, they get transcoded to HLS, and streamed via CloudFront. Turbo monorepo: Next.js app in `apps/web`, AWS Lambda handlers in `apps/lambdas`. Backend is serverless on AWS; the frontend calls API Gateway (Next.js API routes in the repo proxy to it).

**Pipeline:** Frontend requests a presigned S3 URL from API Gateway (`upload-init` Lambda). That Lambda creates a `videoId`, writes a **PENDING** row in DynamoDB, returns the presigned URL. User uploads the file straight to the uploads bucket. S3 triggers the `transcode-trigger` Lambda, which starts a MediaConvert HLS job (output goes to an S3 outputs bucket, one folder per `videoId`). DynamoDB status → **PROCESSING**. When MediaConvert finishes, EventBridge runs the `mediaconvert-notify` Lambda, which sets the row to **READY** with the path to `index.m3u8` or to **ERROR**. `get-video` Lambda returns one video by ID plus a CloudFront playback URL. `list-videos` Lambda scans DynamoDB with pagination (`nextToken`) for the infinite-scroll list. CloudFront serves the outputs bucket (Origin Access Control, bucket private). WAF on CloudFront. IAM least-privilege per Lambda.

**Repo:**

- **`apps/web`** — Next.js App Router app: upload page, videos list, video watch page with HLS player and quality selector. API routes under `app/api` proxy to AWS.
- **`apps/lambdas`** — One package per Lambda: `upload-init`, `transcode-trigger`, `mediaconvert-notify`, `get-video`, `list-videos`. TypeScript, build to `dist`, deployed by GitHub Actions on push to `main` when `apps/lambdas` changes (`vod-<name>` in eu-central-1, Node 24).
- **`packages`** — Reserved for shared code (unused in this MVP).

## Getting started

- **Prerequisites:** Node.js 18+, npm 10+.
- From repo root: `npm install`. Copy `.env.local.example` to `apps/web/.env.local`, set `AWS_API_BASE_URL`.
- `npm run dev` — run the web app.  
  `npm run build` | `npm run start` | `npm run lint` | `npm run clean`.

## Deployment

- Deploy `apps/web` to Vercel (or similar).
- Lambdas deploy via GitHub Actions on push to `main` when `apps/lambdas` changes. Set repo secret **AWS_ROLE_ARN** for AWS OIDC.

## Tech stack

- **Frontend:** Next.js 16, TypeScript, Turbo, CSS Modules, HLS.js.
- **Backend (AWS):** API Gateway, Lambda, S3, DynamoDB, MediaConvert, EventBridge, CloudFront, WAF.
