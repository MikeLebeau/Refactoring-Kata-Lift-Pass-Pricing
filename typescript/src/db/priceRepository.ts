import { Promise } from "mysql2/promise";

export async function upsertPrice(connection: Promise<any>, type: string, cost: string): Promise<void> {
  await connection.query(
      'INSERT INTO `base_price` (type, cost) VALUES (?, ?) ' +
      'ON DUPLICATE KEY UPDATE cost = ?',
      [type, cost, cost]);
}

export async function getPrice(connection: Promise<any>, type: string): Promise<{ cost: number }> {
  return (await connection.query(
      'SELECT cost FROM `base_price` ' +
      'WHERE `type` = ? ',
      [type]))[0][0];
}
