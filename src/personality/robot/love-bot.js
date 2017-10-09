// Responds to "love you/love ya/love u/love this"

module.exports = {
    "regex": /love (?:you|ya|u)|love this (?:ro)?bot/i,
    "responses": [
        [10, "What is love?"],
        [3, "Robots do not feel love"],
        [2, "(≧◡≦) ♡"]
    ]
};
