class TextProcessor
{
    constructor(stemmer)
    {
        this.language = "English";
        this.stemmer = stemmer;

        this.de_stopwords =  ["aber", "ab", "als", "am", "an", "auch", "auf", "aus", "bei", "beide" , "bin", "bis", "bist", "da", "de", "dadurch", "daher", "darum", "das", "daß", "dass", "dein", "deine", "dem", "den", "der", "des", "dessen", "deshalb",
            "die", "dies", "dieser", "dieses", "dann", "um", "hat", "doch", "dort", "du", "durch", "ein", "eine", "einem", "einen", "einer", "eines", "er", "es", "euer", "eure", "für", "hatte", "hatten", "hattest", "hattet", "hier",
            "hinter", "ich", "ihr", "ihre", "im", "in", "ist", "ja", "jede", "jedem", "jeden", "jeder", "jedes", "jener", "jenes", "jetzt", "kann", "kannst", "können", "könnt", "machen", "mein", "meine", "mit",
            "muß", "mußt", "musst", "müssen", "müßt", "nach", "nachdem", "nein", "nicht", "nun", "oder", "seid", "sein", "seine", "sich", "sie", "sind", "soll", "sollen", "sollst", "sollt", "sonst", "soweit",
            "sowie", "und", "unser", "unsere", "unter", "vom", "von", "vor", "wann", "warum", "was", "weiter", "weitere", "wenn", "wer", "werde", "werden", "werdet", "weshalb", "wie", "wieder", "wieso",
            "wir", "werden", "wird", "wirst", "wurde", "wo", "war", "woher", "wohin", "zu", "zum", "zur", "über", "man", "will"];

        this.de_stopwords = this.de_stopwords.concat(["ab", "aber", "abermaliges", "abermals", "abgerufen", "abgerufene", "abgerufener", "abgerufenes", "abgesehen", "acht", "aehnlich", "aehnliche", "aehnlichem", "aehnlichen",
            "aehnlicher", "aehnliches", "aehnlichste", "aehnlichstem", "aehnlichsten", "aehnlichster", "aehnlichstes", "aeusserst", "aeusserste", "aeusserstem", "aeussersten", "aeusserster", "aeusserstes",
            "ähnlich", "ähnliche", "ähnlichem", "ähnlichen", "ähnlicher", "ähnliches", "ähnlichst", "ähnlichste", "ähnlichstem", "ähnlichsten", "ähnlichster", "ähnlichstes", "alle", "allein", "alleine",
            "allem", "allemal", "allen", "allenfalls", "allenthalben", "aller", "allerdings", "allerlei", "alles", "allesamt", "allg", "allg.", "allgemein", "allgemeine", "allgemeinem", "allgemeinen",
            "allgemeiner", "allgemeines", "allgemeinste", "allgemeinstem", "allgemeinsten", "allgemeinster", "allgemeinstes", "allmählich", "allzeit", "allzu", "als", "alsbald", "also", "am", "an", "and",
            "andauernd", "andauernde", "andauerndem", "andauernden", "andauernder", "andauerndes", "ander", "andere", "anderem", "anderen", "anderenfalls", "anderer", "andererseits", "anderes", "anderm",
            "andern", "andernfalls", "anderr", "anders", "anderst", "anderweitig", "anderweitige", "anderweitigem", "anderweitigen", "anderweitiger", "anderweitiges", "anerkannt", "anerkannte",
            "anerkannter", "anerkanntes", "anfangen", "anfing", "angefangen", "angesetze", "angesetzt", "angesetzten", "angesetzter", "ans", "anscheinend", "ansetzen", "ansonst", "ansonsten", "anstatt",
            "anstelle", "arbeiten", "auch", "auf", "aufgehört", "aufgrund", "aufhören", "aufhörte", "aufzusuchen", "augenscheinlich", "augenscheinliche", "augenscheinlichem", "augenscheinlichen",
            "augenscheinlicher", "augenscheinliches", "augenscheinlichst", "augenscheinlichste", "augenscheinlichstem", "augenscheinlichsten", "augenscheinlichster", "augenscheinlichstes", "aus",
            "ausdrücken", "ausdrücklich", "ausdrückliche", "ausdrücklichem", "ausdrücklichen", "ausdrücklicher", "ausdrückliches", "ausdrückt", "ausdrückte", "ausgenommen", "ausgenommene", "ausgenommenem",
            "ausgenommenen", "ausgenommener", "ausgenommenes", "ausgerechnet", "ausgerechnete", "ausgerechnetem", "ausgerechneten", "ausgerechneter", "ausgerechnetes", "ausnahmslos", "ausnahmslose",
            "ausnahmslosem", "ausnahmslosen", "ausnahmsloser", "ausnahmsloses", "außen", "ausser", "ausserdem", "außerhalb", "äusserst", "äusserste", "äusserstem", "äussersten", "äusserster", "äusserstes",
            "author", "autor", "baelde", "bald", "bälde", "bearbeite", "bearbeiten", "bearbeitete", "bearbeiteten", "bedarf", "bedürfen", "bedurfte", "been", "befahl", "befiehlt", "befiehlte", "befohlene",
            "befohlens", "befragen", "befragte", "befragten", "befragter", "begann", "beginnen", "begonnen", "behalten", "behielt", "bei", "beide", "beidem", "beiden", "beider", "beiderlei", "beides",
            "beim", "beinahe", "beisammen", "beispielsweise", "beitragen", "beitrugen", "bekannt", "bekannte", "bekannter", "bekanntlich", "bekanntliche", "bekanntlichem", "bekanntlichen", "bekanntlicher",
            "bekanntliches", "bekennen", "benutzt", "bereits", "berichten", "berichtet", "berichtete", "berichteten", "besonders", "besser", "bessere", "besserem", "besseren", "besserer", "besseres",
            "bestehen", "besteht", "bestenfalls", "bestimmt", "bestimmte", "bestimmtem", "bestimmten", "bestimmter", "bestimmtes", "beträchtlich", "beträchtliche", "beträchtlichem", "beträchtlichen",
            "beträchtlicher", "beträchtliches", "betraechtlich", "betraechtliche", "betraechtlichem", "betraechtlichen", "betraechtlicher", "betraechtliches", "betreffend", "betreffende", "betreffendem",
            "betreffenden", "betreffender", "betreffendes", "bevor", "bez", "bez.", "bezgl", "bezgl.", "bezueglich", "bezüglich", "bietet", "bin", "bis", "bisher", "bisherige", "bisherigem", "bisherigen",
            "bisheriger", "bisheriges", "bislang", "bisschen", "bist", "bitte", "bleiben", "bleibt", "blieb", "bloss", "böden", "boeden", "brachte", "brachten", "brauchen", "braucht", "bräuchte", "bringen",
            "bsp", "bsp.", "bspw", "bspw.", "bzw", "bzw.", "ca", "ca.", "circa", "da", "dabei", "dadurch", "dafuer", "dafür", "dagegen", "daher", "dahin", "dahingehend", "dahingehende", "dahingehendem",
            "dahingehenden", "dahingehender", "dahingehendes", "dahinter", "damalige", "damaligem", "damaligen", "damaliger", "damaliges", "damals", "damit", "danach", "daneben", "dank", "danke", "danken",
            "dann", "dannen", "daran", "darauf", "daraus", "darf", "darfst", "darin", "darüber", "darüberhinaus", "darueber", "darueberhinaus", "darum", "darunter", "das", "daß", "dasselbe", "Dat", "davon",
            "davor", "dazu", "dazwischen", "dein", "deine", "deinem", "deinen", "deiner", "deines", "dem", "demgegenüber", "demgegenueber", "demgemaess", "demgemäss", "demnach", "demselben", "den", "denen",
            "denkbar", "denkbare", "denkbarem", "denkbaren", "denkbarer", "denkbares", "denn", "dennoch", "denselben", "der", "derart", "derartig", "derartige", "derartigem", "derartigen", "derartiger",
            "derem", "deren", "derer", "derjenige", "derjenigen", "derselbe", "derselben", "derzeit", "derzeitig", "derzeitige", "derzeitigem", "derzeitigen", "derzeitiges", "des", "deshalb", "desselben",
            "dessen", "dessenungeachtet", "desto", "desungeachtet", "deswegen", "dich", "die", "diejenige", "diejenigen", "dies", "diese", "dieselbe", "dieselben", "diesem", "diesen", "dieser", "dieses",
            "diesseitig", "diesseitige", "diesseitigem", "diesseitigen", "diesseitiger", "diesseitiges", "diesseits", "dinge", "dir", "direkt", "direkte", "direkten", "direkter", "doch", "doppelt", "dort",
            "dorther", "dorthin", "dran", "drauf", "drei", "dreißig", "drin", "dritte", "drüber", "drueber", "drum", "drunter", "du", "duerfte", "duerften", "duerftest", "duerftet", "dunklen", "durch",
            "durchaus", "durchweg", "durchwegs", "dürfen", "durfte", "dürfte", "durften", "dürften", "durftest", "dürftest", "durftet", "dürftet", "eben", "ebenfalls", "ebenso", "ect", "ect.", "ehe",
            "eher", "eheste", "ehestem", "ehesten", "ehester", "ehestes", "eigen", "eigene", "eigenem", "eigenen", "eigener", "eigenes", "eigenst", "eigentlich", "eigentliche", "eigentlichem",
            "eigentlichen", "eigentlicher", "eigentliches", "ein", "einbaün", "eine", "einem", "einen", "einer", "einerlei", "einerseits", "eines", "einfach", "einführen", "einführte", "einführten",
            "eingesetzt", "einig", "einige", "einigem", "einigen", "einiger", "einigermaßen", "einiges", "einmal", "einmalig", "einmalige", "einmaligem", "einmaligen", "einmaliger", "einmaliges",
            "eins", "einseitig", "einseitige", "einseitigen", "einseitiger", "einst", "einstmals", "einzig", "empfunden", "ende", "entgegen", "entlang", "entsprechend", "entsprechende", "entsprechendem",
            "entsprechenden", "entsprechender", "entsprechendes", "entweder", "er", "ergänze", "ergänzen", "ergänzte", "ergänzten", "ergo", "erhält", "erhalten", "erhielt", "erhielten", "erneut",
            "eröffne", "eröffnen", "eröffnet", "eröffnete", "eröffnetes", "erscheinen", "erst", "erste", "erstem", "ersten", "erster", "erstere", "ersterem", "ersteren", "ersterer", "ersteres",
            "erstes", "es", "etc", "etc.", "etliche", "etlichem", "etlichen", "etlicher", "etliches", "etwa", "etwaige", "etwas", "euch", "euer", "eure", "eurem", "euren", "eurer", "eures",
            "euretwegen", "fall", "falls", "fand", "fast", "ferner", "fertig", "finde", "finden", "findest", "findet", "folgend", "folgende", "folgendem", "folgenden", "folgender", "folgendermassen",
            "folgendes", "folglich", "for", "fordern", "fordert", "forderte", "forderten", "fort", "fortsetzen", "fortsetzt", "fortsetzte", "fortsetzten", "fragte", "frau", "frei", "freie", "freier",
            "freies", "fuer", "fuers", "fünf", "für", "fürs", "gab", "gaenzlich", "gaenzliche", "gaenzlichem", "gaenzlichen", "gaenzlicher", "gaenzliches", "gängig", "gängige", "gängigen", "gängiger",
            "gängiges", "ganz", "ganze", "ganzem", "ganzen", "ganzer", "ganzes", "gänzlich", "gänzliche", "gänzlichem", "gänzlichen", "gänzlicher", "gänzliches", "gar", "gbr", "geb", "geben", "geblieben",
            "gebracht", "gedurft", "geehrt", "geehrte", "geehrten", "geehrter", "gefallen", "gefälligst", "gefällt", "gefiel", "gegeben", "gegen", "gegenüber", "gegenueber", "gehabt", "gehalten", "gehen",
            "geht", "gekommen", "gekonnt", "gemacht", "gemaess", "gemäss", "gemeinhin", "gemocht", "genau", "genommen", "genug", "gepriesener", "gepriesenes", "gerade", "gern", "gesagt", "gesehen",
            "gestern", "gestrige", "getan", "geteilt", "geteilte", "getragen", "getrennt", "gewesen", "gewiss", "gewisse", "gewissem", "gewissen", "gewisser", "gewissermaßen", "gewisses", "gewollt",
            "geworden", "ggf", "ggf.", "gib", "gibt", "gilt", "gleich", "gleiche", "gleichem", "gleichen", "gleicher", "gleiches", "gleichsam", "gleichste", "gleichstem", "gleichsten", "gleichster",
            "gleichstes", "gleichwohl", "gleichzeitig", "gleichzeitige", "gleichzeitigem", "gleichzeitigen", "gleichzeitiger", "gleichzeitiges", "glücklicherweise", "gluecklicherweise", "gmbh",
            "gottseidank", "gratulieren", "gratuliert", "gratulierte", "groesstenteils", "grösstenteils", "gruendlich", "gründlich", "gut", "gute", "guten", "hab", "habe", "haben", "habt", "haette",
            "haeufig", "haeufige", "haeufigem", "haeufigen", "haeufiger", "haeufigere", "haeufigeren", "haeufigerer", "haeufigeres", "halb", "hallo", "halten", "hast", "hat", "hätt", "hatte", "hätte",
            "hatten", "hätten", "hattest", "hattet", "häufig", "häufige", "häufigem", "häufigen", "häufiger", "häufigere", "häufigeren", "häufigerer", "häufigeres", "hen", "her", "heraus", "herein",
            "herum", "heute", "heutige", "heutigem", "heutigen", "heutiger", "heutiges", "hier", "hier", "hierbei", "hiermit", "hiesige", "hiesigem", "hiesigen", "hiesiger", "hiesiges", "hin", "hindurch",
            "hinein", "hingegen", "hinlanglich", "hinlänglich", "hinten", "hintendran", "hinter", "hinterher", "hinterm", "hintern", "hinunter", "hoch", "höchst", "höchstens", "http", "hundert", "ich",
            "igitt", "ihm", "ihn", "ihnen", "ihr", "ihre", "ihrem", "ihren", "ihrer", "ihres", "ihretwegen", "ihrige", "ihrigen", "ihriges", "im", "immer", "immerhin", "immerwaehrend", "immerwaehrende",
            "immerwaehrendem", "immerwaehrenden", "immerwaehrender", "immerwaehrendes", "immerwährend", "immerwährende", "immerwährendem", "immerwährenden", "immerwährender", "immerwährendes", "immerzu",
            "important", "in", "indem", "indessen", "Inf.", "info", "infolge", "infolgedessen", "information", "innen", "innerhalb", "innerlich", "ins", "insbesondere", "insgeheim", "insgeheime",
            "insgeheimer", "insgesamt", "insgesamte", "insgesamter", "insofern", "inzwischen", "irgend", "irgendein", "irgendeine", "irgendeinem", "irgendeiner", "irgendeines", "irgendetwas",
            "irgendjemand", "irgendjemandem", "irgendwann", "irgendwas", "irgendwelche", "irgendwen", "irgendwenn", "irgendwer", "irgendwie", "irgendwo", "irgendwohin", "ist", "ja", "jaehrig",
            "jaehrige", "jaehrigem", "jaehrigen", "jaehriger", "jaehriges", "jährig", "jährige", "jährigem", "jährigen", "jähriges", "je", "jede", "jedem", "jeden", "jedenfalls", "jeder", "jederlei",
            "jedes", "jedesmal", "jedoch", "jeglichem", "jeglichen", "jeglicher", "jegliches", "jemals", "jemand", "jemandem", "jemanden", "jemandes", "jene", "jenem", "jenen", "jener", "jenes",
            "jenseitig", "jenseitigem", "jenseitiger", "jenseits", "jetzt", "jung", "junge", "jungem", "jungen", "junger", "junges", "kaeumlich", "kam", "kann", "kannst", "kaum", "käumlich", "kein",
            "keine", "keinem", "keinen", "keiner", "keinerlei", "keines", "keineswegs", "klar", "klare", "klaren", "klares", "klein", "kleinen", "kleiner", "kleines", "koennen", "koennt", "koennte",
            "koennten", "koenntest", "koenntet", "komme", "kommen", "kommt", "konkret", "konkrete", "konkreten", "konkreter", "konkretes", "könn", "können", "könnt", "konnte", "könnte", "konnten",
            "könnten", "konntest", "könntest", "konntet", "könntet", "kuenftig", "kuerzlich", "kuerzlichst", "künftig", "kürzlich", "kürzlichst", "laengst", "lag", "lagen", "langsam", "längst",
            "längstens", "lassen", "laut", "lediglich", "leer", "legen", "legte", "legten", "leicht", "leider", "lesen", "letze", "letzte", "letzten", "letztendlich", "letztens", "letztere",
            "letzterem", "letzterer", "letzteres", "letztes", "letztlich", "lichten", "liegt", "liest", "links", "mache", "machen", "machst", "macht", "machte", "machten", "mag", "magst",
            "mal", "man", "manch", "manche", "manchem", "manchen", "mancher", "mancherlei", "mancherorts", "manches", "manchmal", "mann", "margin", "massgebend", "massgebende", "massgebendem",
            "massgebenden", "massgebender", "massgebendes", "massgeblich", "massgebliche", "massgeblichem", "massgeblichen", "massgeblicher", "mehr", "mehrere", "mehrerer", "mehrfach", "mehrmalig",
            "mehrmaligem", "mehrmaliger", "mehrmaliges", "mein", "meine", "meinem", "meinen", "meiner", "meines", "meinetwegen", "meins", "meist", "meiste", "meisten", "meistens", "meistenteils",
            "meta", "mich", "mindestens", "mir", "mit", "miteinander", "mitgleich", "mithin", "mitnichten", "mittels", "mittelst", "mitten", "mittig", "mitunter", "mitwohl", "mochte", "möchte",
            "möchten", "möchtest", "moechte", "moeglich", "moeglichst", "moeglichste", "moeglichstem", "moeglichsten", "moeglichster", "mögen", "möglich", "mögliche", "möglichen", "möglicher",
            "möglicherweise", "möglichst", "möglichste", "möglichstem", "möglichsten", "möglichster", "morgen", "morgige", "muessen", "muesst", "muesste", "muss", "müssen", "musst", "müßt",
            "musste", "müsste", "mussten", "müssten", "nach", "nachdem", "nacher", "nachher", "nachhinein", "nächste", "nacht", "naechste", "naemlich", "nahm", "nämlich", "naturgemaess", "naturgemäss",
            "natürlich", "ncht", "neben", "nebenan", "nehmen", "nein", "neu", "neue", "neuem", "neuen", "neuer", "neuerdings", "neuerlich", "neuerliche", "neuerlichem", "neuerlicher", "neuerliches",
            "neues", "neulich", "neun", "nicht", "nichts", "nichtsdestotrotz", "nichtsdestoweniger", "nie", "niemals", "niemand", "niemandem", "niemanden", "niemandes", "nimm", "nimmer", "nimmt",
            "nirgends", "nirgendwo", "noch", "noetigenfalls", "nötigenfalls", "nun", "nur", "nutzen", "nutzt", "nützt", "nutzung", "ob", "oben", "ober", "oberen", "oberer", "oberhalb", "oberste",
            "obersten", "oberster", "obgleich", "obs", "obschon", "obwohl", "oder", "oefter", "oefters", "off", "offenkundig", "offenkundige", "offenkundigem", "offenkundigen", "offenkundiger",
            "offenkundiges", "offensichtlich", "offensichtliche", "offensichtlichem", "offensichtlichen", "offensichtlicher", "offensichtliches", "oft", "öfter", "öfters", "oftmals", "ohne",
            "ohnedies", "online", "paar", "partout", "per", "persoenlich", "persoenliche", "persoenlichem", "persoenlicher", "persoenliches", "persönlich", "persönliche", "persönlicher", "persönliches",
            "pfui", "ploetzlich", "ploetzliche", "ploetzlichem", "ploetzlicher", "ploetzliches", "plötzlich", "plötzliche", "plötzlichem", "plötzlicher", "plötzliches", "pro", "quasi", "reagiere",
            "reagieren", "reagiert", "reagierte", "recht", "rechts", "regelmäßig", "reichlich", "reichliche", "reichlichem", "reichlichen", "reichlicher", "restlos", "restlose", "restlosem", "restlosen",
            "restloser", "restloses", "richtiggehend", "richtiggehende", "richtiggehendem", "richtiggehenden", "richtiggehender", "richtiggehendes", "rief", "rund", "rundheraus", "rundum", "runter",
            "sage", "sagen", "sagt", "sagte", "sagten", "sagtest", "sagtet", "samt", "sämtliche", "sang", "sangen", "sattsam", "schätzen", "schätzt", "schätzte", "schätzten", "scheinbar", "scheinen",
            "schlechter", "schlicht", "schlichtweg", "schließlich", "schlussendlich", "schnell", "schon", "schreibe", "schreiben", "schreibens", "schreiber", "schwerlich", "schwerliche", "schwerlichem",
            "schwerlichen", "schwerlicher", "schwerliches", "schwierig", "sechs", "sect", "sehe", "sehen", "sehr", "sehrwohl", "seht", "sei", "seid", "seien", "seiest", "seiet", "sein", "seine", "seinem",
            "seinen", "seiner", "seines", "seit", "seitdem", "seite", "seiten", "seither", "selbe", "selben", "selber", "selbst", "selbstredend", "selbstredende", "selbstredendem", "selbstredenden",
            "selbstredender", "selbstredendes", "seltsamerweise", "senke", "senken", "senkt", "senkte", "senkten", "setzen", "setzt", "setzte", "setzten", "sich", "sicher", "sicherlich", "sie", "sieben",
            "siebte", "siehe", "sieht", "sind", "singen", "singt", "so", "sobald", "sodaß", "soeben", "sofern", "sofort", "sog", "sogar", "sogleich", "solange", "solc", "solc hen", "solch", "solche",
            "solchem", "solchen", "solcher", "solches", "soll", "sollen", "sollst", "sollt", "sollte", "sollten", "solltest", "solltet", "somit", "sondern", "sonst", "sonstig", "sonstige", "sonstigem",
            "sonstiger", "sonstwo", "sooft", "soviel", "soweit", "sowie", "sowieso", "sowohl", "später", "spielen", "startet", "startete", "starteten", "statt", "stattdessen", "steht", "steige",
            "steigen", "steigt", "stellenweise", "stellenweisem", "stellenweisen", "stets", "stieg", "stiegen", "such", "suchen", "tages", "tat", "tät", "tatsächlich", "tatsächlichen", "tatsächlicher",
            "tatsächliches", "tatsaechlich", "tatsaechlichen", "tatsaechlicher", "tatsaechliches", "tausend", "teile", "teilen", "teilte", "teilten", "tief", "titel", "toll", "total", "trage", "tragen",
            "trägt", "trotzdem", "trug", "tun", "tust", "tut", "txt", "übel", "über", "überall", "überallhin", "überaus", "überdies", "überhaupt", "überll", "übermorgen", "üblicherweise", "übrig",
            "übrigens", "ueber", "ueberall", "ueberallhin", "ueberaus", "ueberdies", "ueberhaupt", "uebermorgen", "ueblicherweise", "uebrig", "uebrigens", "um", "ums", "umso", "umstaendehalber",
            "umständehalber", "unbedingt", "unbedingte", "unbedingter", "unbedingtes", "und", "unerhoert", "unerhoerte", "unerhoertem", "unerhoerten", "unerhoerter", "unerhoertes", "unerhört",
            "unerhörte", "unerhörtem", "unerhörten", "unerhörter", "unerhörtes", "ungefähr", "ungemein", "ungewoehnlich", "ungewoehnliche", "ungewoehnlichem", "ungewoehnlichen", "ungewoehnlicher",
            "ungewoehnliches", "ungewöhnlich", "ungewöhnliche", "ungewöhnlichem", "ungewöhnlichen", "ungewöhnlicher", "ungewöhnliches", "ungleich", "ungleiche", "ungleichem", "ungleichen", "ungleicher",
            "ungleiches", "unmassgeblich", "unmassgebliche", "unmassgeblichem", "unmassgeblichen", "unmassgeblicher", "unmassgebliches", "unmoeglich", "unmoegliche", "unmoeglichem", "unmoeglichen",
            "unmoeglicher", "unmoegliches", "unmöglich", "unmögliche", "unmöglichen", "unmöglicher", "unnötig", "uns", "unsaeglich", "unsaegliche", "unsaeglichem", "unsaeglichen", "unsaeglicher",
            "unsaegliches", "unsagbar", "unsagbare", "unsagbarem", "unsagbaren", "unsagbarer", "unsagbares", "unsäglich", "unsägliche", "unsäglichem", "unsäglichen", "unsäglicher", "unsägliches",
            "unse", "unsem", "unsen", "unser", "unser", "unsere", "unserem", "unseren", "unserer", "unseres", "unserm", "unses", "unsre", "unsrem", "unsren", "unsrer", "unsres", "unstreitig",
            "unstreitige", "unstreitigem", "unstreitigen", "unstreitiger", "unstreitiges", "unten", "unter", "unterbrach", "unterbrechen", "untere", "unterem", "unteres", "unterhalb",
            "unterste", "unterster", "unterstes", "unwichtig", "unzweifelhaft", "unzweifelhafte", "unzweifelhaftem", "unzweifelhaften", "unzweifelhafter", "unzweifelhaftes", "usw", "usw.",
            "vergangen", "vergangene", "vergangener", "vergangenes", "vermag", "vermögen", "vermutlich", "vermutliche", "vermutlichem", "vermutlichen", "vermutlicher", "vermutliches",
            "veröffentlichen", "veröffentlicher", "veröffentlicht", "veröffentlichte", "veröffentlichten", "veröffentlichtes", "verrate", "verraten", "verriet", "verrieten", "version",
            "versorge", "versorgen", "versorgt", "versorgte", "versorgten", "versorgtes", "viel", "viele", "vielen", "vieler", "vielerlei", "vieles", "vielleicht", "vielmalig", "vielmals",
            "vier", "voellig", "voellige", "voelligem", "voelligen", "voelliger", "voelliges", "voelligst", "vollends", "völlig", "völlige", "völligem", "völligen", "völliger", "völliges",
            "völligst", "vollstaendig", "vollstaendige", "vollstaendigem", "vollstaendigen", "vollstaendiger", "vollstaendiges", "vollständig", "vollständige", "vollständigem", "vollständigen",
            "vollständiger", "vollständiges", "vom", "von", "vor", "voran", "vorbei", "vorgestern", "vorher", "vorherig", "vorherige", "vorherigem", "vorheriger", "vorne", "vorüber", "vorueber",
            "wachen", "waehrend", "waehrenddessen", "waere", "während", "währenddessen", "wann", "war", "wär", "wäre", "waren", "wären", "warst", "wart", "warum", "was", "weder", "weg", "wegen",
            "weil", "weiß", "weit", "weiter", "weitere", "weiterem", "weiteren", "weiterer", "weiteres", "weiterhin", "weitestgehend", "weitestgehende", "weitestgehendem", "weitestgehenden",
            "weitestgehender", "weitestgehendes", "weitgehend", "weitgehende", "weitgehendem", "weitgehenden", "weitgehender", "weitgehendes", "welche", "welchem", "welchen", "welcher", "welches",
            "wem", "wen", "wenig", "wenige", "weniger", "wenigstens", "wenn", "wenngleich", "wer", "werde", "werden", "werdet", "weshalb", "wessen", "weswegen", "wichtig", "wie", "wieder",
            "wiederum", "wieso", "wieviel", "wieviele", "wievieler", "wiewohl", "will", "willst", "wir", "wird", "wirklich", "wirklichem", "wirklicher", "wirkliches", "wirst", "wo", "wobei",
            "wodurch", "wofuer", "wofür", "wogegen", "woher", "wohin", "wohingegen", "wohl", "wohlgemerkt", "wohlweislich", "wolle", "wollen", "wollt", "wollte", "wollten", "wolltest", "wolltet",
            "womit", "womoeglich", "womoegliche", "womoeglichem", "womoeglichen", "womoeglicher", "womoegliches", "womöglich", "womögliche", "womöglichem", "womöglichen", "womöglicher", "womögliches",
            "woran", "woraufhin", "woraus", "worin", "wuerde", "wuerden", "wuerdest", "wuerdet", "wurde", "würde", "wurden", "würden", "wurdest", "würdest", "wurdet", "würdet", "www", "x", "z.B.",
            "zahlreich", "zahlreichem", "zahlreicher", "zB", "zb.", "zehn", "zeitweise", "zeitweisem", "zeitweisen", "zeitweiser", "ziehen", "zieht", "ziemlich", "ziemliche", "ziemlichem", "ziemlichen",
            "ziemlicher", "ziemliches", "zirka", "zog", "zogen", "zu", "zudem", "zuerst", "zufolge", "zugleich", "zuletzt", "zum", "zumal", "zumeist", "zumindest", "zunächst", "zunaechst", "zur",
            "zurück", "zurueck", "zusammen", "zusehends", "zuviel", "zuviele", "zuvieler", "zuweilen", "zwanzig", "zwar", "zwei", "zweifelsfrei", "zweifelsfreie", "zweifelsfreiem", "zweifelsfreien",
            "zweifelsfreier", "zweifelsfreies", "zwischen", "zwölf"]);
        
        this.en_stopwords = ["a", "a's", "able", "about", "above", "according", "accordingly", "across", "actually", "after", "afterwards", "again", "against", "ain't", "all", "allow", "allows",
            "almost", "alone", "along", "already", "also", "although", "always", "am", "among", "amongst", "an", "and", "another", "any", "anybody", "anyhow", "anyone", "anything", "anyway", "anyways",
            "anywhere", "apart", "appear", "appreciate", "appropriate", "are", "aren't", "around", "as", "aside", "ask", "asking", "associated", "at", "available", "away", "awfully", "b", "be", "became",
            "because", "become", "becomes", "becoming", "been", "before", "beforehand", "behind", "being", "believe", "below", "beside", "besides", "best", "better", "between", "beyond", "both", "brief",
            "but", "by", "c", "c'mon", "c's", "came", "can", "can't", "cannot", "cant", "cause", "causes", "certain", "certainly", "changes", "clearly", "co", "com", "come", "comes", "concerning",
            "consequently", "consider", "considering", "contain", "containing", "contains", "corresponding", "could", "couldn't", "course", "currently", "d", "definitely", "described", "despite",
            "did", "didn't", "different", "do", "does", "doesn't", "doing", "don't", "done", "down", "downwards", "during", "e", "each", "edu", "eg", "eight", "either", "else", "elsewhere", "enough",
            "entirely", "especially", "et", "etc", "even", "ever", "every", "everybody", "everyone", "everything", "everywhere", "ex", "exactly", "example", "except", "f", "far", "few", "fifth",
            "first", "five", "followed", "following", "follows", "for", "former", "formerly", "forth", "four", "from", "further", "furthermore", "g", "get", "gets", "getting", "given", "gives", "go",
            "goes", "going", "gone", "got", "gotten", "greetings", "h", "had", "hadn't", "happens", "hardly", "has", "hasn't", "have", "haven't", "having", "he", "he's", "hello", "help", "hence", "her",
            "here", "here's", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "hi", "him", "himself", "his", "hither", "hopefully", "how", "howbeit", "however", "i", "i'd", "i'll", "i'm",
            "i've", "ie", "if", "ignored", "immediate", "in", "inasmuch", "inc", "indeed", "indicate", "indicated", "indicates", "inner", "insofar", "instead", "into", "inward", "is", "isn't", "it",
            "it'd", "it'll", "it's", "its", "itself", "j", "just", "k", "keep", "keeps", "kept", "know", "knows", "known", "l", "last", "lately", "later", "latter", "latterly", "least", "less", "lest",
            "let", "let's", "like", "liked", "likely", "little", "look", "looking", "looks", "ltd", "m", "mainly", "many", "may", "maybe", "me", "mean", "meanwhile", "merely", "might", "more", "moreover",
            "most", "mostly", "much", "must", "my", "myself", "n", "name", "namely", "nd", "near", "nearly", "necessary", "need", "needs", "neither", "never", "nevertheless", "new", "next", "nine", "no",
            "nobody", "non", "none", "noone", "nor", "normally", "not", "nothing", "novel", "now", "nowhere", "o", "obviously", "of", "off", "often", "oh", "ok", "okay", "old", "on", "once", "one", "ones",
            "only", "onto", "or", "other", "others", "otherwise", "ought", "our", "ours", "ourselves", "out", "outside", "over", "overall", "own", "p", "particular", "particularly", "per", "perhaps",
            "placed", "please", "plus", "possible", "presumably", "probably", "provides", "q", "que", "quite", "qv", "r", "rather", "rd", "re", "really", "reasonably", "regarding", "regardless", "regards",
            "relatively", "respectively", "right", "s", "said", "same", "saw", "say", "saying", "says", "second", "secondly", "see", "seeing", "seem", "seemed", "seeming", "seems", "seen", "self",
            "selves", "sensible", "sent", "serious", "seriously", "seven", "several", "shall", "she", "should", "shouldn't", "since", "six", "so", "some", "somebody", "somehow", "someone", "something",
            "sometime", "sometimes", "somewhat", "somewhere", "soon", "sorry", "specified", "specify", "specifying", "still", "sub", "such", "sup", "sure", "t", "t's", "take", "taken", "tell", "tends",
            "th", "than", "thank", "thanks", "thanx", "that", "that's", "thats", "the", "their", "theirs", "them", "themselves", "then", "thence", "there", "there's", "thereafter", "thereby", "therefore",
            "therein", "theres", "thereupon", "these", "they", "they'd", "they'll", "they're", "they've", "think", "third", "this", "thorough", "thoroughly", "those", "though", "three", "through",
            "throughout", "thru", "thus", "to", "together", "too", "took", "toward", "towards", "tried", "tries", "truly", "try", "trying", "twice", "two", "u", "un", "under", "unfortunately", "unless",
            "unlikely", "until", "unto", "up", "upon", "us", "use", "used", "useful", "uses", "using", "usually", "uucp", "v", "value", "various", "very", "via", "viz", "vs", "w", "want", "wants", "was",
            "wasn't", "way", "we", "we'd", "we'll", "we're", "we've", "welcome", "well", "went", "were", "weren't", "what", "what's", "whatever", "when", "whence", "whenever", "where", "where's",
            "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "who's", "whoever", "whole", "whom", "whose", "why", "will", "willing",
            "wish", "with", "within", "without", "won't", "wonder", "would", "would", "wouldn't", "x", "y", "yes", "yet", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself",
            "yourselves", "z", "zero"];

        this.separators = [' ', '\\\(', '\\\)', '\\\.', '\\\,', '\\\"', '\\\:', "\\\[", "\\\]", "\\\;", "\\\|", "\\\@", "\\\?"];

        this.filterSymbols = ["–","-", "_", "'", "↵", "↵↵", "↵↵↵", "[", "]","|", "↑", "→", "↓", "{}",
            "//", "=", "{", "}", "+", "?", "$", ">", "<", "''", "•", "/", "%", "--", "---", "&", "»", "«", "€"];

        //Add common filter symbols
        for(var i = 0; i < 500; i++){this.filterSymbols.push(String.fromCharCode(i));}

    }

