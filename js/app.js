/**
 * Productivity Dashboard Application
 * A vanilla JavaScript application for time management and task tracking
 */

/**
 * Performance Optimization Module
 * Provides utilities for optimizing DOM operations and monitoring performance
 */
const PerformanceOptimizer = (() => {
    'use strict';

    // Performance monitoring state
    let performanceMetrics = {
        domOperations: [],
        renderTimes: [],
        interactionTimes: []
    };

    // DOM operation batching
    let pendingUpdates = new Set();
    let updateScheduled = false;

    /**
     * Batch DOM updates using requestAnimationFrame
     * @param {Function} updateFn - Function to execute in the next frame
     * @param {string} key - Unique key to prevent duplicate updates
     */
    function batchDOMUpdate(updateFn, key = 'default') {
        if (key && pendingUpdates.has(key)) {
            return; // Update already scheduled
        }

        if (key) {
            pendingUpdates.add(key);
        }

        if (!updateScheduled) {
            updateScheduled = true;
            requestAnimationFrame(() => {
                try {
                    updateFn();
                } finally {
                    if (key) {
                        pendingUpdates.delete(key);
                    }
                    updateScheduled = false;
                }
            });
        }
    }

    /**
     * Create document fragment for efficient DOM manipulation
     * @param {Array} elements - Array of element creation functions
     * @returns {DocumentFragment} Fragment containing all elements
     */
    function createDocumentFragment(elements) {
        const fragment = document.createDocumentFragment();

        elements.forEach(elementFn => {
            if (typeof elementFn === 'function') {
                const element = elementFn();
                if (element) {
                    fragment.appendChild(element);
                }
            } else if (elementFn instanceof Node) {
                fragment.appendChild(elementFn);
            }
        });

        return fragment;
    }

    /**
     * Measure performance of DOM operations
     * @param {string} operationName - Name of the operation
     * @param {Function} operation - Function to measure
     * @returns {any} Result of the operation
     */
    function measureDOMOperation(operationName, operation) {
        const startTime = performance.now();

        try {
            const result = operation();
            const endTime = performance.now();
            const duration = endTime - startTime;

            // Store performance metric
            performanceMetrics.domOperations.push({
                name: operationName,
                duration: duration,
                timestamp: Date.now()
            });

            // Log slow operations (> 16ms could cause frame drops)
            if (duration > 16) {
                console.warn(`Slow DOM operation detected: ${operationName} took ${duration.toFixed(2)}ms`);
            }

            return result;
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;

            performanceMetrics.domOperations.push({
                name: operationName,
                duration: duration,
                timestamp: Date.now(),
                error: error.message
            });

            throw error;
        }
    }

    /**
     * Measure user interaction response time
     * @param {string} interactionType - Type of interaction
     * @param {Function} handler - Interaction handler function
     * @returns {Function} Wrapped handler with performance measurement
     */
    function measureInteraction(interactionType, handler) {
        return function(...args) {
            const startTime = performance.now();

            try {
                const result = handler.apply(this, args);

                // Handle both sync and async operations
                if (result && typeof result.then === 'function') {
                    return result.finally(() => {
                        const endTime = performance.now();
                        const duration = endTime - startTime;

                        performanceMetrics.interactionTimes.push({
                            type: interactionType,
                            duration: duration,
                            timestamp: Date.now()
                        });

                        // Check if interaction meets performance requirement (< 100ms)
                        if (duration > 100) {
                            console.warn(`Slow interaction detected: ${interactionType} took ${duration.toFixed(2)}ms`);
                        }
                    });
                } else {
                    const endTime = performance.now();
                    const duration = endTime - startTime;

                    performanceMetrics.interactionTimes.push({
                        type: interactionType,
                        duration: duration,
                        timestamp: Date.now()
                    });

                    if (duration > 100) {
                        console.warn(`Slow interaction detected: ${interactionType} took ${duration.toFixed(2)}ms`);
                    }

                    return result;
                }
            } catch (error) {
                const endTime = performance.now();
                const duration = endTime - startTime;

                performanceMetrics.interactionTimes.push({
                    type: interactionType,
                    duration: duration,
                    timestamp: Date.now(),
                    error: error.message
                });

                throw error;
            }
        };
    }

    /**
     * Efficient event delegation setup
     * @param {HTMLElement} container - Container element for event delegation
     * @param {string} eventType - Event type to listen for
     * @param {string} selector - CSS selector for target elements
     * @param {Function} handler - Event handler function
     */
    function delegateEvent(container, eventType, selector, handler) {
        container.addEventListener(eventType, function(event) {
            const target = event.target.closest(selector);
            if (target && container.contains(target)) {
                handler.call(target, event);
            }
        });
    }

    /**
     * Get performance metrics summary
     * @returns {Object} Performance metrics summary
     */
    function getPerformanceMetrics() {
        const now = Date.now();
        const recentWindow = 60000; // Last 60 seconds

        // Filter recent metrics
        const recentDOMOps = performanceMetrics.domOperations.filter(
            op => now - op.timestamp < recentWindow
        );
        const recentInteractions = performanceMetrics.interactionTimes.filter(
            interaction => now - interaction.timestamp < recentWindow
        );

        // Calculate averages
        const avgDOMTime = recentDOMOps.length > 0
            ? recentDOMOps.reduce((sum, op) => sum + op.duration, 0) / recentDOMOps.length
            : 0;

        const avgInteractionTime = recentInteractions.length > 0
            ? recentInteractions.reduce((sum, interaction) => sum + interaction.duration, 0) / recentInteractions.length
            : 0;

        // Find slow operations
        const slowDOMOps = recentDOMOps.filter(op => op.duration > 16);
        const slowInteractions = recentInteractions.filter(interaction => interaction.duration > 100);

        return {
            domOperations: {
                total: recentDOMOps.length,
                averageTime: avgDOMTime,
                slowOperations: slowDOMOps.length,
                slowestOperation: recentDOMOps.reduce((slowest, op) =>
                    op.duration > (slowest?.duration || 0) ? op : slowest, null)
            },
            interactions: {
                total: recentInteractions.length,
                averageTime: avgInteractionTime,
                slowInteractions: slowInteractions.length,
                slowestInteraction: recentInteractions.reduce((slowest, interaction) =>
                    interaction.duration > (slowest?.duration || 0) ? interaction : slowest, null)
            },
            memoryUsage: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            } : null
        };
    }

    /**
     * Clear old performance metrics to prevent memory leaks
     */
    function cleanupMetrics() {
        const now = Date.now();
        const maxAge = 300000; // 5 minutes

        performanceMetrics.domOperations = performanceMetrics.domOperations.filter(
            op => now - op.timestamp < maxAge
        );
        performanceMetrics.interactionTimes = performanceMetrics.interactionTimes.filter(
            interaction => now - interaction.timestamp < maxAge
        );
    }

    /**
     * Initialize performance monitoring
     */
    function init() {
        // Clean up old metrics every 5 minutes
        setInterval(cleanupMetrics, 300000);

        // Monitor page load performance
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                const loadTime = performance.now();
                console.log(`Initial DOM load completed in ${loadTime.toFixed(2)}ms`);

                if (loadTime > 2000) {
                    console.warn(`Slow page load detected: ${loadTime.toFixed(2)}ms (target: < 2000ms)`);
                }
            });
        }

        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) {
                            console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
                        }
                    }
                });
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                console.log('Long task monitoring not available');
            }
        }
    }

    return {
        batchDOMUpdate,
        createDocumentFragment,
        measureDOMOperation,
        measureInteraction,
        delegateEvent,
        getPerformanceMetrics,
        init
    };
})();

