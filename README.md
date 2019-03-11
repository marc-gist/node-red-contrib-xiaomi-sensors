# Xiaomi/Aqara MQTT Sensor Nodes

## Installing:
Directly from Github, goto your `node_modules` directory.  
In **Docker** you should goto `/data/node_modules` THEN **run**
 
> npm install marc-gist/node-red-contrib-xiaomi-sensors 

## Requirements:

1. [Zigbee2MQTT](https://www.zigbee2mqtt.io/) (**aka z2m**) and everything you need to get that runnings :)
2. MQTT broker, which would be part of setting up Z2M

## General Notes:

**z2m** will send payloads in JSON format to the MQTT broker.

In Node-Red, you create a MQTT node to capture those payloads and feed them into one of the custom nodes.

The goal here is to simplify nodes. I was finding that I had numerous **'function'** nodes to deal with the MQTT data

**Subflows** didn't work well because you lose the ability to have status and debug messages 
(looking like Node-Red is changing that in v20, but that isn't out yet so)


