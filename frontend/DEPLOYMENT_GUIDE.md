# Deployment Guide - AI-Driven Development Showcase

## Overview

This guide will help you deploy your AI-Driven Development Showcase slide deck to Vercel for public presentation to stakeholders, CTOs, developers, and marketers.

## Quick Deploy to Vercel

### Option 1: Deploy from GitHub (Recommended)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add AI development showcase slide deck"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your repository
   - Vercel will automatically detect it's a Next.js project
   - Click "Deploy"

3. **Access your slides**:
   - Your slides will be available at: `https://your-project.vercel.app/slides`

### Option 2: Deploy from Command Line

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy from your project directory**:
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Follow the prompts**:
   - Link to existing project or create new
   - Confirm deployment settings
   - Wait for deployment to complete

## Environment Setup

### Required Environment Variables

Make sure these are set in your Vercel project settings:

```env
# Database (if you want to show live data)
DATABASE_URL=your_database_url

# Supabase (if you want to show auth features)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Optional: Environment Variables for Demo

If you want to show the full application capabilities:

```env
# For PDF generation demo
BROWSERLESS_API_KEY=your_browserless_api_key

# For email functionality
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
```

## Custom Domain (Optional)

1. **Add custom domain in Vercel**:
   - Go to your project settings in Vercel
   - Navigate to "Domains"
   - Add your custom domain (e.g., `slides.yourcompany.com`)

2. **Configure DNS**:
   - Add the CNAME record provided by Vercel
   - Wait for DNS propagation (can take up to 24 hours)

## Presentation Tips

### For Live Presentations

1. **Use the auto-play feature**:
   - Click the "Auto" button in the top-right
   - Slides will advance every 8 seconds automatically

2. **Keyboard shortcuts**:
   - **Right Arrow** or **Spacebar**: Next slide
   - **Left Arrow**: Previous slide

3. **Mobile-friendly**:
   - Share your phone screen for mobile demonstrations
   - Swipe left/right to navigate

### For Remote Presentations

1. **Screen sharing**:
   - Share your browser tab with the slides
   - Use full-screen mode for best presentation

2. **Recording**:
   - Use screen recording software to capture the presentation
   - The auto-play feature works great for recorded demos

## Analytics and Tracking

### Add Google Analytics (Optional)

1. **Create a Google Analytics property** for your slide deck

2. **Add tracking code** to your layout:
   ```tsx
   // In app/slides/layout.tsx
   import Script from 'next/script'

   export default function SlidesLayout({ children }) {
     return (
       <>
         <Script
           src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
           strategy="afterInteractive"
         />
         <Script id="google-analytics" strategy="afterInteractive">
           {`
             window.dataLayer = window.dataLayer || [];
             function gtag(){dataLayer.push(arguments);}
             gtag('js', new Date());
             gtag('config', 'GA_MEASUREMENT_ID');
           `}
         </Script>
         {children}
       </>
     )
   }
   ```

## Performance Optimization

### Pre-deployment Checklist

- [ ] All tests pass: `yarn test`
- [ ] Build succeeds: `yarn build`
- [ ] No console errors in development
- [ ] Images are optimized
- [ ] Environment variables are set

### Performance Monitoring

1. **Vercel Analytics**:
   - Automatically included with Vercel deployment
   - Monitor Core Web Vitals
   - Track user engagement

2. **Lighthouse Audit**:
   - Run Lighthouse on your deployed slides
   - Ensure 90+ performance score
   - Optimize any issues found

## Troubleshooting

### Common Issues

1. **Build fails**:
   - Check for TypeScript errors: `yarn type-check`
   - Ensure all dependencies are installed: `yarn install`
   - Verify environment variables are set

2. **Slides not loading**:
   - Check browser console for errors
   - Verify the `/slides` route is accessible
   - Clear browser cache

3. **Mobile issues**:
   - Test on actual mobile devices
   - Check touch event handling
   - Verify responsive design

### Support

If you encounter issues:

1. **Check Vercel logs** in your project dashboard
2. **Review browser console** for client-side errors
3. **Test locally** with `yarn dev` to isolate issues

## Success Metrics

After deployment, track these metrics:

- **Page views**: How many people view the slides
- **Engagement time**: How long people spend on each slide
- **Completion rate**: How many people reach the final slide
- **Feedback**: Qualitative feedback from stakeholders

## Next Steps

Once deployed, consider:

1. **Sharing with stakeholders**:
   - Send the URL to CTOs, developers, and marketers
   - Include in your AI adoption proposals
   - Use in sales presentations

2. **Collecting feedback**:
   - Add a feedback form to the final slide
   - Track engagement metrics
   - Iterate based on stakeholder input

3. **Expanding the showcase**:
   - Add more technical details
   - Include code examples
   - Show before/after comparisons

---

**Your AI-Driven Development Showcase is now ready to impress stakeholders and demonstrate the power of generative AI in software development!**