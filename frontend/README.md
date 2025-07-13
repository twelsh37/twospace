This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Logging and Audit Trail

This project uses [Winston](https://github.com/winstonjs/winston) for robust server-side logging. Logs are written to the `/logs/` directory and are rotated daily (30 days retained). There are two log types:

- **System Logs**: For infrastructure, API, and error events (`system.log_YYYYMMDD.log`)
- **Application Logs**: For business logic, user actions, and workflow events (`app.log_YYYYMMDD.log`)

### How Logging Works

- All API routes and server-side utilities are instrumented with logging.
- Logs are written to both file and console (in development).
- Log files are rotated daily and old logs are automatically deleted after 30 days.
- **Winston is only used server-side.** No client-side logging with Winston.

### How to Use Logs

- **Admins**: Use logs to audit system activity, investigate errors, and monitor usage.
- **Users**: If you encounter an error, provide the relevant log file to the admin for troubleshooting.
- **Log Location**: `/logs/`
- **Log Review**: Open log files with any text editor. Search for timestamps, error messages, or user actions.

### Example Log Entry

```
{"level":"info","message":"Asset created","timestamp":"2024-06-12T10:00:00.000Z","assetId":"01-12345"}
```

## PDF Export and Reporting

- Asset Inventory reports can be exported as PDFs with all charts and tables included, exactly as seen on the screen.
- The export modal provides a simple, robust user experience for exporting reports.
- Recent bugfixes ensure that React state and hooks are used correctly, preventing errors and infinite loops during export.
- The export workflow is modular and ready for future extension to other report types.