// Notification System Module
const NotificationSystem = (() => {
    'use strict';
    
    let notificationContainer = null;
    let notificationQueue = [];
    let isProcessing = false;
    
    /**
     * Initialize the notification system
     */
    function init() {
        createNotificationContainer();
    }
    
    /**
     * Create the notification container
     */
    function createNotificationContainer() {
        if (notificationContainer) return;
        
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    /**
     * Show a toast notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type ('success', 'error', 'warning', 'info')
     * @param {number} duration - Duration in milliseconds (default: 4000)
     */
    function showToast(message, type = 'info', duration = 4000) {
        // Ensure notification system is initialized
        if (!notificationContainer) {
            createNotificationContainer();
        }
        
        const notification = {
            id: Date.now() + Math.random(),
            message,
            type,
            duration
        };
        
        notificationQueue.push(notification);
        processQueue();
    }
    
    /**
     * Process the notification queue
     */
    function processQueue() {
        if (isProcessing || notificationQueue.length === 0) return;
        
        isProcessing = true;
        const notification = notificationQueue.shift();
        displayNotification(notification);
    }
    
    /**
     * Display a notification
     * @param {Object} notification - Notification object
     */
    function displayNotification(notification) {
        // Ensure notification container exists
        if (!notificationContainer) {
            createNotificationContainer();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${notification.type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        
        // Create notification content
        const content = document.createElement('div');
        content.className = 'toast-content';
        
        const icon = document.createElement('span');
        icon.className = 'toast-icon';
        icon.textContent = getIconForType(notification.type);
        
        const message = document.createElement('span');
        message.className = 'toast-message';
        message.textContent = notification.message;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.textContent = '×';
        closeBtn.setAttribute('aria-label', 'Close notification');
        closeBtn.addEventListener('click', () => removeNotification(toast));
        
        content.appendChild(icon);
        content.appendChild(message);
        content.appendChild(closeBtn);
        toast.appendChild(content);
        
        // Add to container (with safety check)
        if (notificationContainer) {
            notificationContainer.appendChild(toast);
        } else {
            console.error('Notification container not available');
            return;
        }
        
        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('toast-show');
        });
        
        // Auto-remove after duration
        setTimeout(() => {
            removeNotification(toast);
        }, notification.duration);
    }
    
    /**
     * Remove a notification
     * @param {HTMLElement} toast - Toast element to remove
     */
    function removeNotification(toast) {
        if (!toast || !toast.parentNode) return;
        
        toast.classList.add('toast-hide');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            
            // Process next notification
            isProcessing = false;
            processQueue();
        }, 300);
    }
    
    /**
     * Get icon for notification type
     * @param {string} type - Notification type
     * @returns {string} Icon character
     */
    function getIconForType(type) {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            case 'info': 
            default: return 'ℹ';
        }
    }
    
    /**
     * Show success notification
     * @param {string} message - Success message
     */
    function showSuccess(message) {
        showToast(message, 'success');
    }
    
    /**
     * Show error notification
     * @param {string} message - Error message
     */
    function showError(message) {
        showToast(message, 'error', 6000); // Longer duration for errors
    }
    
    /**
     * Show warning notification
     * @param {string} message - Warning message
     */
    function showWarning(message) {
        showToast(message, 'warning', 5000);
    }
    
    /**
     * Show info notification
     * @param {string} message - Info message
     */
    function showInfo(message) {
        showToast(message, 'info');
    }
    
    /**
     * Clear all notifications
     */
    function clearAll() {
        if (notificationContainer) {
            notificationContainer.innerHTML = '';
        }
        notificationQueue = [];
        isProcessing = false;
    }
    
    return {
        init,
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        clearAll
    };
})();

// Storage Service Module
const StorageService = (() => {
    'use strict';
    
    /**
     * Check if Local Storage is available
     * @returns {boolean} True if Local Storage is available
     */
    function isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('Local Storage is not available');
            if (typeof NotificationSystem !== 'undefined') {
                NotificationSystem.showWarning('Local storage is not available. Data will not be saved between sessions.');
            }
            return false;
        }
    }
    
    /**
     * Get data from Local Storage
     * @param {string} key - Storage key
     * @returns {any} Parsed data or null if not found/error
     */
    function get(key) {
        if (!isAvailable()) return null;
        
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error(`Failed to load data for key: ${key}`, e);
            if (typeof NotificationSystem !== 'undefined') {
                NotificationSystem.showError(`Failed to load saved data. Some information may be lost.`);
            }
            return null;
        }
    }
    
    /**
     * Set data in Local Storage
     * @param {string} key - Storage key
     * @param {any} value - Data to store
     * @returns {boolean} True if successful
     */
    function set(key, value) {
        if (!isAvailable()) return false;
        
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`Failed to save data for key: ${key}`, e);
            
            if (typeof NotificationSystem !== 'undefined') {
                if (e.name === 'QuotaExceededError') {
                    NotificationSystem.showError('Storage space is full. Please clear some data or use a different browser.');
                } else {
                    NotificationSystem.showError('Failed to save data. Your changes may not be preserved.');
                }
            }
            return false;
        }
    }
    
    /**
     * Remove data from Local Storage
     * @param {string} key - Storage key
     * @returns {boolean} True if successful
     */
    function remove(key) {
        if (!isAvailable()) return false;
        
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error(`Failed to remove data for key: ${key}`, e);
            if (typeof NotificationSystem !== 'undefined') {
                NotificationSystem.showError('Failed to remove data from storage.');
            }
            return false;
        }
    }
    
    /**
     * Clear all Local Storage data
     * @returns {boolean} True if successful
     */
    function clear() {
        if (!isAvailable()) return false;
        
        try {
            localStorage.clear();
            if (typeof NotificationSystem !== 'undefined') {
                NotificationSystem.showSuccess('All data cleared successfully.');
            }
            return true;
        } catch (e) {
            console.error('Failed to clear storage', e);
            if (typeof NotificationSystem !== 'undefined') {
                NotificationSystem.showError('Failed to clear storage data.');
            }
            return false;
        }
    }
    
    return {
        get,
        set,
        remove,
        clear,
        isAvailable
    };
})();
// Storage Keys Constants
const STORAGE_KEYS = {
    TASKS: 'productivity_dashboard_tasks',
    LINKS: 'productivity_dashboard_links',
    THEME: 'productivity_dashboard_theme'
};

