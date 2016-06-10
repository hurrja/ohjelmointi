var canvas;

function setup()
{
    canvas = createCanvas (windowWidth, windowHeight);
    colorMode (HSB, 100);
    
}

function draw ()
{
    background (17, 100, 100);
}

window.onresize = function ()
{
    canvas.size (windowWidth, windowHeight);
};
