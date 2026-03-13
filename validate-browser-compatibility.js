/**
 * Browser Compatibility Validation Script
 * Tests core functionality across different browsers for the Productivity Dashboard
 */

class BrowserCompatibilityValidator {
    constructor() {
        this.results = {
            browser: this.detectBrowser(),
            features: {},
            performance: {},
            errors: [],
            warnings: [],
            score: 0
        };
    }

    /**
     * Detect browser type and version
     */
    detectBrowser() {
        const ua = navigator.userAgent;
        let browser = { name: 'Unknown', version: 'Unknown', engine: 'Unknown' };

        // Chrome
        if (ua.includes('Chrome') && !ua.includes('Edg')) {
            browser.name = 'Chrome';
            browser.version = ua.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
            browser.engine = 'Blink';
        }
        // Firefox
        else if (ua.includes('Firefox')) {
            browser.name = 'Firefox';
            browser.version = ua.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
            browser.engine = 'Gecko';
        }
        // Edge
        else if (ua.includes('Edg')) {
            browser.name = 'Edge';
            browser.version = ua.match(/Edg\/([0-9.]+)/)?.[1] || 'Unknown';
            browser.engine = 'Blink';
        }
        // Safari
        else if (ua.includes('Safari') && !ua.includes('Chrome')) {
            browser.name = 'Safari';
            browser.version = ua.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown';
            browser.engine = 'WebKit';
        }

        return {
            ...browser,
            userAgent: ua,
            platform: navigator.platform,
            language: navigator.language
        };
    }

    /**
     * Test essential JavaScript features required by the dashboard
     */
    testJavaScriptFeatures() {
        console.log('🔧 Testing JavaScript Features...');
        
        const tests = {
            // ES6+ Features
            arrowFunctions: () => (() => true)(),
            templateLiterals: () => `test` === 'test',
            destructuring: () => { const [a] = [1]; return a === 1; },
            spreadOperator: () => [...[1, 2]].length === 2,
            classes: () => { class Test {} return typeof Test === 'function'; },
            
            // Async Features
            promises: () => typeof Promise !== 'undefined',
            asyncAwait: () => {
                async function test() { return true; }
                return test.constructor.name === 'AsyncFunction';
            },
            
            // Core APIs
            json: () => typeof JSON !== 'undefined' && typeof JSON.parse === 'function',
            localStorage: () => {
                try {
                    const test = '__test__';
                    localStorage.setItem(test, test);
                    localStorage.removeItem(test);
                    return true;
                } catch (e) {
                    return false;
                }
            },
            
            // DOM APIs
            querySelector: () => typeof document.querySelector === 'function',
            addEventListener: () => typeof document.addEventListener === 'function',
            customEvents: () => {
                try {
                    new CustomEvent('test');
                    return true;
                } catch (e) {
                    return false;
                }
            },
            
            // Modern APIs
            fetch: () => typeof fetch !== 'undefined',
            urlConstructor: () => {
                try {
                    new URL('https://example.com');
                    return true;
                } catch (e) {
                    return false;
                }
            },
            
            // Performance APIs
            performanceNow: () => typeof performance !== 'undefined' && typeof performance.now === 'function',
            requestAnimationFrame: () => typeof requestAnimationFrame !== 'undefined',
            
            // Array/Object methods
            arrayMethods: () => {
                const arr = [1, 2, 3];
                return typeof arr.map === 'function' && 
                       typeof arr.filter === 'function' && 
                       typeof arr.find === 'function';
            },
            objectMethods: () => {
                return typeof Object.keys === 'function' && 
                       typeof Object.assign === 'function';
            }
        };

        let passed = 0;
        const total = Object.keys(tests).length;

        for (const [name, test] of Object.entries(tests)) {
            try {
                const result = test();
                this.results.features[name] = result;
                if (result) {
                    passed++;
                    console.log(`✅ ${name}: Supported`);
                } else {
                    console.warn(`❌ ${name}: Not supported`);
                    this.results.warnings.push(`${name} is not supported`);
                }
            } catch (error) {
                this.results.features[name] = false;
                this.results.errors.push(`${name}: ${error.message}`);
                console.error(`❌ ${name}: Error - ${error.message}`);
            }
        }

        const jsScore = passed / total;
        console.log(`JavaScript Features: ${passed}/${total} (${Math.round(jsScore * 100)}%)`);
        return jsScore;
    }

