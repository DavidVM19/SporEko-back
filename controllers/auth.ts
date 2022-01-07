import { Request, Response, NextFunction, Router } from 'express';
import * as User from '../models/user';
import IUser from '../interfaces/IUser';
import { ErrorHandler } from '../helpers/errors';
import { calculateToken } from '../helpers/auth';

const authRouter = Router();

authRouter.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as IUser;
    User.getByEmail(email)
      .then(async (user) => {
        if (!user)
          throw new ErrorHandler(401, 'Email et mot de passe incorrects');
        else {
          const passwordIsCorrect: boolean = await User.verifyPassword(
            password,
            user.hash_password
          );
          if (passwordIsCorrect) {
            const token = calculateToken(
              user.pseudo,
              user.picture,
              Number(user.id_user),
              user.isadmin
            );
            res.cookie('user_token', token);
            res.send(token);
          } else
            throw new ErrorHandler(401, 'Email et mot de passe incorrects');
        }
      })
      .catch((err) => next(err));
  } catch (err) {
    next(err);
  }
});

export default authRouter;
