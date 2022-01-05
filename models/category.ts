import connection from '../db-config.js';
import { ResultSetHeader } from 'mysql2';
import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { ErrorHandler } from '../helpers/errors';
import ICategory from '../interfaces/ICategory';

/* ------------------------------------------------Midlleware----------------------------------------------------------- */

const validateCategory = (req: Request, res: Response, next: NextFunction) => {
  let presence: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    presence = 'required';
  }
  const errors = Joi.object({
    name: Joi.string().max(50).presence(presence),
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};
const nameIsFree = (req: Request, res: Response, next: NextFunction) => {
  void (async () => {
    const category = req.body as ICategory;
    const categoryWithSameName: ICategory = await getByName(category.name);
    if (categoryWithSameName) {
      next(new ErrorHandler(409, `Cette categorie existe déjà`));
    } else {
      next();
    }
  })();
};

/* ------------------------------------------------Models----------------------------------------------------------- */

const getAll = (): Promise<ICategory[]> => {
  return connection
    .promise()
    .query<ICategory[]>('SELECT * FROM categories')
    .then(([results]) => results);
};

const getById = (idCategory: number): Promise<ICategory> => {
  return connection
    .promise()
    .query<ICategory[]>('SELECT * FROM categories WHERE id_category = ?', [
      idCategory,
    ])
    .then(([results]) => results[0]);
};

const getByName = async (name: string): Promise<ICategory> => {
  return connection
    .promise()
    .query<ICategory[]>('SELECT * FROM categories WHERE name = ?', [name])
    .then(([results]) => results[0]);
};

const create = async (newCategory: ICategory): Promise<number> => {
  return connection
    .promise()
    .query<ResultSetHeader>('INSERT INTO categories (name) VALUES (?)', [
      newCategory.name,
    ])
    .then(([results]) => results.insertId);
};

const update = async (
  idCategory: number,
  attibutesToUpdate: ICategory
): Promise<boolean> => {
  let sql = 'UPDATE categories SET ';
  const sqlValues: Array<string | number> = [];

  if (attibutesToUpdate.name) {
    sql += 'name = ? ';
    sqlValues.push(attibutesToUpdate.name);
  }
  sql += ' WHERE id_category = ?';
  sqlValues.push(idCategory);

  return connection
    .promise()
    .query<ResultSetHeader>(sql, sqlValues)
    .then(([results]) => results.affectedRows === 1);
};

const destroy = async (idCategory: number): Promise<boolean> => {
  return connection
    .promise()
    .query<ResultSetHeader>('DELETE FROM categories WHERE id_category = ?', [
      idCategory,
    ])
    .then(([results]) => results.affectedRows === 1);
};

export {
  validateCategory,
  getAll,
  getById,
  getByName,
  nameIsFree,
  create,
  update,
  destroy,
};
