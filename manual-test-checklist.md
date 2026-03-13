# Manual Test Checklist - Core Components

## Test Instructions
Open `index.html` in a web browser and verify the following functionality:

## ✅ Storage Service (Foundation)
- [ ] Application loads without errors in browser console
- [ ] No localStorage errors in console
- [ ] Data persists when page is refreshed

## ✅ Greeting Component
- [ ] Current time displays and updates every second
- [ ] Current date displays correctly
- [ ] Greeting message shows appropriate text based on time:
  - Morning (5 AM - 11:59 AM): "Good morning, Faris"
  - Afternoon (12 PM - 4:59 PM): "Good afternoon, Faris"  
  - Evening (5 PM - 8:59 PM): "Good evening, Faris"
  - Night (9 PM - 4:59 AM): "Good night, Faris"

## ✅ Timer Component
- [ ] Timer displays "25:00" initially
- [ ] Start button begins countdown
- [ ] Stop button pauses timer (preserves remaining time)
- [ ] Reset button returns to "25:00"
- [ ] Timer displays in MM:SS format correctly
- [ ] "Switch to Pomodoro" button changes to "Switch to Focus"
- [ ] Mode switching works both ways
- [ ] Timer section title updates with mode

## ✅ Task Manager Component (Partially Implemented)
- [ ] Can add new tasks via input field and button
- [ ] Tasks appear in the list below
- [ ] Cannot add empty tasks
- [ ] Cannot add duplicate tasks
- [ ] "Done" button marks tasks as completed (strikethrough)
- [ ] "Edit" button allows task text modification
- [ ] "Delete" button removes tasks
- [ ] "Sort A-Z" button sorts tasks alphabetically
- [ ] Tasks persist after page refresh

## ✅ Quick Links Component (Partially Implemented)
- [ ] Can add new links with label and URL
- [ ] Links appear as buttons
- [ ] Clicking link buttons opens URLs in new tab
- [ ] Can delete links with × button
- [ ] Links persist after page refresh
- [ ] URL validation prevents invalid URLs

## ✅ Theme Manager Component (Partially Implemented)
- [ ] Theme toggle button (🌙/☀️) switches themes
- [ ] Light theme: light background, dark text
- [ ] Dark theme: dark background, light text
- [ ] Theme preference persists after page refresh
- [ ] All components respect theme colors

## Expected Issues (Known Limitations)
- Some UI interactions may need refinement
- Error messages may not be user-friendly yet
- Performance optimizations not yet implemented
- Cross-browser testing not completed

## Test Results
**Date:** ___________  
**Browser:** ___________  
**Overall Status:** ⭕ Pass / ❌ Fail  
**Notes:** ___________