// Browser Compatibility Utilities
const BrowserUtils = (() => {
    'use strict';
    
    /**
     * Create a custom event with browser compatibility
     * @param {string} eventName - Name of the event
     * @param {Object} detail - Event detail object
     * @returns {Event} Custom event
     */
    function createCustomEvent(eventName, detail = {}) {
        try {
            // Modern browsers
            if (typeof CustomEvent !== 'undefined') {
                return new CustomEvent(eventName, { detail });
            } else {
                // Fallback for older browsers (IE)
                const event = document.createEvent('CustomEvent');
                event.initCustomEvent(eventName, false, false, detail);
                return event;
            }
        } catch (error) {
            console.warn('CustomEvent creation failed, using basic event:', error);
            // Ultimate fallback - basic event
            const event = document.createEvent('Event');
            event.initEvent(eventName, false, false);
            event.detail = detail;
            return event;
        }
    }
    
    /**
     * Check if browser supports required features
     * @returns {Object} Browser compatibility status
     */
    function checkBrowserCompatibility() {
        const features = {
            localStorage: typeof Storage !== 'undefined' && typeof localStorage !== 'undefined',
            customEvents: typeof CustomEvent !== 'undefined',
            urlConstructor: typeof URL !== 'undefined',
            addEventListener: typeof document.addEventListener !== 'undefined',
            querySelector: typeof document.querySelector !== 'undefined',
            json: typeof JSON !== 'undefined'
        };
        
        const unsupported = Object.keys(features).filter(key => !features[key]);
        
        return {
            supported: features,
            allSupported: unsupported.length === 0,
            unsupported: unsupported
        };
    }
    
    /**
     * Display browser compatibility warnings
     */
    function displayCompatibilityWarnings() {
        const compatibility = checkBrowserCompatibility();
        
        if (!compatibility.allSupported) {
            console.warn('Browser compatibility issues detected:', compatibility.unsupported);
            
            if (typeof NotificationSystem !== 'undefined') {
                NotificationSystem.showWarning(
                    `Your browser may not support all features. Consider updating to a modern browser for the best experience.`
                );
            }
            
            // Display specific warnings
            if (!compatibility.supported.localStorage) {
                console.error('LocalStorage not supported - data will not persist');
                if (typeof NotificationSystem !== 'undefined') {
                    NotificationSystem.showError('Data storage is not available in your browser. Your changes will not be saved.');
                }
            }
        }
    }
    
    return {
        createCustomEvent,
        checkBrowserCompatibility,
        displayCompatibilityWarnings
    };
})();

