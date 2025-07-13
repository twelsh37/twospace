## Error Handling and Trapping Strategy

This application implements robust error trapping and user-friendly error handling across all major pages and client components:

- All critical client components are wrapped in an ErrorBoundary for runtime error trapping.
- User-facing error messages are always clear, actionable, and never technical.
- Data fetch and rendering errors are handled gracefully with user-friendly fallback UI.
- No technical or system errors are surfaced to end users; all errors are logged and/or displayed in a non-confusing manner.
- The error handling strategy is documented in code comments and follows best practices for React, Next.js, and TypeScript.

For more details, see the CHANGELOG and code comments in each major page/component.
