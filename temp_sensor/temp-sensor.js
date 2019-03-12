'use strict';
module.exports = function(RED) {
    const debug = true;
    const moment = require('moment');
    const fmt = 'YYYY-MM-DD HH:mm';

    RED.nodes.registerType('temp-sensor', function (config) {
        RED.nodes.createNode(this, config);
        this.lowBatteryLevel = config.lowBatteryLevel;
        let node = this;
        //not this is "global" and saved states
        node.on('input', function (msg) {
            let ret = [null, null, null, null];
            let alert = false;

            msg.payload = JSON.parse(msg.payload);
            const t = msg.payload.temperature;
            if(node.rangeBelow && msg.payload.temperature < node.rangeBelow) {
                alert = true;
                ret[2] = {
                    payload: true,
                    data: msg.payload
                }
            }
            node.status({
                text: moment().format(fmt),
                fill: msg.payload.contact ? "green" : "red",
                shape: msg.payload.contact ? "dot" : "ring"
            });

            if(msg.payload.battery < node.lowBatteryLevel) {
                ret[3] = msg;
            }
            node.send(ret);
        });
    });
};
