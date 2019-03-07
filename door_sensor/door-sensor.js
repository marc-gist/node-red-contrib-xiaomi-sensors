'use strict';
module.exports = function(RED) {
    const debug = true;
    const moment = require('moment');
    const fmt = 'YYYY-MM-DD HH:mm';

    RED.nodes.registerType('door-sensor', function (config) {
        RED.nodes.createNode(this, config);
        this.lowBatteryLevel = config.lowBatteryLevel;
        var node = this;
        //not this is "global" and saved states
        node.on('input', function (msg) {
            var ret = [null, null, null];
            msg.payload = JSON.parse(msg.payload);
            node.status({
                text: moment().format(fmt),
                fill: msg.payload.contact ? "green" : "red",
                shape: msg.payload.contact ? "dot" : "ring"
            });
            if(msg.payload.contact === true) {
                // door is closed, second position payload.
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
