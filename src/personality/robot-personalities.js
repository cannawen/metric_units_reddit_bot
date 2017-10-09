/*
    This module contains the configuration for all robot personalities that metric_units_bot
    uses to reply to other users. The exported list contains *filenames* of those personalities and is
    used by the personality module to construct a dictionary of possible responses.

    *Order of the filenames in the exported list matters*
    Filenames in the exported list will be evaluated by metric_units_bot *in that order*. For example,
    the comment "good bot!" will match both the "good bot" and "{{x}} bot" personalities, so the "good bot"
    personality must be evaluated first.

    To add a new robot personality, first create the personality file within the './robot' directory.  Next,
    add the filename of the new personality to the exported list below; remember that it must be in the proper
    order within the list.  That's it! The personality module will automatically add your new personality to
    its dictionary!


    A robot personality must contain the following three atrributes:
    regex
        a function returning true/false -or- a regex string to see if an input string matches the trigger

    response
        a list of responses. You can change the probability of a response being said
        by adding it in an array (see ./robot/good-bot.js for examples)

    postprocess (optional)
        a function that takes in a response, regex matches, and a username that is run after a
        match is found. You can use the input parameters to construct a new response (i.e. adding
        their username to a response, or echoing a portion of their comment back at them)
*/

module.exports = [
    'good-bad-bot',
    'who-x-bot',
    'ok-bot',
    'cute-bot',
    'mister-bot',
    'good-human-bot',
    'good-bot',
    'bad-bot',
    'thank-you-bot',
    'x-bot',
    'stupid-bot',
    'love-bot',
    'sentient-bot',
    'fingers-right-bot',
    'fingers-left-bot',
    'what-is-love-bot',
    'baby-dont-hurt-me-bot',
    'dont-hurt-me-bot'
];
