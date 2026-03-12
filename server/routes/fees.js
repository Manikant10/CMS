const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// GET /api/fees/student/:studentId - Get fee details for a specific student
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    if (global.mockDB) {
      const mockData = global.mockDB;
      const student = mockData.students.find(s => s._id === studentId);
      
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      
      // Get or create fee record for student
      let feeRecord = mockData.fees?.find(f => f.studentId === studentId);
      
      if (!feeRecord) {
        // Create default fee record
        feeRecord = {
          _id: Date.now().toString(),
          studentId: studentId,
          studentName: student.name,
          rollNo: student.rollNo,
          semester: student.semester,
          totalFee: 50000, // Default total fee
          paidAmount: 0,
          remainingAmount: 50000,
          feeBreakdown: [
            {
              type: 'Tuition Fee',
              amount: 30000,
              paid: 0,
              remaining: 30000
            },
            {
              type: 'Library Fee',
              amount: 5000,
              paid: 0,
              remaining: 5000
            },
            {
              type: 'Lab Fee',
              amount: 10000,
              paid: 0,
              remaining: 10000
            },
            {
              type: 'Examination Fee',
              amount: 5000,
              paid: 0,
              remaining: 5000
            }
          ],
          paymentHistory: [],
          lastUpdated: new Date(),
          createdAt: new Date()
        };
        
        if (!mockData.fees) {
          mockData.fees = [];
        }
        mockData.fees.push(feeRecord);
      }
      
      return res.json({ success: true, data: feeRecord });
    }
    
    // MongoDB logic would go here
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/fees - Get all fee records (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    if (global.mockDB) {
      const mockData = global.mockDB;
      const fees = mockData.fees || [];
      
      // Enrich fee records with student details
      const enrichedFees = fees.map(fee => {
        const student = mockData.students.find(s => s._id === fee.studentId);
        return {
          ...fee,
          studentName: student?.name || 'Unknown',
          rollNo: student?.rollNo || 'N/A',
          semester: student?.semester || 'N/A'
        };
      });
      
      return res.json({ success: true, data: enrichedFees });
    }
    
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/fees/:feeId - Update fee record (admin only)
router.put('/:feeId', protect, authorize('admin'), async (req, res) => {
  try {
    const { feeId } = req.params;
    const { paidAmount, paymentNote } = req.body;
    
    if (global.mockDB) {
      const mockData = global.mockDB;
      const feeIndex = mockData.fees?.findIndex(f => f._id === feeId);
      
      if (feeIndex === -1) {
        return res.status(404).json({ success: false, message: 'Fee record not found' });
      }
      
      const feeRecord = mockData.fees[feeIndex];
      
      // Update paid amount and remaining
      const newPaidAmount = parseFloat(paidAmount) || 0;
      const totalPaid = feeRecord.paidAmount + newPaidAmount;
      const remainingAmount = feeRecord.totalFee - totalPaid;
      
      // Add to payment history
      const paymentEntry = {
        date: new Date(),
        amount: newPaidAmount,
        paymentNote: paymentNote || 'Fee payment',
        paymentMethod: 'Offline',
        updatedBy: req.user.profileId
      };
      
      // Update fee record
      mockData.fees[feeIndex] = {
        ...feeRecord,
        paidAmount: totalPaid,
        remainingAmount: remainingAmount,
        paymentHistory: [...(feeRecord.paymentHistory || []), paymentEntry],
        lastUpdated: new Date()
      };
      
      // Update fee breakdown
      let remainingToDistribute = newPaidAmount;
      const updatedBreakdown = feeRecord.feeBreakdown.map(item => {
        if (remainingToDistribute > 0 && item.remaining > 0) {
          const deduction = Math.min(remainingToDistribute, item.remaining);
          remainingToDistribute -= deduction;
          return {
            ...item,
            paid: item.paid + deduction,
            remaining: item.remaining - deduction
          };
        }
        return item;
      });
      
      mockData.fees[feeIndex].feeBreakdown = updatedBreakdown;
      
      // Emit real-time update
      req.io.emit('fee-updated', {
        studentId: feeRecord.studentId,
        feeData: mockData.fees[feeIndex]
      });
      
      return res.json({ 
        success: true, 
        data: mockData.fees[feeIndex],
        message: 'Fee record updated successfully'
      });
    }
    
    res.json({ success: true, message: 'Fee updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/fees - Create fee record for student (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { studentId, totalFee, feeBreakdown } = req.body;
    
    if (global.mockDB) {
      const mockData = global.mockDB;
      const student = mockData.students.find(s => s._id === studentId);
      
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      
      // Check if fee record already exists
      const existingFee = mockData.fees?.find(f => f.studentId === studentId);
      if (existingFee) {
        return res.status(400).json({ success: false, message: 'Fee record already exists for this student' });
      }
      
      const newFeeRecord = {
        _id: Date.now().toString(),
        studentId: studentId,
        studentName: student.name,
        rollNo: student.rollNo,
        semester: student.semester,
        totalFee: totalFee || 50000,
        paidAmount: 0,
        remainingAmount: totalFee || 50000,
        feeBreakdown: feeBreakdown || [
          {
            type: 'Tuition Fee',
            amount: 30000,
            paid: 0,
            remaining: 30000
          },
          {
            type: 'Library Fee',
            amount: 5000,
            paid: 0,
            remaining: 5000
          },
          {
            type: 'Lab Fee',
            amount: 10000,
            paid: 0,
            remaining: 10000
          },
          {
            type: 'Examination Fee',
            amount: 5000,
            paid: 0,
            remaining: 5000
          }
        ],
        paymentHistory: [],
        createdAt: new Date(),
        lastUpdated: new Date()
      };
      
      if (!mockData.fees) {
        mockData.fees = [];
      }
      mockData.fees.push(newFeeRecord);
      
      return res.status(201).json({ 
        success: true, 
        data: newFeeRecord,
        message: 'Fee record created successfully'
      });
    }
    
    res.json({ success: true, message: 'Fee record created' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/fees/:feeId - Delete fee record (admin only)
router.delete('/:feeId', protect, authorize('admin'), async (req, res) => {
  try {
    const { feeId } = req.params;
    
    if (global.mockDB) {
      const mockData = global.mockDB;
      const feeIndex = mockData.fees?.findIndex(f => f._id === feeId);
      
      if (feeIndex === -1) {
        return res.status(404).json({ success: false, message: 'Fee record not found' });
      }
      
      const deletedFee = mockData.fees[feeIndex];
      mockData.fees.splice(feeIndex, 1);
      
      return res.json({ 
        success: true, 
        message: 'Fee record deleted successfully',
        data: deletedFee
      });
    }
    
    res.json({ success: true, message: 'Fee record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
