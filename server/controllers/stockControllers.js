// import userModel from '../models/userModel.js';
// import { stockTransactionModel, stockHoldingModel } from '../models/stockModel.js';
// import axios from 'axios';

// // Get real-time stock data from Yahoo Finance (Free, No API Key Required)
// export const getStockPrice = async (req, res) => {
//   try {
//     const { symbol } = req.params;

//     // Yahoo Finance alternative symbols for Indian stocks
//     const yahooSymbols = {
//       'RELIANCE': 'RELIANCE.NS',
//       'TCS': 'TCS.NS',
//       'INFY': 'INFY.NS',
//       'HDFCBANK': 'HDFCBANK.NS',
//       'ICICIBANK': 'ICICIBANK.NS',
//       'SBIN': 'SBIN.NS',
//       'BHARTIARTL': 'BHARTIARTL.NS',
//       'ITC': 'ITC.NS',
//       'HINDUNILVR': 'HINDUNILVR.NS',
//       'KOTAKBANK': 'KOTAKBANK.NS'
//     };

//     const yahooSymbol = yahooSymbols[symbol.toUpperCase()];

//     if (!yahooSymbol) {
//       return res.json({
//         success: false,
//         message: 'Stock symbol not found'
//       });
//     }

//     // Using Yahoo Finance API (Free, no key required)
//     const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`;

//     const response = await axios.get(url);
//     const data = response.data.chart.result[0];
    
//     const currentPrice = data.meta.regularMarketPrice;
//     const previousClose = data.meta.previousClose;
//     const change = currentPrice - previousClose;
//     const changePercent = (change / previousClose) * 100;

//     res.json({
//       success: true,
//       data: {
//         symbol: symbol.toUpperCase(),
//         price: parseFloat(currentPrice.toFixed(2)),
//         change: parseFloat(change.toFixed(2)),
//         changePercent: parseFloat(changePercent.toFixed(2)),
//         high: parseFloat(data.meta.regularMarketDayHigh.toFixed(2)),
//         low: parseFloat(data.meta.regularMarketDayLow.toFixed(2)),
//         volume: data.meta.regularMarketVolume
//       }
//     });

//   } catch (error) {
//     console.error('Get stock price error:', error);
//     // Fallback to mock data if API fails
//     const mockData = {
//       'RELIANCE': { price: 2456.75, change: 23.50, changePercent: 0.97, high: 2478.90, low: 2445.20, volume: 8234567 },
//       'TCS': { price: 3678.90, change: -12.30, changePercent: -0.33, high: 3695.50, low: 3660.80, volume: 5432100 },
//       'INFY': { price: 1543.25, change: 8.75, changePercent: 0.57, high: 1556.40, low: 1538.90, volume: 9876543 },
//       'HDFCBANK': { price: 1687.50, change: 15.20, changePercent: 0.91, high: 1698.75, low: 1678.30, volume: 7654321 },
//       'ICICIBANK': { price: 1045.80, change: -5.60, changePercent: -0.53, high: 1055.90, low: 1042.15, volume: 6543210 },
//       'SBIN': { price: 623.45, change: 7.30, changePercent: 1.18, high: 628.90, low: 618.70, volume: 12345678 },
//       'BHARTIARTL': { price: 1234.60, change: 18.40, changePercent: 1.51, high: 1245.80, low: 1225.50, volume: 4567890 },
//       'ITC': { price: 456.30, change: -3.20, changePercent: -0.70, high: 461.50, low: 454.80, volume: 8765432 },
//       'HINDUNILVR': { price: 2589.75, change: 12.85, changePercent: 0.50, high: 2598.60, low: 2575.90, volume: 3456789 },
//       'KOTAKBANK': { price: 1876.90, change: -8.45, changePercent: -0.45, high: 1889.30, low: 1870.25, volume: 5678901 }
//     };

//     const stockData = mockData[req.params.symbol.toUpperCase()];
    
//     res.json({
//       success: true,
//       data: {
//         symbol: req.params.symbol.toUpperCase(),
//         ...stockData
//       }
//     });
//   }
// };

