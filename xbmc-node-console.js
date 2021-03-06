var sprintf = require('sprintf').sprintf;
var xbmc_utils = require('./xbmc-time-adder');
var xbmc_rpc = require('node-xbmc-rpc');
var configs = require('config');

var config = null;
var configKey = null;

for (var k in configs) {
    if (!config) {
        config = configs[k];
        configKey = k;
    }
    if (process.argv.length > 2 && k == process.argv[2]) {
        config = configs[k];
        configKey = k;
        break;
    }
}

if (process.argv.length > 2 && configKey != process.argv[2]) {
    process.stdout.write("Couldn't find config for environment: "+process.argv[2]+"\n");
    process.exit();
}

process.stdout.write("Connecting to XBMC: "+configKey+"\n");

var xbmc = new xbmc_rpc({
    url: config.xbmc.url,
    user: config.xbmc.username,
    password: config.xbmc.password,
});

var stdin = process.stdin;

// without this, we would only get streams once enter is pressed
stdin.setRawMode( true );

// resume stdin in the parent process (node app won't quit all by itself
// unless an error or process.exit() happens)
stdin.resume();

// i don't want binary, do you?
stdin.setEncoding( 'utf8' );

function usage() {
    process.stdout.write("xbmc: (r)eset (a)dvert (s)how (p)lay/pause (q)uit < > skip\n");
}

function xbmc_status() {
    process.stdout.write("\r[period: "+current_period+"] ");
}

var last_prompt_length = 0;

function output_prompt(message) {
    process.stdout.write("\r"+(new Array( last_prompt_length + 1 ).join( ' ' )));
    var prompt_text = "p: "+(initial_sweep?'i':' ')+sprintf("%03s", current_period.toString())+" u: "+sprintf("%03s", user_period.toString())+" last: ["+last_key+"] > "+parsed_number;
    process.stdout.write("\r");
    process.stdout.write(prompt_text);
    prompt_length = prompt_text.length;
    if(message && message.length) {
        message = " # "+message;
        process.stdout.write(message);
        process.stdout.write("\r");
        process.stdout.write(prompt_text);
        prompt_length += message.length;
    }
    last_prompt_length = prompt_length;
}

var initial_sweep = config.advert.delay_bisect
var start_period = config.advert.start_period;
var minimum_period = config.advert.minimum_period;
var current_period = start_period;
var user_period = config.general.user_period;
var parsed_number = '';
var last_key = ' ';

usage();
output_prompt();
var PLAY_KEY = "\33\133\61\71\176",
    PREV_KEY = "\33\133\61\70\176",
    NEXT_KEY = "\33\133\62\60\176",
    ENTER_KEY = "\15"
    UP_KEY = "\33\133\101",
    DOWN_KEY = "\33\133\102",
    LEFT_KEY = "\33\133\104",
    RIGHT_KEY = "\33\133\103",
    TAB_KEY = "\11",
    ESC_KEY = "\33",
    ALT_S_KEY = "\337";

// on any data into stdin
stdin.on( 'data', function( key ){
    // ctrl-c ( end of text )
    if ( key === '\u0003' ) {
        process.exit();
    }
    // write the key to stdout all normal like
    if (1) {//key == 'a' || key == 's' || key == 'p' || key == 'q' || key == PREV_KEY || key == NEXT_KEY || key == PLAY_KEY) {
        var message = '';
        var skip_period = 0;
        if (key == 'a' || key == 's') {
            if (!(key == 'a' && initial_sweep)) {
                current_period /= 2;
                if (current_period < minimum_period)
                    current_period = minimum_period;
            }
        }
        last_key = key;
        var saw_number = false;
        switch (key) {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            saw_number = true;
            parsed_number += key;
            break;
        case 'r':
            current_period = start_period;
            initial_sweep = config.advert.delay_bisect;
            break;
        case 'a':
            skip_period = current_period;
            break;
        case 's':
            skip_period = -current_period;
            initial_sweep = false;
            break;
        case ENTER_KEY:
            var period = parseInt(parsed_number);
            if (parsed_number.length > 0) {
                if (period > 0 && ! isNaN(period)) {
                    user_period = period;
                }
            } else {
                xbmc.input.select();
            }
            last_key = '↵';
            break;
        case 'p':
        case PLAY_KEY:
            xbmc.player.playPause().then(function(r) {
                //console.log(r);
            });
            last_key = 'p';
            break;
        case '=':
            xbmc.player.setSubtitle({"subtitle":true});
            break;
        case '.':
        case '>':
        case NEXT_KEY:
            skip_period = user_period;
            last_key = '>';
            break;
        case ',':
        case '<':
        case PREV_KEY:
            skip_period = -user_period;
            last_key = '<';
            break;
        case 'q':
            process.stdout.write("\n");
            process.exit();
            break;
        case ESC_KEY:
            xbmc.input.back();
            last_key = '⎋';
            break;
        case TAB_KEY:
            xbmc.input.info();
            last_key = '⇆';
            break;
        case UP_KEY:
            xbmc.input.up();
            last_key = '⬆︎';
            break;
        case DOWN_KEY:
            xbmc.input.down();
            last_key = '⬇︎';
            break;
        case LEFT_KEY:
            xbmc.input.left();
            last_key = '⬅︎';
            break;
        case RIGHT_KEY:
            xbmc.input.right();
            last_key = '➡︎';
            break;
        case ALT_S_KEY:
            xbmc.player.stop();
            last_key = '◼︎';
            break;
        default:
            var codes = [];
            for (var i = 0, l = key.length; i < l; ++i) {
                codes.push('\\'+key.charCodeAt(i).toString(8));
            }
            message = 'unknown key was: '+codes.join('');
            last_key = ' ';
        }
        if (!saw_number) {
            parsed_number = '';
        }
        if (skip_period) {
            skipVideo(skip_period);
        }
        output_prompt(message);
    }
});

function skipVideo(period) {
    xbmc.player.getProperties().then(function(r) {
        //console.log(r);
        xbmc_utils.addMillisecondstoXBMCTime(r['time'],(period * 1000));
        xbmc.player.seek({value:r['time']}).then(function(r) {
            //console.log(r);
        });
    } )
}
