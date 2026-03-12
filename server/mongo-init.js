// MongoDB initialization script for BIT CMS
// This script runs when the container starts for the first time

db = db.getSiblingDB('bit_cms');

// Create collections with validation schemas
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "role", "profileId"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        password: {
          bsonType: "string",
          minLength: 6
        },
        role: {
          enum: ["admin", "faculty", "student"]
        },
        profileId: {
          bsonType: "string"
        },
        isActive: {
          bsonType: "bool",
          default: true
        }
      }
    }
  }
});

db.createCollection('students', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "rollNo", "semester", "section", "batch"],
      properties: {
        name: { bsonType: "string", minLength: 1 },
        rollNo: { bsonType: "string", minLength: 1 },
        semester: { bsonType: "int", minimum: 1, maximum: 8 },
        section: { bsonType: "string", pattern: "^[A-Z]$" },
        batch: { bsonType: "string" },
        phone: { bsonType: "string" },
        email: { bsonType: "string" },
        address: { bsonType: "string" },
        guardianName: { bsonType: "string" },
        guardianPhone: { bsonType: "string" }
      }
    }
  }
});

db.createCollection('faculty', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "empId", "department", "email"],
      properties: {
        name: { bsonType: "string", minLength: 1 },
        empId: { bsonType: "string", minLength: 1 },
        department: { bsonType: "string", minLength: 1 },
        email: { bsonType: "string" },
        phone: { bsonType: "string" },
        qualification: { bsonType: "string" },
        experience: { bsonType: "int", minimum: 0 },
        specialization: { bsonType: "array", items: { bsonType: "string" } }
      }
    }
  }
});

db.createCollection('notices', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "content", "type", "targetRole"],
      properties: {
        title: { bsonType: "string", minLength: 1 },
        content: { bsonType: "string", minLength: 1 },
        type: { enum: ["general", "exam", "fee", "holiday", "urgent"] },
        targetRole: { enum: ["all", "admin", "faculty", "student"] },
        priority: { enum: ["low", "medium", "high"], default: "medium" },
        attachments: { bsonType: "array", items: { bsonType: "string" } },
        isActive: { bsonType: "bool", default: true },
        expiresAt: { bsonType: "date" }
      }
    }
  }
});

db.createCollection('courses', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "code", "semester", "credits"],
      properties: {
        name: { bsonType: "string", minLength: 1 },
        code: { bsonType: "string", minLength: 1 },
        semester: { bsonType: "int", minimum: 1, maximum: 8 },
        credits: { bsonType: "int", minimum: 1, maximum: 6 },
        type: { enum: ["theory", "lab", "elective"] },
        faculty: { bsonType: "string" },
        room: { bsonType: "string" },
        schedule: { bsonType: "array" },
        isActive: { bsonType: "bool", default: true }
      }
    }
  }
});

db.createCollection('fees', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["studentId", "feeType", "semester", "totalAmount"],
      properties: {
        studentId: { bsonType: "string" },
        feeType: { enum: ["tuition", "library", "lab", "exam", "hostel"] },
        semester: { bsonType: "int", minimum: 1, maximum: 8 },
        totalAmount: { bsonType: "number", minimum: 0 },
        paidAmount: { bsonType: "number", minimum: 0 },
        dueDate: { bsonType: "date" },
        status: { enum: ["pending", "partial", "paid"], default: "pending" },
        paymentHistory: { bsonType: "array" }
      }
    }
  }
});

db.createCollection('attendance', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["studentId", "courseId", "date", "status"],
      properties: {
        studentId: { bsonType: "string" },
        courseId: { bsonType: "string" },
        date: { bsonType: "date" },
        status: { enum: ["present", "absent", "late"] },
        markedBy: { bsonType: "string" },
        remarks: { bsonType: "string" }
      }
    }
  }
});

db.createCollection('assignments', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "courseId", "dueDate", "type"],
      properties: {
        title: { bsonType: "string", minLength: 1 },
        description: { bsonType: "string" },
        courseId: { bsonType: "string" },
        dueDate: { bsonType: "date" },
        type: { enum: ["assignment", "quiz", "project", "exam"] },
        maxMarks: { bsonType: "number", minimum: 0 },
        attachments: { bsonType: "array", items: { bsonType: "string" } },
        isActive: { bsonType: "bool", default: true }
      }
    }
  }
});

db.createCollection('timetable', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["semester", "section", "day", "periods"],
      properties: {
        semester: { bsonType: "int", minimum: 1, maximum: 8 },
        section: { bsonType: "string", pattern: "^[A-Z]$" },
        day: { enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] },
        periods: { bsonType: "array" },
        isActive: { bsonType: "bool", default: true }
      }
    }
  }
});

db.createCollection('library', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "author", "isbn", "category"],
      properties: {
        title: { bsonType: "string", minLength: 1 },
        author: { bsonType: "string", minLength: 1 },
        isbn: { bsonType: "string", minLength: 1 },
        category: { bsonType: "string" },
        totalCopies: { bsonType: "int", minimum: 1 },
        availableCopies: { bsonType: "int", minimum: 0 },
        issuedBooks: { bsonType: "array" }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "profileId": 1 });

db.students.createIndex({ "rollNo": 1 }, { unique: true });
db.students.createIndex({ "semester": 1, "section": 1 });
db.students.createIndex({ "batch": 1 });

db.faculty.createIndex({ "empId": 1 }, { unique: true });
db.faculty.createIndex({ "department": 1 });

db.notices.createIndex({ "targetRole": 1 });
db.notices.createIndex({ "type": 1 });
db.notices.createIndex({ "createdAt": -1 });
db.notices.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

db.courses.createIndex({ "code": 1 }, { unique: true });
db.courses.createIndex({ "semester": 1 });
db.courses.createIndex({ "faculty": 1 });

db.fees.createIndex({ "studentId": 1 });
db.fees.createIndex({ "semester": 1 });
db.fees.createIndex({ "status": 1 });
db.fees.createIndex({ "dueDate": 1 });

db.attendance.createIndex({ "studentId": 1, "date": -1 });
db.attendance.createIndex({ "courseId": 1, "date": -1 });
db.attendance.createIndex({ "date": -1 });

db.assignments.createIndex({ "courseId": 1 });
db.assignments.createIndex({ "dueDate": 1 });
db.assignments.createIndex({ "type": 1 });

db.timetable.createIndex({ "semester": 1, "section": 1 });
db.timetable.createIndex({ "day": 1 });

db.library.createIndex({ "isbn": 1 }, { unique: true });
db.library.createIndex({ "title": "text", "author": "text" });
db.library.createIndex({ "category": 1 });

// Insert initial admin user
db.users.insertOne({
  email: "admin@bit.edu",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm", // admin123
  role: "admin",
  profileId: "admin-001",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Insert sample data for demonstration
db.notices.insertMany([
  {
    title: "Welcome to BIT CMS",
    content: "This is a comprehensive college management system with real-time features.",
    type: "general",
    targetRole: "all",
    priority: "high",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "System Features",
    content: "Real-time notifications, attendance tracking, fee management, and more.",
    type: "general",
    targetRole: "all",
    priority: "medium",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('BIT CMS Database initialized successfully!');
print('Default admin credentials: admin@bit.edu / admin123');
