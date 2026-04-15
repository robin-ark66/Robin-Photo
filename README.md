# Robin Photo

A modern, elegant personal photo sharing website built with HTML, CSS, JavaScript, and Firebase.

![Robin Photo](https://via.placeholder.com/800x400?text=Robin+Photo)

## Features

- **Authentication**: Email/Password and Google Sign-In
- **Events Management**: Create, view, edit, and delete events
- **Photo Management**: Upload, view, caption, and delete photos
- **Modern UI**: Dark/Light mode, responsive design, smooth animations
- **Gallery**: Lightbox view, lazy loading, masonry layout
- **Sharing**: Public/private events with shareable links
- **Search & Filter**: Search events by name, sort by date
- **Dashboard**: Overview of events and photos with quick actions
- **Download**: Download individual or all photos

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Hosting**: Firebase Hosting

## Project Structure

```
Robin Photo/
├── index.html          # Main HTML structure (Firebase SDK loaded via CDN)
├── style.css           # Complete styling with dark/light mode
├── app.js              # All JavaScript logic
├── firebase.json       # Firebase hosting config
├── firestore.rules     # Firestore security rules
├── firestore.indexes.json
├── storage.rules       # Storage security rules
├── SPEC.md             # Technical specification
└── README.md           # This file
```

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Give your project a name (e.g., "robin-photo")

### 2. Enable Authentication

1. In your Firebase project, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. Enable **Google** provider

### 3. Create Firestore Database

1. Go to **Firestore Database** > **Create database**
2. Choose **Start in test mode** (for development)
3. Select a location close to your users
4. For production, apply the rules from `firestore.rules`

### 4. Enable Storage

1. Go to **Storage** > **Get started**
2. Choose **Start in test mode** (for development)
3. For production, apply the rules from `storage.rules`

### 5. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname
5. Copy the Firebase SDK configuration

### 6. Firebase Configuration

Firebase SDK is loaded via CDN in `index.html`. The configuration is already set up for your project (`robin-photo-5628a`).

To use with a different project, update the Firebase config in `index.html`:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

## Local Development

### Using a Local Server

Since this project uses ES6 modules (`import/export`), you need to serve the files through a local server:

**Option 1: Python**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Option 2: Node.js**
```bash
npx serve
```

**Option 3: VS Code Live Server**
- Install the "Live Server" extension
- Right-click on `index.html` and select "Open with Live Server"

**Option 4: Firebase Emulator** (recommended for Firebase development)
```bash
npm install -g firebase-tools
firebase init emulators
firebase emulators:start
```

### Running Tests

No automated tests are included yet. Manual testing is recommended.

## Deployment

### Deploy to Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init
```
Select:
- Hosting: Configure files for Firebase Hosting
- Firestore: Deploy rules and indexes
- Storage: Deploy rules

4. Deploy:
```bash
firebase deploy
```

Your site will be live at `https://YOUR_PROJECT_ID.web.app`

### Alternative Hosting

This is a static site and can be hosted on any hosting platform:
- Netlify
- Vercel
- GitHub Pages
- Amazon S3 + CloudFront

## Security Considerations

### Firestore Rules

The included `firestore.rules` ensures:
- Users can only access their own data
- Public events are readable by anyone
- Only event owners can modify events
- Photo operations are restricted to the owner

### Storage Rules

The included `storage.rules` ensures:
- Users can only upload files to their own folders
- Only image files are allowed
- File size is limited to 10MB

### Production Checklist

- [ ] Enable Firebase App Check
- [ ] Set up rate limiting
- [ ] Configure CORS for storage
- [ ] Set up analytics
- [ ] Enable Cloud Audit Logs
- [ ] Review and optimize Firestore indexes

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance

- Lazy loading images with Intersection Observer
- Client-side image compression before upload
- Async/await for all Firebase operations
- Debounced search input
- Optimized CSS with CSS variables

## Customization

### Changing Colors

Edit the CSS variables in `style.css`:

```css
:root {
    --color-primary: #6366f1;
    --color-primary-hover: #4f46e5;
    --color-accent: #8b5cf6;
    /* ... */
}
```

### Changing Fonts

Update the Google Fonts link in `index.html` and the font family in `style.css`.

### Adding New Features

1. Add new Firestore collections in `firebase.js`
2. Add new UI elements in `index.html`
3. Add new styles in `style.css`
4. Add new logic in `app.js`

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify Firebase configuration
3. Check Firestore/Storage rules
4. Open an issue on GitHub

## Acknowledgments

- Design inspired by Google Photos and Unsplash
- Icons from Heroicons
- Fonts from Google Fonts (Inter)
