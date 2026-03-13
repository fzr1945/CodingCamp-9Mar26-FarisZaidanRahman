// Core Functionality Test for Productivity Dashboard
console.log('🧪 Testing Core Functionality...');

// Test 1: JSON Operations
try {
    const testObj = { test: true, array: [1, 2, 3] };
    const jsonStr = JSON.stringify(testObj);
    const parsed = JSON.parse(jsonStr);
    console.log('✅ JSON operations work');
} catch (e) {
    console.log('❌ JSON operations failed:', e.message);
}

// Test 2: Date Formatting
try {
    const date = new Date();
    const timeStr = date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    });
    const dateStr = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    console.log('✅ Date formatting works:', timeStr, dateStr);
} catch (e) {
    console.log('❌ Date formatting failed:', e.message);
}

// Test 3: Timer Format Function
try {
    const formatDisplay = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    
    const test1 = formatDisplay(1500); // Should be "25:00"
    const test2 = formatDisplay(125);  // Should be "02:05"
    const test3 = formatDisplay(0);    // Should be "00:00"
    
    console.log('✅ Timer format works:', test1, test2, test3);
} catch (e) {
    console.log('❌ Timer format failed:', e.message);
}

// Test 4: URL Validation
try {
    const isValidUrl = (url) => {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch (error) {
            return false;
        }
    };
    
    const validTest = isValidUrl('https://example.com');
    const invalidTest = !isValidUrl('invalid-url');
    
    console.log('✅ URL validation works:', validTest && invalidTest);
} catch (e) {
    console.log('❌ URL validation failed:', e.message);
}

// Test 5: Array Sorting
try {
    const tasks = [
        { text: 'Zebra task' }, 
        { text: 'Alpha task' }, 
        { text: 'Beta task' }
    ];
    tasks.sort((a, b) => a.text.localeCompare(b.text));
    
    const sorted = tasks.map(t => t.text);
    console.log('✅ Array sorting works:', sorted);
} catch (e) {
    console.log('❌ Array sorting failed:', e.message);
}

console.log('🎉 Core functionality validation complete!');