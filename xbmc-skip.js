var xbmc_utils = require('./xbmc-time-adder');
var xbmc_rpc = require('node-xbmc-rpc');

var xbmc = new xbmc_rpc({
    url: '192.168.0.13',
    //user: <XBMC USERNAME>,
    //password: <XBMC PASSWORD>
});

xbmc.player.getProperties().then(function(r) {
    console.log(r);
    xbmc_utils.addMillisecondstoXBMCTime(r['time'],parseInt(process.argv[2])*1000);
    xbmc.player.seek({value:r['time']}).then(function(r) {
        console.log(r);
    });
} )