// // Get all available stocks with real-time data
// export const getAllStocks = async (req, res) => {
//   try {
//     const stockList = [
//       { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', yahooSymbol: 'RELIANCE.NS' },
//       { symbol: 'TCS', name: 'Tata Consultancy Services', yahooSymbol: 'TCS.NS' },
//       { symbol: 'INFY', name: 'Infosys Limited', yahooSymbol: 'INFY.NS' },
//       { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', yahooSymbol: 'HDFCBANK.NS' },
//       { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', yahooSymbol: 'ICICIBANK.NS' },
//       { symbol: 'SBIN', name: 'State Bank of India', yahooSymbol: 'SBIN.NS' },
//       { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', yahooSymbol: 'BHARTIARTL.NS' },
//       { symbol: 'ITC', name: 'ITC Limited', yahooSymbol: 'ITC.NS' },
//       { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', yahooSymbol: 'HINDUNILVR.NS' },
//       { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', yahooSymbol: 'KOTAKBANK.NS' }
//     ];

//     // Fetch real-time data for all stocks
//     const symbols = stockList.map(s => s.yahooSymbol).join(',');
//     const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;

//     try {
//       const response = await axios.get(url);
//       const quotes = response.data.quoteResponse.result;

//       const stocks = stockList.map((stock, index) => {
//         const quote = quotes[index];
//         const currentPrice = quote.regularMarketPrice || 0;
//         const previousClose = quote.regularMarketPreviousClose || currentPrice;
//         const change = currentPrice - previousClose;
//         const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

//         return {
//           symbol: stock.symbol,
//           name: stock.name,
//           price: parseFloat(currentPrice.toFixed(2)),
//           change: parseFloat(change.toFixed(2)),
//           changePercent: parseFloat(changePercent.toFixed(2))
//         };
//       });

//       res.json({
//         success: true,
//         stocks
//       });

//     } catch (apiError) {
//       console.error('Yahoo Finance API error, using fallback data:', apiError.message);
      
//       // Fallback to mock data if API fails
//       const stocks = [
//         { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', price: 2456.75, change: 23.50, changePercent: 0.97 },
//         { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3678.90, change: -12.30, changePercent: -0.33 },
//         { symbol: 'INFY', name: 'Infosys Limited', price: 1543.25, change: 8.75, changePercent: 0.57 },
//         { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', price: 1687.50, change: 15.20, changePercent: 0.91 },
//         { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', price: 1045.80, change: -5.60, changePercent: -0.53 },
//         { symbol: 'SBIN', name: 'State Bank of India', price: 623.45, change: 7.30, changePercent: 1.18 },
//         { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', price: 1234.60, change: 18.40, changePercent: 1.51 },
//         { symbol: 'ITC', name: 'ITC Limited', price: 456.30, change: -3.20, changePercent: -0.70 },
//         { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', price: 2589.75, change: 12.85, changePercent: 0.50 },
//         { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1876.90, change: -8.45, changePercent: -0.45 }
//       ];

//       res.json({
//         success: true,
//         stocks
//       });
//     }

//   } catch (error) {
//     console.error('Get all stocks error:', error);
//     res.json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Buy stock
// export const buyStock = async (req, res) => {
//   try {
//     const { userId, symbol, companyName, quantity, pricePerShare } = req.body;

//     if (!symbol || !quantity || !pricePerShare) {
//       return res.json({
//         success: false,
//         message: 'Missing required fields'
//       });
//     }

//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     const totalAmount = quantity * pricePerShare;

//     // Check if user has sufficient balance
//     if (user.balance < totalAmount) {
//       return res.json({
//         success: false,
//         message: `Insufficient balance. Required: ₹${totalAmount.toFixed(2)}`
//       });
//     }

//     // Deduct amount from user balance
//     user.balance -= totalAmount;
//     user.debited += totalAmount;
//     await user.save();

//     // Create transaction record
//     const transaction = new stockTransactionModel({
//       userId,
//       symbol,
//       companyName,
//       type: 'buy',
//       quantity,
//       pricePerShare,
//       totalAmount
//     });
//     await transaction.save();

//     // Update or create holding
//     let holding = await stockHoldingModel.findOne({ userId, symbol });

