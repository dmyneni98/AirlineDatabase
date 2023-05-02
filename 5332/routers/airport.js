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
    request.query('SELECT * FROM Airport', (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send({ error: 'Error retrieving airport information' });
        return;
      }
      // Create a table header
      let tableData = 'Airport ID | Name                                             | City                     | Country\n';
      tableData += '-----------------------------------------------------------------------------------------------------------------------------------------\n';

      // Iterate through the result recordset and create table rows
      result.recordset.forEach(airport => {
        tableData += `${airport.airport_id.toString().padEnd(10)}| `;
        tableData += `${airport.name.padEnd(50)}| `;
        tableData += `${airport.city.padEnd(25)}| `;
        tableData += `${airport.country}\n`;
      });
      sql.close();
      // Send the table data as plain text
      res.setHeader('Content-Type', 'text/plain');
      res.send(tableData);
    });
  });
});

// Route to add a new airport
router.post('/', (req, res) => {
  const { airport_id, name, city, country } = req.body;

  sql.connect(dbConfig, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send({ error: 'Error connecting to database' });
      return;
    }

    const request = new sql.Request();
    request.input('airport_id', sql.Int, airport_id);
    request.input('name', sql.VarChar, name);
    request.input('city', sql.VarChar, city);
    request.input('country', sql.VarChar, country);
    request.query('INSERT INTO Airport (airport_id, name, city, country) VALUES (@airport_id, @name, @city, @country)', (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send({ error:'Error adding new airport' });
        return;
      }
      res.send({ message: 'Airport added successfully', rowsAffected: result.rowsAffected });
    });
  });
});


// Route to delete an airport based on multiple conditions
router.delete('/', (req, res) => {
  const { airport_id, name, city, country } = req.body;

  sql.connect(dbConfig, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send({ error: 'Error connecting to database' });
      return;
    }

    const request = new sql.Request();
    let query = 'DELETE FROM Airport WHERE 1 = 1';

    if (airport_id) {
      request.input('airport_id', sql.Int, airport_id);
      query += ' AND airport_id = @airport_id';
    }
    if (name) {
      request.input('name', sql.VarChar, name);
      query += ' AND name = @name';
    }
    if (city) {
      request.input('city', sql.VarChar, city);
      query += ' AND city = @city';
    }
    if (country) {
      request.input('country', sql.VarChar, country);
      query += ' AND country = @country';
    }

    request.query(query, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send({ error: 'Error deleting airport' });
        return;
      }
      sql.close();
      res.send({ message: 'Airport(s) deleted successfully', rowsAffected: result.rowsAffected });
    });
  });
});

// Route to search for airports based on multiple conditions
router.get('/search', (req, res) => {
  const { airport_id, name, city, country } = req.query;

  sql.connect(dbConfig, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send({ error: 'Error connecting to database' });
      return;
    }

    const request = new sql.Request();
    let query = 'SELECT * FROM Airport WHERE 1 = 1';

    if (airport_id) {
      request.input('airport_id', sql.VarChar, airport_id);
      query += ' AND airport_id = @airport_id';
    }
    if (name) {
      request.input('name', sql.VarChar, name);
      query += ' AND name = @name';
    }
    if (city) {
      request.input('city', sql.VarChar, city);
      query += ' AND city = @city';
    }
    if (country) {
      request.input('country', sql.VarChar, country);
      query += ' AND country = @country';
    }

    request.query(query, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send({ error: 'Error retrieving airport information' });
        return;
      }

            const rows = result.recordset;

            let html = '<table><tr><th>Airport ID</th><th>Name</th><th>City</th><th>Country</th></tr>';

            for (let i = 0; i < rows.length; i++) {
              const row = rows[i];
              html += `<tr><td>${row.airport_id}</td><td>${row.name}</td><td>${row.city}</td><td>${row.country}</td></tr>`;
            }

            html += '</table>';
            sql.close();
            res.send(html);
          });
        });
      });


router.post('/update', (req, res) => {
  const { oldAirportId, oldName, oldCity, oldCountry, newAirportId, newName, newCity, newCountry } = req.body;

  sql.connect(dbConfig, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send({ error: 'Error connecting to database' });
      return;
    }

    const request = new sql.Request();
    let query = 'UPDATE Airport SET';

    if (newAirportId) {
      request.input('newAirportId', sql.Int, newAirportId);
      query += ' airport_id = @newAirportId,';
    }
    if (newName) {
      request.input('newName', sql.VarChar, newName);
      query += ' name = @newName,';
    }
    if (newCity) {
      request.input('newCity', sql.VarChar, newCity);
      query += ' city = @newCity,';
    }
    if (newCountry) {
      request.input('newCountry', sql.VarChar, newCountry);
      query += ' country = @newCountry,';
    }

    // remove trailing comma
    query = query.replace(/(^,)|(,$)/g, "");

    query += ' WHERE 1=1';

    if (oldAirportId) {
      request.input('oldAirportId', sql.Int, oldAirportId);
      query += ' AND airport_id = @oldAirportId';
    }
    if (oldName) {
      request.input('oldName', sql.VarChar, oldName);
      query += ' AND name = @oldName';
    }
    if (oldCity) {
      request.input('oldCity', sql.VarChar, oldCity);
      query += ' AND city = @oldCity';
    }
    if (oldCountry) {
      request.input('oldCountry', sql.VarChar, oldCountry);
      query += ' AND country = @oldCountry';
    }

    request.query(query, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send({ error: 'Error updating airport information' });
        return;
      }
      sql.close();
      res.send({ message: 'Airport information updated successfully', rowsAffected: result.rowsAffected });
    });
  });
});



module.exports = router;
