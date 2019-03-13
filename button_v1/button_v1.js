const path = require('path');
const constants = require(path.join(__dirname, '../lib/constants.js'));

module.exports = function(RED) {
    'use strict';

    const debug = true;
    const moment = require('moment');
    const fmt = constants.DATE_FORMAT;

    RED.nodes.registerType('button_v1', function (config) {
        RED.nodes.createNode(this, config);
        this.lowBatteryLevel = config.lowBatteryLevel;
        var node = this;

        //not this is "global" and saved states
        node.on('input', function (msg) {
            var ret = [null, null, null, null, null];
            msg.payload = JSON.parse(msg.payload);
            let lowBat = false;
            let btype = "";

            // if(msg.payload.contact === true) {
            //     // door is closed, second position payload.
            //     ret[0] = msg;
            // } else {
            //     ret[1] = msg;
            // }
            if(msg.payload.hasOwnProperty('click')) {
                btype = msg.payload.click;
                var pos = -1;
                if(msg.payload.click === 'single')
                    pos = 0;
                else if(msg.payload.click === 'double')
                    pos = 1;
                else if(msg.payload.click === 'triple')
                    pos = 2;
                else if(msg.payload.click === 'quadruple')
                    pos = 3;
                if(pos >= 0 && pos <=3)
                    ret[pos] = msg;
            }
            if(msg.payload.battery < node.lowBatteryLevel) {
                ret[4] = msg;
                lowBat = true;
            }

            node.status({
                text: btype + " @ " + moment().format(fmt),
                fill: lowBat ? "red" : "green",
                shape: "dot"
            });

            node.send(ret);
        });
    });
};
