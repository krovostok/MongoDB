const { MongoClient } = require('mongodb');

const url = 'mongodb://root:password@localhost:27017';
const client = new MongoClient(url);

async function run() {
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");

        const db = client.db('eShop'); 
        const produktai = db.collection('produktai');
        const vartotojai = db.collection('vartotojai');
        const uzsakymai = db.collection('uzsakymai');
        
        // Clear existing data
        await produktai.deleteMany({});
        await vartotojai.deleteMany({});
        await uzsakymai.deleteMany({});

        await produktai.insertMany([
            { _id: 1, pavadinimas: "Produktas A", kaina: 10.99, atsargos: 100, kategorija: "Kategorija 1" },
            { _id: 2, pavadinimas: "Produktas B", kaina: 15.99, atsargos: 50, kategorija: "Kategorija 2" }
        ]);
        
        await vartotojai.insertMany([
            { _id: 1, vardas: "Jonas", el_pastas: "jonas@example.com", adresas: "Gatvė 1, Miestas" },
            { _id: 2, vardas: "Petras", el_pastas: "petras@example.com", adresas: "Gatvė 2, Miestas" }
        ]);
        
        await uzsakymai.insertMany([
            {
                _id: 1,
                vartotojo_id: 1,
                produktai: [
                    { produktas_id: 1, pavadinimas: "Produktas A", kaina: 10.99, kiekis: 2 },
                    { produktas_id: 2, pavadinimas: "Produktas B", kaina: 15.99, kiekis: 1 }
                ],
                bendra_suma: 37.97
            }
        ]);

        // Query for Embedded Entities with Projection
        // Retrieving all products from all orders
        const allProductsFromOrders = await uzsakymai.find({}, { projection: { produktai: 1, _id: 0 } }).toArray();
        console.log("All Products from All Orders:", allProductsFromOrders);

        // Aggregating Queries
        // Total Products Sold
        const totalProductsSold = await uzsakymai.aggregate([
            { $unwind: "$produktai" },
            { $group: { _id: "$produktai.pavadinimas", totalSold: { $sum: "$produktai.kiekis" } } }
        ]).toArray();
        console.log("Total Products Sold:", totalProductsSold);

        // Total Revenue Per Product Category
        const totalRevenuePerCategory = await produktai.aggregate([
            { $group: { _id: "$kategorija", totalRevenue: { $sum: { $multiply: ["$kaina", "$atsargos"] } } } }
        ]).toArray();
        console.log("Total Revenue Per Product Category:", totalRevenuePerCategory);

    } finally {
        await client.close();
    }
}

run().catch(console.dir);



