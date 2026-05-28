const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");

main()
    .then((res)=>{
        console.log("Connected to db");
    }).catch((e)=>{
        console.log(e);
    });
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initDB = async ()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj,
        owner:"6a15975b2f7cca72c3ddee6c"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();