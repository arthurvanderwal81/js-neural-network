    class ActivationFunction
    {
        calculate(x)
        {
            return x;
        }

        derivative(x)
        {
            let result = [];

            for (let i = 0; i < x.length; i++)
            {
                result.push(1.0);
            }

            return result;
        }
    }

    class SigmoidActivationFunction extends ActivationFunction
    {
        calculate(x)
        {
            return x.map(e => 1.0 / (1.0 + Math.exp(-x)));
        }

        derivative(x)
        {
            return x.map(e => {
                let sigmoid = this.calculate(x);

                return sigmoid * (1 - sigmoid);
            });
        }
    }

    class ReluActivationFunction extends ActivationFunction
    {
        calculate(x)
        {
            let result = [];

            for (let i = 0; i < x.length; i++)
            {
                result.push(Math.max(x[i], 0.0));
            }

            return result;
        }

        derivative(x)
        {
            let result = [];

            for (let i = 0; i < x.length; i++)
            {
                result.push(x[i] >= 0.0 ? 1.0 : 0.0);
            }

            return result;
        }
    }

    class SoftMaxActivationFunction extends ActivationFunction
    {
        calculate(x)
        {
            let shift = Math.max.apply(null, x);
            let result = x.map((e) => Math.exp(e - shift));

            let expSum = result.reduce((acc, cur) => acc + cur);
            let oneOverExpSum = 1.0 / expSum;

            result = result.map((e) => e * oneOverExpSum);

            let resultSum = 0.0;

            for (let i = 0; i < result.length; i++)
            {
                resultSum += result[i];
            }

            console.log(resultSum);

            return result;
        }

        derivative(x)
        {

        }
    }

    class Neuron extends Drawable
    {
        _id = parseInt(Math.random() * 100000000);

        _inputNeurons = [];
        _outputNeurons = [];

        _layerIndex = -1;

        _bias = 0.0;
        _weights = [];
        _activationFunction = null;
        _outputValue = 0.0;

        _errorSignal = 0.0;

        constructor(layerIndex, activationFunction)
        {
            super();

            this._layerIndex = layerIndex;
            this._activationFunction = activationFunction;

            this._drawableRadius = 10;
        }

        static sigmoid(t)
        {
            return 1.0 / (1.0 + Math.exp(-t));
        }

        static relu(x)
        {
            if (x >= 0.0)
            {
                return x;
            }

            return 0.0;
        }

        calculateOutput()
        {
            this._outputValue = 0.0;

            for (let i = 0; i < this._inputNeurons.length; i++)
            {
                this._outputValue += this._weights[i] * this._inputNeurons[i]._outputValue;
            }

            this._outputValue = this._activationFunction.calculate([this._outputValue]);
        }

        draw(canvas, offsetX, offsetY)
        {
            context.beginPath();
            context.arc(this._drawableX + offsetX, this._drawableY + offsetY, this._drawableRadius, 2.0 * Math.PI, false);

            //context.lineWidth = 5;
            //context.strokeStyle = '#003300';
            context.stroke();

            for (let i = 0; i < this._outputNeurons.length; i++)
            {
                context.beginPath();
                context.moveTo(this._drawableX + this._drawableRadius + offsetX, this._drawableY + offsetY);
                context.lineTo(this._outputNeurons[i]._drawableX - this._outputNeurons[i]._drawableRadius + offsetX, this._outputNeurons[i]._drawableY + offsetY);
                context.stroke();
            }
        }
    }

    // Use https://machinelearningmastery.com/implement-backpropagation-algorithm-scratch-python/
    class NeuralNetwork extends Drawable
    {
        _neurons = [];

        static _learningRate = 0.01;

        static MeanSquaredError(output, desiredOutput)
        {
            return (output - desiredOutput) ** 2;
        }

        createLayer(layerIndex, neuronCount, activationFunction)
        {
            let result = [];

            for (let i = 0; i < neuronCount; i++)
            {
                let neuron = new Neuron(layerIndex, activationFunction);
                neuron._drawableX = layerIndex * 150;
                neuron._drawableY = i * 50;

                result.push(neuron);
            }

            return result;
        }

        fullyConnect(neuron, layer)
        {
            for (let i = 0; i < layer.length; i++)
            {
                neuron._outputNeurons.push(layer[i]);

                layer[i]._inputNeurons.push(neuron);
                layer[i]._weights.push(Math.random() * 2.0 - 1.0);
            }
        }

        constructor(inputCount, outputCount, hiddenLayerNeuronCount, hiddenLayerCount)
        {
            super();

            this._neurons = [];
            this._neurons[0] = this.createLayer(0, inputCount, null);

            for (let i = 0; i < hiddenLayerCount; i++)
            {
                this._neurons[i + 1] = this.createLayer(i + 1, hiddenLayerNeuronCount, new ReluActivationFunction() /*Neuron.relu*/);

                // Loop over previous layer nodes
                for (let j = 0; j < this._neurons[i].length; j++)
                {
                    this.fullyConnect(this._neurons[i][j], this._neurons[i + 1]);
                }
            }

            this._neurons[hiddenLayerCount + 1] = this.createLayer(hiddenLayerCount + 1, outputCount, new SigmoidActivationFunction()/*Neuron.sigmoid*/);

            for (let i = 0; i < this._neurons[hiddenLayerCount].length; i++)
            {
                this.fullyConnect(this._neurons[hiddenLayerCount][i], this._neurons[hiddenLayerCount + 1]);
            }

            //console.log(this);
        }

        static random(lowerRange, upperRange)
        {
            let range = upperRange - lowerRange;

            return Math.random() * range + lowerRange;
        }

        randomizeWeights(lowerRange, upperRange)
        {
            for (let i = 0; i < this._neurons.length; i++)
            {
                for (let j = 0; j < this._neurons[i].length; j++)
                {
                    for (let k = 0; k < this._neurons[i][j]._weights.length; k++)
                    {
                        this._neurons[i][j]._weights[k] = NeuralNetwork.random(lowerRange, upperRange);
                    }
                }
            }
        }

        getLayers()
        {
            return this._neurons.length;
        }

        getLayer(layerIndex)
        {
            return this._neurons[layerIndex];
        }

        getOutputLayerIndex()
        {
            return this._neurons.length - 1;
        }

        getErrorSignals()
        {
            let result = [];

            // input layer doesn't have weights
            for (let layer = 1; layer < this._neurons.length; layer++)
            {
                let layerErrorSignals = [];

                for (let neuronIndex = 0; neuronIndex < this._neurons[layer].length; neuronIndex++)
                {
                    layerErrorSignals.push(this._neurons[layer][neuronIndex]._errorSignal);
                }

                result.push(layerErrorSignals);
            }

            return result;
        }

        getWeights()
        {
            let result = [];

            // input layer doesn't have weights
            for (let layer = 1; layer < this._neurons.length; layer++)
            {
                let layerWeights = [];

                for (let neuronIndex = 0; neuronIndex < this._neurons[layer].length; neuronIndex++)
                {
                    layerWeights.push(this._neurons[layer][neuronIndex]._weights);
                }

                result.push(layerWeights);
            }

            return result;
        }

        importWeights(weights)
        {
            // input layer doesn't have weights
            for (let layer = 1; layer < this._neurons.length; layer++)
            {
                for (let neuronIndex = 0; neuronIndex < this._neurons[layer].length; neuronIndex++)
                {
                    this._neurons[layer][neuronIndex]._weights = weights[layer - 1][neuronIndex];
                }
            }
        }

        feedforward(inputs)
        {
            for (let i = 0; i < inputs.length; i++)
            {
                this._neurons[0][i]._outputValue = inputs[i];
            }

            for (let i = 1; i < this._neurons.length; i++)
            {
                for (let j = 0; j < this._neurons[i].length; j++)
                {
                    this._neurons[i][j].calculateOutput();
                }
            }

            let result = [];

            for (let i = 0; i < this._neurons[this._neurons.length - 1].length; i++)
            {
                result.push(this._neurons[this._neurons.length - 1][i]._outputValue);
            }

            return result;
        }

        resetErrorSignal()
        {
            for (let layer = 0; layer < this._neurons.length; layer++)
            {
                for (let neuronIndex = 0; neuronIndex < this._neurons[layer].length; neuronIndex++)
                {
                    this._neurons[layer][neuronIndex]._errorSignal = 0.0;
                }
            }
        }

        // both arguments are arrays with length == outputlayer.length
        backpropagate(output, desiredOutput)
        {
            this.resetErrorSignal();

            // Calculate error signal for output layer

            for (let neuronIndex = 0; neuronIndex < this._neurons[this.getOutputLayerIndex()].length; neuronIndex++)
            {
                let neuron = this._neurons[this.getOutputLayerIndex()][neuronIndex];

                neuron._errorSignal = (desiredOutput[neuronIndex] - output[neuronIndex]) * neuron._activationFunction.derivative([neuron._outputValue]);
                //NeuralNetwork.MeanSquaredError(output[neuronIndex], desiredOutput[neuronIndex]);

                //console.log(neuron._errorSignal);
            }

            // Back propagate error signal into hidden layers

            for (let layer = this._neurons.length - 2; layer > 0; layer--)
            {
                //debugger;
                for (let neuronIndex = 0; neuronIndex < this._neurons[layer].length; neuronIndex++)
                {
                    for (let outputNeuronIndex = 0; outputNeuronIndex < this._neurons[layer][neuronIndex]._outputNeurons.length; outputNeuronIndex++)
                    {
                        let neuron = this._neurons[layer][neuronIndex];
                        let outputNeuron = neuron._outputNeurons[outputNeuronIndex];

                        //console.log(outputNeuron._errorSignal);
                        //console.log(outputNeuron._weights[neuronIndex]);
                        //console.log(neuron._activationFunction);

                        neuron._errorSignal += outputNeuron._errorSignal * outputNeuron._weights[neuronIndex] * neuron._activationFunction.derivative([neuron._outputValue]);
                    }
                    /*
                    for (let weightIndex = 0; weightIndex < this._neurons[layer][neuronIndex]._weights.length; weightIndex++)
                    {
                        this._neurons[layer][neuronIndex]._weights[weightIndex] -= NeuralNetwork._learningRate * MSEForLayer;
                    }
                    */
                }
            }

            console.log("ERRORS");
            console.log(this.getErrorSignals());
            debugger;

            // Update weights

            // weight = weight + learning_rate * error * input

            for (let layer = 1; layer < this._neurons.length; layer++)
            {
                for (let neuronIndex = 0; neuronIndex < this._neurons[layer].length; neuronIndex++)
                {
                    for (let weightIndex = 0; weightIndex < this._neurons[layer][neuronIndex]._weights.length; weightIndex++)
                    {
                        let neuron = this._neurons[layer][neuronIndex];

                        neuron._weights[weightIndex] += NeuralNetwork._learningRate * neuron._errorSignal * neuron._inputNeurons[weightIndex]._outputValue;
                    }
                }
            }

            //console.log("WEIGHTS");
            //console.log(this.getWeights());
        }

        draw(canvas, offsetX, offsetY)
        {
            for (let i = 0; i < this._neurons.length; i++)
            {
                for (let j = 0; j < this._neurons[i].length; j++)
                {
                    this._neurons[i][j].draw(canvas, offsetX, offsetY);
                }
            }
        }
    }