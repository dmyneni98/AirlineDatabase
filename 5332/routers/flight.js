const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Database configuration
const dbConfig = require('../config/db');

// Route to display all flights
router.get('/', (req, res) => {
  // Connect to the database
  sql.connect(dbConfig, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send({ error: 'Error connecting to database' });
      return;
    }

    // Query the database for flight information
    const request = new sql.Request();
    request.query('SELECT * FROM Flight', (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send({ error: 'Error retrieving flight information' });
        return;
      }

      // Create a table header
      let tableData = 'Flight Number | Status      | Aircraft Model   | Capacity | Number of Passengers | Price\n';
      tableData += '------------------------------------------------------------------------------------------------\n';

      // Iterate through the result recordset and create table rows
      result.recordset.forEach(flight => {
        tableData += `${flight.flight_number.padEnd(14)}| `;
        tableData += `${flight.status.padEnd(12)}| `;
        tableData += `${flight.aircraft_model.padEnd(17)}| `;
        tableData += `${flight.capacity.toString().padEnd(9)}| `;
        tableData += `${flight.num_of_passengers.toString().padEnd(21)}| `;
        tableData += `${flight.price.toFixed(2)}\n`;
      });
      sql.close();
      // Send the table data as plain text
      res.setHeader('Content-Type', 'text/plain');
      res.send(tableData);
    });
  });
});


/// Route to add a new flight
router.post('/', (req, res) => {
  const { flight_number, status, aircraft_model, capacity, num_of_passengers, price } = req.body;

  sql.connect(dbConfig, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send({ error: 'Error connecting to database' });
      return;
    }

    const request = new sql.Request();
    request.input('flight_number', sql.VarChar, flight_number);
    request.input('status', sql.VarChar, status);
    request.input('aircraft_model', sql.VarChar, aircraft_model);
    request.input('capacity', sql.Int, capacity);
    request.input('num_of_passengers', sql.Int, num_of_passengers);
    request.input('price', sql.Decimal(10, 2), price);

    request.query('INSERT INTO Flight (flight_number, status, aircraft_model, capacity, num_of_passengers, price) VALUES (@flight_number, @status, @aircraft_model, @capacity, @num_of_passengers, @price)', (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send({ error: 'Error adding new flight' });
        return;
      }
      sql.close();
      res.send({ message: 'Flight added successfully', rowsAffected: result.rowsAffected });
    });
  });
});


// Route to delete a flight by flight_number
router.delete('/', (req, res) => {
  const { flight_number } = req.body;

  sql.connect(dbConfig, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send({ error: 'Error connecting to database' });
      return;
    }

    const request = new sql.Request();
    request.input('flight_number', sql.VarChar, flight_number);
    request.query('DELETE FROM Flight WHERE flight_number = @flight_number', (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send({ error: 'Error deleting flight' });
        return;
      }
      sql.close();
      res.send({ message: 'Flight deleted successfully', rowsAffected: result.rowsAffected });
    });
});
});

// Route to update a flight by flight_number
router.put('/:flight_number', (req, res) => {
  const { flight_number } = req.params;
  const { status, aircraft_model, capacity, num_of_passengers, price } = req.body;

  sql.connect(dbConfig, (err) => {
  if (err) {
    console.log(err);
    res.status(500).send({ error: 'Error connecting to database' });
    return;
  }

  const request = new sql.Request();
  request.input('flight_number', sql.VarChar, flight_number);

  let query = 'UPDATE Flight SET ';


  if (status) {
    request.input('status', sql.VarChar, status);
    query += 'status = @status, ';
  }
  if (aircraft_model) {
    request.input('aircraft_model', sql.VarChar, aircraft_model);
    query += 'aircraft_model = @aircraft_model, ';
  }
  if (capacity) {
    request.input('capacity', sql.Int, capacity);
    query += 'capacity = @capacity, ';
  }
  if (num_of_passengers) {
    request.input('num_of_passengers', sql.Int, num_of_passengers);
    query += 'num_of_passengers = @num_of_passengers, ';
  }
  if (price) {
    request.input('price', sql.Decimal(10, 2), price);
    query += 'price = @price, ';
  }

  // remove trailing comma and space
  query = query.slice(0, -2);

  query += ' WHERE flight_number = @flight_number';

  request.query(query, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send({ error: 'Error updating flight information' });
      return;
    }
    sql.close();
    res.send({ message: 'Flight information updated successfully', rowsAffected: result.rowsAffected });
    });
  });
});


module.exports = router;
