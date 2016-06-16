var canvas;
var kappaletiedostot;
var kappaleidenNimet;
var kappaleita;
var kappaleElementit;
var kappaleEtaisyydet;
var pSanaAnnettuKappaleP5Taulukko;
var avainsanat;
var avainsanakartat;

// avainsanakartan koordinaatit ja koot lasketaan suurimman kirjainkoon
// monikertoina
function Avainsanateksti (sanaIndeksi, todennakoisyys, suurinTn)
{
    this.sanaIndeksi = sanaIndeksi;
    // kerroin on vähintään 0.1
    this.kirjainkokoKerroin = max (todennakoisyys / suurinTn, .1);
    this.x = 0;
    this.y = 0;
    
    this.asetaPaikka = function (x, y)
    {
        this.x = x;
        this.y = y;
    };
    
    this.piirra = function (ikkunakoko, ikkunaX, ikkunaY, suurinKirjainkoko)
    {
        textSize (suurinKirjainkoko * this.kirjainkokoKerroin);
        textAlign (CENTER, CENTER);
        text (avainsanat [sanaIndeksi],
              ikkunaX + .5 * ikkunakoko + suurinKirjainkoko * this.x,
              ikkunaY + .5 * ikkunakoko + suurinKirjainkoko * this.y + .5);
    };

    // mikä tulisi kirjainkooksi tällä avainsanatekstillä?
    this.kirjainkoko = function (ikkunakoko, maxKirjainkoko)
    {
        textSize (maxKirjainkoko);
        var testiLeveys = textWidth (avainsanat [sanaIndeksi]);
        var ehdotettuKoko = ikkunakoko / testiLeveys * maxKirjainkoko;
        return (min (ehdotettuKoko, maxKirjainkoko));
    }
};

function Avainsanakartta (avainsanat,
                          todennakoisyydet)
{
    // järjestele todennäköisyyksien mukaan
    var jarjLista = [];
    for (var i = 0; i < avainsanat.length; i++)
        jarjLista.push ({"indeksi" : i, "tn" : todennakoisyydet [i]});
    jarjLista.sort (function (a, b)
                    {
                        return ((a.tn < b.tn) ? 1 : ((a.tn == b.tn) ? 0 : -1));
                    });
    
    // paikalliset muuttujat, joihin järjestetyt tallennetaan
    var sanaindeksit = [];
    var tnt = []; // todennäköisyydet
    for (var i = 0; i < jarjLista.length; i++)
    {
        sanaindeksit.push (jarjLista [i].indeksi);
        tnt.push (jarjLista [i].tn);
    }

    // jäsenmuuttuja, jossa avaintekstit suhteellisine kokoineen
    this.avainsanatekstit = [];
    for (var i = 0; i < tnt.length; i++)
        if (tnt [i] > 0)
            this.avainsanatekstit.push (new Avainsanateksti
                                        (sanaindeksit [i],
                                         tnt [i],
                                         tnt [0]));
        
    var kaytettyKorkeus = 0;
    // lasketaan kartan suhteelliset paikat valmiiksi; korkeudet ovat
    // suurimman kirjainkoon monikertoja
    for (var i = 0; i < this.avainsanatekstit.length; i++)
    {
        this.avainsanatekstit [i].asetaPaikka (0, kaytettyKorkeus);
        kaytettyKorkeus += this.avainsanatekstit [i].kirjainkokoKerroin;
    }
    
    this.piirra = function (koko, x, y)
    {
        var suurinKoko = this.avainsanatekstit [0].kirjainkoko (koko, 100);
                
        for (var i = 0; i < this.avainsanatekstit.length; i++)
            this.avainsanatekstit [i].piirra (koko, x, y, suurinKoko);
                                              
    };
    
};

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
    var pSanaAnnettuKappaleTaulukko = new Array (kappaleita);
    for (var r = 1; r < riveja; r++)
    {
        pSanaAnnettuKappaleTaulukko [r - 1] = new Array (sarakkeita);
        for (var s = 0; s < sarakkeita; s++)
            pSanaAnnettuKappaleTaulukko [r - 1][s] = parseFloat (pSanaAnnettuKappaleP5Taulukko.getString (r, s));
    }
    
    avainsanakartat = [];
    for (var i = 0; i < kappaleita; i++)
        avainsanakartat.push (new Avainsanakartta (avainsanat,
                                                   pSanaAnnettuKappaleTaulukko [i]));

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
        
    avainsanakartat [lahin].piirra (windowWidth / 2, windowWidth / 2, 0);

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

