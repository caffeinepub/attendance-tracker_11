# World of Origami

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Product Catalog: Browse origami paper packs, kits, and tools. Filter by type and skill level. Product detail view.
- Tutorial Library: Step-by-step folding guides with difficulty ratings (Beginner / Intermediate / Advanced). Categories: Animals, Flowers, Geometric, Modular.
- Community Gallery: Users submit photos (title + description + image URL) of finished creations. Like and comment on submissions.
- Suggestion Box: Anyone can submit ideas for new tutorials or products. Admin can mark suggestions as "Under Consideration" or "Coming Soon" or dismiss them.
- Admin Panel: Protected by hardcoded credentials. Two admins: Raghav (password: Border@4321) and Kayan (password: password). Admin can add/edit/remove products, tutorials, gallery submissions, and manage suggestions.

### Modify
- Nothing (new project).

### Remove
- Nothing (new project).

## Implementation Plan

### Backend (Motoko)
- Data types: Product, Tutorial, GallerySubmission, Suggestion, AdminCredential
- CRUD for products (admin only)
- CRUD for tutorials (admin only)
- CRUD for gallery submissions (public create, admin manage)
- Gallery likes (public)
- CRUD for suggestions (public create, admin update status/delete)
- Simple hardcoded admin auth check (Raghav/Border@4321, Kayan/password)

### Frontend (React)
- Public pages: Home, Product Catalog, Tutorial Library, Community Gallery, Suggestion Box
- Admin login page with credential check against backend
- Admin dashboard: manage products, tutorials, gallery, suggestions
- Navigation with clear sections
- Responsive layout
