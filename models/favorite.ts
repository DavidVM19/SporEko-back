import connection from '../db-config.js';
import { ResultSetHeader } from 'mysql2';
import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import IFavorite from '../interfaces/IFavorite';

/* ------------------------------------------------Midlleware----------------------------------------------------------- */

const validateFavorite = (req: Request, res: Response, next: NextFunction) => {
  let presence: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    presence = 'required';
  }
  const errors = Joi.object({
    id_offer: Joi.number().integer().presence(presence),
    id_user: Joi.number().integer().presence(presence),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

/* ------------------------------------------------Models----------------------------------------------------------- */

const getAll = (
  sortBy = 'id_favorite',
  order = 'ASC'
): Promise<IFavorite[]> => {
  const sql = `SELECT * FROM favorites ORDER BY ${sortBy} ${order}`;
  if (sortBy === 'id') {
    sortBy = 'id_favorite';
  }
  return connection
    .promise()
    .query<IFavorite[]>(sql)
    .then(([results]) => results);
};

const getById = (idFavorite: number): Promise<IFavorite> => {
  return connection
    .promise()
    .query<IFavorite[]>('SELECT * FROM favorites WHERE id_favorite = ?', [
      idFavorite,
    ])
    .then(([results]) => results[0]);
};

const getFavoritesByUser = (idUser: number): Promise<IFavorite[]> => {
  return connection
    .promise()
    .query<IFavorite[]>('SELECT * FROM favorites WHERE id_user = ?', [idUser])
    .then(([results]) => results);
};

const create = (newFavorite: IFavorite): Promise<number> => {
  return connection
    .promise()
    .query<ResultSetHeader>(
      'INSERT INTO favorites (id_offer, id_user) VALUES (?, ?)',
      [newFavorite.id_offer, newFavorite.id_user]
    )
    .then(([results]) => results.insertId);
};

const update = (
  idFavorite: number,
  attributesToUpdate: IFavorite
): Promise<boolean> => {
  let sql = 'UPDATE favorites SET ';
  const sqlValues: Array<string | number> = [];

  let oneValue = false;
  if (attributesToUpdate.id_offer) {
    sql += 'id_offer = ? ';
    sqlValues.push(attributesToUpdate.id_offer);
    oneValue = true;
  }
  if (attributesToUpdate.id_user) {
    sql += oneValue ? ', id_user = ? ' : ' id_user = ? ';
    sqlValues.push(attributesToUpdate.id_user);
    oneValue = true;
  }
  sql += ' WHERE id_favorite = ?';
  sqlValues.push(idFavorite);

  return connection
    .promise()
    .query<ResultSetHeader>(sql, sqlValues)
    .then(([results]) => results.affectedRows === 1);
};

const destroyFavorite = (idFavorite: number): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>('DELETE FROM favorites WHERE id_favorite = ?', [
      idFavorite,
    ])
    .then(([results]) => results.affectedRows === 1);
};

export default {
  getAll,
  getById,
  create,
  update,
  destroyFavorite,
  validateFavorite,
  getFavoritesByUser,
};