    /**
     * Test CSS features required by the dashboard
     */
    testCSSFeatures() {
        console.log('🎨 Testing CSS Features...');
        
        const tests = {
            // Layout
            flexbox: () => CSS.supports('display', 'flex'),
            grid: () => CSS.supports('display', 'grid'),
            
            // Styling
            cssVariables: () => CSS.supports('color', 'var(--test)'),
            borderRadius: () => CSS.supports('border-radius', '5px'),
            boxShadow: () => CSS.supports('box-shadow', '0 0 5px black'),
            
            // Animations
            transitions: () => CSS.supports('transition', 'all 0.3s'),
            transforms: () => CSS.supports('transform', 'translateX(10px)'),
            animations: () => CSS.supports('animation', 'test 1s'),
            
            // Modern features
            calc: () => CSS.supports('width', 'calc(100% - 10px)'),
            mediaQueries: () => typeof window.matchMedia !== 'undefined',
            
            // Responsive
            viewport: () => {
                const meta = document.querySelector('meta[name="viewport"]');
                return meta !== null;
            }
        };

        let passed = 0;
        const total = Object.keys(tests).length;

        for (const [name, test] of Object.entries(tests)) {
            try {
                const result = test();
                this.results.features[`css_${name}`] = result;
                if (result) {
                    passed++;
                    console.log(`✅ CSS ${name}: Supported`);
                } else {
                    console.warn(`❌ CSS ${name}: Not supported`);
                    this.results.warnings.push(`CSS ${name} is not supported`);
                }
            } catch (error) {
                this.results.features[`css_${name}`] = false;
                this.results.errors.push(`CSS ${name}: ${error.message}`);
                console.error(`❌ CSS ${name}: Error - ${error.message}`);
            }
        }

        const cssScore = passed / total;
        console.log(`CSS Features: ${passed}/${total} (${Math.round(cssScore * 100)}%)`);
        return cssScore;
    }

    /**
     * Test Local Storage functionality specifically
     */
    testLocalStorageFunctionality() {
        console.log('💾 Testing Local Storage Functionality...');
        
        const tests = {
            basic: () => {
                const key = 'compatibility_test';
                const value = 'test_value';
                localStorage.setItem(key, value);
                const retrieved = localStorage.getItem(key);
                localStorage.removeItem(key);
                return retrieved === value;
            },
            
            json: () => {
                const key = 'compatibility_json_test';
                const value = { test: true, number: 42, array: [1, 2, 3] };
                localStorage.setItem(key, JSON.stringify(value));
                const retrieved = JSON.parse(localStorage.getItem(key));
                localStorage.removeItem(key);
                return JSON.stringify(retrieved) === JSON.stringify(value);
            },
            
            quota: () => {
                try {
                    const key = 'compatibility_quota_test';
                    const largeData = 'x'.repeat(100000); // 100KB
                    localStorage.setItem(key, largeData);
                    localStorage.removeItem(key);
                    return true;
                } catch (e) {
                    return false;
                }
            },
            
            events: () => {
                return typeof window.addEventListener === 'function';
            }
        };

        let passed = 0;
        const total = Object.keys(tests).length;

        for (const [name, test] of Object.entries(tests)) {
            try {
                const result = test();
                this.results.features[`storage_${name}`] = result;
                if (result) {
                    passed++;
                    console.log(`✅ Storage ${name}: Working`);
                } else {
                    console.warn(`❌ Storage ${name}: Failed`);
                    this.results.warnings.push(`Local Storage ${name} test failed`);
                }
            } catch (error) {
                this.results.features[`storage_${name}`] = false;
                this.results.errors.push(`Storage ${name}: ${error.message}`);
                console.error(`❌ Storage ${name}: Error - ${error.message}`);
            }
        }

        const storageScore = passed / total;
        console.log(`Local Storage: ${passed}/${total} (${Math.round(storageScore * 100)}%)`);
        return storageScore;
    }

