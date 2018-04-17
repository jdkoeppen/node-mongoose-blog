const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
mongoose.Promise = global.Promise;

const app = express();
app.use(morgan('common'));
app.use(express.json());

const {PORT, DATABASE_URL} = require('./config');
const {BlogPost} = require('./models');
 
app.get('/posts', (req, res) => {
    BlogPost.find().then(posts => {
        res.json(posts.map(post => post.serialize()));
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({error:'Something went wrong.'});
    }); 
});

app.get('/posts/:id', (req, res) => {
    BlogPost.findById(req.params.id)
    .then(post => res.json(post.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error:'Something went wrong.'})
    });
});

app.post('/posts', (req, res) => {
    BlogPost.create({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author
    })
    .then(blogPost => res.status(201).json(blogPost.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error:'Something went wrong.'})
    })
})

app.delete('/posts/:id', (req, res) => {
    BlogPost.findByIdAndRemove(req.params.id)
    .then(() => {
        res.status(204).json({message: 'Successfully Deleted.'});
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Something went wrong.'});
    });
});

app.put("/post/:id", (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({ error: "Path id and Body id must match." });
  }
  const updated = {};
  const updateableFields = ["title", "content", "author"];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  BlogPost.findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({ error: 'Something went wrong.' }));
});

app.use('*', (req, res) => res.status(404).json({error: 'Not Found'}));

let server;

function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if(err) {
                return reject(err);
            }
            server = app.listen(port,() => {
                console.log(`App is listening on port ${port}`);
                resolve();
            })
            .on('error', err => {
                mongoose.disconnect();
                reject(err)
            });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing Server.');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        })
    })
}

if(require.main === module) {
    console.log('Database Url is' + DATABASE_URL);
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {runServer, app, closeServer};