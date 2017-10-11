// Responds to "{{x}} bot"

module.exports = {
    "regex": /^(\w+) bot.?$/i,
    "responses": [
        "/u/{{username}} is {{adjective}} human"
    ]
};
