# Adding Custom Bottle Images

## Quick Guide

Place your bottle images in the `public/images/` directory with these filenames:

- `bottle-20l.jpg` - Image for 20L water bottle
- `bottle-10l.jpg` - Image for 10L water bottle

## Image Requirements

- **Format:** JPG, PNG, or WebP
- **Recommended size:** 300x400 pixels (portrait orientation)
- **Max file size:** 500KB for faster loading
- **Background:** Transparent or white background works best

## Adding Images

### Option 1: Use Your Own Images

1. Take or find photos of your water bottles
2. Rename them to `bottle-20l.jpg` and `bottle-10l.jpg`
3. Copy them to `/Users/anupamprasad/Documents/Projects/Amrut-Bot/public/images/`
4. Restart the bot server

### Option 2: Use Placeholder Images

The bot will automatically show a placeholder SVG if images are not found.

### Option 3: Use External URLs

Edit `src/flows/newOrderFlow.js` and change the image URLs:

```javascript
images: [
  {
    url: 'https://your-cdn.com/bottle-20l.jpg',
    caption: '1️⃣ 20L Bottle',
    type: '20L'
  },
  {
    url: 'https://your-cdn.com/bottle-10l.jpg',
    caption: '2️⃣ 10L Bottle',
    type: '10L'
  }
]
```

## Where Images Appear

Images will be displayed:
- ✅ Web chat interface (http://localhost:3000)
- ✅ WhatsApp (when configured with proper media sending)
- ✅ Any client consuming the webhook API

## Testing

1. Start the bot: `npm start`
2. Open http://localhost:3000
3. Login and select "Place New Order"
4. You should see clickable bottle images

## Current Image Locations

- 20L Bottle: `/images/bottle-20l.jpg`
- 10L Bottle: `/images/bottle-10l.jpg`

Full path: `/Users/anupamprasad/Documents/Projects/Amrut-Bot/public/images/`

## Customizing Further

To add more bottle types or change the selection:

1. Edit `src/flows/newOrderFlow.js`
2. Find the `startNewOrder()` function
3. Modify the `images` array
4. Update bottle types in database schema if needed
