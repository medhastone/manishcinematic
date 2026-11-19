# Manish Cinematic — Wedding Photography & Cinematography Studio

**Dream • Shoot • Create** — Begusarai, Bihar

## Automatic Deployment on GitHub Pages

This repository includes a pre-configured GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys the site whenever you push to `main` or `master`.

### One-Time Setup on GitHub

1. Push this project to your GitHub repository (`main` or `master` branch).
2. Open your repository on GitHub and go to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. Push any commit (or go to **Actions → Deploy Manish Cinematic to GitHub Pages → Run workflow**) — your live site will publish automatically.

### Full-Stack Mode (Optional)

By default, running `npm run build` builds the full-stack Next.js standalone server (with PostgreSQL/Cloud SQL API routes for `/api/bookings`, `/api/reviews`, `/api/catalog`, and `/api/maps-embed`). When built by the GitHub Pages workflow (`GITHUB_PAGES=true`), the app exports a static site into `./out` with automatic browser fallbacks for Google Maps, free FormSubmit booking emails, and client reviews.
