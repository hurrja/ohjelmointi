var canvas;
var kappaletiedostot;
var kappaleidenNimet;
var kappaleita;
var kappaleElementit;

function preload ()
{
    kappaletiedostot = loadStrings ("kappaletiedostot.txt");
    kappaleidenNimet = loadStrings ("kappaleiden-nimet.txt");
}

function setup ()
{
    kappaleita = kappaletiedostot.length;
    kappaleElementit = new Array ();
    canvas = createCanvas (windowWidth, windowHeight);
    colorMode (HSB, 100);
    noLoop ();
}

function draw ()
{
    removeElements ();
    background (17, 50, 100);
    var x = windowWidth / 5;
    var korkeus = windowHeight / (2 * kappaleita + 1);
    
    for (i = 0; i < kappaleita; i++)
    {
        var elementti = createA (kappaletiedostot [i] + ".html",
                                 kappaleidenNimet [i]);
        elementti.position (x, (2 * i + 1) * korkeus);
        elementti.size (AUTO, korkeus);
        kappaleElementit [i] = elementti;
    }
}

function windowResized ()
{
    resizeCanvas (windowWidth, windowHeight);
}

