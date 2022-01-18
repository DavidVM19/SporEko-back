import { Request, Response, NextFunction, Router } from 'express';
import * as Size_type from '../models/size_type';
import ISize_type from '../interfaces/ISize_type';
import { ErrorHandler } from '../helpers/errors';

const size_typesRouter = Router();

size_typesRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  let sortBy = 'id_size_type';
  let order = 'ASC';

  const {
    sort,
    // firstItem,
    // limit
  } = req.query;

  if (sort) {
    const sortToArray = sort.toString().split(' ');
    sortBy = sortToArray[0];
    order = sortToArray[1];
  }

  Size_type.getAll(sortBy, order)
    .then((size_types: Array<ISize_type>) => {
      res.status(200).json(size_types);
    })
    .catch((err) => next(err));
});

size_typesRouter.get(
  '/:idSize_type',
  (req: Request, res: Response, next: NextFunction) => {
    const { idSize_type } = req.params;
    Size_type.getById(Number(idSize_type))
      .then((size_type: ISize_type) => {
        if (size_type === undefined) {
          res.status(404).send('Size_type not found');
        }
        res.status(200).json(size_type);
      })
      .catch((err) => next(err));
  }
);

size_typesRouter.post(
  '/',
  Size_type.nameIsFree,
  Size_type.validateSize_type,
  (req: Request, res: Response, next: NextFunction) => {
    void (async () => {
      try {
        const size_type = req.body as ISize_type;
        size_type.id_size_type = await Size_type.create(size_type);
        res.status(201).json(size_type);
      } catch (err) {
        next(err);
      }
    })();
  }
);

size_typesRouter.put(
  '/:idsize_type',
  Size_type.nameIsFree,
  Size_type.validateSize_type,
  (req: Request, res: Response) => {
    void (async () => {
      const { idsize_type } = req.params;

      const size_typeUpdated = await Size_type.update(
        Number(idsize_type),
        req.body as ISize_type
      );
      if (size_typeUpdated) {
        res.status(200).send('Size_type updated');
      } else if (!size_typeUpdated) {
        res.status(404).send('Size_type not found');
      } else {
        throw new ErrorHandler(500, `Size_type can't be updated`);
      }
    })();
  }
);

size_typesRouter.delete(
  '/:idsize_type',
  (req: Request, res: Response, next: NextFunction) => {
    void (async () => {
      try {
        const { idsize_type } = req.params;
        const size_typeDeleted = await Size_type.destroy(Number(idsize_type));
        if (size_typeDeleted) {
          res.status(200).send('Size_type deleted');
        } else {
          throw new ErrorHandler(404, `Size_type not found`);
        }
      } catch (err) {
        next(err);
      }
    })();
  }
);

export default size_typesRouter;