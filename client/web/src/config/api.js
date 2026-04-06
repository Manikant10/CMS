// API Configuration
// Set REACT_APP_API_URL in your .env file for the deployed backend URL.
// Falls back to localhost for local development.
const normalizeBaseUrl = (value = '') => value
  .trim()
  .replace(/^['"]|['"]$/g, '')
  .replace(/\/+$/, '');

const API_BASE_URL = normalizeBaseUrl(process.env.REACT_APP_API_URL || '') || 'http://localhost:5000';

const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    me: `${API_BASE_URL}/api/auth/me`,
    dashboard: `${API_BASE_URL}/api/dashboard`,
    notices: `${API_BASE_URL}/api/notices`,
    students: `${API_BASE_URL}/api/students`,
    faculty: `${API_BASE_URL}/api/faculty`,
    courses: `${API_BASE_URL}/api/courses`,
    fees: `${API_BASE_URL}/api/fees`,
    attendance: `${API_BASE_URL}/api/attendance`,
    timetable: `${API_BASE_URL}/api/timetable`,
    exams: `${API_BASE_URL}/api/exams`,
    results: `${API_BASE_URL}/api/results`,
    approvals: `${API_BASE_URL}/api/approvals`,
    admin: `${API_BASE_URL}/api/admin`,
    health: `${API_BASE_URL}/api/health`,
  },
};

export default apiConfig;
