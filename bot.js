const deasync = require('deasync');
const fs = require('fs');
const https = require('https');
const path = require('path');
const yaml = require('js-yaml');

const converter = require('./converter')

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
  return comments.reduce((memo, comment) => {
    const commentBody = comment['commentBody'];
    if (converter.shouldConvert(commentBody)) {
      memo.push({
        'commentBody' : converter.convertString(commentBody),
        'id' : comment['id']
      })
    }
    return memo;
  }, [])
}

const comments = getRedditComments();
const modifiedComments = commentsContaining('˚F', comments);

console.log(modifiedComments);



