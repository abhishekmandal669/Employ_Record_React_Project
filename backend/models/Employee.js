// models/Employee.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String },
  dateOfBirth: { type: Date },
  department: { type: String, required: true },
  position: { type: String },
  dateOfJoining: { type: Date, required: true },
  salary: { type: Number, required: true },
});

module.exports = mongoose.model('Employee', employeeSchema);
