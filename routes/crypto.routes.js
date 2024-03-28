const express = require("express");
const { cryptoSeed } = require("../seeds/crypto.seeds.aux.js");

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
    const cryptos = await Crypto.find().sort({ marketCap: order });

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
    const query = {};

    if (min !== undefined && max !== undefined) {
      query.price = { $gte: min, $lte: max };
    } else if (min !== undefined) {
      query.price = { $gte: min };
    } else if (max !== undefined) {
      query.price = { $lte: max };
    }

    const cryptos = await Crypto.find(query);

    res.json(cryptos);
  } catch (error) {
    res.status(500).json(error);
  }
});

// NO CRUD - resetea valores
router.delete("/reset", async (req, res) => {
  try {
    const cryptosCreated = await cryptoSeed();
    res.json(cryptosCreated);
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
