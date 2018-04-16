const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const blogPostSchema = mongoose.Schema({
  author: {
    firstName: String,
    lastName: String
  },
  title: { type: String, required: true },
  content: String,
  created: { type: Date, default: Date.now }
});

blogPostSchema.virtual('authorName').get(() => {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostSchema.methods.serialize = () => {
    return {
        id: this._id,
        author: this.authorName,
        content: this.content,
        title: this.title,
        created: this.created
    };
};

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = {BlogPost};

