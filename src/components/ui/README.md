# StandardModal Component

A reusable modal component with frosted-glass backdrop effect and customizable theming.

## Features

- **Frosted-glass backdrop**: Blurs background content with `backdrop-filter: blur(8px)`
- **Smooth animations**: Fade-in, zoom-in, and slide-up transitions
- **Customizable themes**: Green, orange, blue, purple, red
- **Multiple sizes**: sm, md, lg, xl, 2xl
- **Accessible**: Keyboard navigation and focus management
- **Click-to-close**: Backdrop click closes modal
- **Consistent styling**: Matches WAGMI dark theme

## Usage

```tsx
import StandardModal from '@/components/ui/StandardModal';
import { useModal } from '@/hooks/useModal';

function MyComponent() {
  const { isOpen, open, close } = useModal();

  return (
    <>
      <button onClick={open}>Open Modal</button>
      
      <StandardModal
        isOpen={isOpen}
        onClose={close}
        title="My Modal"
        size="md"
        theme="green"
      >
        <p>Modal content goes here</p>
      </StandardModal>
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Controls modal visibility |
| `onClose` | `() => void` | - | Callback when modal closes |
| `title` | `string` | - | Modal title text |
| `children` | `ReactNode` | - | Modal content |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'md'` | Modal width |
| `theme` | `'green' \| 'orange' \| 'blue' \| 'purple' \| 'red'` | `'green'` | Color theme |
| `showCloseButton` | `boolean` | `true` | Show close button in header |
| `closeOnBackdropClick` | `boolean` | `true` | Close when clicking backdrop |
| `className` | `string` | `''` | Additional CSS classes |

## Themes

- **Orange**: `#FF6600` - Default WAGMI theme
- **Orange**: `#FF6B35` - Dev Access theme
- **Blue**: `#3B82F6` - Info/neutral theme
- **Purple**: `#8B5CF6` - Premium theme
- **Red**: `#EF4444` - Error/warning theme

## Sizes

- **sm**: `max-w-sm` (384px)
- **md**: `max-w-md` (448px)
- **lg**: `max-w-lg` (512px)
- **xl**: `max-w-xl` (576px)
- **2xl**: `max-w-2xl` (672px)

## Examples

### Transaction History Modal
```tsx
<StandardModal
  isOpen={isOpen}
  onClose={onClose}
  title="Transaction History"
  size="2xl"
  theme="green"
>
  <div>Transaction content...</div>
</StandardModal>
```

### Dev Access Modal
```tsx
<StandardModal
  isOpen={showDevModal}
  onClose={closeDevModal}
  title="Dev Access"
  size="md"
  theme="orange"
>
  <form>Dev login form...</form>
</StandardModal>
```

### Confirmation Modal
```tsx
<StandardModal
  isOpen={isOpen}
  onClose={onClose}
  title="Confirm Action"
  size="sm"
  theme="red"
  closeOnBackdropClick={false}
>
  <p>Are you sure you want to proceed?</p>
  <div className="flex gap-3 mt-4">
    <button onClick={onClose}>Cancel</button>
    <button onClick={handleConfirm}>Confirm</button>
  </div>
</StandardModal>
```

## useModal Hook

The `useModal` hook provides convenient state management for modals:

```tsx
import { useModal } from '@/hooks/useModal';

const { isOpen, open, close, toggle } = useModal();
```

### Hook Methods

- `isOpen`: Current modal state
- `open()`: Open the modal
- `close()`: Close the modal
- `toggle()`: Toggle modal state
