# Instructor Dashboard - Learning Management System

A professional, responsive instructor dashboard for managing courses, students, assignments, and exams. Built with HTML5, CSS3, and vanilla JavaScript.

## Features

### 📊 Dashboard
- Overview of key metrics (Total Courses, Total Students, Active Assignments, Active Exams)
- Visual performance charts with Chart.js
- Team performance metrics
- Student distribution graph
- Real-time statistics

### 📚 My Courses
- **Create Courses**: Add new courses with details
- **Edit Courses**: Modify existing course information
- **Delete Courses**: Remove courses from the system
- **Publish/Unpublish**: Control course visibility
- **View Enrollments**: See all students enrolled in each course
- Course cards display student count and lesson count

### 👥 Student Enrollment
- **Student Progress Tracking**: Visual progress bars showing completion percentage
- **Completed Lessons**: Display number of completed lessons
- **Last Active**: Track when students were last active
- **Status Indicator**: Show if student is active or inactive
- **Searchable Table**: Filter students by name or email
- **Action Buttons**: Quick access to view student details

### ✏️ Assignments
- **Create Assignments**: Add new assignments with due dates
- **Upload Documents**: Attach assignment files
- **View Submissions**: See all student submissions
- **Submission Status**: Track on-time, late, and non-submitted assignments
- **Submission Details**: 
  - Student name
  - Submission date and time
  - On-time or late status
  - Grades (if graded)

### 📝 Exams
- **Create Exams**: Set up exams with detailed parameters
- **Set Schedule**: Date, time, and duration
- **Configure Questions**: Specify total questions and marks
- **Passing Score**: Set minimum passing score
- **Active/Inactive Toggle**: Control exam availability
- **View Results**: Track student performance
- **Completion Stats**: See completed, in-progress, and not-attended counts

### 👤 Profile
- **Profile Information**: Display instructor details
- **Edit Profile**: Update personal information
- **Qualifications**: List certifications and qualifications
- **Statistics**: Show career metrics (courses, students, rating, reviews)
- **Contact Information**: Manage contact details and bio

## Color Scheme

```css
:root {
  --primary: #6C4AB6;
  --primary-dark: #4A2E8C;
  --lavender: #EDE7F6;
  --background: #F6F3FB;
  --white: #FFFFFF;
  --success: #7ED957;
  --danger: #FF6B81;
  --text-primary: #2E2E2E;
  --text-secondary: #8A8A8A;
}
```

## Navigation Menu

The sidebar contains quick links to:
- Dashboard
- My Courses
- Student Enrollment
- Assignments
- Exams
- Profile
- Help Center
- Settings
- Logout

## Responsive Design

The dashboard is fully responsive and adapts to different screen sizes:
- **Desktop** (1024px+): Full sidebar, multi-column layouts
- **Tablet** (768px - 1024px): Adjusted columns, compact sidebar
- **Mobile** (≤ 768px): Hamburger menu, single-column layout

## File Structure

```
instructor-dashboard/
├── index.html          # Main HTML file
├── js/
│   └── main.js         # JavaScript functionality
└── css/
    ├── styles.css      # Main stylesheet with all styling
    └── responsive.css  # Responsive design breakpoints
```

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables, Grid, and Flexbox
- **JavaScript (Vanilla)**: No dependencies required
- **Chart.js**: Data visualization (CDN included)

## Getting Started

1. Extract the files to your web server
2. Open `index.html` in a web browser
3. Navigate through the sections using the sidebar menu
4. All interactive features are ready to use

## Key Features Implementation

### Modal System
- Create forms for courses, assignments, and exams
- Smooth open/close animations
- Click outside to close functionality
- Keyboard shortcut support (Escape to close)

### Form Handling
- Validation for all required fields
- File upload support for assignments
- Real-time error messages
- Success notifications

### Data Management
- Search and filter functionality
- Progress tracking visualizations
- Status indicators with color coding
- Action buttons for CRUD operations

### Notifications
- Success notifications (green)
- Error notifications (red)
- Info notifications (blue)
- Auto-dismiss after 4 seconds

## Interactive Elements

### Buttons
- **Primary**: Create/Submit actions (Purple)
- **Secondary**: Cancel/Alternative actions (Lavender)
- **Danger**: Delete actions (Red)
- **Success**: Positive actions (Green)

### Status Badges
- **Active**: Green for active students/exams
- **Inactive**: Red for inactive status
- **On Time**: Green for on-time submissions
- **Late**: Red for late submissions
- **Not Submitted**: Gray for missing submissions

### Forms
- Course creation with name, description, duration
- Assignment creation with file upload
- Exam configuration with detailed parameters
- Profile update form

## Usage Tips

1. **Creating an Assignment**: 
   - Click "+ Create Assignment" button
   - Fill in title, description, due date
   - Select associated course
   - Upload assignment document
   - Click "Create Assignment"

2. **Viewing Student Enrollment**:
   - Navigate to "Student Enrollment"
   - Use search box to find specific students
   - Track progress with visual progress bars
   - Check last active time and status

3. **Managing Exams**:
   - Create exams with specific parameters
   - Toggle exam status on/off
   - View student results and completion stats
   - Set passing scores and duration

4. **Publishing Courses**:
   - Create new courses in "My Courses"
   - Use the publish/unpublish buttons
   - View all enrolled students
   - Edit or delete courses as needed

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- All data is currently handled client-side (for demonstration)
- Connect to a backend API to persist data
- Customize colors by modifying CSS variables in `:root`
- Extend functionality by adding new sections or features

## Future Enhancements

- Backend API integration
- Email notifications
- Advanced analytics
- Grade calculation
- Plagiarism detection
- Grade distribution charts
- Student attendance tracking
- Announcement system
