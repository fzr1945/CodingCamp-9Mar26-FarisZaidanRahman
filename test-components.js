/**
 * Node.js Test Script for Productivity Dashboard Components
 * Tests core functionality without requiring a browser
 */

// Mock DOM environment
global.document = {
    getElementById: (id) => ({
        textContent: '',
        innerHTML: '',
        value: '',
        addEventListener: () => {},
        appendChild: () => {},
        setAttribute: () => {},
        removeAttribute: () => {}
    }),
    createElement: () => ({
        textContent: '',
        innerHTML: '',
        className: '',
        appendChild: () => {}
    }),
    body: {
        setAttribute: () => {},
        removeAttribute: () => {}
    },
    readyState: 'complete',
    addEventListener: () => {}
};

global.window = {
    localStorage: {
        data: {},
        setItem(key, value) { this.data[key] = value; },
        getItem(key) { return this.data[key] || null; },
        removeItem(key) { delete this.data[key]; },
        clear() { this.data = {}; }
    },
    open: () => {},
    setInterval: (fn, ms) => setTimeout(fn, ms),
    clearInterval: () => {},
    setTimeout: setTimeout,
    clearTimeout: clearTimeout
};

global.console = console;

// Load the application code
const fs = require('fs');
const appCode = fs.readFileSync('js/app.js', 'utf8');

// Execute the app code in our mock environment
eval(appCode);

// Test Results
let testCount = 0;
let passCount = 0;

function test(name, condition, message = '') {
    testCount++;
    const passed = condition;
    if (passed) passCount++;
    
    console.log(`${passed ? '✓' : '✗'} ${name}${message ? ` - ${message}` : ''}`);
    return passed;
}

function section(title) {
    console.log(`\n=== ${title} ===`);
}

// Run Tests
console.log('🧪 Running Productivity Dashboard Component Tests\n');

section('Storage Service Tests');
try {
    test('Storage service exists', typeof StorageService !== 'undefined');
    test('Has get method', typeof StorageService.get === 'function');
    test('Has set method', typeof StorageService.set === 'function');
    test('Has remove method', typeof StorageService.remove === 'function');
    test('Has clear method', typeof StorageService.clear === 'function');
    test('Has isAvailable method', typeof StorageService.isAvailable === 'function');
    
    // Test basic operations
    const testData = { test: 'value', number: 42 };
    test('Can set data', StorageService.set('test_key', testData));
    
    const retrieved = StorageService.get('test_key');
    test('Can get data', retrieved && retrieved.test === 'value' && retrieved.number === 42);
    
    StorageService.remove('test_key');
    test('Can remove data', StorageService.get('test_key') === null);
    
} catch (error) {
    test('Storage Service error handling', false, error.message);
}

section('Greeting Component Tests');
try {
    test('Greeting component exists', typeof GreetingComponent !== 'undefined');
    test('Has getGreetingMessage method', typeof GreetingComponent.getGreetingMessage === 'function');
    test('Has formatTime method', typeof GreetingComponent.formatTime === 'function');
    test('Has formatDate method', typeof GreetingComponent.formatDate === 'function');
    
    // Test greeting messages
    test('Morning greeting (9 AM)', GreetingComponent.getGreetingMessage(9) === 'Good morning, Faris');
    test('Afternoon greeting (2 PM)', GreetingComponent.getGreetingMessage(14) === 'Good afternoon, Faris');
    test('Evening greeting (7 PM)', GreetingComponent.getGreetingMessage(19) === 'Good evening, Faris');
    test('Night greeting (11 PM)', GreetingComponent.getGreetingMessage(23) === 'Good night, Faris');
    
    // Test boundary conditions
    test('Boundary: 5 AM (morning start)', GreetingComponent.getGreetingMessage(5) === 'Good morning, Faris');
    test('Boundary: 12 PM (afternoon start)', GreetingComponent.getGreetingMessage(12) === 'Good afternoon, Faris');
    test('Boundary: 5 PM (evening start)', GreetingComponent.getGreetingMessage(17) === 'Good evening, Faris');
    test('Boundary: 9 PM (night start)', GreetingComponent.getGreetingMessage(21) === 'Good night, Faris');
    
} catch (error) {
    test('Greeting Component error', false, error.message);
}

