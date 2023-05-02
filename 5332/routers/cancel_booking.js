const express = require('express');
const router = express.Router();
const sql = require('mssql');


/** cancel flight booking
  1. modify payment status 
  2. minus the accumulated points from the loyalmember who is in the booking.
  3. count the number passenger in the reservation, and minus the number from 
     the flight.num_of_passengers
 */


//2. check in: assign seat, update bag informatio



// Database configuration
var dbConfig = {
  user: 'admin',
  password: 'JEehamQf8trOZS5xaEnx',
  server: 'database-project-2023.c47efrinlj0k.us-east-2.rds.amazonaws.com',
  database: 'Spring2023',
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    integratedSecurity: false
  },
};

router.get('/getConfirmationNumber', (req, res) => {

  const { lastName, firstName, bookingDate, flightNumber } = req.query;
  // Connect to the database
  sql.connect(dbConfig, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send({ error: 'Error connecting to database' });
      return;
    }

    const request = new sql.Request();

    request.input('lastName', sql.VarChar, lastName);
    request.input('firstName', sql.VarChar, firstName);
    if (bookingDate) {
      request.input('bookingDate', sql.Date, new Date(bookingDate));
    }
    if (flightNumber) {
      request.input('flightNumber', sql.VarChar, flightNumber);
    }
    const query = `
  SELECT DISTINCT
     B.confirmation_number, Person.first_name, Person.last_name
  FROM
    Booking B
    JOIN Booker P ON B.Booker_id = P.id
    JOIN Person ON P.id = Person.id
    JOIN Reservation R ON B.confirmation_number = R.confirmation_number
  WHERE
    Person.last_name = @lastName
    AND Person.first_name = @firstName
    ${bookingDate ? 'AND R.booking_date = @bookingDate' : ''}
    ${flightNumber ? 'AND B.flight_number = @flightNumber' : ''}
    `;


    request.query(query, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send({ error: 'Error retrieving information' });
        return;
      }

      // Create a table to display the results
      let html = '<table><tr><th>Confirmation Number</th><th>First Name</th><th>Last Name</th></tr>';
      result.recordset.forEach(record => {
        html += `<tr><td>${record.confirmation_number}</td><td>${record.first_name}</td><td>${record.last_name}</td></tr>`;
      });
      html += '</table>';

      res.send(html);

    });
  });
});


// Cancel booking
router.post('/cancelBooking', async (req, res) => {
  try {
    const { confirmationNumber } = req.body;
    const pool = await new sql.ConnectionPool(dbConfig).connect();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    const request = new sql.Request(transaction);
    request.input('confirmationNumber', sql.VarChar, confirmationNumber);

    //check the status of this confirmation, return if it's in status of 'canceled'
    const checkStatus = await request.query(`
      SELECT payment_status
      FROM Reservation
      WHERE confirmation_number = @confirmationNumber
    `);
    const status = checkStatus.recordset;

  // If no reservation found
  if (status.length === 0) {
    res.status(404).json({ message: 'No such reservation' });
    return;
  }
  console.log(status)
  if (status[0].payment_status === 'Cancelled') {
    res.status(404).json({ message: 'Fail: This reservation had been canceled' });
    return;
  }
//uapdta num of passenger in flight
  const flights = await request.query(`
    SELECT 
      booking.confirmation_number, 
      flight.flight_number, 
      flight.num_of_passengers, 
      COUNT(booking.passenger_id) as num_ticket
    FROM booking JOIN flight ON booking.flight_number = flight.flight_number
    WHERE booking.confirmation_number = @confirmationNumber
    GROUP BY 
      booking.confirmation_number, 
      flight.flight_number,
      flight.num_of_passengers
  `);
  const flightList = flights.recordset;

  console.log(flights);
  const updateNumPassengers = async (flight) => {
    const { confirmation_number, flight_number, num_of_passengers, num_ticket } = flight;
    console.log(`num_passengers: ${num_of_passengers}`);
    console.log(`num_ticket: ${num_ticket}`);
    const new_num_passengers = num_of_passengers - num_ticket;
    console.log(`new_num_passengers: ${new_num_passengers}`);
  
    const ticketRequest = new sql.Request(transaction);
    ticketRequest.input('flight_number', sql.VarChar, flight_number);
    ticketRequest.input('new_num_passengers', sql.Int, new_num_passengers);
  
    await ticketRequest.query(`
      UPDATE Flight
      SET num_of_passengers = @new_num_passengers
      WHERE flight_number = @flight_number
    `);
  };
  
  for (const flight of flightList) {
    await updateNumPassengers(flight);
  }
  

    // Update payment status
    await request.query(`
      UPDATE Reservation
      SET payment_status = 'Cancelled'
      WHERE confirmation_number = @confirmationNumber
    `);

    // Retrieve passenger_id and points for loyalty members
    const pointsResult = await request.query(`
      SELECT DISTINCT
        LM.membership_id, LM.points_balance, R.total_price, R.payment_status,
        P.first_name, P.last_name
      FROM
        Booking B
        JOIN LoyaltyMember LM ON B.passenger_id = LM.passenger_id
        JOIN Reservation R ON B.confirmation_number = R.confirmation_number
        JOIN Passenger PS ON B.passenger_id = PS.id
        JOIN Person P ON PS.id = P.id
      WHERE
        B.confirmation_number = @confirmationNumber
    `);

    const passengers = pointsResult.recordset;

    // If no passengers found
    if (passengers.length === 0) {
      res.status(404).json({ message: 'No passengers found with the given confirmation number' });
      return;
    }

    // Update points balance for each loyalty member
    // Begin transaction

//  Update points balance for each loyalty member
for (const passenger of passengers) {
  const { membership_id, points_balance, total_price } = passenger;
  const newPoints = points_balance - total_price * 0.1;
  console.log(`New points balance: ${newPoints}`);

  
  // Use a separate Request object for updating the points balance
  const pointsRequest = new sql.Request(transaction);
  pointsRequest.input('membership_id', sql.VarChar, membership_id);
  pointsRequest.input('newPoints', sql.Int, newPoints);
  
  await pointsRequest.query(`
    UPDATE LoyaltyMember
    SET points_balance = @newPoints
    WHERE membership_id = @membership_id
  `);

  // Add the newPoints value to the passenger object
  passenger.newPoints = newPoints;
}

// Commit the transaction
await transaction.commit();

// Use the updated passengers array to generate the HTML table
let html = '<table><tr><th>Confirmation Number</th><th>Membership ID</th><th>Full Name</th><th>Status</th><th>Points Balance</th></tr>';
passengers.forEach(({ membership_id, first_name, last_name, payment_status, points_balance, newPoints }) => {
  html += `<tr>
    <td>${confirmationNumber}</td>
    <td>${membership_id}</td>
    <td>${first_name} ${last_name}</td>
    <td>${payment_status}</td>
    <td>${newPoints}</td>
  </tr>`;
});
html += '</table>';

// Send the HTML table as the response
res.status(200).send(html);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



module.exports = router;
