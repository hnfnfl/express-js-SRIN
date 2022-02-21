const express = require("express");
const mahasiswaModel = require("./model");
const app = express();

app.post("/add_mahasiswa", async (req, res) => {
  const result = new mahasiswaModel(req.body);

  try {
    await result.save();
    res.send("Success add data");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/mahasiswa/getAll", async (req, res) => {
  const result = await mahasiswaModel.aggregate([
    {
      $lookup: {
        from: "matkul",
        localField: "matkul",
        foreignField: "_id",
        as: "mata_kuliah",
      },
    },
    {
      $project: {
        matkul: 0,
        "mata_kuliah._id": 0,
      },
    },
    {
      $addFields: {
        "total sks": { $sum: { $sum: "$mata_kuliah.sks" } },
      },
    },
  ]);

  try {
    if (result.length > 0) {
      res.status(200).json({ data: result });
    } else {
      res.status(204).send("Data not found");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/mahasiswa/getDomisili", async (req, res) => {
  let domicile = req.query.city;

  try {
    const result = await mahasiswaModel.aggregate([
      { $match: { domicile: { $regex: domicile, $options: "i" } } },
      {
        $lookup: {
          from: "matkul",
          localField: "matkul",
          foreignField: "_id",
          as: "mata_kuliah",
        },
      },
      {
        $project: {
          matkul: 0,
          "mata_kuliah._id": 0,
        },
      },
      {
        $addFields: {
          "total sks": { $sum: { $sum: "$mata_kuliah.sks" } },
        },
      },
    ]);

    if (result.length > 0) {
      res.status(200).json({ data: result });
    } else {
      res.status(204).send("Data not found");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/mahasiswa/getMatkul", async (req, res) => {
  let matkul = req.query.matkul;

  try {
    const result = await mahasiswaModel.aggregate([
      {
        $lookup: {
          from: "matkul",
          localField: "matkul",
          foreignField: "_id",
          as: "mata_kuliah",
        },
      },
      { $unwind: "$mata_kuliah" },
      { $unwind: "$mata_kuliah.matkul" },
      { $match: { "mata_kuliah.matkul": { $regex: matkul, $options: "i" } } },
      { $project: { matkul: 0, "mata_kuliah._id": 0 } },
    ]);

    if (result.length > 0) {
      res.status(200).json({ data: result });
    } else {
      res.status(204).send("Data not found");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/mahasiswa/getMatkulSks", async (req, res) => {
  let sks = parseInt(req.query.sks);

  try {
    const result = await mahasiswaModel.aggregate([
      {
        $lookup: {
          from: "matkul",
          localField: "matkul",
          foreignField: "_id",
          as: "mata_kuliah",
        },
      },
      { $unwind: "$mata_kuliah" },
      { $unwind: "$mata_kuliah.sks" },
      { $match: { "mata_kuliah.sks": sks } },
      { $project: { matkul: 0, "mata_kuliah._id": 0 } },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          matkul: { $push: "$mata_kuliah" },
        },
      },
    ]);

    if (result.length > 0) {
      res.status(200).json({ data: result });
    } else {
      res.status(204).send("Data not found");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/mahasiswa/getTotalSks", async (req, res) => {
  let sks = parseInt(req.query.sks);

  try {
    const result = await mahasiswaModel.aggregate([
      {
        $lookup: {
          from: "matkul",
          localField: "matkul",
          foreignField: "_id",
          as: "mata_kuliah",
        },
      },
      { $project: { matkul: 0, "mata_kuliah._id": 0 } },
      { $addFields: { "total sks": { $sum: { $sum: "$mata_kuliah.sks" } } } },
      { $match: { "total sks": { $lt: sks } } },
    ]);

    if (result.length > 0) {
      res.status(200).json({ data: result });
    } else {
      res.status(204).send("Data not found");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = app;
