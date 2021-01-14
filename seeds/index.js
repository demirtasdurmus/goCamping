const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/fun-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 25; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            owner: "5ff80fe116131e094c7467b6",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.Temporibus eveniet neque distinctio facilis quam impedit aut porro nisi itaque quod commodi quo ducimus, doloremque magnam quisquam sed natus. Eveniet, nisi.",
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/doo75ctwq/image/upload/v1609957683/FunCamping/ejfqmzhg4sozpcskdrss.jpg',
                    filename: 'FunCamping/ejfqmzhg4sozpcskdrss'
                },
                  {
                    url: 'https://res.cloudinary.com/doo75ctwq/image/upload/v1609957683/FunCamping/plabcolo5zhzkwjhxnrl.jpg',
                    filename: 'FunCamping/plabcolo5zhzkwjhxnrl'
                  }
            ],
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})