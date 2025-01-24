const mongoose = require("mongoose");

const oeuvreSchema = new mongoose.Schema({
	titre: { type: String, required: true },
	description: { type: String, required: true },
	prix: { type: Number, required: true },
	image: { type: String, required: true },
	categorie: {
		type: String,
		enum: ["dessins", "peintures", "photos", "sculptures"],
		required: true,
	},

	dateCreation: { type: Date, default: Date.now },
});

const Oeuvre = mongoose.model("Oeuvre", oeuvreSchema);

module.exports = Oeuvre;
