    class Neuron extends Drawable
    {
        _inputNeurons = [];
        _outputNeurons = [];

        _layerIndex = -1;

        _bias = 0.0;
        _weights = [];
        _activationFunction = null;
        _outputValue = 0.0;

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
            this._outputValue = this._bias;

            for (let i = 0; i < this._inputNeurons.length; i++)
            {
                this._outputValue += this._weights[i] * this._inputNeurons[i]._outputValue;
            }

            this._outputValue = this._activationFunction(this._outputValue);
        }

        draw(canvas, offsetX, offsetY)
        {
            context.beginPath();
            canvas.arc(this._drawableX + offsetX, this._drawableY + offsetY, this._drawableRadius, 2.0 * Math.PI, false);
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
            this._neurons[0] = this.createLayer(0, inputCount);

            for (let i = 0; i < hiddenLayerCount; i++)
            {
                this._neurons[i + 1] = this.createLayer(i + 1, hiddenLayerNeuronCount, Neuron.relu);

                // Loop over previous layer nodes
                for (let j = 0; j < this._neurons[i].length; j++)
                {
                    this.fullyConnect(this._neurons[i][j], this._neurons[i + 1]);
                }
            }

            this._neurons[hiddenLayerCount + 1] = this.createLayer(hiddenLayerCount + 1, outputCount, Neuron.sigmoid);

            for (let i = 0; i < this._neurons[hiddenLayerCount].length; i++)
            {
                this.fullyConnect(this._neurons[hiddenLayerCount][i], this._neurons[hiddenLayerCount + 1]);
            }

            //console.log(this);
        }

        getLayers()
        {
            return this._neurons.length;
        }

        getLayer(layerIndex)
        {
            return this._neurons[layerIndex];
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