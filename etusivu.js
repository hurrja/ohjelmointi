var canvas;
var kappaletiedostot;
var kappaleidenNimet;
var kappaleita;
var kappaleElementit;
var kappaleEtaisyydet;
var pSanaAnnettuKappaleP5Taulukko;
var pSanaAnnettuKappaleTaulukko
var avainsanat;

var t; // otettujen aika-askeleiden lukumäärä

function preload ()
{
    kappaletiedostot = loadStrings ("kappaletiedostot.txt");
    kappaleidenNimet = loadStrings ("kappaleiden-nimet.txt");
    pSanaAnnettuKappaleP5Taulukko = loadTable ("p-sana-annettu-kappale.csv",
                                               "csv");
}

function setup ()
{
    kappaleita = kappaletiedostot.length;
    kappaleElementit = new Array ();
    kappaleEtaisyydet = new Array ();
    canvas = createCanvas (windowWidth, windowHeight);
    colorMode (HSB, 100);
    
    // luodaan linkit kappaleisiin
    for (var i = 0; i < kappaleita; i++)
        kappaleElementit [i] = createA (kappaletiedostot [i] + ".html",
                                        kappaleidenNimet [i]);
    asetaElementit ();

    // luetaan avainsanat sekä niiden ehdolliset todennäköisyydet
    var riveja = pSanaAnnettuKappaleP5Taulukko.getRowCount ();
    var sarakkeita = pSanaAnnettuKappaleP5Taulukko.getColumnCount ();
    
    // avainsanat 1. riviltä
    avainsanat = new Array (sarakkeita);
    for (var s = 0; s < sarakkeita; s++)
        avainsanat [s] = pSanaAnnettuKappaleP5Taulukko.getString (0, s);
    
    // muut jäljemmiltä riveiltä (oletetaan, että (riveja-1)==kappaleita
    pSanaAnnettuKappaleTaulukko = new Array (kappaleita);
    for (var r = 1; r < riveja; r++)
    {
        pSanaAnnettuKappaleTaulukko [r - 1] = new Array (sarakkeita);
        for (var s = 0; s < sarakkeita; s++)
            pSanaAnnettuKappaleTaulukko [r - 1][s] = parseFloat (pSanaAnnettuKappaleP5Taulukko.getString (r, s));
    }
    
    frameRate (1);
    t = 0;
    redraw ();
}

function draw ()
{
    background (17, 50, 100);

    // päivitetään etäisyydet kerran sekunnissa; etäisyydet ovat
    // "suhteellisia"; lähimmän etäisyys 1 ja muiden tämän kertalukuja
    if (t % 1 == 0)
    {
        for (var i = 0; i < kappaleita; i++)
        {
            var pos = kappaleElementit [i].position ();
            kappaleEtaisyydet [i] = dist (mouseX, mouseY, pos.x, pos.y);
        }
        
        var minEtaisyys = Math.min.apply (Math, kappaleEtaisyydet);
        if (minEtaisyys == 0)
            minEtaisyys = 1;
        
        for (var i = 0; i < kappaleita; i++)
            kappaleEtaisyydet [i] /= minEtaisyys;
    }
    
    var lahin = 0; // lähimmän kappaleen indeksi
    for (var i = 0; i < kappaleita; i++)
    {
        if (kappaleEtaisyydet [i] < kappaleEtaisyydet [lahin])
            lahin = i;
    }
        
    for (var i = 0; i < avainsanat.length; i++)
    {
        var ehdollinenTn = pSanaAnnettuKappaleTaulukko [lahin][i];
        if (ehdollinenTn > 0)
        {
            textSize (ehdollinenTn * .1 * windowHeight);
            text (avainsanat [i],
                  random (windowWidth),
                  random (windowHeight));
        }
    }

    t++;
}

function asetaElementit ()
{
    var x = windowWidth / 10;
    var korkeus = windowHeight / (2 * kappaleita + 1);
    
    for (i = 0; i < kappaleita; i++)
        kappaleElementit [i].position (x, (2 * i + 1) * korkeus);
}

function windowResized ()
{
    resizeCanvas (windowWidth, windowHeight);
    asetaElementit ();
}

