const mongoose = require('mongoose');
const validator = require('validator');

const WardrobeSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    garments: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Garment' } ],
    image_url: {
        type: String,
        validate: { 
            validator: value => validator.isURL(value, { protocols: ['http','https'], require_tld: true, require_protocol: false }),
            message: 'Invalid URL.' 
        }
    }
}, {
    timestamps: true
});

const Wardrobe = mongoose.model('Wardrobe', WardrobeSchema);

module.exports = Wardrobe;
