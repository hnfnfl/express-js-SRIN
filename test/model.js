const mongoose = require("mongoose");

const MahasiswaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    domicile: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    matkul: {
      type: Array,
      default: [],
    }
  },
  {
    collection: "mahasiswa",
		versionKey: false,
  }
);

const Mahasiswa = mongoose.model("mahasiswa", MahasiswaSchema);

module.exports = Mahasiswa;
