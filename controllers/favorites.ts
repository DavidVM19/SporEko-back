import { Request, Response, NextFunction, Router } from 'express';
import Favorite from '../models/favorite';
import IFavorite from '../interfaces/IFavorite';
import { ErrorHandler } from '../helpers/errors';

const favoritesRouter = Router();

favoritesRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  const sortBy = 'id_favorite';
  const order = 'ASC';

  Favorite.getAll(sortBy, order)
    .then((favorites: Array<IFavorite>) => {
      res.status(200).json(favorites);
    })
    .catch((err) => next(err));
});

favoritesRouter.get(
  '/:idFavorite',
  (req: Request, res: Response, next: NextFunction) => {
    const idFavorite = req.params.idFavorite;
    Favorite.getById(Number(idFavorite))
      .then((favorite: IFavorite) => {
        if (favorite === undefined) {
          res.status(404).send('Favorite not found');
        }
        res.status(200).json(favorite);
      })
      .catch((err) => next(err));
  }
);

favoritesRouter.post(
  '/',
  Favorite.validateFavorite,
  (req: Request, res: Response, next: NextFunction) => {
    void (async () => {
      try {
        const favorite = req.body as IFavorite;
        const idFavorite = await Favorite.create(favorite);
        res
          .status(201)
          .json({ id_favorite: idFavorite, id: idFavorite, ...req.body });
      } catch (err) {
        next(err);
      }
    })();
  }
);

favoritesRouter.put(
  '/:idFavorite',
  Favorite.validateFavorite,
  (req: Request, res: Response) => {
    void (async () => {
      const idFavorite = req.params.idFavorite;

      const favoriteUpdated = await Favorite.update(
        Number(idFavorite),
        req.body as IFavorite
      );
      if (favoriteUpdated) {
        res.status(200).json({ id: idFavorite });
      } else if (!favoriteUpdated) {
        res.status(404).send('Favorite not found');
      } else {
        throw new ErrorHandler(500, `Favorite can't be updated`);
      }
    })();
  }
);

favoritesRouter.delete(
  '/:idFavorite',
  (req: Request, res: Response, next: NextFunction) => {
    void (async () => {
      try {
        const idFavorite = req.params.idFavorite;
        const favoriteDeleted = await Favorite.destroyFavorite(
          Number(idFavorite)
        );
        if (favoriteDeleted) {
          res.status(200).send('Favorite deleted');
        } else {
          throw new ErrorHandler(404, `Favorite not found`);
        }
      } catch (err) {
        next(err);
      }
    })();
  }
);

export default favoritesRouter;
