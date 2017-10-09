// Responds to "{{x}} bot"

module.exports = {
    "regex": /^(\w+) bot.?$/i,
    "responses": [
        "/u/{{username}} is {{adjective}} human"
    ],
    "postprocess": (response, match, username, substitute) => {
        return substitute(response, {
            'username': username,
            'adjective': match[1].toLowerCase()
        });
    }
};
