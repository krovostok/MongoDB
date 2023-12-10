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
        
        await produktai.deleteMany({});
        await vartotojai.deleteMany({});
        await uzsakymai.deleteMany({});

        await produktai.insertMany([
            { _id: 1, pavadinimas: "Chicken Steak", kaina: 10.99, atsargos: 100, kategorija: "Food" },
            { _id: 2, pavadinimas: "Beef Steak", kaina: 15.99, atsargos: 50, kategorija: "Food" }
        ]);
        
        await vartotojai.insertMany([
            { _id: 1, vardas: "Mike", el_pastas: "mike@shsm.com", adresas: "1206 Levin Street, Silent Hill" },
            { _id: 2, vardas: "Lucy", el_pastas: "rakso@shsm.com", adresas: "1206 Levin Street, Silent Hill" }
        ]);
        
        await uzsakymai.insertMany([
            {
                _id: 1,
                vartotojo_id: 1,
                produktai: [
                    { produktas_id: 1, pavadinimas: "Chicken Steak", kaina: 10.99, kiekis: 2 },
                    { produktas_id: 2, pavadinimas: "Beef Steak", kaina: 15.99, kiekis: 1 }
                ],
                bendra_suma: 37.97
            }
        ]);

        const allProductsFromOrders = await uzsakymai.find({}, { projection: { produktai: 1, _id: 0 } }).toArray();
        console.log("All Products from All Orders:", allProductsFromOrders);

        const totalProductsSold = await uzsakymai.aggregate([
            { $unwind: "$produktai" },
            { $group: { _id: "$produktai.pavadinimas", totalSold: { $sum: "$produktai.kiekis" } } }
        ]).toArray();
        console.log("Total Products Sold:", totalProductsSold);

        const totalRevenuePerCategory = await produktai.aggregate([
            { $group: { _id: "$kategorija", totalRevenue: { $sum: { $multiply: ["$kaina", "$atsargos"] } } } }
        ]).toArray();
        console.log("Total Revenue Per Product Category:", totalRevenuePerCategory);

    } finally {
        await client.close();
    }
}

run().catch(console.dir);



