const fs = require('fs');
const path = require('path');

// Color mapping from old to new semantic classes
const colorMap = {
  // Neutral colors -> semantic colors
  'text-neutral-50': 'text-background',
  'text-neutral-100': 'text-background/90',
  'text-neutral-200': 'text-background/80',
  'text-neutral-300': 'text-muted-foreground/70',
  'text-neutral-400': 'text-muted-foreground/60',
  'text-neutral-500': 'text-muted-foreground',
  'text-neutral-600': 'text-muted-foreground',
  'text-neutral-700': 'text-foreground/80',
  'text-neutral-800': 'text-foreground/90',
  'text-neutral-900': 'text-foreground',
  'bg-neutral-50': 'bg-background',
  'bg-neutral-100': 'bg-background/80',
  'bg-neutral-200': 'bg-secondary',
  'bg-neutral-300': 'bg-secondary/80',
  'bg-neutral-400': 'bg-secondary/60',
  'bg-neutral-500': 'bg-secondary/40',
  'bg-neutral-600': 'bg-secondary/20',
  'bg-neutral-700': 'bg-secondary/10',
  'bg-neutral-800': 'bg-card',
  'bg-neutral-900': 'bg-card',

  // Red colors -> error
  'text-red-50': 'text-destructive/10',
  'text-red-100': 'text-destructive/20',
  'text-red-200': 'text-destructive/40',
  'text-red-300': 'text-destructive/60',
  'text-red-400': 'text-destructive/80',
  'text-red-500': 'text-destructive',
  'text-red-600': 'text-destructive',
  'text-red-700': 'text-destructive',
  'text-red-800': 'text-destructive',
  'text-red-900': 'text-destructive',
  'bg-red-50': 'bg-destructive/10',
  'bg-red-100': 'bg-destructive/15',
  'bg-red-200': 'bg-destructive/20',
  'bg-red-300': 'bg-destructive/25',
  'bg-red-400': 'bg-destructive/30',
  'bg-red-500': 'bg-destructive/40',
  'bg-red-600': 'bg-destructive/50',
  'bg-red-700': 'bg-destructive/60',
  'bg-red-800': 'bg-destructive/80',
  'bg-red-900': 'bg-destructive',
  'border-red-50': 'border-destructive/20',
  'border-red-200': 'border-destructive/30',
  'border-red-800': 'border-destructive/50',

  // Blue colors -> primary/info
  'text-blue-50': 'text-info/20',
  'text-blue-100': 'text-info/30',
  'text-blue-200': 'text-info/40',
  'text-blue-300': 'text-info/60',
  'text-blue-400': 'text-info/80',
  'text-blue-500': 'text-info',
  'text-blue-600': 'text-info',
  'text-blue-700': 'text-info',
  'text-blue-800': 'text-info',
  'text-blue-900': 'text-info',
  'bg-blue-50': 'bg-info/10',
  'bg-blue-100': 'bg-info/15',
  'bg-blue-200': 'bg-info/20',
  'bg-blue-300': 'bg-info/30',
  'bg-blue-400': 'bg-info/40',
  'bg-blue-500': 'bg-info/50',
  'bg-blue-600': 'bg-info/60',
  'bg-blue-700': 'bg-info/70',
  'bg-blue-800': 'bg-info/80',
  'bg-blue-900': 'bg-info/90',
  'border-blue-50': 'border-info/20',
  'border-blue-200': 'border-info/30',
  'border-blue-800': 'border-info/50',

  // Green colors -> success
  'text-green-50': 'text-success/20',
  'text-green-100': 'text-success/30',
  'text-green-200': 'text-success/40',
  'text-green-300': 'text-success/60',
  'text-green-400': 'text-success/80',
  'text-green-500': 'text-success',
  'text-green-600': 'text-success',
  'text-green-700': 'text-success',
  'text-green-800': 'text-success',
  'text-green-900': 'text-success',
  'bg-green-50': 'bg-success/10',
  'bg-green-100': 'bg-success/15',
  'bg-green-200': 'bg-success/20',
  'bg-green-300': 'bg-success/30',
  'bg-green-400': 'bg-success/40',
  'bg-green-500': 'bg-success/50',
  'bg-green-600': 'bg-success/60',
  'bg-green-700': 'bg-success/70',
  'bg-green-800': 'bg-success/80',
  'bg-green-900': 'bg-success/90',
  'border-green-50': 'border-success/20',
  'border-green-200': 'border-success/30',
  'border-green-800': 'border-success/50',

  // Amber/Yellow colors -> warning
  'text-amber-50': 'text-warning/20',
  'text-amber-100': 'text-warning/30',
  'text-amber-200': 'text-warning/40',
  'text-amber-300': 'text-warning/60',
  'text-amber-400': 'text-warning/80',
  'text-amber-500': 'text-warning',
  'text-amber-600': 'text-warning',
  'text-amber-700': 'text-warning',
  'text-amber-800': 'text-warning',
  'text-amber-900': 'text-warning',
  'bg-amber-50': 'bg-warning/10',
  'bg-amber-100': 'bg-warning/15',
  'bg-amber-200': 'bg-warning/20',
  'bg-amber-300': 'bg-warning/30',
  'bg-amber-400': 'bg-warning/40',
  'bg-amber-500': 'bg-warning/50',
  'bg-amber-600': 'bg-warning/60',
  'bg-amber-700': 'bg-warning/70',
  'bg-amber-800': 'bg-warning/80',
  'bg-amber-900': 'bg-warning/90',
  'border-amber-50': 'border-warning/20',
  'border-amber-200': 'border-warning/30',
  'border-amber-800': 'border-warning/50',

  // White/Black specific
  'text-white': 'text-foreground',
  'bg-white': 'bg-card',
  'border-white': 'border-border',
};

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    // Sort keys by length (longest first) to avoid partial replacements
    const sortedKeys = Object.keys(colorMap).sort((a, b) => b.length - a.length);

    for (const oldClass of sortedKeys) {
      const newClass = colorMap[oldClass];
      // Use word boundaries in regex to match whole class names
      const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
      newContent = newContent.replace(regex, newClass);
    }

    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✓ Fixed: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
  return false;
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (!file.includes('node_modules') && !file.includes('.next')) {
        walkDir(filePath, callback);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.js')) {
      callback(filePath);
    }
  }
}

// Start the process
const projectRoot = '/vercel/share/v0-project';
let filesFixed = 0;

walkDir(projectRoot, (filePath) => {
  if (processFile(filePath)) {
    filesFixed++;
  }
});

console.log(`\n✨ Fixed ${filesFixed} files`);
