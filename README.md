# React Custom Hooks Library

[![npm version](https://img.shields.io/npm/v/qazuor-react-hooks.svg)](https://www.npmjs.com/package/qazuor-react-hooks)
[![npm downloads](https://img.shields.io/npm/dm/qazuor-react-hooks.svg)](https://www.npmjs.com/package/qazuor-react-hooks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2+-blue.svg)](https://reactjs.org/)

A collection of high-quality, fully tested React hooks for common use cases. Written in TypeScript with comprehensive documentation and examples.

## Features

- 📦 20+ Custom Hooks
- 🔒 Type-safe with TypeScript
- 📚 Comprehensive documentation
- ✅ Fully tested
- 🎯 Zero dependencies
- 🌳 Tree-shakeable
- 💻 SSR compatible

## Installation

```bash
# Using npm
npm install qazuor-react-hooks

# Using yarn
yarn add qazuor-react-hooks

# Using pnpm
pnpm add qazuor-react-hooks
```

## Available Hooks

### State Management
- `useBoolean` - Manage boolean state with convenient methods
- `useToggle` - Toggle between two states
- `useQueue` - Implement a FIFO queue with state management

### Side Effects
- `useTimeout` - Execute a callback after a delay
- `useInterval` - Execute a callback at regular intervals
- `useHandledInterval` - Enhanced interval with pause/resume functionality
- `useDebounce` - Debounce a value with configurable delay

### Browser APIs
- `useLocalStorage` - Persist state in localStorage
- `useSessionStorage` - Persist state in sessionStorage
- `useCopyToClipboard` - Copy text to clipboard
- `useMediaQuery` - React to media query changes
- `useNetworkState` - Track network connectivity
- `useVisibilityChange` - Track document visibility
- `useWindowWidth` - Track window width

### User Interaction
- `useClickOutside` - Detect clicks outside an element
- `useIdleness` - Track user idle state
- `usePageLeave` - Detect when user attempts to leave page
- `useLockBodyScroll` - Prevent body scrolling
- `useMeasure` - Measure DOM elements

### Development
- `useLogger` - Debug values with console logging

## Detailed Examples

### useBoolean

```tsx
import { useBoolean } from 'qazuor-react-hooks';

function Modal() {
    const { value: isOpen, setTrue: open, setFalse: close } = useBoolean(false);

    return (
        <>
            <button onClick={open}>Open Modal</button>
            {isOpen && (
                <div className="modal">
                    <button onClick={close}>Close</button>
                    <h1>Modal Content</h1>
                </div>
            )}
        </>
    );
}
```

### useLocalStorage

```tsx
import { useLocalStorage } from 'qazuor-react-hooks';

function ThemeToggle() {
    const [theme, setTheme] = useLocalStorage('theme', 'light');

    return (
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            Current theme: {theme}
        </button>
    );
}
```

### useClickOutside

```tsx
import { useClickOutside } from 'qazuor-react-hooks';
import { useRef } from 'react';

function Dropdown() {
    const ref = useRef(null);
    const [isOpen, setIsOpen] = useState(false);

    useClickOutside(ref, () => setIsOpen(false));

    return (
        <div ref={ref}>
            <button onClick={() => setIsOpen(true)}>Open</button>
            {isOpen && <div>Dropdown content</div>}
        </div>
    );
}
```

### useDebounce

```tsx
import { useDebounce } from 'qazuor-react-hooks';

function SearchInput() {
    const [value, setValue] = useState('');
    const debouncedValue = useDebounce(value, 500);

    useEffect(() => {
        // API call with debouncedValue
    }, [debouncedValue]);

    return (
        <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search..."
        />
    );
}
```

### useHandledInterval

```tsx
import { useHandledInterval } from 'qazuor-react-hooks';

function Timer() {
    const [count, setCount] = useState(0);
    const { isRunning, start, pause, reset } = useHandledInterval({
        callback: () => setCount(c => c + 1),
        delay: 1000,
        random: false
    });

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={isRunning ? pause : start}>
                {isRunning ? 'Pause' : 'Start'}
            </button>
            <button onClick={reset}>Reset</button>
        </div>
    );
}
```

### useIdleness

```tsx
import { useIdleness } from 'qazuor-react-hooks';

function IdleDetector() {
    const { isIdle } = useIdleness({
        timeout: 5000,
        onIdleChange: (idle) => console.log(`User is ${idle ? 'idle' : 'active'}`),
    });

    return (
        <div>
            User is currently {isIdle ? 'idle' : 'active'}
        </div>
    );
}
```

### useInterval

```tsx
import { useInterval } from 'qazuor-react-hooks';

function Counter() {
    const [count, setCount] = useState(0);
    const { isRunning, start, pause } = useInterval({
        callback: () => setCount(c => c + 1),
        delay: 1000
    });

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={isRunning ? pause : start}>
                {isRunning ? 'Pause' : 'Start'}
            </button>
        </div>
    );
}
```

### useLogger

```tsx
import { useLogger } from 'qazuor-react-hooks';

function DebugComponent() {
    const [value, setValue] = useState('initial');
    useLogger('StateValue', value, {
        level: 'info',
        timestamp: true
    });

    return (
        <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
        />
    );
}
```

### useLockBodyScroll

```tsx
import { useLockBodyScroll } from 'qazuor-react-hooks';

function Modal() {
    const { isLocked, lock, unlock } = useLockBodyScroll({
        preservePosition: true
    });

    return (
        <div className="modal">
            <button onClick={isLocked ? unlock : lock}>
                {isLocked ? 'Enable' : 'Disable'} Scroll
            </button>
        </div>
    );
}
```

### useMeasure

```tsx
import { useMeasure } from 'qazuor-react-hooks';

function ResizeTracker() {
    const { ref, size } = useMeasure();

    return (
        <div ref={ref} style={{ resize: 'both', overflow: 'auto' }}>
            Width: {size.width}px
            Height: {size.height}px
        </div>
    );
}
```

### useMediaQuery

```tsx
import { useMediaQuery } from 'qazuor-react-hooks';

function ResponsiveComponent() {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    return (
        <div>
            <p>Current layout: {isMobile ? 'Mobile' : 'Desktop'}</p>
            <p>Theme: {isDarkMode ? 'Dark' : 'Light'}</p>
        </div>
    );
}
```

### useNetworkState

```tsx
import { useNetworkState } from 'qazuor-react-hooks';

function NetworkStatus() {
    const { online, type, rtt } = useNetworkState();

    return (
        <div>
            <p>Status: {online ? 'Online' : 'Offline'}</p>
            <p>Connection: {type}</p>
            <p>Latency: {rtt}ms</p>
        </div>
    );
}
```

### usePageLeave

```tsx
import { usePageLeave } from 'qazuor-react-hooks';

function ExitIntent() {
    const { hasLeft } = usePageLeave({
        onLeave: () => console.log('User is leaving!'),
        threshold: 10
    });

    return hasLeft && (
        <div className="exit-popup">
            Wait! Don't leave yet...
        </div>
    );
}
```

### useQueue

```tsx
import { useQueue } from 'qazuor-react-hooks';

function TaskQueue() {
    const { enqueue, dequeue, peek, size, isEmpty } = useQueue<string>();

    return (
        <div>
            <button onClick={() => enqueue(`Task ${size + 1}`)}>
                Add Task
            </button>
            <button onClick={dequeue} disabled={isEmpty}>
                Process Next
            </button>
            <p>Next task: {peek() || 'No tasks'}</p>
            <p>Queue size: {size}</p>
        </div>
    );
}
```

### useSessionStorage

```tsx
import { useSessionStorage } from 'qazuor-react-hooks';

function SessionForm() {
    const [formData, setFormData] = useSessionStorage('form', {
        name: '',
        email: ''
    });

    return (
        <form>
            <input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <input
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
        </form>
    );
}
```

### useTimeout

```tsx
import { useTimeout } from 'qazuor-react-hooks';

function AutoDismiss() {
    const [visible, setVisible] = useState(true);
    const { isPending, reset } = useTimeout({
        callback: () => setVisible(false),
        delay: 3000
    });

    return visible && (
        <div>
            <p>I will disappear in 3 seconds!</p>
            <button onClick={reset}>Reset Timer</button>
        </div>
    );
}
```

### useToggle

```tsx
import { useToggle } from 'qazuor-react-hooks';

function ToggleButton() {
    const { value, toggle, setTrue, setFalse } = useToggle({
        initialValue: false,
        persist: true,
        storageKey: 'buttonState'
    });

    return (
        <div>
            <button onClick={toggle}>
                {value ? 'ON' : 'OFF'}
            </button>
            <button onClick={setTrue}>Turn On</button>
            <button onClick={setFalse}>Turn Off</button>
        </div>
    );
}
```

### useVisibilityChange

```tsx
import { useVisibilityChange } from 'qazuor-react-hooks';

function TabTracker() {
    const { isVisible } = useVisibilityChange({
        onVisible: () => console.log('Tab is visible'),
        onHidden: () => console.log('Tab is hidden')
    });

    return (
        <div>
            Tab is currently {isVisible ? 'visible' : 'hidden'}
        </div>
    );
}
```

### useWindowWidth

```tsx
import { useWindowWidth } from 'qazuor-react-hooks';

function WindowSizeTracker() {
    const { width } = useWindowWidth({
        debounceDelay: 250,
        onChange: (w) => console.log(`Window width: ${w}px`)
    });

    return (
        <div>
            Current window width: {width}px
        </div>
    );
}
```

## TypeScript Support

All hooks are written in TypeScript and include comprehensive type definitions. Generic types are used where appropriate to ensure type safety.

```tsx
// Example with generic type
const [value, setValue] = useLocalStorage<User>('user', defaultUser);
value.name; // TypeScript knows this is User.name
```

## Browser Support

The library supports all modern browsers and IE11 with appropriate polyfills. Some hooks may require specific browser features - check individual hook documentation for details.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Leandro Asrilevich ([@qazuor](https://github.com/qazuor))
