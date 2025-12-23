# VOD AWS MVP - Turbo Monorepo

This is a Turbo monorepo containing a Next.js video on demand application built with AWS services.

## Project Structure

```
.
├── apps/
│   └── web/          # Next.js application
├── packages/         # Shared packages (future)
├── turbo.json        # Turbo configuration
└── package.json      # Root package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 10+

### Installation

1. Install dependencies from the root:

```bash
npm install
```

This will install dependencies for all workspaces.

### Development

Run the development server:

```bash
npm run dev
```

This will start the Next.js app in development mode using Turbo.

### Building

Build all apps:

```bash
npm run build
```

### Other Commands

- `npm run lint` - Lint all apps
- `npm run start` - Start production server
- `npm run clean` - Clean build artifacts

## Workspaces

### apps/web

The main Next.js application for video upload and streaming.

**Features:**
- Upload videos directly to S3 using presigned URLs
- Process videos with AWS Lambda and MediaConvert
- Stream videos using HLS (HTTP Live Streaming)
- Built with Next.js, React, and AWS services

**Environment Variables:**

Create a `.env.local` file in `apps/web/` with:

```
AWS_API_BASE_URL=your-api-gateway-url
```

## Deployment

The monorepo is configured to work with Vercel. Deploy the `apps/web` directory as your Next.js application.

## Tech Stack

- **Framework:** Next.js 16
- **Monorepo:** Turbo
- **Language:** TypeScript
- **Styling:** CSS Modules
- **Video Streaming:** HLS.js
