# React Custom Hooks Library

<div align="center">
  <img src="logo.webp" alt="React Custom Hooks Library Logo" width="200" />
</div>

[![npm version](https://img.shields.io/npm/v/qazuor-react-hooks.svg)](https://www.npmjs.com/package/qazuor-react-hooks)
[![npm downloads](https://img.shields.io/npm/dm/qazuor-react-hooks.svg)](https://www.npmjs.com/package/qazuor-react-hooks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2+-blue.svg)](https://reactjs.org/)

A collection of high-quality, fully tested React hooks for common use cases. Written in TypeScript with comprehensive documentation and examples.

## Table of Contents

- [React Custom Hooks Library](#react-custom-hooks-library)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Available Hooks](#available-hooks)
    - [State Management](#state-management)
      - [useBoolean](#useboolean)
      - [useToggle](#usetoggle)
      - [useQueue](#usequeue)
    - [Side Effects](#side-effects)
      - [useTimeout](#usetimeout)
      - [useInterval](#useinterval)
      - [useHandledInterval](#usehandledinterval)
      - [useDebounce](#usedebounce)
    - [Browser APIs](#browser-apis)
      - [useLocalStorage](#uselocalstorage)
      - [useSessionStorage](#usesessionstorage)
      - [useCopyToClipboard](#usecopytoclipboard)
      - [useMediaQuery](#usemediaquery)
      - [useNetworkState](#usenetworkstate)
      - [useVisibilityChange](#usevisibilitychange)
      - [useWindowWidth](#usewindowwidth)
    - [User Interaction](#user-interaction)
      - [useClickOutside](#useclickoutside)
      - [useIdleness](#useidleness)
      - [usePageLeave](#usepageleave)
      - [useLockBodyScroll](#uselockbodyscroll)
      - [useMeasure](#usemeasure)
    - [Development](#development)
      - [useLogger](#uselogger)
  - [TypeScript Support](#typescript-support)
  - [Browser Support](#browser-support)
  - [Contributing](#contributing)
  - [License](#license)
  - [Author](#author)

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

#### useBoolean
Manages a boolean state with convenient methods.

```tsx
import { useBoolean } from 'qazuor-react-hooks';

function Modal() {
    const { value: isOpen, setTrue: open, setFalse: close } = useBoolean(false);

    return (
        <>
            <button onClick={open} type="button">Open Modal</button>
            {isOpen && (
                <div className="modal">
                    <button onClick={close} type="button">Close</button>
                    <h1>Modal Content</h1>
                </div>
            )}
        </>
    );
}
```

#### useToggle
Manages a toggleable boolean state with persistence options.

```tsx
import { useToggle } from 'qazuor-react-hooks';

function ThemeToggle() {
    const { value: isDark, toggle } = useToggle({
        initialValue: false,
        persist: true,
        storageKey: 'theme-preference'
    });

    return (
        <button onClick={toggle} type="button">
            Current theme: {isDark ? 'Dark' : 'Light'}
        </button>
    );
}
```

#### useQueue
Implements a FIFO queue with state management.

```tsx
import { useQueue } from 'qazuor-react-hooks';

function TaskQueue() {
    const { enqueue, dequeue, peek, size, isEmpty } = useQueue<string>();

    return (
        <div>
            <button onClick={() => enqueue(`Task ${size + 1}`)} type="button">
                Add Task
            </button>
            <button onClick={dequeue} disabled={isEmpty} type="button">
                Process Next
            </button>
            <p>Next task: {peek() || 'No tasks'}</p>
            <p>Queue size: {size}</p>
        </div>
    );
}
```

### Side Effects

#### useTimeout
Execute a callback after a delay with control methods.

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
            <button onClick={reset} type="button">Reset Timer</button>
        </div>
    );
}
```

#### useInterval
Execute a callback at regular intervals with pause/resume functionality.

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
            <button onClick={isRunning ? pause : start} type="button">
                {isRunning ? 'Pause' : 'Start'}
            </button>
        </div>
    );
}
```

#### useHandledInterval
Enhanced interval with random delay options and more control.

```tsx
import { useHandledInterval } from 'qazuor-react-hooks';

function RandomTimer() {
    const [count, setCount] = useState(0);
    const { isRunning, start, pause, reset } = useHandledInterval({
        callback: () => setCount(c => c + 1),
        delay: 1000,
        random: true,
        minDelay: 500
    });

    return (
        <div>
            <p>Random intervals count: {count}</p>
            <button onClick={isRunning ? pause : start} type="button">
                {isRunning ? 'Pause' : 'Start'}
            </button>
            <button onClick={reset} type="button">Reset</button>
        </div>
    );
}
```

#### useDebounce
Debounce a value with configurable delay.

```tsx
import { useDebounce } from 'qazuor-react-hooks';

function SearchInput() {
    const [value, setValue] = useState('');
    const debouncedValue = useDebounce(value, 500);

    useEffect(() => {
        // API call with debouncedValue
        console.log('Searching:', debouncedValue);
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

### Browser APIs

#### useLocalStorage
Persist state in localStorage with type safety.

```tsx
import { useLocalStorage } from 'qazuor-react-hooks';

function UserPreferences() {
    const [preferences, setPreferences] = useLocalStorage('user-prefs', {
        theme: 'light',
        fontSize: 16
    });

    return (
        <div>
            <button
                onClick={() => setPreferences(p => ({ ...p, theme: p.theme === 'light' ? 'dark' : 'light' }))}
                type="button"
            >
                Toggle Theme
            </button>
            <select
                value={preferences.fontSize}
                onChange={(e) => setPreferences(p => ({ ...p, fontSize: Number(e.target.value) }))}
            >
                <option value="14">Small</option>
                <option value="16">Medium</option>
                <option value="18">Large</option>
            </select>
        </div>
    );
}
```

#### useSessionStorage
Persist state in sessionStorage.

```tsx
import { useSessionStorage } from 'qazuor-react-hooks';

function FormWithAutosave() {
    const [formData, setFormData] = useSessionStorage('form-draft', {
        title: '',
        content: ''
    });

    return (
        <form>
            <input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Title"
            />
            <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Content"
            />
        </form>
    );
}
```

#### useCopyToClipboard
Copy text to clipboard with status feedback.

```tsx
import { useCopyToClipboard } from 'qazuor-react-hooks';

function ShareButton() {
    const { copy, copied, error } = useCopyToClipboard();
    const url = window.location.href;

    return (
        <button
            onClick={() => copy(url)}
            type="button"
            className={copied ? 'success' : error ? 'error' : ''}
        >
            {copied ? 'Copied!' : error ? 'Failed to copy' : 'Copy URL'}
        </button>
    );
}
```

#### useMediaQuery
React to media query changes.

```tsx
import { useMediaQuery } from 'qazuor-react-hooks';

function ResponsiveLayout() {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

    return (
        <div className={`layout ${isMobile ? 'mobile' : 'desktop'} ${prefersDark ? 'dark' : 'light'}`}>
            <p>Current layout: {isMobile ? 'Mobile' : 'Desktop'}</p>
            <p>Theme preference: {prefersDark ? 'Dark' : 'Light'}</p>
        </div>
    );
}
```

#### useNetworkState
Track network connectivity status.

```tsx
import { useNetworkState } from 'qazuor-react-hooks';

function NetworkIndicator() {
    const { online, type, rtt } = useNetworkState();

    return (
        <div>
            <div className={`status-dot ${online ? 'online' : 'offline'}`} />
            {online && (
                <>
                    <p>Connection: {type}</p>
                    <p>Latency: {rtt}ms</p>
                </>
            )}
        </div>
    );
}
```

#### useVisibilityChange
Track document visibility state.

```tsx
import { useVisibilityChange } from 'qazuor-react-hooks';

function VideoPlayer() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { isVisible } = useVisibilityChange({
        onHidden: () => videoRef.current?.pause(),
        onVisible: () => videoRef.current?.play()
    });

    return (
        <div>
            <video ref={videoRef} />
            <p>Video is {isVisible ? 'visible' : 'hidden'}</p>
        </div>
    );
}
```

#### useWindowWidth
Track window width with debouncing.

```tsx
import { useWindowWidth } from 'qazuor-react-hooks';

function ResponsiveComponent() {
    const { width } = useWindowWidth({
        debounceDelay: 250,
        onChange: (w) => console.log(`Window width changed to ${w}px`)
    });

    return (
        <div>
            <p>Window width: {width}px</p>
            {width > 1024 ? (
                <h1>Desktop View</h1>
            ) : width > 768 ? (
                <h2>Tablet View</h2>
            ) : (
                <h3>Mobile View</h3>
            )}
        </div>
    );
}
```

### User Interaction

#### useClickOutside
Detect clicks outside an element.

```tsx
import { useClickOutside } from 'qazuor-react-hooks';

function Dropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useClickOutside(ref, () => setIsOpen(false));

    return (
        <div ref={ref}>
            <button onClick={() => setIsOpen(true)} type="button">
                Toggle Dropdown
            </button>
            {isOpen && (
                <ul className="dropdown-menu">
                    <li>Option 1</li>
                    <li>Option 2</li>
                </ul>
            )}
        </div>
    );
}
```

#### useIdleness
Track user idle state.

```tsx
import { useIdleness } from 'qazuor-react-hooks';

function IdleMonitor() {
    const { isIdle, reset } = useIdleness({
        timeout: 5000,
        onIdleChange: (idle) => {
            if (idle) {
                console.log('User is idle');
            } else {
                console.log('User is active');
            }
        }
    });

    return (
        <div>
            <p>User is currently {isIdle ? 'idle' : 'active'}</p>
            <button onClick={reset} type="button">Reset Idle Timer</button>
        </div>
    );
}
```

#### usePageLeave
Detect when user attempts to leave page.

```tsx
import { usePageLeave } from 'qazuor-react-hooks';

function ExitIntent() {
    const { hasLeft } = usePageLeave({
        onLeave: () => console.log('Mouse left the page'),
        threshold: 10
    });

    return hasLeft && (
        <div className="exit-popup">
            <h2>Wait! Don't leave yet...</h2>
            <p>Would you like to subscribe to our newsletter?</p>
        </div>
    );
}
```

#### useLockBodyScroll
Prevent body scrolling.

```tsx
import { useLockBodyScroll } from 'qazuor-react-hooks';

function Modal({ isOpen }: { isOpen: boolean }) {
    const { isLocked, lock, unlock } = useLockBodyScroll({
        lockImmediately: isOpen,
        preservePosition: true
    });

    useEffect(() => {
        if (isOpen) {
            lock();
        } else {
            unlock();
        }
    }, [isOpen, lock, unlock]);

    return isOpen && (
        <div className="modal">
            <h2>Modal Content</h2>
            <p>Body scroll is {isLocked ? 'locked' : 'unlocked'}</p>
        </div>
    );
}
```

#### useMeasure
Measure DOM elements.

```tsx
import { useMeasure } from 'qazuor-react-hooks';

function ResizableBox() {
    const { ref, size } = useMeasure();

    return (
        <div
            ref={ref}
            style={{
                resize: 'both',
                overflow: 'auto',
                minWidth: '100px',
                minHeight: '100px',
                border: '1px solid black'
            }}
        >
            <p>Width: {size.width}px</p>
            <p>Height: {size.height}px</p>
        </div>
    );
}
```

### Development

#### useLogger
Debug values with console logging.

```tsx
import { useLogger } from 'qazuor-react-hooks';

function DebugComponent() {
    const [count, setCount] = useState(0);

    useLogger('Counter Value', count, {
        level: 'info',
        timestamp: true,
        formatter: (label, value) => `${label}: ${value} (${new Date().toISOString()})`
    });

    return (
        <button onClick={() => setCount(c => c + 1)} type="button">
            Increment ({count})
        </button>
    );
}
```

## TypeScript Support

All hooks are written in TypeScript and include comprehensive type definitions. Generic types are used where appropriate to ensure type safety.

```tsx
interface UserPreferences {
    theme: 'light' | 'dark';
    fontSize: number;
}

// Type-safe localStorage hook
const [preferences, setPreferences] = useLocalStorage<UserPreferences>('prefs', {
    theme: 'light',
    fontSize: 16
});

// TypeScript knows the correct types
preferences.theme; // 'light' | 'dark'
preferences.fontSize; // number
```

## Browser Support

The library supports all modern browsers. Some hooks may require specific browser features - check individual hook documentation for details.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Leandro Asrilevich ([@qazuor](https://github.com/qazuor))
