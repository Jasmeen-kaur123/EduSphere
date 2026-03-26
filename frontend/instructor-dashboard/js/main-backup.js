/**
 * MAIN.JS - APP INITIALIZATION & MODULE LOADER
 * ======================================================
 * 
 * This file serves as the main entry point for the instructor dashboard.
 * All functionality has been organized into separate module files for
 * better maintainability and code organization.
 * 
 * MODULE STRUCTURE:
 * ================
 * 
 * 1. api-utils.js
 *    - API fetch helper
 *    - fetchCourses(), fetchStudents()
 *    - Course backend operations
 * 
 * 2. modal-manager.js
 *    - Modal opening/closing functions
 *    - Global modal event handling
 * 
 * 3. navigation.js
 *    - Section navigation
 *    - Profile navigation
 * 
 * 4. courses-manager.js
 *    - Course CRUD operations
 *    - Course form handling
 *    - Course rendering
 * 
 * 5. assignments-manager.js
 *    - Assignment CRUD operations
 *    - Assignment form handling
 *    - Assignment rendering
 * 
 * 6. exams-manager.js
 *    - Exam CRUD operations
 *    - Exam form handling
 *    - Exam rendering & taking
 * 
 * 7. students-manager.js
 *    - Student loading and display
 *    - Student modal functionality
 * 
 * 8. search-controller.js
 *    - Global search functionality
 *    - Search result rendering
 * 
 * 9. notifications.js
 *    - Notification display system
 *    - Notification bell functionality
 * 
 * 10. charts-manager.js
 *     - Performance chart initialization and rendering
 * 
 * 11. profile-manager.js
 *     - Profile form handling
 *     - Profile editing
 *     - Logout functionality
 * 
 * 12. utils.js
 *     - HTML escaping utility
 *     - File upload handling
 * 
 * 13. app.js
 *     - Main app initialization
 *     - Module coordination
 *     - DOMContentLoaded handler
 * 
 * ======================================================
 * 
 * HOW TO LOAD MODULES:
 * 
 * In your HTML index.html, load files in this order:
 * 
 * <script src="js/utils.js"></script>
 * <script src="js/api-utils.js"></script>
 * <script src="js/modal-manager.js"></script>
 * <script src="js/navigation.js"></script>
 * <script src="js/notifications.js"></script>
 * <script src="js/search-controller.js"></script>
 * <script src="js/charts-manager.js"></script>
 * <script src="js/courses-manager.js"></script>
 * <script src="js/assignments-manager.js"></script>
 * <script src="js/exams-manager.js"></script>
 * <script src="js/students-manager.js"></script>
 * <script src="js/profile-manager.js"></script>
 * <script src="js/app.js"></script>
 * <script src="js/main.js"></script>
 * 
 * Note: main.js is loaded last as a documentation file.
 */
