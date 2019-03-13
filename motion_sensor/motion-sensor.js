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
            //["Occupied", "Empty", "Low Battery"]
            let ret = [null, null, null];
            msg.payload = JSON.parse(msg.payload);

            if(msg.payload.occupancy === true) {
                ret[0] = msg;
                if(node.motionDelay > 0)
                    clearTimeout(node.delayStatus);
                node.nodeColor = "red";
            } else {
                if(node.motionDelay > 0 ) {
                    node.delayStatus = setTimeout(node.delayMessage, node.motionDelay, RED.util.cloneMessage(msg));
                    node.nodeColor = "yellow";
                } else {
                    ret[1] = msg;
                    node.nodeColor = "blue";
                }
            }

            if(msg.payload.battery < node.lowBatteryLevel) {
                ret[2] = msg;
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
