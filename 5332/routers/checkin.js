const express = require('express');
const router = express.Router();
const sql = require('mssql');


/**  check in: 
 * 1. assign seat
 * 2. update bag information

 */


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

function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}


router.post('/', async (req, res) => {
    try {
      const { confirmationNumber, num_bag } = req.body;
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

  
    const flightsResult = await request.query(`
      SELECT b.confirmation_number, b.flight_number, b.passenger_id, p.first_name, p.last_name, MAX(c.seat) AS max_seat_number
        FROM Booking b
        JOIN (
            SELECT flight_number, MAX(seat) AS seat
            FROM Checkin
            GROUP BY flight_number
        ) c ON b.flight_number = c.flight_number
        JOIN Person p ON b.passenger_id = p.id
        WHERE b.confirmation_number =  @confirmationNumber
        GROUP BY b.confirmation_number, b.flight_number, b.passenger_id, p.first_name, p.last_name;
    `);
  
    const flights = flightsResult.recordset;

    const flight_to_seat = new Map();
    for (const flight of flights) {
      const { confirmation_number, flight_number, passenger_id, first_name, last_name, max_seat_number } = flight;
      let newSeat;
      if (flight_to_seat.has(flight_number)){
        newSeat = flight_to_seat.get(flight_number) + 1;
      } else {
        newSeat = max_seat_number + 1;
      }
      flight_to_seat.set(flight_number, newSeat);

      flight.seat = newSeat; // Store the new seat number in the flight object
        
      console.log(`New newSeat number: ${newSeat}`);

      const checkinTime = new Date();
      const formattedCheckinTime = formatDate(checkinTime);
      flight.checkinTime = formattedCheckinTime; // Store the new seat number in the flight object

      console.log(checkinTime);
      const checkinRequest = new sql.Request(transaction);
      // Use a separate Request object for updating the points balance
      checkinRequest.input('confirmation_number', sql.VarChar, confirmation_number);
      checkinRequest.input('flight_number', sql.VarChar, flight_number);
      checkinRequest.input('passenger_id', sql.Int, passenger_id);
      checkinRequest.input('newSeat', sql.Int, newSeat);
      checkinRequest.input('num_bag', sql.Int, num_bag);
      checkinRequest.input('checkin_time', sql.DateTime, checkinTime);
   
      await checkinRequest.query(`
      INSERT INTO Checkin (confirmation_number,passenger_id, flight_number, checkin_time,actual_number_of_baggage,seat)
      VALUES (@confirmation_number, @passenger_id, @flight_number, @checkin_time, @num_bag, @newSeat)
    `);
    }
    
    // Commit the transaction
    await transaction.commit();
    
// Use the updated passengers array to generate the HTML table
    let html = `
    <table>
    <tr>
      <th >Confirmation Number </th>
      <th > Flight Number </th>
      <th > Checkin Time </th>
      <th > Passenger Name </th>
      <th > Seat Number </th>
      <th > Number of Bags</th>
    </tr>`;

    flights.forEach(({ confirmation_number, flight_number,checkinTime, first_name, last_name, seat}) => {
      html += `<tr>
        <td>${confirmation_number}</td>
        <td>${flight_number}</td>
        <td>${checkinTime}</td>
        <td>${first_name} ${last_name}</td>
        <td>${seat}</td>
        <td>${num_bag}</td>
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
