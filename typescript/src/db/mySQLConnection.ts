import mysql from "mysql2/promise"

export async function connectToDB() {


  // Ca c'est pour la connection a la DB
  let connectionOptions = {
    host: 'localhost',
    user: 'root',
    database: 'lift_pass',
    password: 'mysql'
  };

  return await mysql.createConnection(connectionOptions);
}
