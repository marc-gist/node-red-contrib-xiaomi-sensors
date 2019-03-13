const path = require('path');
const constants = require(path.join(__dirname, '../lib/constants.js'));

module.exports = function(RED) {
    'use strict';

    const debug = true;
    const moment = require('moment');
    let util = require('util');

    RED.nodes.registerType('door-sensor', function (config) {
        RED.nodes.createNode(this, config);
        this.lowBatteryLevel = config.lowBatteryLevel;
        this.openTimeout = config.openTimeout * 1000; //config should have seconds, so *1000 for ms

        let node = this;
        //not this is "global" and saved states

        node.timerSet = null;
        node.doorState = null;

        node.doorTimer = function() {
            if(node.doorState === 'open') {
                // node.warn("door timeout send message");
                clearTimeout(this.timerSet);
                setTimeout(node.doorTimer, node.openTimeout);
                node.send([null, null, null, {payload: true}]);
            } else {
                clearTimeout(this.timerSet);
            }
        };
        node.doorOpen = function() {
            if(node.openTimeout > 0) {
                clearTimeout(node.timerSet);
                node.timerSet = setTimeout(node.doorTimer, node.openTimeout);
                // node.warn("set timeout " + node.openTimeout);
            }
            node.doorState = 'open';
        };
        node.doorClosed = function() {
            if(node.timerSet !== null);
                clearTimeout(node.timerSet);
            // node.warn("Clear Timeout Timer " + node.timerSet);
            node.doorState = 'closed';
        };

        node.on('input', function (msg) {
            //outputLabels: ["Open", "Closed", "Low Battery", "Door Left Open"],
            let ret = [null, null, null, null];


            if(msg.payload.contact === true) {
                // door is closed, second position payload.
                node.doorClosed();
                ret[1] = msg;
            } else {
                // open, start timer
                node.doorOpen();
                ret[0] = msg;
            }
            if(msg.payload.battery < node.lowBatteryLevel) {
                ret[2] = msg;
            }

            // TODO - doorIcon if timer Set.
            msg.payload = JSON.parse(msg.payload);
            const doorIcon = msg.payload.contact ? "⛔ " : "⭕ ";
            node.status({
                text: doorIcon + moment().format(constants.DATE_FORMAT),
                fill: msg.payload.contact ? "green" : "red",
                shape: msg.payload.contact ? "dot" : "ring"
            });

            node.send(ret);
        });

        node.on('close', function(){
            // clearTimeout(); ?
            if(node.timerSet !== null)
                clearTimeout(node.timerSet);
            done();
        });
    });
};
