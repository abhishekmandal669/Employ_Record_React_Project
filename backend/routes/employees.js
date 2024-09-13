// routes/employees.js
const express = require('express');
const mongoose = require('mongoose');
const Employee = require('../models/Employee'); // Your Employee model
const router = express.Router();

// Create a new employee
router.post('/', async (req, res) => {
  const {
    employeeId,
    firstName,
    lastName,
    email,
    phoneNumber,
    dateOfBirth,
    department,
    position,
    dateOfJoining,
    salary,
  } = req.body;

  try {
    const newEmployee = new Employee({
      employeeId,
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      department,
      position,
      dateOfJoining,
      salary,
    });

    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists. Please use a different email.' });
    }
    console.error('Error adding employee:', error);
    res.status(400).json({ message: 'Error adding employee', error: error.message });
  }
});

// EDIT an employee by employeeId or ObjectId (_id) (PUT)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    let updatedEmployee;

    if (mongoose.Types.ObjectId.isValid(id)) {
      // Update by ObjectId (_id)
      updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, {
        new: true, 
        runValidators: true,
      });
    } else {
      // Update by employeeId
      updatedEmployee = await Employee.findOneAndUpdate({ employeeId: id }, updateData, {
        new: true, 
        runValidators: true,
      });
    }

    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(400).json({ message: 'Error updating employee', error: error.message });
  }
});

// DELETE an employee by employeeId or ObjectId (_id) (DELETE)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    let deletedEmployee;

    if (mongoose.Types.ObjectId.isValid(id)) {
      // Delete by ObjectId (_id)
      deletedEmployee = await Employee.findByIdAndDelete(id);
    } else {
      // Delete by employeeId
      deletedEmployee = await Employee.findOneAndDelete({ employeeId: id });
    }

    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(400).json({ message: 'Error deleting employee', error: error.message });
  }
});

// Backend (search logic in your Express route)
router.get('/search', async (req, res) => {
  const { employeeId, name, department } = req.query;

  let searchQuery = {};

  // Employee ID check
  if (employeeId) {
    searchQuery.employeeId = employeeId;
  }

  // Department check
  if (department) {
    searchQuery.department = department;
  }

  // Name check
  if (name) {
    const nameParts = name.split(' '); // Split the name by spaces
    if (nameParts.length === 1) {
      // If only one name is provided, search in both first and last name
      searchQuery.$or = [
        { firstName: new RegExp(nameParts[0], 'i') },
        { lastName: new RegExp(nameParts[0], 'i') }
      ];
    } else {
      // If two names are provided, assume the first part is firstName and the second part is lastName
      searchQuery.$or = [
        {
          $and: [
            { firstName: new RegExp(nameParts[0], 'i') },
            { lastName: new RegExp(nameParts[1], 'i') }
          ]
        }
      ];
    }
  }

  try {
    const employees = await Employee.find(searchQuery);
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


router.get('/', async (req, res) => {
  try {
    const { employeeId, name, department, dateFrom, dateTo } = req.query;
    let query = {};

    // Logging query parameters for debugging
    console.log('Query parameters:', req.query);

    // Build the query based on provided filters
    if (employeeId) query.employeeId = employeeId;

    if (name) {
      query.$or = [
        { firstName: { $regex: name, $options: 'i' } },
        { lastName: { $regex: name, $options: 'i' } }
      ];
    }

    if (department) query.department = department;

    // Ensure dates are in the correct format
    if (dateFrom && dateTo) {
      if (new Date(dateFrom) > new Date(dateTo)) {
        return res.status(400).json({ message: 'dateFrom cannot be greater than dateTo' });
      }

      query.dateOfJoining = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      };
    }

    // Logging the built query for debugging
    console.log('MongoDB Query:', query);

    const employees = await Employee.find(query);
    res.status(200).json(employees);

  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees', error: error.message });
  }
});

module.exports = router;
