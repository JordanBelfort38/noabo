# No Abo - Claude Code Instructions

## Project Context
Subscription management platform to help French users track and cancel subscriptions.

## Team Guidelines

### Frontend Developer
- **ALWAYS** use the `/frontend-design` skill before creating any UI component
- Follow design system: Blue primary (#3B82F6), Shadcn/ui, Tailwind CSS
- Mobile-first responsive design
- WCAG 2.1 AA accessibility compliance
- French language for all UI text

### Backend Developer
- Use Prisma for database operations
- Encrypt sensitive data (bank tokens) with AES-256
- Rate limiting on all auth endpoints
- GDPR compliance for all user data

### SEO Expert
- Optimize for French search terms
- Core Web Vitals targets: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Security headers in next.config.ts

## Skills to Use
- Frontend: `/frontend-design` for all UI components
- Testing: `/test` for component testing
