/**
 * Copyright 2018 Dean Cording
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {

    var regression = require('regression');
    var util = require('util');

    var setNodeProperty = function(field, type, node, msg, value) {
        if (type === 'msg') {
            RED.util.setMessageProperty(msg,field,value);
        } else if (type === 'flow') {
            node.context().flow.set(field,value);
        } else if (type === 'global') {
            node.context().global.set(field,value);
        }
    };
    
    
    function RegressionNode(config) {
        RED.nodes.createNode(this,config);

        var node = this;

        node.dataSetSize = ((config.dataSetSize != undefined) ? config.dataSetSize : 0) * 1;
        node.regressionType = config.regressionType || "linear";
        node.options = {};
        node.options.order = Math.round((config.polynomialOrder || 2) * 1);
        node.options.precision = Math.round((config.precision || 2) * 1);
        node.xInputField = config.xInputField || "payload.x";
        node.xInputFieldType = config.xInputFieldType || "msg";
        node.yInputField = config.yInputField || "payload.y";
        node.yInputFieldType = config.yInputFieldType || "msg";
        node.yOutputField = config.yOutputField || "payload.y";
        node.yOutputFieldType = config.yOutputFieldType || "msg";
        node.functionOutputField = config.functionOutputField;
        node.functionOutputFieldType = config.functionOutputFieldType || "none";
        node.resultOnly = (config.resultOnly != undefined) ? config.resultOnly : true;

        node.data= [];
        node.function = undefined;

        if (node.dataSetSize < 0) node.dataSetSize = 0;
        
        if (node.regressionType != "polynomial") {
            node.options.order = 2;
            config.polynomialOrder = 2;
        }
       
        node.status({});
        
        var saveData = function(x,y) {
            if (x != undefined) {
                if (Array.isArray(x)) {
                    x.forEach(function (element) {
                        if (Array.isArray(element)) {
                            saveData(element[0],element[1]);
                        }
                    });
                } else {
                    x = parseFloat(x);
                    y = parseFloat(y);
                    if (!isNaN(x) && !isNaN(y)) {
                        node.data.push([x,y]);

                        if (node.dataSetSize > 0) {
                            while (node.data.length > node.dataSetSize) {
                                node.data.shift();
                            }
                        }
                    }
                }
            }
        };
  
        this.on('input', function(msg) {
        
            var x = RED.util.evaluateNodeProperty(node.xInputField, node.xInputFieldType, node, msg);
            var y = RED.util.evaluateNodeProperty(node.yInputField, node.yInputFieldType, node, msg);

            if (((x != undefined) && (y != undefined)) || Array.isArray(x)) {
                saveData(x,y);
                node.function = regression[node.regressionType](node.data, node.options);
                
                if (!isNaN(node.function.equation[0])){ 
                    delete node.function.points;
                    node.status({text:node.function.string});
                    setNodeProperty(node.functionOutputField, node.functionOutputFieldType, node, msg, node.function);
                    
                    if (!Array.isArray(x)) {
                        setNodeProperty(node.yOutputField, node.yOutputFieldType, node, msg, 
                                        node.function.predict(x)[1]);
                    }
                }
                if (!node.resultOnly) {
                    node.send(msg);
                }

            } else if (x != undefined) {
                x = parseFloat(x);

                if (!isNaN(x) && (node.function != undefined)) {
                    setNodeProperty(node.yOutputField, node.yOutputFieldType, node, msg, 
                                    node.function.predict(x)[1]);
                    node.send(msg);
                }
            } else {
                // Empty input signal to clear data
                node.data = [];
                node.line = undefined;
            }
        });
    }
    RED.nodes.registerType("regression",RegressionNode);
};
