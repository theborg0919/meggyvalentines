# Mobile-First Valentine Webapp

Single-play style Valentine experience built with plain HTML/CSS/JS.

## What It Includes
- Intro screen
- Story scenes with photos
- Mini-game 1: Heart Catch (20s tap challenge)
- Mini-game 2: Memory Match (4 pairs)
- Final letter reveal
- Soft single-play behavior (completed landing + replay options)

## File Structure
- `index.html`
- `styles.css`
- `app.js`
- `content.config.js`
- `assets/photos/` (put your photos here)
- `assets/ui/` (optional extras)
- `.nojekyll`

## Personalization
Edit `content.config.js`:
- `appMeta.recipientName`
- `appMeta.senderName`
- `uiText` (all interface text across welcome, scenes UI labels, mini-games, final/replay, and missing-image messages)
- `scenes[*].title` and `scenes[*].message`
- `finalLetter.title` and `finalLetter.message`
- `captions`

`finalLetter.message` accepts either:
- A single string (recommended): use one text block, and separate paragraphs with a blank line.
- An array of lines (legacy format).

## Photo Naming Rules (Required)
1. Put all photos in `assets/photos/`.
2. Use names `photo-01` through `photo-12` with zero-padding.
3. Allowed extensions: `.jpg`, `.jpeg`, `.png`, `.webp`.
4. Update `photos` array in `content.config.js` with exact filenames in desired order.

Example:
```js
photos: [
  "photo-01.jpg",
  "photo-02.webp",
  "photo-03.png",
  "photo-04.jpeg",
  "photo-05.jpg",
  "photo-06.jpg",
  "photo-07.jpg",
  "photo-08.jpg",
  "photo-09.jpg",
  "photo-10.jpg",
  "photo-11.jpg",
  "photo-12.jpg",
]
```

## Run Locally
You can open `index.html` directly, but a local server is recommended.

PowerShell option:
```powershell
cd "c:\Users\hyuns\Meggy Valentines"
python -m http.server 8080
```

Then open:
- `http://localhost:8080`

## Deployment (GitHub Pages)
1. Push this folder to a GitHub repository.
2. In GitHub repo settings, open `Pages`.
3. Set source to `Deploy from a branch`.
4. Choose branch `main` and folder `/ (root)`.
5. Save and wait for publish.
6. Use the generated URL to share.

## Persistence Behavior
- Completion key: `valentine_v1_completed`
- Progress key: `valentine_v1_progress`

If you want to reset manually, clear site local storage in browser dev tools.
