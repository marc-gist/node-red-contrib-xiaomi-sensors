const path = require('path');
const constants = require(path.join(__dirname, '../lib/constants.js'));

module.exports = function(RED) {
    'use strict';

    const debug = true;
    const moment = require('moment');

    RED.nodes.registerType('door-sensor', function (config) {
        RED.nodes.createNode(this, config);
        this.lowBatteryLevel = config.lowBatteryLevel;
        let node = this;
        //not this is "global" and saved states
        node.on('input', function (msg) {
            let ret = [null, null, null];
            msg.payload = JSON.parse(msg.payload);
            const doorIcon = msg.payload.contact ? "⛔ " : "⭕ ";
            node.status({
                text: doorIcon + moment().format(constants.DATE_FORMAT),
                fill: msg.payload.contact ? "green" : "red",
                shape: msg.payload.contact ? "dot" : "ring"
            });
            if(msg.payload.contact === true) {
                // door is closed, second position payload.
                ret[1] = msg;
            } else {
                ret[0] = msg;
            }
            if(msg.payload.battery < node.lowBatteryLevel) {
                ret[2] = msg;
            }
            node.send(ret);
        });
    });
};
