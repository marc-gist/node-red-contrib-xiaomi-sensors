const path = require('path');
const constants = require(path.join(__dirname, '../lib/constants.js'));

module.exports = function(RED) {
    'use strict';
    const debug = true;
    const moment = require('moment');
    const fmt = constants.DATE_FORMAT;

    RED.nodes.registerType('temp-sensor', function (config) {
        RED.nodes.createNode(this, config);
        this.lowBatteryLevel = config.lowBatteryLevel;
        this.rangeAbove = config.rangeAbove;
        this.rangeBelow = config.rangeBelow;
        let node = this;
        //not this is "global" and saved states
        node.on('input', function (msg) {
            let ret = [null, null, null, null];
            let alert = false;

            let newMsg = {
               payload: null,
               topic: msg.topic,
               data: msg.payload
            };

            if (typeof msg.payload === 'object'){
                msg.payload = msg.payload;
            } else {
                msg.payload = JSON.parse(msg.payload);
            }

            ret[0] = Object.assign({}, newMsg);
            ret[0].payload = Number(msg.payload.temperature.toFixed(1));
            ret[1] = Object.assign({}, newMsg);
            ret[1].payload = Number(msg.payload.humidity.toFixed(1));

            if(node.rangeBelow && msg.payload.temperature < node.rangeBelow) {
                alert = true;
                ret[2] = {
                    payload: true,
                    data: msg.payload,
                    alert: 'below'
                }
            }
            if(node.rangeAbove && msg.payload.temperature > node.rangeAbove) {
                alert = true;
                ret[2] = {
                    payload: true,
                    data: msg.payload,
                    alert: 'above'
                }
            }

            node.status({
                text: moment().format(fmt),
                fill: alert ? "red" : "green",
                shape: alert ? "dot" : "ring"
            });

            if(msg.payload.battery < node.lowBatteryLevel) {
                ret[3] = msg;
            }

            //send node output
            node.send(ret);
        });
    });
};