// Greeting Component Module
const GreetingComponent = (() => {
    'use strict';
    
    let updateInterval;
    
    /**
     * Initialize the greeting component
     */
    function init() {
        updateGreeting();
        // Update every second
        updateInterval = setInterval(updateGreeting, 1000);
    }
    
    /**
     * Safe DOM element getter with error handling
     * @param {string} id - Element ID
     * @param {string} context - Context for error reporting
     * @returns {HTMLElement|null} Element or null if not found
     */
    function safeGetElement(id, context = 'component') {
        try {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element with ID '${id}' not found in ${context}`);
                if (typeof NotificationSystem !== 'undefined') {
                    NotificationSystem.showWarning(`Some interface elements are missing. Please refresh the page.`);
                }
            }
            return element;
        } catch (error) {
            console.error(`Error accessing element '${id}' in ${context}:`, error);
            if (typeof NotificationSystem !== 'undefined') {
                NotificationSystem.showError(`Interface error detected. Please refresh the page.`);
            }
            return null;
        }
    }

    /**
     * Update the greeting, time, and date display
     */
    function updateGreeting() {
        const now = new Date();
        const greetingElement = safeGetElement('greeting-message', 'greeting component');
        const timeElement = safeGetElement('current-time', 'greeting component');
        const dateElement = safeGetElement('current-date', 'greeting component');
        
        if (greetingElement) {
            greetingElement.textContent = getGreetingMessage(now.getHours());
        }
        
        if (timeElement) {
            timeElement.textContent = formatTime(now);
        }
        
        if (dateElement) {
            dateElement.textContent = formatDate(now);
        }
    }
    
    /**
     * Get appropriate greeting message based on hour
     * @param {number} hour - Hour of the day (0-23)
     * @returns {string} Greeting message
     */
    function getGreetingMessage(hour) {
        if (hour >= 5 && hour <= 11) {
            return 'Good morning, Faris';
        } else if (hour >= 12 && hour <= 16) {
            return 'Good afternoon, Faris';
        } else if (hour >= 17 && hour <= 20) {
            return 'Good evening, Faris';
        } else {
            return 'Good night, Faris';
        }
    }
    
    /**
     * Format time in 12-hour format with AM/PM
     * @param {Date} date - Date object
     * @returns {string} Formatted time string
     */
    function formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
    
    /**
     * Format date in readable format
     * @param {Date} date - Date object
     * @returns {string} Formatted date string
     */
    function formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    /**
     * Cleanup function to clear intervals
     */
    function destroy() {
        if (updateInterval) {
            clearInterval(updateInterval);
        }
    }
    
    return {
        init,
        updateGreeting,
        getGreetingMessage,
        formatTime,
        formatDate,
        destroy
    };
})();
// Timer Component Module
const TimerComponent = (() => {
    'use strict';
    
    let timeRemaining = 1500; // 25 minutes in seconds
    let isRunning = false;
    let mode = 'focus'; // 'focus' or 'pomodoro'
    let intervalId = null;
    
    /**
     * Safe DOM element getter with error handling
     * @param {string} id - Element ID
     * @returns {HTMLElement|null} Element or null if not found
     */
    function safeGetElement(id) {
        try {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Timer component: Element '${id}' not found`);
            }
            return element;
        } catch (error) {
            console.error(`Timer component: Error accessing element '${id}':`, error);
            return null;
        }
    }
    
    /**
     * Initialize the timer component
     */
    function init() {
        updateDisplay();
        updateModeDisplay();
        setupEventListeners();
    }
    
    /**
     * Set up event listeners for timer controls with performance monitoring
     */
    function setupEventListeners() {
        const startBtn = safeGetElement('timer-start');
        const stopBtn = safeGetElement('timer-stop');
        const resetBtn = safeGetElement('timer-reset');
        const modeToggle = safeGetElement('mode-toggle');
        
        if (startBtn) {
            startBtn.addEventListener('click', function() {
                console.log('Timer start clicked');
                start();
            });
        }
        if (stopBtn) {
            stopBtn.addEventListener('click', function() {
                console.log('Timer stop clicked');
                stop();
            });
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                console.log('Timer reset clicked');
                reset();
            });
        }
        if (modeToggle) {
            modeToggle.addEventListener('click', function() {
                console.log('Timer mode toggle clicked');
                toggleMode();
            });
        }
    }
    
    /**
     * Start the timer countdown
     */
    function start() {
        console.log('Timer start function called, isRunning:', isRunning, 'timeRemaining:', timeRemaining);
        if (!isRunning && timeRemaining > 0) {
            isRunning = true;
            intervalId = setInterval(tick, 1000);
            console.log('Timer started, intervalId:', intervalId);
        } else {
            console.log('Timer not started - already running or time is 0');
        }
    }
    
    /**
     * Stop/pause the timer
     */
    function stop() {
        console.log('Timer stop function called, isRunning:', isRunning);
        if (isRunning) {
            isRunning = false;
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
                console.log('Timer stopped and interval cleared');
            }
        } else {
            console.log('Timer not stopped - not running');
        }
    }
    
    /**
     * Reset timer to initial duration
     */
    function reset() {
        console.log('Timer reset function called');
        stop();
        timeRemaining = 1500; // 25 minutes
        updateDisplay();
        console.log('Timer reset to 25:00');
    }
    
    /**
     * Timer tick function - decrements time and updates display
     */
    function tick() {
        if (timeRemaining > 0) {
            timeRemaining--;
            updateDisplay();
            console.log('Timer tick, time remaining:', timeRemaining);
        } else {
            onComplete();
        }
    }
    
    /**
     * Handle timer completion
     */
    function onComplete() {
        stop();
        console.log('Timer completed!');
        // Dispatch simple custom event
        try {
            const event = new CustomEvent('timer:completed', {
                detail: { mode: mode, completedAt: new Date() }
            });
            document.dispatchEvent(event);
            console.log('Timer completed event dispatched');
        } catch (error) {
            console.log('CustomEvent dispatch failed, using fallback:', error);
            // Fallback for older browsers
            try {
                const event = document.createEvent('CustomEvent');
                event.initCustomEvent('timer:completed', false, false, { mode: mode, completedAt: new Date() });
                document.dispatchEvent(event);
            } catch (fallbackError) {
                console.log('Event dispatch completely failed:', fallbackError);
            }
        }
    }
    
    /**
     * Switch to a specific timer mode
     * @param {string} newMode - Mode to switch to ('focus' or 'pomodoro')
     */
    function switchMode(newMode) {
        if (newMode !== 'focus' && newMode !== 'pomodoro') {
            console.warn('Invalid mode. Use "focus" or "pomodoro"');
            return;
        }
        
        if (mode !== newMode) {
            mode = newMode;
            updateModeDisplay();
            reset(); // Reset timer when switching modes
        }
    }
    
    /**
     * Toggle between focus and pomodoro modes
     */
    function toggleMode() {
        const newMode = mode === 'focus' ? 'pomodoro' : 'focus';
        switchMode(newMode);
    }
    
    /**
     * Update the mode display button text
     */
    function updateModeDisplay() {
        const modeToggle = document.getElementById('mode-toggle');
        const timerSection = document.querySelector('.timer-section h2');
        
        if (modeToggle) {
            modeToggle.textContent = mode === 'focus' ? 'Switch to Pomodoro' : 'Switch to Focus';
        }
        
        if (timerSection) {
            timerSection.textContent = mode === 'focus' ? 'Focus Timer' : 'Pomodoro Timer';
        }
    }
    
    /**
     * Update the timer display
     */
    function updateDisplay() {
        const display = safeGetElement('timer-display');
        if (display) {
            display.textContent = formatDisplay(timeRemaining);
        }
    }
    
    /**
     * Format seconds into MM:SS display
     * @param {number} seconds - Seconds to format
     * @returns {string} Formatted time string
     */
    function formatDisplay(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return {
        init,
        start,
        stop,
        reset,
        switchMode,
        formatDisplay,
        getTimeRemaining: () => timeRemaining,
        isRunning: () => isRunning,
        getMode: () => mode
    };
})();
// Task Manager Component Module
const TaskManager = (() => {
    'use strict';
    
    let tasks = [];
    
    /**
     * Initialize the task manager
     */
    function init() {
        load();
        setupEventListeners();
        render();
    }
    
    /**
     * Set up event listeners for task controls with performance optimizations
     */
    function setupEventListeners() {
        const addBtn = document.getElementById('add-task');
        const taskInput = document.getElementById('task-input');
        const sortBtn = document.getElementById('sort-tasks');
        const taskList = document.getElementById('task-list');
        
        if (addBtn) {
            addBtn.addEventListener('click', function() {
                console.log('Add task button clicked');
                handleAddTask();
            });
        }
        
        if (taskInput) {
            taskInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    console.log('Enter key pressed in task input');
                    handleAddTask();
                }
            });
        }
        
        if (sortBtn) {
            sortBtn.addEventListener('click', function() {
                console.log('Sort tasks button clicked');
                sortTasks();
            });
        }
        
        // Use event delegation for task actions
        if (taskList) {
            PerformanceOptimizer.delegateEvent(taskList, 'click', '[data-action]', function(event) {
                const taskId = this.getAttribute('data-task-id');
                const action = this.getAttribute('data-action');
                
                switch (action) {
                    case 'toggle':
                        console.log('Toggle task:', taskId);
                        toggleTask(taskId);
                        break;
                    case 'edit':
                        console.log('Edit task:', taskId);
                        editTaskPrompt(taskId);
                        break;
                    case 'delete':
                        console.log('Delete task:', taskId);
                        deleteTask(taskId);
                        break;
                }
            });
        }
    }
    
    /**
     * Handle add task button click
     */
    function handleAddTask() {
        const input = document.getElementById('task-input');
        if (!input) return;
        
        const text = input.value.trim();
        
        if (!text) {
            NotificationSystem.showWarning('Please enter a task description.');
            input.focus();
            return;
        }
        
        if (text.length > 500) {
            NotificationSystem.showError('Task description is too long. Maximum 500 characters allowed.');
            input.focus();
            return;
        }
        
        const success = addTask(text);
        if (success) {
            input.value = '';
            NotificationSystem.showSuccess('Task added successfully!');
        }
    }
    
    /**
     * Add a new task
     * @param {string} text - Task text
     * @returns {boolean} True if task was added successfully
     */
    function addTask(text) {
        console.log('addTask called with text:', text);
        
        if (!text || text.trim().length === 0) {
            console.log('Task text is empty, showing warning');
            NotificationSystem.showWarning('Task description cannot be empty.');
            return false;
        }
        
        const trimmedText = text.trim();
        console.log('Trimmed text:', trimmedText);
        
        if (trimmedText.length > 500) {
            console.log('Task text too long:', trimmedText.length);
            NotificationSystem.showError('Task description is too long. Maximum 500 characters allowed.');
            return false;
        }
        
        // Check for duplicates
        if (isDuplicate(trimmedText)) {
            console.log('Duplicate task detected');
            NotificationSystem.showWarning('This task already exists. Please enter a different task.');
            return false;
        }
        
        const task = {
            id: Date.now().toString(),
            text: trimmedText,
            completed: false,
            createdAt: Date.now()
        };
        
        console.log('Created task object:', task);
        tasks.push(task);
        console.log('Task added to array, total tasks:', tasks.length);
        
        const saved = save();
        console.log('Save result:', saved);
        
        if (saved) {
            console.log('Task saved successfully, rendering...');
            render();
            
            // Dispatch custom event for component communication
            try {
                document.dispatchEvent(BrowserUtils.createCustomEvent('task:added', {
                    task: task
                }));
                console.log('Task added event dispatched');
            } catch (error) {
                console.log('Event dispatch failed:', error);
            }
            
            return true;
        } else {
            console.log('Save failed, removing task from array');
            // Remove the task if save failed
            tasks.pop();
            NotificationSystem.showError('Failed to save task. Please try again.');
            return false;
        }
    }
    
    /**
     * Check if task text is duplicate
     * @param {string} text - Task text to check
     * @returns {boolean} True if duplicate exists
     */
    function isDuplicate(text) {
        return tasks.some(task => task.text === text);
    }
    
    /**
     * Edit a task's text
     * @param {string} id - Task ID
     * @param {string} newText - New task text
     */
    function editTask(id, newText) {
        const task = tasks.find(t => t.id === id);
        if (!task) {
            NotificationSystem.showError('Task not found.');
            return;
        }
        
        const trimmedText = newText.trim();
        
        if (!trimmedText) {
            NotificationSystem.showWarning('Task description cannot be empty.');
            return;
        }
        
        if (trimmedText.length > 500) {
            NotificationSystem.showError('Task description is too long. Maximum 500 characters allowed.');
            return;
        }
        
        // Check for duplicates (excluding current task)
        if (tasks.some(t => t.id !== id && t.text === trimmedText)) {
            NotificationSystem.showWarning('This task already exists. Please enter a different task.');
            return;
        }
        
        const oldText = task.text;
        task.text = trimmedText;
        
        const saved = save();
        if (saved) {
            render();
            NotificationSystem.showSuccess('Task updated successfully!');
        } else {
            // Revert change if save failed
            task.text = oldText;
            NotificationSystem.showError('Failed to save task changes. Please try again.');
        }
    }
    
    /**
     * Toggle task completion status
     * @param {string} id - Task ID
     */
    function toggleTask(id) {
        const task = tasks.find(t => t.id === id);
        if (!task) {
            NotificationSystem.showError('Task not found.');
            return;
        }
        
        task.completed = !task.completed;
        
        const saved = save();
        if (saved) {
            render();
            const status = task.completed ? 'completed' : 'reopened';
            NotificationSystem.showSuccess(`Task ${status}!`);
        } else {
            // Revert change if save failed
            task.completed = !task.completed;
            NotificationSystem.showError('Failed to update task status. Please try again.');
        }
    }
    
    /**
     * Delete a task
     * @param {string} id - Task ID
     */
    function deleteTask(id) {
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex === -1) {
            NotificationSystem.showError('Task not found.');
            return;
        }
        
        const deletedTask = tasks[taskIndex];
        tasks.splice(taskIndex, 1);
        
        const saved = save();
        if (saved) {
            render();
            NotificationSystem.showSuccess('Task deleted successfully!');
        } else {
            // Restore task if save failed
            tasks.splice(taskIndex, 0, deletedTask);
            NotificationSystem.showError('Failed to delete task. Please try again.');
        }
    }
    
    /**
     * Sort tasks alphabetically by text
     */
    function sortTasks() {
        const originalOrder = [...tasks];
        tasks.sort((a, b) => a.text.localeCompare(b.text));
        
        const saved = save();
        if (saved) {
            render();
            NotificationSystem.showSuccess('Tasks sorted alphabetically!');
        } else {
            // Restore original order if save failed
            tasks = originalOrder;
            NotificationSystem.showError('Failed to save sorted tasks. Please try again.');
        }
    }
    
    /**
     * Render tasks to DOM with immediate updates
     */
    function render() {
        console.log('TaskManager render() called');
        const taskList = document.getElementById('task-list');
        if (!taskList) {
            console.warn('Task list element not found');
            return;
        }
        
        console.log(`Rendering ${tasks.length} tasks`);
        
        // Clear existing content immediately
        taskList.innerHTML = '';
        
        // Create and append each task element directly
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            li.innerHTML = `
                <span class="task-text">${escapeHtml(task.text)}</span>
                <div class="task-actions">
                    <button class="btn btn-small btn-success" data-task-id="${task.id}" data-action="toggle">
                        ${task.completed ? 'Undo' : 'Done'}
                    </button>
                    <button class="btn btn-small btn-secondary" data-task-id="${task.id}" data-action="edit">
                        Edit
                    </button>
                    <button class="btn btn-small btn-danger" data-task-id="${task.id}" data-action="delete">
                        Delete
                    </button>
                </div>
            `;
            
            taskList.appendChild(li);
        });
        
        console.log(`✅ Successfully rendered ${tasks.length} tasks to DOM`);
    }
    
    /**
     * Prompt user to edit task
     * @param {string} id - Task ID
     */
    function editTaskPrompt(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            const newText = prompt('Edit task:', task.text);
            if (newText !== null) {
                editTask(id, newText);
            }
        }
    }
    
    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Save tasks to Local Storage
     * @returns {boolean} True if successful
     */
    function save() {
        console.log('TaskManager save() called, tasks to save:', tasks.length);
        const result = StorageService.set(STORAGE_KEYS.TASKS, tasks);
        console.log('StorageService.set result:', result);
        return result;
    }
    
    /**
     * Load tasks from Local Storage
     */
    function load() {
        const savedTasks = StorageService.get(STORAGE_KEYS.TASKS);
        tasks = Array.isArray(savedTasks) ? savedTasks : [];
    }
    
    return {
        init,
        addTask,
        editTask,
        toggleTask,
        deleteTask,
        sortTasks,
        editTaskPrompt,
        isDuplicate,
        getTasks: () => [...tasks]
    };
})();
// Quick Links Component Module
const QuickLinksComponent = (() => {
    'use strict';
    
    let links = [];
    
    /**
     * Initialize the quick links component
     */
    function init() {
        load();
        setupEventListeners();
        render();
    }
    
    /**
     * Set up event listeners for link controls with performance optimizations
     */
    function setupEventListeners() {
        const addBtn = document.getElementById('add-link');
        const container = document.getElementById('links-container');
        
        if (addBtn) {
            addBtn.addEventListener('click', function() {
                console.log('Add link button clicked');
                handleAddLink();
            });
        }
        
        // Use event delegation for link actions
        if (container) {
            PerformanceOptimizer.delegateEvent(container, 'click', '.link-button', function(event) {
                const url = this.getAttribute('data-url');
                if (url) {
                    console.log('Open link:', url);
                    openLink(url);
                }
            });
            
            PerformanceOptimizer.delegateEvent(container, 'click', '.link-delete', function(event) {
                const linkId = this.getAttribute('data-link-id');
                if (linkId) {
                    console.log('Delete link:', linkId);
                    deleteLink(linkId);
                }
            });
        }
    }
    
    /**
     * Handle add link button click
     */
    function handleAddLink() {
        const labelInput = document.getElementById('link-label');
        const urlInput = document.getElementById('link-url');
        
        if (!labelInput || !urlInput) return;
        
        const label = labelInput.value.trim();
        const url = urlInput.value.trim();
        
        // Validate inputs
        if (!label) {
            NotificationSystem.showWarning('Please enter a link name.');
            labelInput.focus();
            return;
        }
        
        if (label.length > 50) {
            NotificationSystem.showError('Link name is too long. Maximum 50 characters allowed.');
            labelInput.focus();
            return;
        }
        
        if (!url) {
            NotificationSystem.showWarning('Please enter a URL.');
            urlInput.focus();
            return;
        }
        
        if (!isValidUrl(url)) {
            NotificationSystem.showError('Please enter a valid URL (must start with http:// or https://).');
            urlInput.focus();
            return;
        }
        
        // Check for duplicate labels
        if (links.some(link => link.label === label)) {
            NotificationSystem.showWarning('A link with this name already exists. Please use a different name.');
            labelInput.focus();
            return;
        }
        
        const success = addLink(label, url);
        if (success) {
            labelInput.value = '';
            urlInput.value = '';
            NotificationSystem.showSuccess('Quick link added successfully!');
        }
    }
    
    /**
     * Validate URL format
     * @param {string} url - URL to validate
     * @returns {boolean} True if valid URL
     */
    function isValidUrl(url) {
        try {
            // Check if URL constructor is available (modern browsers)
            if (typeof URL !== 'undefined') {
                const urlObj = new URL(url);
                return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
            } else {
                // Fallback for older browsers using regex
                const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
                return urlPattern.test(url);
            }
        } catch (error) {
            console.warn('URL validation error:', error);
            NotificationSystem.showWarning('URL validation encountered an issue. Please check your browser compatibility.');
            // Fallback regex validation
            const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
            return urlPattern.test(url);
        }
    }
    
    /**
     * Add a new quick link
     * @param {string} label - Link label
     * @param {string} url - Link URL
     * @returns {boolean} True if successful
     */
    function addLink(label, url) {
        if (!label.trim() || !url.trim()) {
            NotificationSystem.showWarning('Both link name and URL are required.');
            return false;
        }
        
        if (!isValidUrl(url)) {
            NotificationSystem.showError('Invalid URL format. Please use http:// or https://');
            return false;
        }
        
        const link = {
            id: Date.now().toString(),
            label: label.trim(),
            url: url.trim()
        };
        
        links.push(link);
        const saved = save();
        
        if (saved) {
            render();
            return true;
        } else {
            // Remove the link if save failed
            links.pop();
            NotificationSystem.showError('Failed to save quick link. Please try again.');
            return false;
        }
    }
    
    /**
     * Delete a quick link
     * @param {string} id - Link ID
     */
    function deleteLink(id) {
        const linkIndex = links.findIndex(l => l.id === id);
        if (linkIndex === -1) {
            NotificationSystem.showError('Link not found.');
            return;
        }
        
        const deletedLink = links[linkIndex];
        links.splice(linkIndex, 1);
        
        const saved = save();
        if (saved) {
            render();
            NotificationSystem.showSuccess('Quick link deleted successfully!');
        } else {
            // Restore link if save failed
            links.splice(linkIndex, 0, deletedLink);
            NotificationSystem.showError('Failed to delete quick link. Please try again.');
        }
    }
    
    /**
     * Open link in new tab
     * @param {string} url - URL to open
     */
    function openLink(url) {
        try {
            window.open(url, '_blank', 'noopener,noreferrer');
            NotificationSystem.showInfo('Opening link in new tab...');
        } catch (error) {
            console.error('Failed to open link:', error);
            NotificationSystem.showError('Failed to open link. Please check the URL and try again.');
        }
    }
    
    /**
     * Render links to DOM with immediate updates
     */
    function render() {
        console.log('QuickLinksComponent render() called');
        const container = document.getElementById('links-container');
        if (!container) {
            console.warn('Links container element not found');
            return;
        }
        
        console.log(`Rendering ${links.length} links`);
        
        // Clear existing content immediately
        container.innerHTML = '';
        
        // Create and append each link element directly
        links.forEach(link => {
            const linkDiv = document.createElement('div');
            linkDiv.className = 'link-item';
            
            linkDiv.innerHTML = `
                <button class="link-button" data-url="${escapeHtml(link.url)}">
                    ${escapeHtml(link.label)}
                </button>
                <button class="link-delete" data-link-id="${link.id}">
                    ×
                </button>
            `;
            
            container.appendChild(linkDiv);
        });
        
        console.log(`✅ Successfully rendered ${links.length} links to DOM`);
    }
    
    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Save links to Local Storage
     * @returns {boolean} True if successful
     */
    function save() {
        return StorageService.set(STORAGE_KEYS.LINKS, links);
    }
    
    /**
     * Load links from Local Storage
     */
    function load() {
        const savedLinks = StorageService.get(STORAGE_KEYS.LINKS);
        links = Array.isArray(savedLinks) ? savedLinks : [];
    }
    
    return {
        init,
        addLink,
        deleteLink,
        openLink,
        getLinks: () => [...links]
    };
})();
// Theme Manager Component Module
const ThemeManager = (() => {
    'use strict';
    
    let currentTheme = 'light';
    
    /**
     * Initialize the theme manager
     */
    function init() {
        load();
        applyTheme(currentTheme);
        setupEventListeners();
    }
    
    /**
     * Set up event listeners for theme controls with performance monitoring
     */
    function setupEventListeners() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                console.log('Theme toggle clicked');
                toggleTheme();
            });
        }
    }
    
    /**
     * Toggle between light and dark themes
     */
    function toggleTheme() {
        const oldTheme = currentTheme;
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(currentTheme);
        
        const saved = save();
        if (saved) {
            // Dispatch custom event for component communication
            document.dispatchEvent(BrowserUtils.createCustomEvent('theme:changed', {
                theme: currentTheme
            }));
            
            NotificationSystem.showSuccess(`Switched to ${currentTheme} theme!`);
        } else {
            // Revert theme if save failed
            currentTheme = oldTheme;
            applyTheme(currentTheme);
            NotificationSystem.showError('Failed to save theme preference. Theme reverted.');
        }
    }
    
    /**
     * Apply theme to DOM with performance optimization
     * @param {string} theme - Theme name ('light' or 'dark')
     */
    function applyTheme(theme) {
        PerformanceOptimizer.measureDOMOperation('theme-apply', () => {
            const body = document.body;
            const themeToggle = document.getElementById('theme-toggle');
            
            PerformanceOptimizer.batchDOMUpdate(() => {
                if (theme === 'dark') {
                    body.setAttribute('data-theme', 'dark');
                    if (themeToggle) {
                        themeToggle.textContent = '☀️';
                        themeToggle.setAttribute('aria-label', 'Switch to light theme');
                    }
                } else {
                    body.removeAttribute('data-theme');
                    if (themeToggle) {
                        themeToggle.textContent = '🌙';
                        themeToggle.setAttribute('aria-label', 'Switch to dark theme');
                    }
                }
                
                currentTheme = theme;
            }, 'theme-update');
        });
    }

    /**
     * Save theme preference to Local Storage
     * @returns {boolean} True if successful
     */
    function save() {
        return StorageService.set(STORAGE_KEYS.THEME, currentTheme);
    }
    
    /**
     * Load theme preference from Local Storage
     */
    function load() {
        const savedTheme = StorageService.get(STORAGE_KEYS.THEME);
        currentTheme = savedTheme === 'dark' ? 'dark' : 'light';
    }
    
    return {
        init,
        toggleTheme,
        applyTheme,
        getCurrentTheme: () => currentTheme
    };
})();

