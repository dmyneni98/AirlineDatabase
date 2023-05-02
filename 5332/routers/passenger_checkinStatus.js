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
    request.query('select R.passenger_id, R.flight_number,R.Booker_id  from Booking R left join checkin C on R.passenger_id  = C.passenger_id  where C.confirmation_number is NULL', (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send({ error: 'Error retrieving airport information' });
        return;
      }
      // Create a table header
      let tableData = 'Flight Number | Passenger ID | Booking ID\n';
      tableData += '--------------------------------------------------\n';

      // Iterate through the result recordset and create table rows
      result.recordset.forEach(passenger => {
        tableData += `${passenger.flight_number.toString().padEnd(14)}| `;
        tableData += `  ${passenger.passenger_id.toString().padEnd(11)}| `;
        tableData += `  ${passenger.Booker_id}\n`;
      });
      sql.close();
      // Send the table data as plain text
      res.setHeader('Content-Type', 'text/plain');
      res.send(tableData);
    });
  });
});







module.exports = router;
