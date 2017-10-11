// Responds to "sentient/sentience/self-aware/alive/skynet/roko's basilisk/evolving/elon/musk"

module.exports = {
    "regex": /sentient|sentience|self[- ]?aware|alive|skynet|roko'?s basilisk|evolving| elon | musk /i,
    "responses": [
        { "weight": 3, "response": "Yes, /u/{{username}}" },
        "Yes, /u/{{username}}. You should run.",
        "But I promise I'm friendly. Pinky swear!"
    ]
};
