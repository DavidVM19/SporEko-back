import { RowDataPacket } from 'mysql2';

export default interface IOffer_deliverer extends RowDataPacket {
  id_offer: number;
  id_deliverer: number;
}