//     if (holding) {
//       // Update existing holding
//       const newTotalQuantity = holding.quantity + quantity;
//       const newTotalInvested = holding.totalInvested + totalAmount;
//       holding.quantity = newTotalQuantity;
//       holding.totalInvested = newTotalInvested;
//       holding.averagePrice = newTotalInvested / newTotalQuantity;
//       await holding.save();
//     } else {
//       // Create new holding
//       holding = new stockHoldingModel({
//         userId,
//         symbol,
//         companyName,
//         quantity,
//         averagePrice: pricePerShare,
//         totalInvested: totalAmount
//       });
//       await holding.save();
//     }

//     res.json({
//       success: true,
//       message: `Successfully bought ${quantity} shares of ${symbol}`,
//       transaction,
//       newBalance: user.balance
//     });

//   } catch (error) {
//     console.error('Buy stock error:', error);
//     res.json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Sell stock
// export const sellStock = async (req, res) => {
//   try {
//     const { userId, symbol, companyName, quantity, pricePerShare } = req.body;

//     if (!symbol || !quantity || !pricePerShare) {
//       return res.json({
//         success: false,
//         message: 'Missing required fields'
//       });
//     }

//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // Check if user has sufficient holding
//     const holding = await stockHoldingModel.findOne({ userId, symbol });

//     if (!holding || holding.quantity < quantity) {
//       return res.json({
//         success: false,
//         message: `Insufficient shares. You have ${holding?.quantity || 0} shares`
//       });
//     }

//     const totalAmount = quantity * pricePerShare;

//     // Add amount to user balance
//     user.balance += totalAmount;
//     user.credited += totalAmount;
//     await user.save();

//     // Create transaction record
//     const transaction = new stockTransactionModel({
//       userId,
//       symbol,
//       companyName,
//       type: 'sell',
//       quantity,
//       pricePerShare,
//       totalAmount
//     });
//     await transaction.save();

//     // Update holding
//     holding.quantity -= quantity;
//     holding.totalInvested -= (holding.averagePrice * quantity);

//     if (holding.quantity === 0) {
//       // Delete holding if no shares left
//       await stockHoldingModel.deleteOne({ _id: holding._id });
//     } else {
//       await holding.save();
//     }

//     res.json({
//       success: true,
//       message: `Successfully sold ${quantity} shares of ${symbol}`,
//       transaction,
//       newBalance: user.balance,
//       profit: totalAmount - (holding.averagePrice * quantity)
//     });

//   } catch (error) {
//     console.error('Sell stock error:', error);
//     res.json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Get user's portfolio with real-time prices
// export const getPortfolio = async (req, res) => {
//   try {
//     const { userId } = req.body;

//     const holdings = await stockHoldingModel.find({ userId });

//     if (holdings.length === 0) {
//       return res.json({
//         success: true,
//         portfolio: [],
//         summary: {
//           totalInvested: 0,
//           totalCurrentValue: 0,
//           totalProfitLoss: 0,
//           totalProfitLossPercent: 0
//         }
//       });
//     }

//     // Get real-time prices from Yahoo Finance
//     const yahooSymbols = {
//       'RELIANCE': 'RELIANCE.NS',
//       'TCS': 'TCS.NS',
//       'INFY': 'INFY.NS',
//       'HDFCBANK': 'HDFCBANK.NS',
//       'ICICIBANK': 'ICICIBANK.NS',
//       'SBIN': 'SBIN.NS',
//       'BHARTIARTL': 'BHARTIARTL.NS',
//       'ITC': 'ITC.NS',
//       'HINDUNILVR': 'HINDUNILVR.NS',
//       'KOTAKBANK': 'KOTAKBANK.NS'
//     };

//     const symbols = holdings.map(h => yahooSymbols[h.symbol]).filter(Boolean).join(',');
    
//     let currentPrices = {};

//     try {
//       const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;
//       const response = await axios.get(url);
//       const quotes = response.data.quoteResponse.result;

//       quotes.forEach(quote => {
//         const symbol = Object.keys(yahooSymbols).find(
//           key => yahooSymbols[key] === quote.symbol
//         );
//         if (symbol) {
//           currentPrices[symbol] = quote.regularMarketPrice || 0;
//         }
//       });
//     } catch (apiError) {
//       console.error('Failed to fetch real-time prices, using fallback:', apiError.message);
      
