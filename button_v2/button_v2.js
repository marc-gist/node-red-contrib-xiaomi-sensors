const path = require('path');
const constants = require(path.join(__dirname, '../lib/constants.js'));

module.exports = function(RED) {
    'use strict';
    const debug = true;
    const moment = require('moment');
    const fmt = constants.DATE_FORMAT;

    RED.nodes.registerType('button_v2', function (config) {
        RED.nodes.createNode(this, config);
        this.lowBatteryLevel = config.lowBatteryLevel;
        var node = this;
        //not this is "global" and saved states
        node.on('input', function (msg) {
            let ret = [null, null, null, null, null, null];
            let etype = "";
            let lowBat = false;

            if (typeof msg.payload === 'object'){
                msg.payload = msg.payload;
            } else {
                msg.payload = JSON.parse(msg.payload);
            }

            // if(msg.payload.contact === true) {
            //     // door is closed, second position payload.
            //     ret[0] = msg;
            // } else {
            //     ret[1] = msg;
            // }
            let pos = -1;
            if(msg.payload.hasOwnProperty('click')) {
                if(msg.payload.click === 'single')
                    pos = 0;
                else if(msg.payload.click === 'double')
                    pos = 1;

                etype = msg.payload.click;
            }
            if(msg.payload.hasOwnProperty('action')) {
                if(msg.payload.action === 'hold')
                    pos = 2;
                else if(msg.payload.action === 'release')
                    pos = 3;
                else if(msg.payload.action === 'shake')
                    pos = 4;

                etype = msg.payload.action;
            }
            if(pos >= 0 && pos <=4)
                ret[pos] = msg;

            if(msg.payload.battery < node.lowBatteryLevel) {
                ret[ret.length-1] = msg;
                lowBat = true;
            }

            node.status({
                text: etype + " @ " + moment().format(fmt),
                fill: lowBat ? "red" : "green",
                shape: "dot"
            });
            node.send(ret);
        });
    });
};
