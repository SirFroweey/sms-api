import { Router } from "express";
import MessagesController from "../controllers/messages.controller";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

const seconds: number = 60 * 1000;
const postRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1 * seconds,
  max: 5,
  message: {
    type: "error",
    message: "Maximum amount of API requests reached for the given 'from' phone number."
  },
  keyGenerator: (req) => {
    const { from } = req.body;
    return from;
  },
});

class MessageRoutes {
  router = Router();
  controller = new MessagesController();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.post("/", postRateLimiter, this.controller.create);

    this.router.get("/", this.controller.list);
  }
}

export default new MessageRoutes().router;