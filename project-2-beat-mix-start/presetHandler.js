// Use this presets array inside your presetHandler
const presets = require('./presets');

// Complete this function:
const presetHandler = (requestType, index, newPresetArray) => {
    if (index >= presets.length || index < 0) return [404]
    let result = [200]

    switch (requestType) {
        case 'GET':
            return [200,presets[index]]
        case 'PUT':
            presets[index] = newPresetArray
            return [200, presets[index]]
        default:
            return [400]
    }
};

// Leave this line so that your presetHandler function can be used elsewhere:
module.exports = presetHandler;
