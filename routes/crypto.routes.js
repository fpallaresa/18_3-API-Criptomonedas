const express = require("express");

// Modelos
const { Crypto } = require("../models/Crypto.js");

// Router propio de cryptomonedas
const router = express.Router();

// CRUD: READ
// EJEMPLO DE REQ: http://localhost:3000/crypto?page=1&limit=10
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

// CRUD: READ
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

// CRUD: Operación custom, no es CRUD
router.get("/title/:title", async (req, res) => {
  const title = req.params.title;

  try {
    const crypto = await Crypto.find({ title: new RegExp("^" + title.toLowerCase(), "i") });
    if (crypto?.length) {
      res.json(crypto);
    } else {
      res.status(404).json([]);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Endpoint de creación de libros
// CRUD: CREATE
router.post("/", async (req, res) => {
  try {
    const crypto = new Crypto({
      title: req.body.title,
      author: req.body.author,
      pages: req.body.pages,
    });

    const createdCrypto = await crypto.save();
    return res.status(201).json(createdCrypto);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Para elimnar libros
// CRUD: DELETE
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

// CRUD: UPDATE
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

module.exports = { cryptoRouter: router };
