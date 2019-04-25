    var context = null;
    var canvasElement = null;
    var frame = 0;
    var scene = [];

    function tick()
    {

        let tickEvent = new Event("tick");

        window.dispatchEvent(tickEvent);
    }

    function installTick()
    {
        // Tick at 30 FPS
        setInterval(tick, 1000 / 30);
    }

    window.addEventListener("tick", function() {
        frame = (frame + 1) % 30;

        // Clear canvas
        canvasElement.width = canvasElement.width;
        context.beginPath();

        context.fillText(frame, 0, 10);

        for (let i = 0; i < scene.length; i++)
        {
            scene[i].draw(context, 0, 0);
        }
    });

    window.addEventListener("load", function() {
        canvasElement = document.querySelector("canvas");
        context = canvasElement.getContext("2d");

        //var nn = new NeuralNetwork(4, 2, 10, 1);
        var nn = new NeuralNetwork(4, 2, 0, 0);

        for (let i = 1; i < nn.getLayers(); i++)
        {
            let layer = nn.getLayer(i);

            for (let j = 0; j < layer.length; j++)
            {
                let weights = [];

                for (let k = 0; k < layer[j]._inputNeurons.length; k++)
                {
                    weights.push(Math.random());
                }

                layer[j]._weights = weights;
            }
        }

        //console.log(nn);
        //console.log(nn.feedforward([5, 4, 3, 2]));
        //nn.draw(context, 100, 100);

        installTick();

        //let player = new Player("1");
        //player.draw(context, 0, 0);

        let level = new Level();
        //level.draw(context, 0, 0);



        //scene.push(nn);
        scene.push(level);
    });