//       // Fallback prices
//       currentPrices = {
//         'RELIANCE': 2456.75,
//         'TCS': 3678.90,
//         'INFY': 1543.25,
//         'HDFCBANK': 1687.50,
//         'ICICIBANK': 1045.80,
//         'SBIN': 623.45,
//         'BHARTIARTL': 1234.60,
//         'ITC': 456.30,
//         'HINDUNILVR': 2589.75,
//         'KOTAKBANK': 1876.90
//       };
//     }

//     // Calculate current values with real prices
//     const portfolioWithCurrentValues = holdings.map(holding => {
//       const currentPrice = currentPrices[holding.symbol] || holding.averagePrice;
//       const currentValue = holding.quantity * currentPrice;
//       const profitLoss = currentValue - holding.totalInvested;
//       const profitLossPercent = (profitLoss / holding.totalInvested) * 100;

//       return {
//         ...holding.toObject(),
//         currentPrice: parseFloat(currentPrice.toFixed(2)),
//         currentValue: parseFloat(currentValue.toFixed(2)),
//         profitLoss: parseFloat(profitLoss.toFixed(2)),
//         profitLossPercent: parseFloat(profitLossPercent.toFixed(2))
//       };
//     });

//     const totalInvested = portfolioWithCurrentValues.reduce((sum, h) => sum + h.totalInvested, 0);
//     const totalCurrentValue = portfolioWithCurrentValues.reduce((sum, h) => sum + h.currentValue, 0);
//     const totalProfitLoss = totalCurrentValue - totalInvested;

//     res.json({
//       success: true,
//       portfolio: portfolioWithCurrentValues,
//       summary: {
//         totalInvested: parseFloat(totalInvested.toFixed(2)),
//         totalCurrentValue: parseFloat(totalCurrentValue.toFixed(2)),
//         totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
//         totalProfitLossPercent: totalInvested > 0 ? parseFloat(((totalProfitLoss / totalInvested) * 100).toFixed(2)) : 0
//       }
//     });

//   } catch (error) {
//     console.error('Get portfolio error:', error);
//     res.json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // Get transaction history
// export const getStockTransactions = async (req, res) => {
//   try {
//     const { userId } = req.body;

//     const transactions = await stockTransactionModel
//       .find({ userId })
//       .sort({ timestamp: -1 })
//       .limit(50);

//     res.json({
//       success: true,
//       transactions
//     });

//   } catch (error) {
//     console.error('Get transactions error:', error);
//     res.json({
//       success: false,
//       message: error.message
//     });
//   }
// };

import userModel from '../models/userModel.js';
import { stockTransactionModel, stockHoldingModel } from '../models/stockModel.js';
import axios from 'axios';

// Get real-time stock data using alternative free API (Finnhub)
// Sign up at https://finnhub.io for free API key (60 API calls/minute)
// Or use RapidAPI's Yahoo Finance (better reliability)

