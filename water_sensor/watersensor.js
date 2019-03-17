const path = require('path');
const constants = require(path.join(__dirname, '../lib/constants.js'));

module.exports = function(RED) {
    'use strict';
    const debug = true;
    const moment = require('moment');
    const fmt = constants.DATE_FORMAT;

    RED.nodes.registerType('water-sensor', function (config) {
        RED.nodes.createNode(this, config);
        this.lowBatteryLevel = config.lowBatteryLevel;
        this.motionDelay = config.motionDelay * 1000; // seconds so *1000 for ms timer
        this.nodeIcon = "";
        this.nodeColor = "";
        this.delayStatus = null;

        var node = this;

        node.delayMessage = function(msg) {
            node.status({
                text: moment().format(fmt),
                fill: "blue",
                shape: "dot"
            });
            node.send([null, msg, null]);
        };

        //not this is "global" and saved states
        node.on('input', function (msg) {
            //["Leak", "Low Battery"]
            let ret = [null, null];
            msg.payload = JSON.parse(msg.payload);

            if(msg.payload.water_leak === true) {
                ret[0] = msg;
                node.nodeColor = "red";
            } else {
                node.nodeColor = "green";
            }

            if(msg.payload.battery < node.lowBatteryLevel) {
                ret[1] = msg;
                if(node.nodeColor !== 'red') {
                    node.nodeColor = 'yellow';
                }
            }

            node.status({
                text: moment().format(fmt),
                fill: node.nodeColor,
                shape: "dot"
            });

            node.send(ret);
        });

        node.on('close', function() {
            if(node.motionDelay > 0)
                clearTimeout(node.delayStatus);
            done();
        });
    });
};
