// Drum Arrays
let kicks = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
let snares = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
let hiHats = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
let rideCymbals = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]

function stringToArray(name) {
    switch (name) {
        case 'kicks':
            return kicks;
        case 'snares':
            return snares;
        case 'hiHats':
            return hiHats;
        case 'rideCymbals':
            return rideCymbals;
        default:
            break;
    }
}

function toggleDrum(array, index) {
    const drums = stringToArray(array);

    if (array && index < array.length && index >= 0)
        drums[index] = !drums[index]
}

function clear(array) {
    if (array) {
        const drums = stringToArray(array);

        if (drums)
            for (let i = 0; i < 16; i++) {
                drums[i] = false;
            }
    }
}

function invert(array) {
    if (array) {
        const drums = stringToArray(array)

        if(drums)
        for(let i = 0; i < drums.length; i++) {
            drums[i] = !drums[i]
        }
    }
}

function getNeighborPads(x, y) {

}
