var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
var uniqueValidator = require('mongoose-unique-validator');
//Define a schema
var Schema = mongoose.Schema;

var UserModelSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true, },
    email: { type: String, required: true, unique: true, trim: true,lowercase: true, },
    password: { type: String, required: true,  trim: true, },
    created_groups: [Schema.Types.ObjectId],
    joined_groups: [Schema.Types.ObjectId],
    stories: [Object],
    profile: {
        profile_pic: String,
        dob:{ type: Date, required: true,trim: true },
        full_name: { type: String, required: true,  trim: true },
        role: { type: String, required: true,  trim: true, default:"User" },
        UserCreateddate: { type: Date,  default: Date.now() }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

UserModelSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'HardWorkAlwaysPayOff')

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}


UserModelSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

UserModelSchema.statics.findByCredentials = async (username, password) => {
    const user = await User.findOne({ username })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

UserModelSchema.plugin(uniqueValidator);

const User = mongoose.model('UserModel', UserModelSchema)

module.exports = User