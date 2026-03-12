const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

// GET /api/courses
router.get('/', protect, async (req, res) => {
  try {
    const { semester, type, search } = req.query;
    
    if (global.mockDB) {
      const mockData = global.mockDB;
      let courses = mockData.courses;
      
      // Filter by semester
      if (semester) {
        courses = courses.filter(course => course.semester === parseInt(semester));
      }
      
      // Filter by type
      if (type) {
        courses = courses.filter(course => course.type.toLowerCase() === type.toLowerCase());
      }
      
      // Search by name or code
      if (search) {
        courses = courses.filter(course => 
          course.name.toLowerCase().includes(search.toLowerCase()) ||
          course.code.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Populate faculty information
      courses = courses.map(course => {
        const faculty = mockData.faculty.find(f => f._id === course.faculty);
        return {
          ...course,
          faculty: faculty ? {
            _id: faculty._id,
            name: faculty.name,
            empId: faculty.empId
          } : null
        };
      });
      
      return res.json({ success: true, data: courses });
    }
    
    const query = { isActive: true };
    if (semester) query.semester = semester;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }
    const courses = await Course.find(query).populate('faculty', 'name empId').sort({ semester: 1, code: 1 });
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/courses/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('faculty', 'name empId email');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/courses
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    if (global.mockDB) {
      const mockData = global.mockDB;
      const newCourse = {
        _id: '60d0fe4f5311236168a109' + (mockData.courses.length + 6),
        ...req.body,
        isActive: true,
        createdAt: new Date()
      };
      
      mockData.courses.push(newCourse);
      
      // Populate faculty information
      const faculty = mockData.faculty.find(f => f._id === newCourse.faculty);
      newCourse.faculty = faculty ? {
        _id: faculty._id,
        name: faculty.name,
        empId: faculty.empId
      } : null;
      
      return res.status(201).json({ success: true, data: newCourse });
    }
    
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/courses/:id
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    if (global.mockDB) {
      const mockData = global.mockDB;
      const courseIndex = mockData.courses.findIndex(c => c._id === req.params.id);
      
      if (courseIndex === -1) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      
      // Update course
      mockData.courses[courseIndex] = { ...mockData.courses[courseIndex], ...req.body };
      const updatedCourse = mockData.courses[courseIndex];
      
      // Populate faculty information
      const faculty = mockData.faculty.find(f => f._id === updatedCourse.faculty);
      updatedCourse.faculty = faculty ? {
        _id: faculty._id,
        name: faculty.name,
        empId: faculty.empId
      } : null;
      
      return res.json({ success: true, data: updatedCourse });
    }
    
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/courses/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    if (global.mockDB) {
      const mockData = global.mockDB;
      const courseIndex = mockData.courses.findIndex(c => c._id === req.params.id);
      
      if (courseIndex === -1) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      
      // Soft delete by setting isActive to false
      mockData.courses[courseIndex].isActive = false;
      
      return res.json({ success: true, message: 'Course deactivated' });
    }
    
    await Course.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Course deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
