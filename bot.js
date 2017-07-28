const deasync = require('deasync');
const fs = require('fs');
const https = require('https');
const path = require('path');
const yaml = require('js-yaml');

function getRedditComments() {
  // let content = null;

  // const url = "https://www.reddit.com/r/all/comments.json";
  // https.get(url, function(res) {
  //   res.setEncoding('utf8');

  //   let chunks = "";
  //   res.on('data', function(chunk) { 
  //     chunks += chunk;
  //   });
  //   res.on('end', function() {
  //     content = chunks;
  //   });

  // }).on("error", function(e){
  //   content = undefined;
  // });

  // while(content === null) {
  //   deasync.sleep(50);
  // }

  let content = fs.readFileSync('./comments.js', 'utf8');


  return yaml.safeLoad(content)['data']['children'].map(yaml => {
    const commentData = yaml['data'];
    return {
      'commentBody': commentData['body'],
      'id': commentData['name']
    }
  });
}

function commentsContaining(target, comments) {
  return comments.filter(comment => {
    return comment['commentBody'].indexOf(target) != -1;
  })
}

const comments = getRedditComments();
const relevantComments = commentsContaining('˚F', comments);

console.log(relevantComments);



