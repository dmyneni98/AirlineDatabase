const express = require('express');
const router = express.Router();

const db = require('../config/db');
const sql = require('mssql');

router.get('/top', (req, res, next) => {
    sql.connect(db, (err) => {
      if(err) {
        console.log(err);
      }
  
      const request = new sql.Request();
      request.query('SELECT TOP 10 * FROM LoyaltyMember ORDER BY points_balance DESC;', function(err, result) {
        if(err) {
          console.log(err);
          res.send(err);
        }
        
        sql.close();
  
        res.send({
          route: 'customer',
          data: result.recordset 
        });
      });
    });
  });

  module.exports = router;