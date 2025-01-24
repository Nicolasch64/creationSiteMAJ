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
		from: "ton_email@gmail.com", // Ton email
		to,
		subject,
		text,
		html,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log("Erreur:", error);
		} else {
			console.log("Email envoyé:", info.response);
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

	// Lire les fichiers du dossier 'dessins'
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
					// Vérifie si l'image existe déjà dans la base de données
					Oeuvre.findOne({ titre: file }) // Ici, on utilise le titre comme identifiant unique
						.then((existingOeuvre) => {
							if (!existingOeuvre) {
								// Si l'œuvre n'existe pas déjà
								const imageUrl = `/images/dessins/${file}`; // URL relative pour l'image

								// Créer une nouvelle oeuvre avec l'URL de l'image
								const oeuvre = new Oeuvre({
									titre: file, // Le titre peut être le nom de l'image ou autre chose
									description: "Description de l'œuvre", // Tu peux personnaliser cela
									prix: 100, // Prix à définir
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
										console.error(
											`Erreur lors de l'ajout de l'image ${file}:`,
											err
										);
									});
							} else {
								console.log(
									`L'image ${file} existe déjà dans la base de données.`
								);
							}
						})
						.catch((err) => {
							console.error(
								"Erreur lors de la recherche de l'œuvre dans la base de données:",
								err
							);
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

	// Lire les fichiers du dossier 'dessins'
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
					// Vérifie si l'image existe déjà dans la base de données
					Oeuvre.findOne({ titre: file }) // Ici, on utilise le titre comme identifiant unique
						.then((existingOeuvre) => {
							if (!existingOeuvre) {
								// Si l'œuvre n'existe pas déjà
								const imageUrl = `/images/peintures/${file}`; // URL relative pour l'image

								// Créer une nouvelle oeuvre avec l'URL de l'image
								const oeuvre = new Oeuvre({
									titre: file, // Le titre peut être le nom de l'image ou autre chose
									description: "Description de l'œuvre", // Tu peux personnaliser cela
									prix: 100, // Prix à définir
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
										console.error(
											`Erreur lors de l'ajout de l'image ${file}:`,
											err
										);
									});
							} else {
								console.log(
									`L'image ${file} existe déjà dans la base de données.`
								);
							}
						})
						.catch((err) => {
							console.error(
								"Erreur lors de la recherche de l'œuvre dans la base de données:",
								err
							);
						});
				}
			});
		});
	});
};

ajouterPeintures();

// Route pour recevoir les achats
app.post("/submit", async (req, res) => {
	const { name, email, address, paymentMethod, productName, price, productId } =
		req.body;
	console.log("Received productId:", productId);

	// Tu peux rechercher l'œuvre dans la base de données MongoDB
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

	// Créer l'objet de la commande
	const purchase = new Purchase({
		acheteur: {
			nom: name,
			email,
			adresse: address,
			telephone: req.body.telephone, // Assure-toi que ce champ est dans le formulaire si tu veux l'envoyer
		},
		oeuvre: oeuvre._id,
		paymentMethod,
	});

	try {
		// Sauvegarder la commande
		const savedPurchase = await purchase.save();

		// Message pour l'utilisateur
		const userMessage = `
        <h3>Merci beaucoup pour votre commande, ${name}</h3>
        <p>Nous avons bien reçu votre commande pour "${productName}".</p>
        <p>Prix: ${price}€</p>
        <p>Adresse de livraison: ${address}</p>
        <p>Méthode de paiement: ${paymentMethod}</p>
        <p>Nous vous enverrons un e-mail lorsque votre commande sera expédiée.</p>`;

		// Envoi de l'email à l'utilisateur
		sendEmail(
			email,
			"Confirmation de votre commande",
			"Merci pour votre achat et votre soutien!",
			userMessage
		);

		// Message pour l'administrateur
		const adminMessage = `
        <h3>Nouvelle vente</h3>
        <p>Un utilisateur a acheté "${productName}".</p>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Adresse de livraison:</strong> ${address}</p>
        <p><strong>Prix:</strong> ${price}€</p>
        <p><strong>Méthode de paiement:</strong> ${paymentMethod}</p>
        `;

		// Envoi de l'email à l'administrateur
		sendEmail(
			"admin@example.com",
			"Nouvelle vente",
			"Une nouvelle vente a été effectuée",
			adminMessage
		);

		// Réponse à l'utilisateur
		res.status(200).json({
			message: "Purchase recorded successfully!",
			date: savedPurchase.dateCommande,
		});
	} catch (error) {
		res.status(500).json({ message: "Error saving purchase data" });
	}
});

app.listen(5056, () => {
	console.log("Server is running on http://localhost:5056");
});
