-- INSERT NEW FLIGHT
INSERT INTO dbo.Flight
	(flight_number ,status ,aircraft_model, capacity, num_of_passengers, price)
VALUES
	 ('ER140', 'On Time', 'MAX757', 50, 45, 120.5)

-- INSERT NEW AIRPORT
INSERT INTO TABLE dbo.Airport
    (airport_id, name, city, country)
VALUES
	(1, 'Austin International Airport', 'Austin', 'USA')

-- INSERT NEW GATES
INSERT INTO dbo.Gate
	(airport_id, gate_number, status)
VALUES
	(1, 41, 'Available'),
	(1, 42, 'Available'),
	(1, 43, 'Available'),
	(1, 44, 'Available')

-- INSERT FLIGHT EVENT
INSERT INTO dbo.FlightEvent
	(flight_number, event_time, duration, airport_id, gate_number, event_type)
VALUES
	('ER140', '2023-04-30 15:25:00', 0, 1, 42, 'Arrive')
	('ER140', '2023-04-30 17:10:00', 0, 1, 42, 'Depart') 

-- INSERT PERSON
INSERT INTO dbo.Person
	(id, first_name, last_name, date_of_birth)
VALUES
	(1, 'John', 'Wilson', '10/12/1987')
	(2, 'Jim', 'Clinton', '1/23/1991')

-- INSERT PASSENGER
INSERT INTO dbo.Passenger
	(id)
VALUES
	(1)
	(2)

-- INSERT LOYALTY_PROGRAM
INSERT INTO dbo.LoyaltyProgram
	(id, program_name)
VALUES
	(1, 'Gold')
	(2, 'Silver')

-- INSERT LOYALTY_MEMBER
INSERT INTO LoyaltyMember
    (passenger_id, program_id, membership_id, points_balance, join_date)
VALUES
	(1, 1, 'AAA341', 150, '04/21/2021')
	(2, 2, 'AAA344', 450, '11/28/2022')