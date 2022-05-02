import { Promise } from "mysql2/promise";

export async function getHolidays(connection: Promise<any>, date: string): Promise<string[]> {
  return (await connection.query(
      'SELECT holiday FROM `holidays` WHERE `holiday` = ?', [date]
  ))[0];
}
