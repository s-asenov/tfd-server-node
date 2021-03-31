import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface IRouter {
  prefix: string;
  router: Router;
}

function ApiRoutes(routers: IRouter[]): Router {
  const ApiRouter = Router();

  const accessTokenSecret = process.env.SECRET;
  const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (token) {
      jwt.verify(token, accessTokenSecret, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }

        res.locals.user = user;
        next();
      });
    } else {
      res.sendStatus(401);
    }
  };

  ApiRouter.use((req, res, next) => authenticateJWT(req, res, next));

  routers.forEach((item) => {
    ApiRouter.use(`/${item.prefix}`, item.router);
  });

  return ApiRouter;
}

export { ApiRoutes, IRouter };
