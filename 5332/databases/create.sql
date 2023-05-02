-- Table 1- Airport
CREATE TABLE Airport (
    airport_id integer  primary key,
    name varchar(255) not null,
    city varchar(255) not null,
    country varchar(255) not null
);

-- Table 2- Flight
CREATE TABLE Flight (
    flight_number varchar(40) PRIMARY KEY,
    status  varchar(40) not null
   check (status in('Scheduled', 'On Time', 'Delayed', 'Cancelled')),
    aircraft_model varchar(255) not null,
    capacity integer    not null,
    num_of_passengers integer   not null,
    price DECIMAL(10,2)  not null
);
-- Table 3 - Gate
CREATE TABLE Gate (
    airport_id integer  not null  REFERENCES Airport(airport_id),
    gate_number VARCHAR(40)  not null,
    status VARCHAR(40)  not null
         check (status in ('Available', 'Occupied', 'Closed')),
    PRIMARY KEY (airport_id, gate_number)
);

-- Table 4 - FlightEvent
CREATE TABLE FlightEvent(
  flight_event_id integer not null identity(1, 1),
  flight_number varchar(40)  not null references Flight(flight_number),
  departure_time  DATETIME   not null,
  arrival_time    DATETIME   not null,
  duration        integer    not null,
  airport_id integer not null,
  gate_number VARCHAR(40) not null ,
  event_type  varchar(40) not null
   check (event_type in('Depart', 'Arrive')),
  primary key (flight_number,airport_id ,gate_number),
  FOREIGN KEY (airport_id, gate_number) REFERENCES Gate(airport_id, gate_number)
)

-- Table 5 - Person
CREATE TABLE Person (
    id integer PRIMARY KEY,
    first_name VARCHAR(255) not null,
    last_name VARCHAR(255) not null,
    date_of_birth DATE not null
);
-- Table 6 - Booker
CREATE TABLE Booker (
    id integer PRIMARY KEY REFERENCES Person(id),
    password VARCHAR(255) not null
);

-- Table 7- Passenger
CREATE TABLE Passenger (
    id  integer PRIMARY KEY REFERENCES Person(id)
);

-- Table 8-  LoyaltyProgram
CREATE TABLE LoyaltyProgram (
    id integer PRIMARY KEY,
    program_name VARCHAR(255) NOT NULL --('Basic', 'Silver', 'Gold', 'Platinum')
);

-- Table 9-  LoyaltyMember
CREATE TABLE LoyaltyMember (
    passenger_id integer REFERENCES Passenger(id),
    program_id integer REFERENCES LoyaltyProgram(id),
    membership_id VARCHAR(40) NOT NULL,
    points_balance integer NOT NULL,
    join_date date not null,
    PRIMARY KEY (passenger_id, program_id)
);
-- Table 10-  Booking
CREATE TABLE Booking (
    confirmation_number varchar(40) not null,
    flight_number varchar(40) not null  REFERENCES Flight(flight_number),
    passenger_id  integer  not null REFERENCES Passenger(id),
    Booker_id integer not null REFERENCES Booker(id),
    booking_date DATE not null ,
    payment_status VARCHAR(255)  not null
        check (payment_status in ('Booked', 'Cancelled')) ,
    total_price DECIMAL(10,2)  not null,
    baggage_allowance integer  not null,
    PRIMARY KEY (flight_number, passenger_id, Booker_id)

);

-- Table 11-  Checkin
CREATE TABLE Checkin (
  passenger_id  integer REFERENCES Passenger(id),
  flight_number varchar(40) REFERENCES Flight(flight_number),
  checkin_time DATETIME not null,
  actual_number_of_baggage integer  not null,
  seat integer  not null,
  PRIMARY KEY (passenger_id, flight_number),
);