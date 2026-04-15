# Robin Photo - Technical Specification

## Overview
Robin Photo is a modern, elegant personal photo sharing website built with vanilla JavaScript and Firebase. It provides users with a clean, intuitive interface for managing events and sharing photos.

## Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Hosting**: Firebase Hosting

## File Structure
```
Robin Photo/
├── index.html          # Main HTML structure (Firebase SDK via CDN)
├── style.css           # Complete styling
├── app.js              # All JavaScript logic
├── SPEC.md             # This specification
├── firestore.rules     # Firestore security rules
├── storage.rules       # Storage security rules
└── firebase.json       # Firebase hosting config
```

## Firebase Configuration
### Firestore Collections

#### users/{userId}
```javascript
{
  email: string,
  displayName: string,
  photoURL: string,
  createdAt: timestamp
}
```

#### events/{eventId}
```javascript
{
  userId: string,
  name: string,
  description: string,
  date: timestamp,
  coverImage: string,
  isPublic: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### photos/{photoId}
```javascript
{
  userId: string,
  eventId: string,
  url: string,
  caption: string,
  createdAt: timestamp
}
```

### Storage Structure
```
/photos/{userId}/{eventId}/{photoId}.{ext}
```

## Design System

### Colors
**Light Mode:**
- Background: #ffffff (primary), #f8fafc (secondary)
- Text: #0f172a (primary), #64748b (secondary)
- Primary: #6366f1 (Indigo)
- Accent: #8b5cf6 (Purple)
- Success: #10b981
- Error: #ef4444
- Border: #e2e8f0

**Dark Mode:**
- Background: #0f172a (primary), #1e293b (secondary)
- Text: #f8fafc (primary), #94a3b8 (secondary)
- Primary: #818cf8 (Light Indigo)
- Accent: #a78bfa (Light Purple)
- Border: #334155

### Typography
- Font Family: 'Inter', system-ui, sans-serif
- Headings: 700 weight
- Body: 400 weight
- Small: 500 weight

### Spacing
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)

### Border Radius
- sm: 4px
- md: 8px
- lg: 12px
- xl: 16px
- full: 9999px

## Features

### 1. Authentication
- Email/Password registration and login
- Google Sign-In integration
- Session persistence
- Protected routes with redirect
- User profile display in navbar

### 2. Events Management
- Create event with name, description, date, cover image
- View events in responsive grid layout
- Update event details
- Delete event with confirmation (cascades to photos)
- Toggle public/private visibility

### 3. Photo Management
- Drag & drop multi-file upload
- Click to select files
- Client-side image compression
- Individual and batch upload progress
- Inline caption editing
- Delete photos with confirmation

### 4. Gallery Features
- Responsive masonry/grid layout
- Lazy loading with Intersection Observer
- Lightbox modal for full-size viewing
- Previous/Next navigation in lightbox
- Keyboard navigation (Esc, arrows)

### 5. Dashboard
- Total events count
- Total photos count
- Quick action buttons
- Recent events list

### 6. Search & Filter
- Real-time search by event name
- Sort by date (newest/oldest)
- Filter by visibility

### 7. Sharing
- Public/private toggle per event
- Shareable links for public events
- Direct download functionality

### 8. UI/UX
- Dark/Light mode toggle
- System preference detection
- Toast notifications
- Loading skeletons
- Confirmation modals
- Smooth animations (300ms transitions)

## Security Rules

### Firestore Rules
- Users can only read/write their own data
- Public events readable by anyone
- Events must have valid userId
- Photos must have valid eventId

### Storage Rules
- Users can only upload to their own folder
- File size limit: 10MB
- Allowed types: image/jpeg, image/png, image/webp

## Performance Optimizations
- Lazy loading images with Intersection Observer
- Client-side image compression before upload
- Debounced search input
- Async/await for all Firebase calls
- Error boundary handling
- Loading states for all async operations

## Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Deployment
- Firebase Hosting
- SSL enabled by default
- Single-page app support
- Clean URLs with rewrites