    /**
     * Test responsive design capabilities
     */
    testResponsiveDesign() {
        console.log('📱 Testing Responsive Design...');
        
        const breakpoints = [
            { name: 'mobile', maxWidth: 480 },
            { name: 'tablet', maxWidth: 768 },
            { name: 'desktop', maxWidth: 1024 }
        ];

        let workingBreakpoints = 0;

        breakpoints.forEach(bp => {
            try {
                const mediaQuery = window.matchMedia(`(max-width: ${bp.maxWidth}px)`);
                if (typeof mediaQuery.matches === 'boolean') {
                    workingBreakpoints++;
                    console.log(`✅ ${bp.name} breakpoint: Working`);
                } else {
                    console.warn(`❌ ${bp.name} breakpoint: Not working`);
                }
            } catch (error) {
                console.error(`❌ ${bp.name} breakpoint: Error - ${error.message}`);
                this.results.errors.push(`${bp.name} breakpoint: ${error.message}`);
            }
        });

        // Test viewport meta tag
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        const hasViewport = viewportMeta !== null;
        
        if (hasViewport) {
            console.log('✅ Viewport meta tag: Present');
        } else {
            console.warn('❌ Viewport meta tag: Missing');
            this.results.warnings.push('Viewport meta tag is missing');
        }

        const responsiveScore = (workingBreakpoints + (hasViewport ? 1 : 0)) / (breakpoints.length + 1);
        console.log(`Responsive Design: ${Math.round(responsiveScore * 100)}%`);
        return responsiveScore;
    }

    /**
     * Test performance capabilities
     */
    testPerformance() {
        console.log('⚡ Testing Performance...');
        
        const startTime = performance.now();
        
        // Test DOM manipulation performance
        const testElement = document.createElement('div');
        testElement.style.display = 'none';
        document.body.appendChild(testElement);
        
        const domStart = performance.now();
        for (let i = 0; i < 1000; i++) {
            const child = document.createElement('span');
            child.textContent = `Item ${i}`;
            testElement.appendChild(child);
        }
        const domEnd = performance.now();
        const domTime = domEnd - domStart;
        
        document.body.removeChild(testElement);
        
        // Test array operations performance
        const arrayStart = performance.now();
        const largeArray = Array.from({ length: 10000 }, (_, i) => i);
        const filtered = largeArray.filter(x => x % 2 === 0);
        const mapped = filtered.map(x => x * 2);
        const arrayEnd = performance.now();
        const arrayTime = arrayEnd - arrayStart;
        
        const totalTime = performance.now() - startTime;
        
        this.results.performance = {
            domManipulation: domTime,
            arrayOperations: arrayTime,
            totalTest: totalTime,
            memoryUsage: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
            } : null
        };
        
        console.log(`DOM Manipulation: ${domTime.toFixed(2)}ms`);
        console.log(`Array Operations: ${arrayTime.toFixed(2)}ms`);
        console.log(`Total Test Time: ${totalTime.toFixed(2)}ms`);
        
        if (performance.memory) {
            console.log(`Memory Usage: ${this.results.performance.memoryUsage.used}MB`);
        }
        
        // Performance score based on timing thresholds
        const domScore = domTime < 100 ? 1 : domTime < 200 ? 0.7 : domTime < 500 ? 0.4 : 0;
        const arrayScore = arrayTime < 50 ? 1 : arrayTime < 100 ? 0.7 : arrayTime < 200 ? 0.4 : 0;
        
