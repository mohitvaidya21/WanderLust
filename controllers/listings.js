const Listing = require("../models/listing");
const axios = require("axios");


module.exports.index = async(req,res)=>{
    const allListings = await Listing.find({});
    return res.render("./listings/index.ejs",{allListings});
}

module.exports.newForm = (req,res)=>{
    return res.render("./listings/new.ejs");
}

module.exports.createListing = async(req,res,next)=>{
    if (!req.file) {
        req.flash("error", "Image upload required");
        return res.redirect("/listings/new");
    }
    let url = req.file.path;
    let filename = req.file.filename;
    let location = req.body.listing.location;
    let response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${location}`,
        {
            headers: {
                "User-Agent": "WanderLust"
            }
        }
    );
    if (!response.data.length) {
    req.flash("error", "Invalid location");
        return res.redirect("/listings/new");
    }
    let data = response.data[0];
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url , filename};
    newListing.geometry = {
        type: "Point",
        coordinates: [
            parseFloat(data.lon),
            parseFloat(data.lat),
        ]
    };
    await newListing.save();
    req.flash("success","New Listing Created");
    return res.redirect("/listings"); 
};

module.exports.showListing = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing
    .findById(id)
    .populate({
        path:"reviews",
        populate:{
            path: "author"
        },
    }).
    populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    // console.log(listing);
    return res.render("./listings/show.ejs",{listing});
};

module.exports.editForm = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    return res.render("./listings/edit.ejs",{listing});
};

module.exports.updateListing = async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{... req.body.listing});

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url , filename};
        await listing.save();
    }
    
    req.flash("success","Listing Updated!");
    return res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async(req,res)=>{
    let {id} = req.params;
    let delListing = await Listing.findByIdAndDelete(id);
    // console.log(delListing);
    req.flash("success","Listing Deleted");
    return res.redirect("/listings");

};

module.exports.searchListings = async(req,res)=>{

    let { search } = req.query;

    if(!search || typeof search !== "string"){
        req.flash("error","Search input invalid!");
        return res.redirect("/listings");
    }

    const allListings = await Listing.find({
        $or: [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } }
        ]
    });

    return res.render("listings/index.ejs",{ allListings });
};