const express = require("express");

// Modelos
const { Crypto } = require("../models/Crypto.js");

// Router propio de cryptomonedas
const router = express.Router();

// CRUD: READ - devuelve todas las crypto (params opcionales http://localhost:3000/crypto?page=1&limit=10)
router.get("/", async (req, res) => {
  try {
    // Asi leemos query params
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const crypto = await Crypto.find()
      .limit(limit)
      .skip((page - 1) * limit);

    // LIMIT 10, PAGE 1 -> SKIP = 0
    // LIMIT 10, PAGE 2 -> SKIP = 10
    // LIMIT 10, PAGE 3 -> SKIP = 20
    // ...

    // Num total de elementos
    const totalElements = await Crypto.countDocuments();

    const response = {
      totalItems: totalElements,
      totalPages: Math.ceil(totalElements / limit),
      currentPage: page,
      data: crypto,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});

// CRUD: CREATE - crea nueva crypotomoneda
router.post("/", async (req, res) => {
  try {
    const crypto = new Crypto({
      name: req.body.name,
      price: req.body.price,
      marketCap: req.body.marketCap,
      created_at: req.body.created_at,
    });

    const createdCrypto = await crypto.save();
    return res.status(201).json(createdCrypto);
  } catch (error) {
    res.status(500).json(error);
  }
});

// NO CRUD - Busca crypto por name
router.get("/name/:name", async (req, res) => {
  const name = req.params.name;

  try {
    const crypto = await Crypto.find({ name: new RegExp("^" + name.toLowerCase(), "i") });

    if (crypto?.length) {
      res.json(crypto);
    } else {
      res.status(404).json([]);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// NO CRUD - Genera archivo csv
router.get("/csv", async (req, res) => {
  try {
    const crypto = await Crypto.find();

    let csv = "Name;Price;MarketCap;Created_at\n";
    crypto.forEach((item) => {
      csv += `${item.name};${item.price};${item.marketCap};${item.created_at}\n`;
    });
    res.header("Content-Type", "text/text");
    res.send(csv);
  } catch (error) {
    res.status(500).json(error);
  }
});

// NO CRUD - Ordenar por valor marketcap (asc o desc)
router.get("/sorted-by-marketcap", async (req, res) => {
  try {
    const order = req.query.order;
    let cryptos = await Crypto.find().sort({ marketCap: order });

    res.json(cryptos);
  } catch (error) {
    res.status(500).json(error);
  }
});

// NO CRUD - Ordenar por price range (max o min)
router.get("/price-range", async (req, res) => {
  try {
    const min = req.query.min;
    const max = req.query.max;
    let query = {};

    if (min !== undefined && max !== undefined) {
      query.price = { $gte: min, $lte: max };
    } else if (min !== undefined) {
      query.price = { $gte: min };
    } else if (max !== undefined) {
      query.price = { $lte: max };
    }

    let cryptos = await Crypto.find(query);

    res.json(cryptos);
  } catch (error) {
    res.status(500).json(error);
  }
});

// NO CRUD - resetea valores
router.delete("/reset", async (req, res) => {
  try {
    const cryptoList = [
      { name: "Bitcoin", price: 57329.99, marketCap: 1077962308762, created_at: "2009-01-03T18:15:05.000Z" },
      { name: "Ethereum", price: 2230.16, marketCap: 258082329474, created_at: "2015-07-30T01:26:13.000Z" },
      { name: "Binance Coin", price: 549.54, marketCap: 84853731506, created_at: "2017-07-25T04:44:59.000Z" },
      { name: "Cardano", price: 1.28, marketCap: 40908813290, created_at: "2017-10-01T21:44:29.000Z" },
      { name: "Tether", price: 1.0, marketCap: 41409618000, created_at: "2014-11-20T06:36:20.000Z" },
      { name: "XRP", price: 1.68, marketCap: 76737229287, created_at: "2013-04-18T16:58:29.000Z" },
      { name: "Solana", price: 41.43, marketCap: 11603455490, created_at: "2020-03-18T20:22:23.000Z" },
      { name: "Polkadot", price: 41.85, marketCap: 40472684787, created_at: "2020-05-26T19:22:08.000Z" },
      { name: "Dogecoin", price: 0.34, marketCap: 44977516251, created_at: "2013-12-06T22:31:21.000Z" },
      { name: "USD Coin", price: 1.0, marketCap: 15732336636, created_at: "2018-09-26T23:11:46.000Z" },
      { name: "Aave", price: 457.81, marketCap: 5947881051, created_at: "2020-12-16T13:45:37.000Z" },
      { name: "Chainlink", price: 38.64, marketCap: 16989923434, created_at: "2017-09-20T19:44:14.000Z" },
      { name: "Bitcoin Cash", price: 1012.16, marketCap: 19004593616, created_at: "2017-07-23T23:27:51.000Z" },
      { name: "Litecoin", price: 287.87, marketCap: 19614490277, created_at: "2011-10-08T02:26:17.000Z" },
      { name: "Uniswap", price: 31.97, marketCap: 16650903753, created_at: "2020-09-17T17:25:40.000Z" },
      { name: "Theta Network", price: 11.12, marketCap: 11118649159, created_at: "2018-01-08T15:58:25.000Z" },
      { name: "Dent", price: 0.008624, marketCap: 932525678, created_at: "2017-07-12T14:50:00.000Z" },
      { name: "Chiliz", price: 0.4997, marketCap: 3091737381, created_at: "2018-06-02T20:17:59.000Z" },
      { name: "Fantom", price: 1.11, marketCap: 3121563451, created_at: "2018-06-02T20:17:59.000Z" },
      { name: "Harmony", price: 0.2069, marketCap: 1745227461, created_at: "2019-03-14T01:41:31.000Z" },
      { name: "BitTorrent", price: 0.002132, marketCap: 1696751105, created_at: "2019-01-28T09:36:27.000Z" },
      { name: "Flow", price: 17.89, marketCap: 1681560903, created_at: "2020-06-25T04:29:30.000Z" },
      { name: "Celsius", price: 5.01, marketCap: 1435799031, created_at: "2018-03-09T21:01:43.000Z" },
      { name: "Curve DAO Token", price: 2.12, marketCap: 1423039242, created_at: "2020-01-21T18:09:02.000Z" },
      { name: "Near", price: 5.71, marketCap: 1415588328, created_at: "2019-04-24T07:16:01.000Z" },
      { name: "Helium", price: 44.95, marketCap: 1381900023, created_at: "2019-06-28T18:15:27.000Z" },
    ];
    connect().then(() => {
      console.log("We have connection");

      // Borrar datos
      Crypto.collection.drop().then(() => {
        console.log("Deleted cryptocoins");

        // Añadimos cryptomonedas
        const documents = cryptoList.map((crypto) => new Crypto(crypto));
        Crypto.insertMany(documents)
          .then(() => console.log("Saved data properly"))
          .catch((error) => console.error(error))
          .finally(() => mongoose.disconnect());
      });
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// CRUD: DELETE - Elimina cypto
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const cryptoDeleted = await Crypto.findByIdAndDelete(id);
    if (cryptoDeleted) {
      res.json(cryptoDeleted);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// CRUD: UPDATE - modifica crypto
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const cryptoUpdated = await Crypto.findByIdAndUpdate(id, req.body, { new: true });
    if (cryptoUpdated) {
      res.json(cryptoUpdated);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// CRUD: READ - busca crypto por id
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const crypto = await Crypto.findById(id);
    if (crypto) {
      res.json(crypto);
    } else {
      res.status(404).json({});
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = { cryptoRouter: router };