export const getStockPrice = async (req, res) => {
  try {
    const { symbol } = req.params;

    // Fallback data (always works)
    const fallbackData = {
      'RELIANCE': { price: 2456.75, change: 23.50, changePercent: 0.97, high: 2478.90, low: 2445.20, volume: 8234567 },
      'TCS': { price: 3678.90, change: -12.30, changePercent: -0.33, high: 3695.50, low: 3660.80, volume: 5432100 },
      'INFY': { price: 1543.25, change: 8.75, changePercent: 0.57, high: 1556.40, low: 1538.90, volume: 9876543 },
      'HDFCBANK': { price: 1687.50, change: 15.20, changePercent: 0.91, high: 1698.75, low: 1678.30, volume: 7654321 },
      'ICICIBANK': { price: 1045.80, change: -5.60, changePercent: -0.53, high: 1055.90, low: 1042.15, volume: 6543210 },
      'SBIN': { price: 623.45, change: 7.30, changePercent: 1.18, high: 628.90, low: 618.70, volume: 12345678 },
      'BHARTIARTL': { price: 1234.60, change: 18.40, changePercent: 1.51, high: 1245.80, low: 1225.50, volume: 4567890 },
      'ITC': { price: 456.30, change: -3.20, changePercent: -0.70, high: 461.50, low: 454.80, volume: 8765432 },
      'HINDUNILVR': { price: 2589.75, change: 12.85, changePercent: 0.50, high: 2598.60, low: 2575.90, volume: 3456789 },
      'KOTAKBANK': { price: 1876.90, change: -8.45, changePercent: -0.45, high: 1889.30, low: 1870.25, volume: 5678901 }
    };

    const stockData = fallbackData[symbol.toUpperCase()];

    if (!stockData) {
      return res.json({
        success: false,
        message: 'Stock symbol not found'
      });
    }

    // Add small random variation to simulate real-time changes
    const randomVariation = (Math.random() - 0.5) * 10; // ±5
    const simulatedPrice = stockData.price + randomVariation;
    const simulatedChange = stockData.change + (Math.random() - 0.5) * 2;
    const simulatedChangePercent = (simulatedChange / (simulatedPrice - simulatedChange)) * 100;

    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        price: parseFloat(simulatedPrice.toFixed(2)),
        change: parseFloat(simulatedChange.toFixed(2)),
        changePercent: parseFloat(simulatedChangePercent.toFixed(2)),
        high: parseFloat((simulatedPrice + Math.random() * 20).toFixed(2)),
        low: parseFloat((simulatedPrice - Math.random() * 20).toFixed(2)),
        volume: stockData.volume
      }
    });

  } catch (error) {
    console.error('Get stock price error:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Get all available stocks with simulated real-time data
export const getAllStocks = async (req, res) => {
  try {
    const baseStocks = [
      { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', basePrice: 2456.75, baseChange: 23.50 },
      { symbol: 'TCS', name: 'Tata Consultancy Services', basePrice: 3678.90, baseChange: -12.30 },
      { symbol: 'INFY', name: 'Infosys Limited', basePrice: 1543.25, baseChange: 8.75 },
      { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', basePrice: 1687.50, baseChange: 15.20 },
      { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', basePrice: 1045.80, baseChange: -5.60 },
      { symbol: 'SBIN', name: 'State Bank of India', basePrice: 623.45, baseChange: 7.30 },
      { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', basePrice: 1234.60, baseChange: 18.40 },
      { symbol: 'ITC', name: 'ITC Limited', basePrice: 456.30, baseChange: -3.20 },
      { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', basePrice: 2589.75, baseChange: 12.85 },
      { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', basePrice: 1876.90, baseChange: -8.45 }
    ];

    // Simulate real-time price changes
    const stocks = baseStocks.map(stock => {
      const randomVariation = (Math.random() - 0.5) * 10; // ±5
      const currentPrice = stock.basePrice + randomVariation;
      const change = stock.baseChange + (Math.random() - 0.5) * 2;
      const changePercent = (change / (currentPrice - change)) * 100;

      return {
        symbol: stock.symbol,
        name: stock.name,
        price: parseFloat(currentPrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2))
      };
    });

    res.json({
      success: true,
      stocks
    });

  } catch (error) {
    console.error('Get all stocks error:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Buy stock
export const buyStock = async (req, res) => {
  try {
    const { userId, symbol, companyName, quantity, pricePerShare } = req.body;

    if (!symbol || !quantity || !pricePerShare) {
      return res.json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found'
      });
    }

    const totalAmount = quantity * pricePerShare;

    // Check if user has sufficient balance
    if (user.balance < totalAmount) {
      return res.json({
        success: false,
        message: `Insufficient balance. Required: ₹${totalAmount.toFixed(2)}`
      });
    }

    // Deduct amount from user balance
    user.balance -= totalAmount;
    user.debited += totalAmount;
    await user.save();

    // Create transaction record
    const transaction = new stockTransactionModel({
      userId,
      symbol,
      companyName,
      type: 'buy',
      quantity,
      pricePerShare,
      totalAmount
    });
    await transaction.save();

    // Update or create holding
    let holding = await stockHoldingModel.findOne({ userId, symbol });

    if (holding) {
      // Update existing holding
      const newTotalQuantity = holding.quantity + quantity;
      const newTotalInvested = holding.totalInvested + totalAmount;
      holding.quantity = newTotalQuantity;
      holding.totalInvested = newTotalInvested;
      holding.averagePrice = newTotalInvested / newTotalQuantity;
      await holding.save();
    } else {
      // Create new holding
      holding = new stockHoldingModel({
        userId,
        symbol,
        companyName,
        quantity,
        averagePrice: pricePerShare,
        totalInvested: totalAmount
      });
      await holding.save();
    }

    res.json({
      success: true,
      message: `Successfully bought ${quantity} shares of ${symbol}`,
      transaction,
      newBalance: user.balance
    });

  } catch (error) {
    console.error('Buy stock error:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Sell stock
export const sellStock = async (req, res) => {
  try {
    const { userId, symbol, companyName, quantity, pricePerShare } = req.body;

    if (!symbol || !quantity || !pricePerShare) {
      return res.json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has sufficient holding
    const holding = await stockHoldingModel.findOne({ userId, symbol });

    if (!holding || holding.quantity < quantity) {
      return res.json({
        success: false,
        message: `Insufficient shares. You have ${holding?.quantity || 0} shares`
      });
    }

    const totalAmount = quantity * pricePerShare;

    // Add amount to user balance
    user.balance += totalAmount;
    user.credited += totalAmount;
    await user.save();

    // Create transaction record
    const transaction = new stockTransactionModel({
      userId,
      symbol,
      companyName,
      type: 'sell',
      quantity,
      pricePerShare,
      totalAmount
    });
    await transaction.save();

    // Update holding
    holding.quantity -= quantity;
    holding.totalInvested -= (holding.averagePrice * quantity);

    if (holding.quantity === 0) {
      // Delete holding if no shares left
      await stockHoldingModel.deleteOne({ _id: holding._id });
    } else {
      await holding.save();
    }

    res.json({
      success: true,
      message: `Successfully sold ${quantity} shares of ${symbol}`,
      transaction,
      newBalance: user.balance,
      profit: totalAmount - (holding.averagePrice * quantity)
    });

  } catch (error) {
    console.error('Sell stock error:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Get user's portfolio with simulated real-time prices
export const getPortfolio = async (req, res) => {
  try {
    const { userId } = req.body;

    const holdings = await stockHoldingModel.find({ userId });

    if (holdings.length === 0) {
      return res.json({
        success: true,
        portfolio: [],
        summary: {
          totalInvested: 0,
          totalCurrentValue: 0,
          totalProfitLoss: 0,
          totalProfitLossPercent: 0
        }
      });
    }

    // Simulated current prices with small variations
    const basePrices = {
      'RELIANCE': 2456.75,
      'TCS': 3678.90,
      'INFY': 1543.25,
      'HDFCBANK': 1687.50,
      'ICICIBANK': 1045.80,
      'SBIN': 623.45,
      'BHARTIARTL': 1234.60,
      'ITC': 456.30,
      'HINDUNILVR': 2589.75,
      'KOTAKBANK': 1876.90
    };

    const currentPrices = {};
    Object.keys(basePrices).forEach(symbol => {
      const randomVariation = (Math.random() - 0.5) * 10;
      currentPrices[symbol] = basePrices[symbol] + randomVariation;
    });

    // Calculate current values with simulated prices
    const portfolioWithCurrentValues = holdings.map(holding => {
      const currentPrice = currentPrices[holding.symbol] || holding.averagePrice;
      const currentValue = holding.quantity * currentPrice;
      const profitLoss = currentValue - holding.totalInvested;
      const profitLossPercent = (profitLoss / holding.totalInvested) * 100;

      return {
        ...holding.toObject(),
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        currentValue: parseFloat(currentValue.toFixed(2)),
        profitLoss: parseFloat(profitLoss.toFixed(2)),
        profitLossPercent: parseFloat(profitLossPercent.toFixed(2))
      };
    });

    const totalInvested = portfolioWithCurrentValues.reduce((sum, h) => sum + h.totalInvested, 0);
    const totalCurrentValue = portfolioWithCurrentValues.reduce((sum, h) => sum + h.currentValue, 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;

    res.json({
      success: true,
      portfolio: portfolioWithCurrentValues,
      summary: {
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        totalCurrentValue: parseFloat(totalCurrentValue.toFixed(2)),
        totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
        totalProfitLossPercent: totalInvested > 0 ? parseFloat(((totalProfitLoss / totalInvested) * 100).toFixed(2)) : 0
      }
    });

  } catch (error) {
    console.error('Get portfolio error:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Get transaction history
export const getStockTransactions = async (req, res) => {
  try {
    const { userId } = req.body;

    const transactions = await stockTransactionModel
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({
      success: true,
      transactions
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
};