section('Timer Component Tests');
try {
    test('Timer component exists', typeof TimerComponent !== 'undefined');
    test('Has formatDisplay method', typeof TimerComponent.formatDisplay === 'function');
    test('Has start method', typeof TimerComponent.start === 'function');
    test('Has stop method', typeof TimerComponent.stop === 'function');
    test('Has reset method', typeof TimerComponent.reset === 'function');
    test('Has switchMode method', typeof TimerComponent.switchMode === 'function');
    
    // Test display formatting
    test('Format 25:00', TimerComponent.formatDisplay(1500) === '25:00');
    test('Format 01:05', TimerComponent.formatDisplay(65) === '01:05');
    test('Format 00:00', TimerComponent.formatDisplay(0) === '00:00');
    test('Format 59:59', TimerComponent.formatDisplay(3599) === '59:59');
    
    // Test initial state
    test('Initial time is 25 minutes', TimerComponent.getTimeRemaining() === 1500);
    test('Initially not running', !TimerComponent.isRunning());
    test('Initial mode is focus', TimerComponent.getMode() === 'focus');
    
} catch (error) {
    test('Timer Component error', false, error.message);
}

section('Task Manager Tests');
try {
    test('Task Manager exists', typeof TaskManager !== 'undefined');
    test('Has addTask method', typeof TaskManager.addTask === 'function');
    test('Has editTask method', typeof TaskManager.editTask === 'function');
    test('Has toggleTask method', typeof TaskManager.toggleTask === 'function');
    test('Has deleteTask method', typeof TaskManager.deleteTask === 'function');
    test('Has sortTasks method', typeof TaskManager.sortTasks === 'function');
    test('Has isDuplicate method', typeof TaskManager.isDuplicate === 'function');
    test('Has getTasks method', typeof TaskManager.getTasks === 'function');
    
    // Clear storage for clean test
    window.localStorage.clear();
    
    // Test task operations
    test('Can add valid task', TaskManager.addTask('Test task 1'));
    test('Task list has one item', TaskManager.getTasks().length === 1);
    test('Task has correct text', TaskManager.getTasks()[0].text === 'Test task 1');
    
    // Test duplicate prevention
    test('Prevents duplicate task', !TaskManager.addTask('Test task 1'));
    test('List size unchanged after duplicate', TaskManager.getTasks().length === 1);
    
    // Test empty task rejection
    test('Rejects empty task', !TaskManager.addTask(''));
    test('Rejects whitespace-only task', !TaskManager.addTask('   '));
    
} catch (error) {
    test('Task Manager error', false, error.message);
}

section('Quick Links Component Tests');
try {
    test('Quick Links component exists', typeof QuickLinksComponent !== 'undefined');
    test('Has addLink method', typeof QuickLinksComponent.addLink === 'function');
    test('Has deleteLink method', typeof QuickLinksComponent.deleteLink === 'function');
    test('Has openLink method', typeof QuickLinksComponent.openLink === 'function');
    test('Has getLinks method', typeof QuickLinksComponent.getLinks === 'function');
    
    // Clear storage for clean test
    window.localStorage.clear();
    
    // Test link operations
    QuickLinksComponent.addLink('Google', 'https://google.com');
    test('Can add valid link', QuickLinksComponent.getLinks().length === 1);
    test('Link has correct label', QuickLinksComponent.getLinks()[0].label === 'Google');
    test('Link has correct URL', QuickLinksComponent.getLinks()[0].url === 'https://google.com');
    
} catch (error) {
    test('Quick Links error', false, error.message);
}

section('Theme Manager Tests');
try {
    test('Theme Manager exists', typeof ThemeManager !== 'undefined');
    test('Has toggleTheme method', typeof ThemeManager.toggleTheme === 'function');
    test('Has applyTheme method', typeof ThemeManager.applyTheme === 'function');
    test('Has getCurrentTheme method', typeof ThemeManager.getCurrentTheme === 'function');
    
    // Test theme operations
    test('Has initial theme', typeof ThemeManager.getCurrentTheme() === 'string');
    
    const initialTheme = ThemeManager.getCurrentTheme();
    ThemeManager.toggleTheme();
    test('Theme toggles', initialTheme !== ThemeManager.getCurrentTheme());
    
} catch (error) {
    test('Theme Manager error', false, error.message);
}

// Summary
console.log(`\n📊 Test Summary`);
console.log(`${passCount}/${testCount} tests passed (${Math.round((passCount / testCount) * 100)}%)`);

if (passCount === testCount) {
    console.log('🎉 All tests passed! Components are working correctly.');
} else if (passCount / testCount >= 0.8) {
    console.log('✅ Most components are working. Minor issues detected.');
} else {
    console.log('⚠️  Some components need attention.');
}

// Exit with appropriate code
process.exit(passCount === testCount ? 0 : 1);