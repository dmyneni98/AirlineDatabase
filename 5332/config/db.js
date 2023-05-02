// const db = {
//   user: 'amsservice',
//   password: 'ams@1235',
//   server: 'localhost',
//   database: 'AirportSystem'
// };

const db = {
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

module.exports = db;