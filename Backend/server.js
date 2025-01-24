const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const Oeuvre = require("./models/oeuvres"); // Une seule déclaration ici
const Purchase = require("./models/purchase");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connexion à MongoDB
mongoose
	.connect("mongodb://localhost:27017/db_site", {})
	.then(() => {
		console.log("Connected to MongoDB");

		// Forcer la création des collections 'oeuvres' et 'purchases'
		const db = mongoose.connection.db;

		// Créer manuellement la collection "oeuvres"
		db.createCollection("oeuvres")
			.then(() => console.log("Collection 'oeuvres' créée avec succès"))
			.catch((err) =>
				console.error(
					"Erreur lors de la création de la collection 'oeuvres':",
					err
				)
			);

		// Créer manuellement la collection "purchases"
		db.createCollection("purchases")
			.then(() => console.log("Collection 'purchases' créée avec succès"))
			.catch((err) =>
				console.error(
					"Erreur lors de la création de la collection 'purchases':",
					err
				)
			);
	})
	.catch((error) => {
		console.log("Error connecting to MongoDB:", error);
	});

// Schéma de la commande (purchase)
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

// Initialisation de Nodemailer pour l'envoi des emails
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "chapellen10@gmail.com",
		pass: "bikz bbsy ttok bbdk ",
	},
});

const sendEmail = (to, subject, text, html) => {
	const mailOptions = {
		from: "chapellen10@gmail.com",
		to,
		subject,
		text,
		html,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log("Error:", error);
		} else {
			console.log("Email sent: " + info.response);
		}
	});
};

// Middleware pour servir les images
app.use("/images", express.static(path.join(__dirname, "images")));

// Fonction pour ajouter les images du sous-dossier dessins dans MongoDB
// 1. Définir la fonction ajouterDessins
const ajouterDessins = () => {
	const dessinsDir = path.resolve(__dirname, "../Frontend/images/dessins");
	console.log("Chemin vers le dossier dessins:", dessinsDir);

	fs.readdir(dessinsDir, (err, files) => {
		if (err) {
			console.error("Erreur lors de la lecture du dossier dessins:", err);
			return;
		}

		files.forEach((file) => {
			const filePath = path.join(dessinsDir, file);
			fs.stat(filePath, (error, stat) => {
				if (error) {
					console.error("Erreur lors de la lecture du fichier:", error);
					return;
				}

				if (stat.isFile()) {
					const imageUrl = `/images/dessins/${file}`; // URL relative pour l'image

					// Créer une nouvelle oeuvre avec l'URL de l'image
					const oeuvre = new Oeuvre({
						titre: file,
						description: "Description de l'œuvre",
						prix: 100,
						image: imageUrl,
						categorie: "dessins",
					});

					// Sauvegarder l'objet dans MongoDB
					oeuvre
						.save()
						.then(() => {
							console.log(`Image ${file} ajoutée à la base de données`);
						})
						.catch((err) => {
							console.error(`Erreur lors de l'ajout de l'image ${file}:`, err);
						});
				}
			});
		});
	});
};

// 2. Appeler la fonction après sa déclaration
ajouterDessins(); // Appel de la fonction ici

const ajouterPeintures = () => {
	const peinturesDir = path.resolve(__dirname, "../Frontend/images/peintures");
	console.log("Chemin vers le dossier peintures:", peinturesDir);

	fs.readdir(peinturesDir, (err, files) => {
		if (err) {
			console.error("Erreur lors de la lecture du dossier peintures:", err);
			return;
		}

		files.forEach((file) => {
			const filePath = path.join(peinturesDir, file);
			fs.stat(filePath, (error, stat) => {
				if (error) {
					console.error("Erreur lors de la lecture du fichier:", error);
					return;
				}

				if (stat.isFile()) {
					const imageUrl = `/images/peintures/${file}`; // URL relative pour l'image

					// Créer une nouvelle oeuvre avec l'URL de l'image
					const oeuvre = new Oeuvre({
						titre: file,
						description: "Description de l'œuvre",
						prix: 100,
						image: imageUrl,
						categorie: "peintures",
					});

					// Sauvegarder l'objet dans MongoDB
					oeuvre
						.save()
						.then(() => {
							console.log(`Image ${file} ajoutée à la base de données`);
						})
						.catch((err) => {
							console.error(`Erreur lors de l'ajout de l'image ${file}:`, err);
						});
				}
			});
		});
	});
};

// 2. Appeler la fonction après sa déclaration
ajouterPeintures(); // Appel de la fonction ici

// Route pour recevoir les achats
app.post("/submit", async (req, res) => {
	const { name, email, address, paymentMethod, productName, price, productId } =
		req.body;
	console.log("Received productId:", productId);

	let oeuvre;
	try {
		oeuvre = await Oeuvre.findById(productId);
	} catch (err) {
		console.error(err);
		return res
			.status(500)
			.json({ message: "Erreur lors de la recherche de l'œuvre" });
	}

	if (!oeuvre) {
		return res.status(404).json({ message: "Oeuvre non trouvée!" });
	}

	const purchase = new Purchase({
		acheteur: {
			nom: name,
			email,
			adresse: address,
			telephone: req.body.telephone,
		},
		oeuvre: oeuvre._id,
		paymentMethod,
	});

	try {
		const savedPurchase = await purchase.save();

		const userMessage = `
      <h3>Merci beaucoup pour votre commande, ${name}</h3>
      <p>Nous avons bien reçu votre commande pour "${productName}".</p>
      <p>Prix: ${price}€</p>
      <p>Adresse de livraison: ${address}</p>
      <p>Méthode de paiement: ${paymentMethod}</p>
      <p>Nous vous enverrons un e-mail lorsque votre commande sera expédiée.</p>`;

		sendEmail(
			email,
			"Confirmation de votre commande",
			"Merci pour votre achat et votre soutien!",
			userMessage
		);

		const adminMessage = `
      <h3>Nouvelle vente</h3>
      <p>Un utilisateur a acheté "${productName}".</p>
      <p><strong>Nom:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Adresse de livraison:</strong> ${address}</p>
      <p><strong>Prix:</strong> ${price}€</p>
      <p><strong>Méthode de paiement:</strong> ${paymentMethod}</p>
    `;

		sendEmail(
			"chapellen10@gmail.com",
			"Nouvelle vente",
			"Une nouvelle vente a été effectuée",
			adminMessage
		);

		res.status(200).json({
			message: "Purchase recorded successfully!",
			date: savedPurchase.dateCommande,
		});
	} catch (error) {
		res.status(500).json({ message: "Error saving purchase data" });
	}
});

app.listen(5055, () => {
	console.log("Server is running on http://localhost:5055");
});
