const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Database configuration
const dbConfig = require('../config/db');

// Route to display all airports
router.get('/', (req, res) => {
  // Connect to the database
  sql.connect(dbConfig, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send({ error: 'Error connecting to database' });
      return;
    }

    // Query the database for airport information
    const request = new sql.Request();
    request.query('select flight_number, count(passenger_id) as Passengers from Booking group by flight_number', (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send({ error: 'Error retrieving airport information' });
        return;
      }
      // Create a table header
      let tableData = 'Flight Number | Passenger Count\n';
      tableData += '-----------------------------------\n';

      // Iterate through the result recordset and create table rows
      result.recordset.forEach(passenger => {
        tableData += `${passenger.flight_number.toString().padEnd(14)}| `;
        tableData += `  ${passenger.Passengers}\n`;
      });
      sql.close();
      // Send the table data as plain text
      res.setHeader('Content-Type', 'text/plain');
      res.send(tableData);
    });
  });
});







module.exports = router;
