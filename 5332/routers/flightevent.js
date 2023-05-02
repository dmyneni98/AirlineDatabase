const express = require('express');
const router = express.Router();

const db = require('../config/db');
const sql = require('mssql');

router.get('/flight_event_id/:flight_event_id', (req, res, next) => {
  sql.connect(db, (err) => {
    if(err) {
      console.log(err);
    }

    const request = new sql.Request();
    request.input('flight_event_id', sql.Int, req.params.flight_event_id);
    request.query("SELECT * FROM FlightEvent where flight_event_id=@flight_event_id", (err, result) => {
      if(err) {
        console.log(err);
        res.send(err);
      }
      
      sql.close();

      res.send({
        route: 'flightevent',
        data: result.recordset[0]
      });
    });
  });
});

router.put('/flight_event_id/:flight_event_id', (req, res, next) => {
  sql.connect(db, (err) => {
    if(err) {
      console.log(err);
    }

    const request = new sql.Request();
    request.input('flight_event_id', sql.Int, req.params.flight_event_id)
      .input('gate_number', sql.Int, req.body.gate_number)
      .input('event_time', sql.VarChar, req.body.event_time)
      .query('update FlightEvent set gate_number=@gate_number,event_time=@event_time where flight_event_id=@flight_event_id', function (err, result) {
        if(err) {
          console.log(err);
          res.send(err);
        }
        
        sql.close();
  
        res.send({
          route: 'flightevent',
          data: `flightevent with flight_event_id=${req.params.flight_event_id} is updateded successfully` 
        });
    });
  });
});

module.exports = router;