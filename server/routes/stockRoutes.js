import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  getAllStocks,
  getStockPrice,
  buyStock,
  sellStock,
  getPortfolio,
  getStockTransactions
} from "../controllers/stockControllers.js";

const stockRouter = express.Router();

// Get all stocks
stockRouter.get('/all', userAuth, getAllStocks);

// Get specific stock price
stockRouter.get('/price/:symbol', userAuth, getStockPrice);

// Buy stock
stockRouter.post('/buy', userAuth, buyStock);

// Sell stock
stockRouter.post('/sell', userAuth, sellStock);

// Get user portfolio
stockRouter.get('/portfolio', userAuth, getPortfolio);

// Get transaction history
stockRouter.get('/transactions', userAuth, getStockTransactions);

export default stockRouter;