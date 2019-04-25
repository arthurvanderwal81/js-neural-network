    class Player extends Drawable
    {
        _neuralNetwork;
        _boundingBox;
        _position = [100.0, 500.0];
        _size = [25.0, 25.0];

        _id;
        _startTime = -1;
        _level = null;
        _endTime = null;

        _hit = false;

        constructor(id, level)
        {
            super();

            this._id = id;
            this._startTime = new Date().getTime();
            this._level = level;

            this._position[1] = this._level._size[1] * 0.5;

            this._neuralNetwork = new NeuralNetwork(5, 3, 3, 1);
            this._boundingBox = new BoundingBox(this._position, this._size);

            //window.addEventListener("tick", this.tickEventHandler);

            if (true)
            {
                window.addEventListener("keydown", this.handleKeyboardInput.bind(this));
            }
        }

        stepUp()
        {
            this._position[1] -= 10.0;

            if ((this._position[1] - 0.5 * this._size[1]) < 0.0)
            {
                this._position[1] = 0.5 * this._size[1];
            }
        }

        stepDown()
        {
            this._position[1] += 10.0;

            if ((this._position[1] + 0.5 * this._size[1]) > 768)
            {
                this._position[1] = 768 - 0.5 * this._size[1];
            }
        }

        handleKeyboardInput(e)
        {
            //console.log(e.keyCode);//37, 38, 39 40

            switch (e.keyCode)
            {
                case 38: this.stepUp();
                    break;
                case 40: this.stepDown();
                    break;
            }
        }

        getSensorValues()
        {
            let beamYRanges = [
                [this._position[1] - 1.5 * this._size[1], this._position[1] - 0.5 * this._size[1]],
                [this._position[1] - 0.5 * this._size[1], this._position[1] + 0.5 * this._size[1]],
                [this._position[1] + 0.5 * this._size[1], this._position[1] + 1.5 * this._size[1]]
            ];

            let foundBullets = [[], [], []];

            for (let i = 0; i < this._level._bullets.length; i++)
            {
                for (let j = 0; j < beamYRanges.length; j++)
                {
                    if (this._level._bullets[i]._position[1] >= beamYRanges[j][0] && this._level._bullets[i]._position[1] <= beamYRanges[j][1])
                    {
                        foundBullets[j].push(this._level._bullets[i]);
                    }
                }
            }

            let maxDistance = 1024.0;
            let result = [maxDistance, maxDistance, maxDistance];

            for (let i = 0; i < result.length; i++)
            {
                for (let j = 0; j < foundBullets[i].length; j++)
                {
                    let distance = foundBullets[i][j]._position[0] - this._position[0];

                    if (distance < result[i])
                    {
                        result[i] = distance;
                    }
                }
            }

            for (let i = 0; i < result.length; i++)
            {
                result[i] /= maxDistance;
            }

            let maxHeight = 755.0;

            result.push(this._position[1] / maxHeight);
            result.push((maxHeight - this._position[1]) / maxHeight)

            //console.log(result);

            // get all bullets for beams, and use closest distance for sensor value

            // top beam distance with bullet
            // current beam distance with bullet
            // bottom beam distance with bullet
            return result;
        }

        hit()
        {
            if (!this._hit)
            {
                this._hit = true;
                this._endTime = new Date().getTime();

                //console.log(`Player ${this._id} HIT`);
            }
        }

        getScore()
        {
            if (this._endTime != null)
            {
                return parseInt((this._endTime - this._startTime) / 1000);
            }

            return parseInt((new Date().getTime() - this._startTime) / 1000);
        }

        tick()
        {
            if (this._hit)
            {
                return;
            }

            // get bullet with smallest distance and get delta
            let result = this._neuralNetwork.feedforward(this.getSensorValues());

            //console.log(result);
            let max = result[0];
            let maxIndex = 0;

            for (let i = 0; i < result.length; i++)
            {
                if (result[i] > max)
                {
                    max = result[i];
                    maxIndex = i;
                }
            }

            if (maxIndex == 0)
            {
                this.stepUp();
            }
            else if (maxIndex == 2)
            {
                this.stepDown();
            }
            //interpret result
            //console.log(`Player ${this._id} tick : ${this.getScore()}`);
        }

        draw(context, offsetX, offsetY)
        {
            if (this._hit)
            {
                return;
                context.fillStyle = "#f00";
                context.fillRect(this._position[0] - 0.5 * this._size[0], this._position[1] - 0.5 * this._size[1], this._size[0], this._size[1]);
            }

            context.fillStyle = "#000";
            context.fillText(this.getScore(), this._position[0] - 0.25 * this._size[0], this._position[1] + 0.25 * this._size[1]);
            context.rect(this._position[0] - 0.5 * this._size[0], this._position[1] - 0.5 * this._size[1], this._size[0], this._size[1]);
            context.stroke();

            //this._neuralNetwork.draw(context, 200, 200);
        }

        tickEventHandler = this.tick.bind(this);
    }