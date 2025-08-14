# CAPS Tutor Bot Customization Guide

## Quick Theme Customizer

Your tutor bot includes a built-in theme customizer that you can access by clicking the palette icon (🎨) in the header. This gives you:

### 1. **Quick Color Themes**
- **Ocean Blue**: Professional blue tones
- **Forest Green**: Nature-inspired greens
- **Sunset Orange**: Warm orange palette
- **Purple Magic**: Creative purple scheme
- **South African**: Green, yellow, and red inspired by SA flag

### 2. **Custom Colors**
- **Primary Color**: Main buttons and highlights
- **Secondary Color**: Subject cards and accents
- **Accent Color**: Success states and special elements

### 3. **Bot Avatar Options**
- 🤖 Robot (default)
- 👩‍🏫 Teacher
- 🎓 Graduate
- 📚 Book
- 🦉 Owl

### 4. **Typography & Layout**
- **Font Size**: 12px to 20px
- **Border Radius**: 0px to 20px (controls roundness)
- **Chat Style**: Bubbles, Minimal, or Classic

---

## Advanced Customization (Code Level)

### Editing Colors in CSS

To make permanent color changes, edit `client/src/index.css`:

```css
:root {
  --primary: hsl(207, 90%, 54%);        /* Main blue */
  --secondary: hsl(160, 84%, 39%);      /* Green */
  --accent: hsl(45, 93%, 47%);          /* Yellow */
  --light-gray: hsl(210, 17%, 98%);     /* Background */
  --neutral: hsl(215, 16%, 47%);        /* Text gray */
}
```

### Custom Subject Icons

Edit `client/src/lib/types.ts` to change subject icons:

```typescript
export const SUBJECTS = [
  { id: 'mathematics', name: 'Mathematics', icon: 'calculator' },
  { id: 'english', name: 'English', icon: 'book-open' },
  // Change 'calculator' to any FontAwesome icon name
] as const;
```

### Chat Message Styling

Modify `client/src/components/chat-interface.tsx` for message appearance:

```typescript
// User messages
className="bg-primary text-white rounded-tr-sm"

// Bot messages  
className="bg-light-gray text-gray-800 rounded-tl-sm"
```

### Header Customization

Edit `client/src/components/app-header.tsx`:

```typescript
// Change app title
<h1>Your Custom Title</h1>

// Change subtitle
<p>Your Custom Subtitle</p>

// Change logo icon
<i className="fas fa-your-icon text-white text-lg" />
```

---

## Layout Customization

### Sidebar Width

In `client/src/pages/home.tsx`, modify the grid:

```typescript
// Current: sidebar takes 1 column, chat takes 3
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

// Make sidebar wider: 2 columns for sidebar, 2 for chat
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <div className="lg:col-span-2">  {/* Sidebar */}
  <div className="lg:col-span-2">  {/* Chat */}
```

### Chat Height

Adjust chat window height in `client/src/components/chat-interface.tsx`:

```typescript
// Current height
<Card className="h-[calc(100vh-200px)]">

// Taller chat
<Card className="h-[calc(100vh-150px)]">

// Fixed height
<Card className="h-[600px]">
```

---

## Adding Custom Branding

### Logo Replacement

1. Add your logo to `client/public/` folder
2. Update header component:

```typescript
// Replace icon with image
<img src="/your-logo.png" alt="Logo" className="w-10 h-10" />
```

### Custom Fonts

1. Add font imports to `client/index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Your+Font:wght@400;600;700&display=swap" rel="stylesheet">
```

2. Update `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    fontFamily: {
      'custom': ['Your Font', 'sans-serif'],
    }
  }
}
```

3. Apply in components:

```typescript
<div className="font-custom">Your text</div>
```

---

## Quick Actions Customization

Edit `client/src/lib/types.ts` to modify quick action buttons:

```typescript
export const QUICK_ACTIONS: QuickAction[] = [
  { type: 'example', label: 'Show Example', icon: 'lightbulb' },
  { type: 'simpler', label: 'Simplify', icon: 'question-circle' },
  { type: 'test', label: 'Quiz Me', icon: 'check-circle' },
  // Add your custom actions
];
```

---

## Dark Mode Support

Your bot includes automatic dark mode support. Users can toggle it, and all components will adapt. To customize dark mode colors, edit the `.dark` section in `client/src/index.css`.

---

## Mobile Responsiveness

The bot is fully responsive. To customize mobile behavior:

### Hide Elements on Mobile
```typescript
<div className="hidden sm:block">Desktop only</div>
```

### Mobile-Specific Styling
```typescript
<div className="text-sm sm:text-lg">Responsive text</div>
```

### Mobile Chat Layout
The floating chat button appears only on mobile (`lg:hidden` class).

---

## Performance Tips

1. **Images**: Optimize any custom images (use WebP format)
2. **Icons**: Stick to FontAwesome for consistency
3. **Colors**: Use CSS variables for easy theming
4. **Animations**: Keep animations subtle for better performance

---

## Troubleshooting

### Theme Not Applying
- Check browser console for errors
- Clear localStorage: `localStorage.clear()`
- Refresh the page

### Icons Not Showing
- Verify FontAwesome is loaded
- Check icon names at fontawesome.com
- Use `fas fa-icon-name` format

### Layout Issues
- Check Tailwind classes are correct
- Ensure grid columns add up correctly
- Test on different screen sizes

---

## Getting Help

The customization system is designed to be user-friendly. Start with the built-in theme customizer, then move to code-level changes for more advanced customization.

Remember to test your changes on different devices and screen sizes to ensure a good user experience for all students!