    processText(text)
    {
        text = text.replace(/\d+/g, '');

        text = text.replace(/\s/g, " ");

        text = text.toLowerCase();

        var array = text.split(new RegExp(this.separators.join('|'), 'g'));

        array = array.filter(x => x != '');

        array = array.filter(x => this.filterSymbols.every(t => t != x));

        array = array.filter(x => this.de_stopwords.every(t => t != x));

        array = array.filter(x => this.en_stopwords.every(t => t != x));

        var stemArray = [];

        var termMap = {};

        array.forEach(x => {
           this.stemmer.setCurrent(x);
           this.stemmer.stem();
           var stem = this.stemmer.getCurrent();
           stemArray.push(stem);

           if(!termMap.hasOwnProperty(stem))
               termMap[stem] = x;
        });

        return {stemArray: stemArray, stemTermMap: termMap};

        //return array;
    }

    static findSentencesWithKeywords(text, keyword)
    {
        var stemmer = Snowball('English');

        var regex = /[^\.!\?]+[\.!\?]+/g;

        var sentences = [];

        var result = text.match(regex);

        if(result != undefined)
        {
            result.forEach( (sentence) => {

                var processed = sentence.replace(/[\.!\?\)\(:,"\n]+/g,'');
                processed = processed.toLowerCase();

                var words = processed.split(" ");
                //TODO: This does not work in any case. i.e. when there are multiple different words in one sentence with the same stem (should not occur frequently though)
                var originalWord = "";

                if(words.some(w =>
                    {
                        stemmer.setCurrent(w);
                        stemmer.stem();

                        var stem = stemmer.getCurrent();
                        originalWord = w;
                        return stem == keyword.toLowerCase();

                    }))
                    sentences.push({sentence: sentence, word: originalWord});
            });
        }
        
        return sentences;
    }

}

if (typeof module !== 'undefined' && module.exports)
    module.exports = TextProcessor;