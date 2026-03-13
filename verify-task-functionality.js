/**
 * Task Functionality Verification Script
 * Run this in the browser console to verify task add functionality
 */

console.log('🔍 Starting Task Functionality Verification...');

// Test 1: Check if TaskManager exists and is properly exposed
console.log('\n📋 Test 1: TaskManager Availability');
if (typeof TaskManager === 'undefined') {
    console.error('❌ TaskManager is not available globally');
} else {
    console.log('✅ TaskManager is available globally');
    
    // Check required methods
    const requiredMethods = ['addTask', 'editTask', 'deleteTask', 'getTasks', 'init'];
    requiredMethods.forEach(method => {
        if (typeof TaskManager[method] === 'function') {
            console.log(`✅ TaskManager.${method} is available`);
        } else {
            console.error(`❌ TaskManager.${method} is missing or not a function`);
        }
    });
}

// Test 2: Check DOM elements
console.log('\n🏗️ Test 2: DOM Elements');
const taskInput = document.getElementById('task-input');
const addButton = document.getElementById('add-task');
const taskList = document.getElementById('task-list');

if (taskInput) {
    console.log('✅ Task input element found');
} else {
    console.error('❌ Task input element not found');
}

if (addButton) {
    console.log('✅ Add task button found');
} else {
    console.error('❌ Add task button not found');
}

if (taskList) {
    console.log('✅ Task list element found');
} else {
    console.error('❌ Task list element not found');
}

// Test 3: Test direct TaskManager functionality
console.log('\n🧪 Test 3: Direct TaskManager Testing');
if (typeof TaskManager !== 'undefined' && TaskManager.addTask) {
    try {
        // Get initial task count
        const initialCount = TaskManager.getTasks().length;
        console.log(`Initial task count: ${initialCount}`);
        
        // Add a test task
        const testTaskText = 'Verification test task ' + Date.now();
        console.log(`Adding test task: "${testTaskText}"`);
        
        const addResult = TaskManager.addTask(testTaskText);
        console.log(`Add result: ${addResult}`);
        
        if (addResult) {
            const newCount = TaskManager.getTasks().length;
            console.log(`New task count: ${newCount}`);
            
            if (newCount === initialCount + 1) {
                console.log('✅ TaskManager.addTask working correctly');
                
                // Find and remove the test task
                const tasks = TaskManager.getTasks();
                const testTask = tasks.find(t => t.text === testTaskText);
                if (testTask) {
                    const deleteResult = TaskManager.deleteTask(testTask.id);
                    console.log(`Test task cleanup result: ${deleteResult}`);
                    console.log('🧹 Test task cleaned up');
                } else {
                    console.warn('⚠️ Test task not found for cleanup');
                }
            } else {
                console.error('❌ Task count mismatch after add');
            }
        } else {
            console.error('❌ TaskManager.addTask returned false');
        }
    } catch (error) {
        console.error(`❌ TaskManager test error: ${error.message}`);
    }
} else {
    console.error('❌ TaskManager.addTask not available for testing');
}

// Test 4: Test UI interaction
console.log('\n🖱️ Test 4: UI Interaction Testing');
if (taskInput && addButton) {
    try {
        // Save original value
        const originalValue = taskInput.value;
        
        // Set test value
        const uiTestText = 'UI test task ' + Date.now();
        taskInput.value = uiTestText;
        console.log(`Set input value: "${uiTestText}"`);
        
        // Simulate button click
        console.log('Simulating button click...');
        addButton.click();
        
        // Check result after a short delay
        setTimeout(() => {
            if (taskInput.value === '') {
                console.log('✅ UI interaction working (input cleared)');
            } else if (taskInput.value === uiTestText) {
                console.error('❌ UI interaction not working (input not cleared)');
            } else {
                console.warn(`⚠️ Unexpected input value: "${taskInput.value}"`);
            }
            
            // Restore original value
            taskInput.value = originalValue;
        }, 500);
        
    } catch (error) {
        console.error(`❌ UI interaction test error: ${error.message}`);
    }
} else {
    console.error('❌ Required UI elements not available for testing');
}

// Test 5: Check event listeners
console.log('\n👂 Test 5: Event Listener Check');
if (addButton) {
    // Check if button has onclick handler
    if (addButton.onclick) {
        console.log('✅ Button has onclick handler');
    } else {
        console.log('ℹ️ Button does not have onclick handler (using addEventListener)');
    }
    
    // Try to check for event listeners (Chrome DevTools only)
    if (typeof getEventListeners === 'function') {
        try {
            const listeners = getEventListeners(addButton);
            console.log('Button event listeners:', listeners);
        } catch (e) {
            console.log('ℹ️ Cannot inspect event listeners (not in Chrome DevTools)');
        }
    } else {
        console.log('ℹ️ getEventListeners not available (not in Chrome DevTools)');
    }
}

// Test 6: Check storage functionality
console.log('\n💾 Test 6: Storage Functionality');
try {
    const testKey = 'verification_test';
    const testValue = { test: true, timestamp: Date.now() };
    
    localStorage.setItem(testKey, JSON.stringify(testValue));
    const retrieved = JSON.parse(localStorage.getItem(testKey));
    localStorage.removeItem(testKey);
    
    if (retrieved && retrieved.test === true) {
        console.log('✅ LocalStorage working correctly');
    } else {
        console.error('❌ LocalStorage not working correctly');
    }
} catch (error) {
    console.error(`❌ LocalStorage test error: ${error.message}`);
}

// Test 7: Check NotificationSystem
console.log('\n🔔 Test 7: NotificationSystem Check');
if (typeof NotificationSystem === 'undefined') {
    console.error('❌ NotificationSystem not available');
} else {
    console.log('✅ NotificationSystem available');
    
    // Test notification methods
    const notificationMethods = ['showSuccess', 'showError', 'showWarning', 'showInfo'];
    notificationMethods.forEach(method => {
        if (typeof NotificationSystem[method] === 'function') {
            console.log(`✅ NotificationSystem.${method} available`);
        } else {
            console.error(`❌ NotificationSystem.${method} missing`);
        }
    });
}

console.log('\n📊 Verification Complete');
console.log('If all tests pass, task add functionality should be working.');
console.log('If any tests fail, there may be initialization or implementation issues.');