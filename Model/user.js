const { Types, Schema, model } = require("mongoose");
const mongoose = require("mongoose");

const userData = new Schema({
    userGUID: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    emailAddress: {
        type: String,
    },
    password: {
        type: String,
    },
    businessName: {
        type: String,
    },
    businessNumber: {
        type: String,
    },
    uniqueCode: {
        type: String,
    },
    externalReference: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    homeAddress: {
        address1: { type: String },
        address2: { type: String },
        city: { type: String },
        pinCode: { type: String },
        state: { type: String },
        country: { type: String },
    },
    postalAddress: {
        address1: { type: String },
        address2: { type: String },
        city: { type: String },
        pinCode: { type: String },
        state: { type: String },
        country: { type: String },
    },
    creationDate: {
        type: Date,
        default: new Date()
    },
    modifyDate: {
        type: Date,
        default: null
    },
    archiveDate: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Delete"],
        default: "Active"
    },


},
);

module.exports = model("user", userData);

