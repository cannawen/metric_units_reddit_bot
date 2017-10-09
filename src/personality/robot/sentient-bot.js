// Responds to "sentient/sentience/self-aware/alive/skynet/roko's basilisk/evolving/elon/musk"

module.exports = {
    "regex": /sentient|sentience|self[- ]?aware|alive|skynet|roko'?s basilisk|evolving| elon | musk /i,
    "responses": [
        [3, "Yes, /u/{{username}}"],
        "Yes, /u/{{username}}. You should run.",
        "But I promise I'm friendly. Pinky swear!"
    ],
    "postprocess": (response, match, username, substitute) => {
        return substitute(response, {
            'username': username
        });
    }
};
