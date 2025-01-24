const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
	{
		acheteur: {
			nom: { type: String, required: true },
			email: { type: String, required: true },
			adresse: { type: String, required: true },
			telephone: { type: String },
		},
		oeuvre: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Oeuvre",
			required: true,
		},
		paymentMethod: { type: String, required: true },
		dateCommande: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

const Purchase = mongoose.model("Purchase", purchaseSchema);

module.exports = Purchase;