        return (domScore + arrayScore) / 2;
    }

    /**
     * Run all compatibility tests
     */
    async runAllTests() {
        console.log('🚀 Starting Browser Compatibility Validation...');
        console.log(`Browser: ${this.results.browser.name} ${this.results.browser.version}`);
        console.log(`Platform: ${this.results.browser.platform}`);
        
        const scores = {
            javascript: this.testJavaScriptFeatures(),
            css: this.testCSSFeatures(),
            storage: this.testLocalStorageFunctionality(),
            responsive: this.testResponsiveDesign(),
            performance: this.testPerformance()
        };
        
        // Calculate overall score
        const weights = {
            javascript: 0.3,
            css: 0.2,
            storage: 0.2,
            responsive: 0.15,
            performance: 0.15
        };
        
        this.results.score = Object.entries(scores).reduce((total, [key, score]) => {
            return total + (score * weights[key]);
        }, 0);
        
        const scorePercent = Math.round(this.results.score * 100);
        
        console.log('\n📊 Compatibility Test Results:');
        console.log(`JavaScript: ${Math.round(scores.javascript * 100)}%`);
        console.log(`CSS: ${Math.round(scores.css * 100)}%`);
        console.log(`Storage: ${Math.round(scores.storage * 100)}%`);
        console.log(`Responsive: ${Math.round(scores.responsive * 100)}%`);
        console.log(`Performance: ${Math.round(scores.performance * 100)}%`);
        console.log(`\n🎯 Overall Score: ${scorePercent}%`);
        
        if (scorePercent >= 90) {
            console.log('🎉 Excellent compatibility! Dashboard should work perfectly.');
        } else if (scorePercent >= 75) {
            console.log('✅ Good compatibility! Dashboard should work well with minor limitations.');
        } else if (scorePercent >= 60) {
            console.log('⚠️ Moderate compatibility. Some features may not work optimally.');
        } else {
            console.log('❌ Poor compatibility. Dashboard may have significant issues.');
        }
        
        if (this.results.errors.length > 0) {
            console.log('\n❌ Errors encountered:');
            this.results.errors.forEach(error => console.error(`  - ${error}`));
        }
        
        if (this.results.warnings.length > 0) {
            console.log('\n⚠️ Warnings:');
            this.results.warnings.forEach(warning => console.warn(`  - ${warning}`));
        }
        
        return this.results;
    }

    /**
     * Generate a detailed report
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            browser: this.results.browser,
            score: Math.round(this.results.score * 100),
            features: this.results.features,
            performance: this.results.performance,
            errors: this.results.errors,
            warnings: this.results.warnings,
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }

    /**
     * Generate recommendations based on test results
     */
    generateRecommendations() {
        const recommendations = [];
        
        if (!this.results.features.localStorage) {
            recommendations.push('Enable Local Storage or use a modern browser for data persistence');
        }
        
        if (!this.results.features.css_flexbox && !this.results.features.css_grid) {
            recommendations.push('Update browser for better layout support');
        }
        
        if (!this.results.features.customEvents) {
            recommendations.push('Some interactive features may not work properly');
        }
        
        if (this.results.performance.domManipulation > 200) {
            recommendations.push('Browser performance may be slow for complex operations');
        }
        
        if (this.results.score < 0.6) {
            recommendations.push('Consider updating to a modern browser for optimal experience');
        }
        
        return recommendations;
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrowserCompatibilityValidator;
}

// Auto-run if loaded directly
if (typeof window !== 'undefined') {
    window.BrowserCompatibilityValidator = BrowserCompatibilityValidator;
    
    // Provide global function for easy testing
    window.testBrowserCompatibility = async function() {
        const validator = new BrowserCompatibilityValidator();
        const results = await validator.runAllTests();
        const report = validator.generateReport();
        
        console.log('\n📋 Detailed Report:', report);
        return report;
    };
    
    console.log('🌐 Browser Compatibility Validator loaded');
    console.log('Run testBrowserCompatibility() to start testing');
}