// Main Application Controller
    const App = (() => {
        'use strict';

        // Application state
        let isInitialized = false;
        let components = {};

        /**
         * Initialize the entire application
         */
        function init() {
            // Prevent double initialization
            if (isInitialized) {
                console.warn('Application already initialized');
                return;
            }

            // Check if DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializeApplication);
            } else {
                initializeApplication();
            }
        }

        /**
         * Main application initialization function
         */
        function initializeApplication() {
            try {
                console.log('Initializing Productivity Dashboard...');

                // Initialize components in dependency order
                initializeComponents();

                // Set up global event listeners
                setupGlobalEventListeners();

                // Set up component communication
                setupComponentCommunication();

                // Ensure all components are properly initialized
                ensureComponentsReady();

                // Mark as initialized
                isInitialized = true;

                console.log('Productivity Dashboard initialized successfully');

                // Dispatch custom event for initialization complete
                document.dispatchEvent(BrowserUtils.createCustomEvent('app:initialized'));

            } catch (error) {
                console.error('Failed to initialize application:', error);
                handleInitializationError(error);
            }
        }

        /**
         * Ensure all components are properly initialized and ready
         */
        function ensureComponentsReady() {
            console.log('Ensuring components are ready...');
            
            // Double-check TaskManager initialization
            if (typeof TaskManager !== 'undefined') {
                // Verify TaskManager has all required methods
                const requiredMethods = ['addTask', 'editTask', 'deleteTask', 'getTasks'];
                const missingMethods = requiredMethods.filter(method => typeof TaskManager[method] !== 'function');
                
                if (missingMethods.length > 0) {
                    console.error('TaskManager missing methods:', missingMethods);
                    // Re-initialize TaskManager
                    TaskManager.init();
                }
                
                // Verify event listeners are attached
                const addButton = document.getElementById('add-task');
                const taskInput = document.getElementById('task-input');
                
                if (addButton && taskInput) {
                    // Check if button responds to clicks
                    const testClickHandler = function() {
                        console.log('Task add button click detected');
                    };
                    
                    // Add a test listener to verify event system works
                    addButton.addEventListener('click', testClickHandler, { once: true });
                    
                    console.log('✅ TaskManager event listeners verified');
                } else {
                    console.warn('⚠️ Task input elements not found during initialization');
                }
            } else {
                console.error('❌ TaskManager not available after initialization');
            }
            
            // Ensure NotificationSystem is ready
            if (typeof NotificationSystem !== 'undefined') {
                // Test notification system
                try {
                    // This should not show a notification, just test the system
                    const testContainer = document.getElementById('notification-container');
                    if (!testContainer) {
                        console.log('Re-initializing NotificationSystem...');
                        NotificationSystem.init();
                    }
                    console.log('✅ NotificationSystem verified');
                } catch (error) {
                    console.error('NotificationSystem verification failed:', error);
                }
            }
            
            console.log('Component readiness check complete');
        }

        /**
         * Initialize all application components in proper order
         */
        function initializeComponents() {
            console.log('Initializing components...');
            
            // Initialize notification system first
            NotificationSystem.init();
            
            // Check browser compatibility first
            BrowserUtils.displayCompatibilityWarnings();

            // Initialize theme first to set proper styling
            components.themeManager = ThemeManager;
            ThemeManager.init();

            // Initialize greeting component for time display
            components.greetingComponent = GreetingComponent;
            GreetingComponent.init();

            // Initialize timer component
            components.timerComponent = TimerComponent;
            TimerComponent.init();

            // Initialize task manager
            components.taskManager = TaskManager;
            TaskManager.init();
            
            // Ensure TaskManager event listeners are properly attached
            setTimeout(() => {
                reinforceTaskManagerListeners();
            }, 100);

            // Initialize quick links component
            components.quickLinksComponent = QuickLinksComponent;
            QuickLinksComponent.init();

            console.log('All components initialized');
        }

        /**
         * Set up global event listeners for application-wide interactions
         */
        function setupGlobalEventListeners() {
            console.log('Setting up global event listeners...');

            // Handle keyboard shortcuts
            document.addEventListener('keydown', handleGlobalKeydown);

            // Handle window events
            window.addEventListener('beforeunload', handleBeforeUnload);
            window.addEventListener('focus', handleWindowFocus);
            window.addEventListener('blur', handleWindowBlur);

            // Handle visibility changes (tab switching)
            document.addEventListener('visibilitychange', handleVisibilityChange);

            // Handle storage events (for multi-tab synchronization)
            window.addEventListener('storage', handleStorageChange);

            console.log('Global event listeners set up');
        }

        /**
         * Set up communication channels between components
         */
        function setupComponentCommunication() {
            console.log('Setting up component communication...');

            // Set up custom events for component communication
            document.addEventListener('timer:completed', handleTimerCompleted);
            document.addEventListener('task:added', handleTaskAdded);
            document.addEventListener('theme:changed', handleThemeChanged);

            console.log('Component communication set up');
        }

        /**
         * Handle global keyboard shortcuts
         * @param {KeyboardEvent} event - Keyboard event
         */
        function handleGlobalKeydown(event) {
            // Ctrl/Cmd + T: Focus task input
            if ((event.ctrlKey || event.metaKey) && event.key === 't') {
                event.preventDefault();
                const taskInput = document.getElementById('task-input');
                if (taskInput) {
                    taskInput.focus();
                }
            }

            // Ctrl/Cmd + L: Focus link label input
            if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
                event.preventDefault();
                const linkInput = document.getElementById('link-label');
                if (linkInput) {
                    linkInput.focus();
                }
            }

            // Space: Start/stop timer (when not in input field)
            if (event.code === 'Space' && !isInputFocused()) {
                event.preventDefault();
                if (components.timerComponent.isRunning()) {
                    components.timerComponent.stop();
                } else {
                    components.timerComponent.start();
                }
            }

            // Escape: Clear focused input
            if (event.key === 'Escape') {
                const activeElement = document.activeElement;
                if (activeElement && activeElement.tagName === 'INPUT') {
                    activeElement.blur();
                }
            }
        }

        /**
         * Check if an input field is currently focused
         * @returns {boolean} True if input is focused
         */
        function isInputFocused() {
            const activeElement = document.activeElement;
            return activeElement && (
                activeElement.tagName === 'INPUT' || 
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.contentEditable === 'true'
            );
        }

        /**
         * Handle before window unload (save state)
         */
        function handleBeforeUnload() {
            console.log('Application shutting down, saving state...');
            // Components handle their own persistence, but we can add cleanup here
        }

        /**
         * Handle window focus (resume timers, refresh data)
         */
        function handleWindowFocus() {
            // Refresh greeting when window regains focus
            if (components.greetingComponent) {
                components.greetingComponent.updateGreeting();
            }
        }

        /**
         * Handle window blur (pause non-essential updates)
         */
        function handleWindowBlur() {
            // Could pause non-essential updates here for performance
        }

        /**
         * Handle visibility change (tab switching)
         */
        function handleVisibilityChange() {
            if (document.hidden) {
                // Tab is hidden - could pause updates
                console.log('Tab hidden');
            } else {
                // Tab is visible - resume updates
                console.log('Tab visible');
                if (components.greetingComponent) {
                    components.greetingComponent.updateGreeting();
                }
            }
        }

        /**
         * Handle storage changes from other tabs
         * @param {StorageEvent} event - Storage event
         */
        function handleStorageChange(event) {
            console.log('Storage changed in another tab:', event.key);

            // Reload data if it was changed in another tab
            switch (event.key) {
                case STORAGE_KEYS.TASKS:
                    if (components.taskManager) {
                        // Reload and re-render tasks
                        components.taskManager.load();
                        components.taskManager.render();
                    }
                    break;
                case STORAGE_KEYS.LINKS:
                    if (components.quickLinksComponent) {
                        // Reload and re-render links
                        components.quickLinksComponent.load();
                        components.quickLinksComponent.render();
                    }
                    break;
                case STORAGE_KEYS.THEME:
                    if (components.themeManager) {
                        // Reload and apply theme
                        components.themeManager.load();
                        components.themeManager.applyTheme(components.themeManager.getCurrentTheme());
                    }
                    break;
            }
        }

        /**
         * Handle timer completion event
         */
        function handleTimerCompleted() {
            console.log('Timer completed - could show notification');
            // Could integrate with browser notifications API here
            // Could also trigger other actions like adding a completed session task
        }

        /**
         * Handle task added event
         * @param {CustomEvent} event - Task added event
         */
        function handleTaskAdded(event) {
            console.log('Task added:', event.detail);
            // Could trigger analytics or other side effects
        }

        /**
         * Handle theme changed event
         * @param {CustomEvent} event - Theme changed event
         */
        function handleThemeChanged(event) {
            console.log('Theme changed to:', event.detail);
            // Could trigger additional theme-related updates
        }

        /**
         * Handle initialization errors
         * @param {Error} error - Initialization error
         */
        function handleInitializationError(error) {
            // Display user-friendly error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.innerHTML = `
                <h3>Application Error</h3>
                <p>The dashboard failed to initialize properly. Please refresh the page.</p>
                <button onclick="location.reload()">Refresh Page</button>
            `;

            document.body.insertBefore(errorMessage, document.body.firstChild);
        }

        /**
         * Reinforce TaskManager event listeners to ensure they work
         */
        function reinforceTaskManagerListeners() {
            console.log('Reinforcing TaskManager event listeners...');
            
            const addButton = document.getElementById('add-task');
            const taskInput = document.getElementById('task-input');
            
            if (addButton && taskInput) {
                // Add a backup event listener that directly calls TaskManager
                addButton.addEventListener('click', function(e) {
                    console.log('Backup task add listener triggered');
                    
                    const text = taskInput.value.trim();
                    if (!text) {
                        if (typeof NotificationSystem !== 'undefined') {
                            NotificationSystem.showWarning('Please enter a task description.');
                        }
                        taskInput.focus();
                        return;
                    }
                    
                    if (text.length > 500) {
                        if (typeof NotificationSystem !== 'undefined') {
                            NotificationSystem.showError('Task description is too long. Maximum 500 characters allowed.');
                        }
                        taskInput.focus();
                        return;
                    }
                    
                    // Direct call to TaskManager
                    if (typeof TaskManager !== 'undefined' && TaskManager.addTask) {
                        const success = TaskManager.addTask(text);
                        if (success) {
                            taskInput.value = '';
                            if (typeof NotificationSystem !== 'undefined') {
                                NotificationSystem.showSuccess('Task added successfully!');
                            }
                            console.log('✅ Task added via backup listener');
                            
                            // Force immediate render to ensure task appears
                            setTimeout(() => {
                                if (typeof TaskManager.render === 'function') {
                                    TaskManager.render();
                                    console.log('🔄 Forced TaskManager render after backup add');
                                }
                            }, 50);
                        } else {
                            console.log('❌ TaskManager.addTask returned false');
                        }
                    } else {
                        console.error('❌ TaskManager not available');
                    }
                }, { passive: false });
                
                // Also add Enter key support
                taskInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        console.log('Enter key pressed in task input (backup listener)');
                        addButton.click();
                    }
                });
                
                console.log('✅ Backup TaskManager listeners added');
            } else {
                console.warn('⚠️ Cannot reinforce listeners - elements not found');
            }
        }

        /**
         * Get application status including performance metrics
         * @returns {Object} Application status information
         */
        function getStatus() {
            return {
                initialized: isInitialized,
                components: Object.keys(components),
                storageAvailable: StorageService.isAvailable(),
                performance: PerformanceOptimizer.getPerformanceMetrics()
            };
        }
        
        /**
         * Display performance metrics in console
         */
        function showPerformanceReport() {
            const metrics = PerformanceOptimizer.getPerformanceMetrics();
            console.group('📊 Performance Report');
            
            console.group('🔧 DOM Operations');
            console.log(`Total operations: ${metrics.domOperations.total}`);
            console.log(`Average time: ${metrics.domOperations.averageTime.toFixed(2)}ms`);
            console.log(`Slow operations: ${metrics.domOperations.slowOperations}`);
            if (metrics.domOperations.slowestOperation) {
                console.log(`Slowest: ${metrics.domOperations.slowestOperation.name} (${metrics.domOperations.slowestOperation.duration.toFixed(2)}ms)`);
            }
            console.groupEnd();
            
            console.group('👆 User Interactions');
            console.log(`Total interactions: ${metrics.interactions.total}`);
            console.log(`Average time: ${metrics.interactions.averageTime.toFixed(2)}ms`);
            console.log(`Slow interactions: ${metrics.interactions.slowInteractions}`);
            if (metrics.interactions.slowestInteraction) {
                console.log(`Slowest: ${metrics.interactions.slowestInteraction.type} (${metrics.interactions.slowestInteraction.duration.toFixed(2)}ms)`);
            }
            console.groupEnd();
            
            if (metrics.memoryUsage) {
                console.group('💾 Memory Usage');
                console.log(`Used: ${metrics.memoryUsage.used}MB`);
                console.log(`Total: ${metrics.memoryUsage.total}MB`);
                console.log(`Limit: ${metrics.memoryUsage.limit}MB`);
                console.groupEnd();
            }
            
            console.groupEnd();
            
            return metrics;
        }

        /**
         * Restart the application (for debugging/recovery)
         */
        function restart() {
            console.log('Restarting application...');

            // Clean up existing components
            if (components.greetingComponent && components.greetingComponent.destroy) {
                components.greetingComponent.destroy();
            }

            // Reset state
            isInitialized = false;
            components = {};

            // Reinitialize
            initializeApplication();
        }

        // Public API
        return {
            init,
            getStatus,
            showPerformanceReport,
            restart,
            components: () => ({ ...components }) // Return copy to prevent external modification
        };
    })();

// Make components globally accessible for onclick handlers and debugging
window.TaskManager = TaskManager;
window.QuickLinksComponent = QuickLinksComponent;
window.PerformanceOptimizer = PerformanceOptimizer;
window.App = App;

// Start the application
App.init();