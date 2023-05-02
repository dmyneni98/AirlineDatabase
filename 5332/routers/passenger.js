const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Database configuration
const dbConfig = require('../config/db');

router.get('/', (req, res) => {
  // Connect to the database
  sql.connect(dbConfig, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send({ error: 'Error connecting to database' });
      return;
    }

    // Query the database for person, passenger, and booker information
    const request = new sql.Request();
    request.query('SELECT Person.id, Person.first_name, Person.last_name, Person.date_of_birth FROM Person INNER JOIN Booker ON Person.id = Booker.id INNER JOIN Passenger ON Person.id = Passenger.id;', (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send({ error: 'Error retrieving information' });
        return;
      }

      // Create a table header
      let tableData = 'ID | First Name | Last Name  | Date of Birth\n';
      tableData += '---------------------------------------------\n';

      // Iterate through the result recordset and create table rows
      result.recordset.forEach(record => {
        tableData += `${record.id.toString().padEnd(3)}| `;
        tableData += `${record.first_name.padEnd(11)}| `;
        tableData += `${record.last_name.padEnd(11)}| `;
        tableData += `${record.date_of_birth.toISOString().substring(0, 10)}\n`;
      });
      sql.close();
      // Send the table data as plain text
      res.setHeader('Content-Type', 'text/plain');
      res.send(tableData);
    });
  });
});

module.exports = router;
