const express = require("express");
const bodyParser = require("body-parser");
const airportRoutes = require('./routers/airport');
const flightRoutes = require('./routers/flight');
const passengerRoutes = require('./routers/passenger');
const cancelBookingRoutes = require('./routers/cancel_booking');
const checkinRoutes = require('./routers/checkin');
const flighteventRoutes = require('./routers/flightevent');
const customerRoutes = require('./routers/customer');
const passengerCountRoutes = require('./routers/passenger_count');
const passengerCheckinStatus = require('./routers/passenger_checkinStatus');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
const sql = require('mssql');
// var dbConfig = {
//   user: 'admin',
//   password: 'JEehamQf8trOZS5xaEnx',
//   server: 'database-project-2023.c47efrinlj0k.us-east-2.rds.amazonaws.com',
//   database: 'Spring2023',
//   port: 1433,
//   options: {
//     encrypt: true,
//     trustServerCertificate: true,
//     integratedSecurity: false
//   },
// };

app.use('/airports', airportRoutes);
app.use('/flights', flightRoutes);
app.use('/passengers', passengerRoutes);
app.use('/cancleBooking', cancelBookingRoutes);
app.use('/checkin', checkinRoutes);
app.use('/flightevent', flighteventRoutes);
app.use('/customer', customerRoutes);
app.use('/flightBookingStatus',passengerCountRoutes);
app.use('/passengerCheckinStatus',passengerCheckinStatus);

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

// sql.connect(dbConfig, (err) => {
//   if (err) {
//     console.log(err);
//     res.status(500).send({ error: 'Error connecting to database' });
//     return;
//   }
//   console.log("connected to database");
// });