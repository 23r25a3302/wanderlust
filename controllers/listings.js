const { query } = require("express");
const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken: mapToken});

// index callback
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    console.log("working listing");
    res.render("listings/index.ejs", {allListings});
}

// new callback
module.exports.renderNewForm = async (req, res) => {
    // console.log(req.body);
    res.render("listings/new.ejs");
}

// show callback
module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path: "reviews", populate : {
        path: "author",
    }})
    .populate("owner");
    if(!listing) {
        req.flash("error", "Listing you requested for not exist!");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", {listing});
}

// create callback
module.exports.createListing = async (req, res) => {
    // adding map
    // let response = await geocodingClient
    //     .forwardGeocode({
    //         query: req.body.Listing.location,
    //         limit: 1,
    //     })
    //     .send();
    //     console.log(query);
    //     res.send("ok");

    // let {title, description, image, price, country, location} = req.body;
    // let listing = req.body.listing;

    let url = req.file.path;
    let filename = req.file.filename;
    // console.log(url , " .. ", filename);

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename};

    // newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success", "New Listing Created!");
    // console.log(req.body.listing);
    res.redirect("/listings");
    // res.send("ok");
}

// edit callback
module.exports.renderEditListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for not exist!");
        res.redirect("/listings");
    }

    // let originalImageUrl = listing.image.url;
    // originalImageUrl.replace("/upload", "/upload/h_200,w_250"); // used to edit img using cloudinary api

    res.render("listings/edit.ejs", {listing});
    console.log("working");
}

// update callback
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    // if(!req.body.listing) {
    //     throw new ExpressError(400, "Send valid data for listing");
    // }
    // let listing = await Listing.findById(id);
    // if(!listing.owner._id.equals(res.locals.currUser._id)) {
    //     req.flash("error", "You don't have permission t edit");
    //     return res.redirect(`/listings/${id}`);
    // }
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}

// delete callback
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}