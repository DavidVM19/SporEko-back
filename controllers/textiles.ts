import { Request, Response, NextFunction, Router } from 'express';
import Textile from '../models/textile';
import ITextile from '../interfaces/ITextile';
import { ErrorHandler } from '../helpers/errors';

const textilesRouter = Router();

textilesRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  const sortBy = req.query.sortBy as string;
  const order = req.query.order as string;
  const firstItem = req.query.firstItem as string;
  const limit = req.query.limit as string;

  Textile.getAll(sortBy, order, firstItem, limit)
    .then((textiles: Array<ITextile>) => {
      res.setHeader(
        'Content-Range',
        `textiles : 0-${textiles.length}/${textiles.length + 1}`
      );
      res.status(200).json(textiles);
    })
    .catch((err) => next(err));
});

textilesRouter.get(
  '/:idTextile',
  (req: Request, res: Response, next: NextFunction) => {
    const { idTextile } = req.params;
    Textile.getById(Number(idTextile))
      .then((textile: ITextile) => {
        if (textile === undefined) {
          res.status(404).send('Textile not found');
        }
        res.status(200).json(textile);
      })
      .catch((err) => next(err));
  }
);

textilesRouter.post(
  '/',
  Textile.nameIsFree,
  Textile.validateTextile,
  (req: Request, res: Response, next: NextFunction) => {
    void (async () => {
      try {
        const textile = req.body as ITextile;
        textile.id_textile = await Textile.create(textile);
        res.status(201).json(textile);
      } catch (err) {
        next(err);
      }
    })();
  }
);

textilesRouter.put(
  '/:idtextile',
  Textile.nameIsFree,
  Textile.validateTextile,
  (req: Request, res: Response) => {
    void (async () => {
      const { idtextile } = req.params;

      const textileUpdated = await Textile.update(
        Number(idtextile),
        req.body as ITextile
      );
      if (textileUpdated) {
        res.status(200).json({ id: idtextile });
      } else if (!textileUpdated) {
        res.status(404).send('Textile not found');
      } else {
        throw new ErrorHandler(500, `Textile can't be updated`);
      }
    })();
  }
);

textilesRouter.delete(
  '/:idtextile',
  (req: Request, res: Response, next: NextFunction) => {
    void (async () => {
      try {
        const { idtextile } = req.params;
        const textileDeleted = await Textile.destroy(Number(idtextile));
        if (textileDeleted) {
          res.status(200).send('Textile deleted');
        } else {
          throw new ErrorHandler(404, `Textile not found`);
        }
      } catch (err) {
        next(err);
      }
    })();
  }
);

export default textilesRouter;
