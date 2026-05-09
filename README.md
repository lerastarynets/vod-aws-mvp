# VOD AWS MVP

Serverless video-on-demand MVP on AWS. Users upload videos, the pipeline transcodes them to HLS, and playback is delivered through CloudFront.

## What this project does

- Accepts video uploads from the web app using presigned S3 URLs.
- Triggers automatic transcoding with MediaConvert.
- Tracks video lifecycle in DynamoDB (`PENDING` -> `PROCESSING` -> `READY` / `ERROR`).
- Serves video metadata and playback URLs through API Gateway + Lambda.
- Streams HLS output through CloudFront.

## Repository layout

- **`apps/web`** — Next.js App Router frontend (upload page, videos list, single video page with HLS player).
- **`apps/lambdas`** — Lambda packages:
  - `upload-init`
  - `transcode-trigger`
  - `mediaconvert-notify`
  - `get-video`
  - `list-videos`
- **`packages`** — Shared packages (reserved for future use).

## API and data flow

- The frontend calls Next.js API routes under `apps/web/app/api/*`.
- Those routes proxy to AWS API Gateway using `AWS_API_BASE_URL`.
- `upload-init` creates a `videoId`, writes a DynamoDB item with `entityType = VIDEO`, and returns a presigned upload URL.
- `transcode-trigger` starts a MediaConvert job when a new file lands in S3.
- `mediaconvert-notify` updates DynamoDB with final status and `outputKey`.
- `list-videos` reads newest-first using a DynamoDB GSI `Query` with pagination (`nextToken`).
- `get-video` returns one video and a CloudFront playback URL when ready.

## Getting started

- Prerequisites: Node.js 18+, npm 10+.
- Install dependencies from repo root:
  - `npm install`
- Configure web app environment variables in `apps/web/.env.local`:
  - `AWS_API_BASE_URL=<your-api-gateway-base-url>`
- Run locally:
  - `npm run dev`
- Other commands:
  - `npm run build`
  - `npm run start`
  - `npm run lint`
  - `npm run clean`

## Deployment

- Frontend: deploy `apps/web` to Vercel (or equivalent).
- Lambdas: GitHub Actions deploys changed Lambda packages on push to `main` when files under `apps/lambdas/**` change.
- GitHub Actions requires `AWS_ROLE_ARN` secret for AWS OIDC auth.

## Documentation

- Full architecture, diagrams, ADRs, and observability details: [`ARCHITECTURE.md`](./ARCHITECTURE.md)

## Tech stack

- Frontend: Next.js 16, React 18, TypeScript, HLS.js
- Backend: API Gateway, Lambda, S3, DynamoDB, MediaConvert, EventBridge, CloudFront, WAF
- Tooling: Turbo monorepo, GitHub Actions
