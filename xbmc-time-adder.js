exports.addMillisecondstoXBMCTime = function(time, ms) {
    var units = [
        { 'unit' : 'milliseconds', 'multiplier' : 1 },
        { 'unit' : 'seconds', 'multiplier' : 1000 },
        { 'unit' : 'minutes', 'multiplier' : 60 },
        { 'unit' : 'hours', 'multiplier' : 60 }
        ];
    var total = 0;
    var multiplier = 1;
    for ( var i = 0, l = units.length; i < l; ++i) {
        var unit = units[i];
        multiplier *= unit['multiplier'];
        total += time[unit['unit']] * multiplier;
    }
    total += ms;
    for ( var i = 0, l = units.length; i < l; ++i) {
        var unit = units[i];
        var next = units[i+1];
        if (next) {
            time[unit['unit']] = total % next['multiplier'];
            total = Math.floor( total / next['multiplier'] );
        } else {
            time[unit['unit']] = total;
        }
    }
};
