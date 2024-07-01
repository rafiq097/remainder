const mongoose = require("mongoose");

const toIST = (date) => {
    const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST is GMT+5.5
    return new Date(date.getTime() + IST_OFFSET);
};

const emailSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Enter Email"],
        unique: true,
    },
    time: {
        type: Date,
        default: Date.now,
    },
},
{
    timestamps: true 
});

emailSchema.pre('save', function(next) {
    if (this.isNew) {
        this.createdAt = toIST(this.createdAt);
        this.time = toIST(this.time);
    }
    this.updatedAt = toIST(new Date());
    next();
});

const Email = mongoose.model("Email", emailSchema);

module.exports = Email;