const path = require('path');
const constants = require(path.join(__dirname, '../lib/constants.js'));

module.exports = function(RED) {
    'use strict';
    const debug = true;
    const moment = require('moment');
    const fmt = constants.DATE_FORMAT;

    RED.nodes.registerType('motion-sensor', function (config) {
        RED.nodes.createNode(this, config);
        this.lowBatteryLevel = config.lowBatteryLevel;
        var node = this;
        //not this is "global" and saved states
        node.on('input', function (msg) {
            var ret = [null, null, null];
            msg.payload = JSON.parse(msg.payload);
            node.status({
                text: moment().format(fmt),
                fill: msg.payload.occupancy ? "red" : "blue",
                shape: msg.payload.occupancy ? "dot" : "ring"
            });
            if(msg.payload.occupancy === true) {
                ret[0] = msg;
            } else {
                ret[1] = msg;
            }
            if(msg.payload.battery < node.lowBatteryLevel) {
                ret[2] = msg;
            }
            node.send(ret);
        });
    });
};
