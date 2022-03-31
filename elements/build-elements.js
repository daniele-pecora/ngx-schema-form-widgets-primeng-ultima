/** angular elements */
let appname = ''
const bakeNumberedScriptsIn = true

const fs = require('fs-extra')
const fileExists = (path) => {
  try {
    if (fs.existsSync(path)) {
      return true
    }
  } catch (err) {
    console.error(err)
  }
  return false
}
const dirExists = (path) => {
  try {
    stats = fs.lstatSync(path)
    return stats.isDirectory()
  } catch (err) {
    console.error(err)
  }
  return false
}

if (!fileExists('angular.json')) {
  throw new Error('Not an Angular project. File angular.json not found')
} else {
  const _a = JSON.parse(fs.readFileSync('angular.json'))
  appname = (_a.defaultProject || Object.keys(_a.projects)[0]) + '-elements'
}

const distdir = `./dist/${appname}`
const targetdir = `${distdir}-publish`

const replaceStringInFile = (filePath, replace, replacement) => {
  let val = fs.readFileSync(filePath) + ''
  val = val.replace(replace, replacement)
  fs.writeFileSync(filePath, val)
}

const readNumberedJSFile = (essuffix = '', directory) => {
  /* 0.js, 1.js etc...*/
  const scripts = []
  const list = fs.readdirSync(directory)
  for (var i = 0; i < list.length; i++) {
    try {
      if (Number.parseInt(list[i].split('.')[0].replace(essuffix, ''))) {
        scripts.push(`${directory}/${list[i]}`)
      }
    } catch (e) { console.error(e) }
  }
  return scripts
}

const fixStrictModeThisPointer = (filePath) => {
  /** fix 'this' pointing not to 'window' when concatenating all scripts and using strict mode ('use strict')  */
  replaceStringInFile(filePath, new RegExp('\\(this, (\\()?function', 'ig'), '(window, $1function')
}

const concat = require('concat')
const buildElement = async (files, essuffix) => {
  await fs.ensureDir(`${targetdir}`)
  await concat(files, `${targetdir}/${appname}${essuffix}.js`)

  fixStrictModeThisPointer(`${targetdir}/${appname}${essuffix}.js`)
}

/**
 * 1. Delete directory elements
 */
fs.removeSync(`${targetdir}`)

/**
 * 2. Create single script application
 */
const variants = ['es5', 'es2015']
for (let i = 0; i < variants.length; i++) {
  const essuffix = variants[i] ? `-${variants[i]}` : ''
  const scriptsFiles = [
    `${distdir}/runtime${essuffix}.js`,
    `${distdir}/polyfills${essuffix}.js`,
    `${distdir}/styles${essuffix}.js`,
    `${distdir}/scripts.js`,
    `${distdir}/vendor${essuffix}.js`,
    `${distdir}/main${essuffix}.js`
  ]
    // optionally: provide the numbered script files from host
    .concat(bakeNumberedScriptsIn ? readNumberedJSFile(variants[i], distdir) : [])

  buildElement(scriptsFiles, `${essuffix}`)
}

/**
 * 3. Copy assets
 */
fs.copySync(`${distdir}/assets`, `${targetdir}/assets`)
// script files 0.js, 1.js etc...
if (!bakeNumberedScriptsIn) {
  for (let i = 0; i < variants.length; i++) {
    const _scripts = readNumberedJSFile(variants[i], distdir)
    for (let j = 0; j < _scripts.length; j++) {
      fs.copyFileSync(_scripts[j], `${targetdir}/` + (_scripts[j].split('/').slice(-1)))
    }
  }
}

/**
 * 4. Print out snippet
 * This is how the webcomponent is included into a page
 */
const isPrimeNGApplication = dirExists(`${targetdir}/assets/theme`)
const primeNGTheme = `
  <!-- Theme -->
  <link id="theme-css" rel="stylesheet" type="text/css" href="assets/theme/theme-vois.css">
  <link id="layout-css" rel="stylesheet" type="text/css" href="assets/layout/css/layout-vois.css">`
for (let i = 0; i < variants.length; i++) {
  const essuffix = variants[i] ? `-${variants[i]}` : ''
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *')
  console.log(`
  <!-- Include this into the index.html page (variant: ${variants[i] ? variants[i] : 'general'}) -->${isPrimeNGApplication ? primeNGTheme : ''}
  <!-- Webcomponent -->
  <script type="text/javascript" src="./${appname}${essuffix}.js"></script>
  <${appname}></${appname}>
`)
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *')
}

/**
 * 5. Create index.html
 * This is an example for integration in portal page
 */
const indexHtml = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml"  lang="de" id="www.taunusstein.de" xml:lang="de" dir="ltr" itemscope itemtype="http://schema.org/WebPage">
  <head>
    <title>Städtische Kita am Schaußberg feierte ihr Sommerfest | Stadt Taunusstein</title>
    <meta name="geo.region" content="DE-HE" />
    <meta name="geo.placename" content="Taunusstein" />
    <meta name="geo.position" content="50.143298;8.160377" />
    <meta name="ICBM" content="50.143298, 8.160377" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0, minimum-scale=1.0, maximum-scale=1.0" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <meta name="format-detection" content="telephone=no" />
    <meta http-equiv="content-type" content="text/html; charset=utf-8" />
    <meta name="author" content="Stadt Taunusstein" />
    <meta name="publisher" content="https://www.taunusstein.de/" />
    <meta name="description" content="Bei strahlendem Sonnenschein feierten die Familien zusammen mit dem pädagogischen Team der Kita am Schaußberg ihr alljährliches Sommerfest." />
    <meta name="keywords" content="" />
    <meta name="twitter:url" content="https://www.taunusstein.de/portal/pressemitteilungen/staedtische-kita-am-schaussberg-feierte-ihr-sommerfest-900000720-29880.html" />
    <meta name="twitter:title" content="Städtische Kita am Schaußberg feierte ihr Sommerfest" />
    <meta name="twitter:twitter:description" content="Bei strahlendem Sonnenschein feierten die Familien zusammen mit dem pädagogischen Team der Kita am Schaußberg ihr alljährliches Sommerfest." />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="https://www.taunusstein.de/portal/pressemitteilungen/staedtische-kita-am-schaussberg-feierte-ihr-sommerfest-900000720-29880.html" />
    <meta property="og:title" content="Städtische Kita am Schaußberg feierte ihr Sommerfest" />
    <meta name="og:description" content="Bei strahlendem Sonnenschein feierten die Familien zusammen mit dem pädagogischen Team der Kita am Schaußberg ihr alljährliches Sommerfest." />
    <meta name="og:site_name" content="Stadt Taunusstein" />
    <meta property="article:published_time" content="2019-09-05 10:43:00" />
    <meta property="article:modified_time" content="2019-09-05 10:49:21" />
    <meta property="article:author" content="Stadt Taunusstein" />
    <meta property="article:publisher" content="https://www.taunusstein.de/" />
    <meta itemprop="name" content="Städtische Kita am Schaußberg feierte ihr Sommerfest" />
    <meta itemprop="description" content="Bei strahlendem Sonnenschein feierten die Familien zusammen mit dem pädagogischen Team der Kita am Schaußberg ihr alljährliches Sommerfest." />
    <meta property="og:image" content="https://www.taunusstein.de/medien/bilder/218_sommerfest_web.jpg?20190905104912" />
    <meta property="og:image:secure_url" content="https://www.taunusstein.de/medien/bilder/218_sommerfest_web.jpg?20190905104912" />
    <meta property="og:image:width" content="2576" />
    <meta property="og:image:height" content="1932" />
    <meta name="twitter:image" content="https://www.taunusstein.de/medien/bilder/218_sommerfest_web.jpg?20190905104912" />
    <meta name="twitter:image:width" content="2576" />
    <meta name="twitter:image:height" content="1932" />
    <meta itemprop="image" content="https://www.taunusstein.de/medien/bilder/218_sommerfest_web.jpg?20190905104912" />
    <link rel="canonical" href="https://www.taunusstein.de/portal/pressemitteilungen/staedtische-kita-am-schaussberg-feierte-ihr-sommerfest-900000720-29880.html"/>
    <link rel="shortcut icon" href="https://www.taunusstein.de/favicon.ico" type="image/x-icon" />
    <link rel="icon" href="https://www.taunusstein.de/favicon.ico" type="image/x-icon" />
    <link rel="alternate" type="application/rss+xml" title="Meldungen von https://www.taunusstein.de/" href="https://www.taunusstein.de/portal/rss.xml" />
    <link rel="stylesheet" href="https://www.taunusstein.de/static/css/basic-18308.css" type="text/css" id="nolis-standard-stylesheet" /><link rel="stylesheet" href="https://www.taunusstein.de/static/static/css/fontawesome-pro-5.8.2-web/css/all.min.css" type="text/css" media="screen, print" /><link rel="stylesheet" href="https://www.taunusstein.de/static/static/css/nolisfont/style.css" type="text/css" media="screen, print" />
    <script type="text/javascript">
      var jurl2domain = "https://www.taunusstein.de/";
      var jurl2cmsbilder = "https://www.taunusstein.de/static/static/bilder/cms/";
      var jurl2cms = "https://cms.taunusstein.de/";
      var jurl2static = "https://www.taunusstein.de/static/static/";
      var jurl2jscript = "https://www.taunusstein.de/static/static/jscript/";
      var jurl2tinymce = "https://www.taunusstein.de/static/static/tinymce/4.1.5/";
      var jurl_tinymce_document_domain = "cms.taunusstein.de";
    </script>
    <script type="text/javascript" src="https://www.taunusstein.de/static/jscript/basic-18308.js"></script>

    <link href="https://www.taunusstein.de/static/static/css/fonts/Open_Sans/font.css" rel="stylesheet">
    <link href="https://www.taunusstein.de/static/css/OverlayScrollbars.min.css" rel="stylesheet">
</head>

<body class="startseite0 internet blau blau-gruen" itemscope itemtype="http://schema.org/WebPage">

  <div id="container">
    <a id="top"></a>

    <!-- <header>  -->
    <div id="head" role="banner">
      <h1>Stadt Taunusstein</h1>

      <div id="linkbox"><a href="https://www.taunusstein.de/portal/startseite.html" id="logolink"></a></div>

      <div id="suche">
        <h2>Volltextsuche</h2>
        <form id="form_schnellfinder" name="form_schnellfinder" action="https://www.taunusstein.de/portal/suche.html" method="get" role="search">
          <fieldset>
            <label for="suchfeld" class="not_in_view">Suchen</label>
            <input type="text" name="suchbegriff" id="suchfeld" placeholder="Finden Sie Dienstleistungen, Infos und mehr..." aria-required="true" required="required" pattern=".{3,}" />
            <input type="submit" value="" id="search_button" />
            <a id="search_close" href="javascript:" onclick="jQuery('body').removeClass('search');">&nbsp;</a>
          </fieldset>
        </form>
        <a id="search_toggle" href="javascript:">&nbsp;</a>
      </div>

      <!-- <nav id="navigation_top">  -->
      <div id="navigation_top" role="navigation">
        <ul id="naviEbene0_0" class="naviEbene0"><li class="hasChilds childActive hasChilds_childActive" data-id="900000005" data-owner="29880" id="rathaus"><a href="https://www.taunusstein.de/rathaus/"><span>Rathaus</span></a><div class="megamenu"></div><div class="wrapper"><div class="top_trenner nr0"><ul><li class="hasChilds active hasChilds_active" data-id="900000012" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/aktuelles/"><span>Aktuelles</span></a><ul id="topnavi_megamenu0_900000012" class="topnavi_megamenu0"><li class="" data-id="900000057" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/aktuelles/archiv/"><span>Archiv</span></a></li><li class="" data-id="900000094" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/aktuelles/newsletter/"><span>Newsletter</span></a></li><li class="" data-id="900000220" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/aktuelles/taunussteiner-stadtnachrichten/"><span>Taunussteiner Stadtnachrichten</span></a></li></ul></li><li class="" data-id="900000016" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/ortsgericht-schiedsamt/"><span>Ortsgericht &amp; Schiedsamt</span></a></li><li class="" data-id="900000019" data-owner="29880"><a href="https://www.stadtwerke-taunusstein.de/" target="_blank"><span>Stadtwerke Taunusstein</span></a></li><li class="hasChilds" data-id="900000023" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/karriere/"><span>Karriere</span></a><ul id="topnavi_megamenu0_900000023" class="topnavi_megamenu0"><li class="" data-id="900000219" data-owner="29880"><a href="https://www.mein-check-in.de/taunusstein/index" target="_blank"><span>Online-Bewerberportal</span></a></li><li class="" data-id="900000218" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/karriere/praktikum-ausbildung/"><span>Praktikum &amp; Ausbildung</span></a></li></ul></li></ul></div><div class="top_trenner nr1"><ul><li class="hasChilds" data-id="900000013" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/was-erledige-ich-wo-/"><span>Was erledige ich wo?</span></a><ul id="topnavi_megamenu0_900000013" class="topnavi_megamenu0"><li class="" data-id="900000114" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/was-erledige-ich-wo-/organisationsstruktur/"><span>Organisationsstruktur</span></a></li><li class="" data-id="900000104" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/was-erledige-ich-wo-/buergerbuero/"><span>Bürgerbüro</span></a></li><li class="" data-id="900000074" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/was-erledige-ich-wo-/mobiles-buergerbuero/"><span>Mobiles Bürgerbüro</span></a></li><li class="" data-id="900000075" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/was-erledige-ich-wo-/rentenberatung/"><span>Rentenberatung</span></a></li><li class="" data-id="900000082" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/was-erledige-ich-wo-/standesamt-aartal/"><span>Standesamt Aartal</span></a></li></ul></li><li class="" data-id="900000017" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/notruf-servicenummern/"><span>Notruf- &amp; Servicenummern</span></a></li><li class="" data-id="900000020" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/im-gespraech/"><span>Im Gespräch</span></a></li><li class="" data-id="900000024" data-owner="29880"><a href="https://maengelmelder.taunusstein.de/" target="_blank"><span>Mängelmelder</span></a></li></ul></div><div class="top_trenner nr2"><ul><li class="hasChilds" data-id="900000014" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/verwaltung/"><span>Verwaltung</span></a><ul id="topnavi_megamenu0_900000014" class="topnavi_megamenu0"><li class="" data-id="900000058" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/verwaltung/buergermeister/"><span>Bürgermeister</span></a></li><li class="" data-id="900000060" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/verwaltung/haushalt-finanzen/"><span>Haushalt &amp; Finanzen</span></a></li><li class="" data-id="900000059" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/verwaltung/bankverbindungen/"><span>Bankverbindungen</span></a></li><li class="" data-id="900000063" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/verwaltung/oeffentliche-bekanntmachungen/"><span>Öffentliche Bekanntmachungen</span></a></li><li class="" data-id="900000064" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/verwaltung/satzungen-gebuehren/"><span>Satzungen &amp; Gebühren</span></a></li><li class="" data-id="900000067" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/verwaltung/zentr-vergabeberatungsstelle/"><span>Zentr. Vergabeberatungsstelle</span></a></li></ul></li><li class="" data-id="900000093" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/so-informieren-wir/"><span>So informieren wir</span></a></li><li class="" data-id="900000021" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/wahlen/"><span>Wahlen</span></a></li><li class="" data-id="900000026" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/stadtplan/"><span>Stadtplan</span></a></li></ul></div><div class="top_trenner nr3"><ul><li class="" data-id="900000015" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/feuerwehr/"><span>Feuerwehr</span></a></li><li class="" data-id="900000018" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/formulare/"><span>Formulare</span></a></li><li class="hasChilds" data-id="900000022" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/kommunalpolitik/"><span>Kommunalpolitik</span></a><ul id="topnavi_megamenu0_900000022" class="topnavi_megamenu0"><li class="" data-id="900000095" data-owner="29880"><a href="https://www.taunusstein.de/allris/si010_e.asp" target="_top"><span>Sitzungskalender</span></a></li><li class="" data-id="900000096" data-owner="29880"><a href="https://www.taunusstein.de/allris/pa021.asp" target="_top"><span>Stadtverordneten­versammlung</span></a></li><li class="" data-id="900000097" data-owner="29880"><a href="https://www.taunusstein.de/allris/au020.asp?AULFDNR=18" target="_top"><span>Magistrat</span></a></li><li class="" data-id="900000098" data-owner="29880"><a href="https://www.taunusstein.de/allris/au010.asp?T1=Aussch%FCsse&amp;AU=Ausschuss&amp;SORTVON=1&amp;SORTBIS=5&amp;SELECT=1" target="_top"><span>Ausschüsse</span></a></li><li class="" data-id="900000099" data-owner="29880"><a href="https://www.taunusstein.de/allris/au010.asp?T1=Ortsbeirat&amp;AU=Ortsbeirat&amp;SORTVON=30&amp;SORTBIS=30&amp;SELECT=1" target="_top"><span>Ortsbeiräte</span></a></li><li class="" data-id="900000100" data-owner="29880"><a href="https://www.taunusstein.de/allris/au020.asp?AULFDNR=17&amp;altoption=Sonstige%20Gremien" target="_top"><span>Seniorenbeirat</span></a></li><li class="" data-id="900000101" data-owner="29880"><a href="https://www.taunusstein.de/allris/au020.asp?AULFDNR=7&amp;altoption=Sonstige%20Gremien" target="_top"><span>Jugendparlament</span></a></li><li class="" data-id="900000102" data-owner="29880"><a href="https://www.taunusstein.de/allris/fr010.asp?SELECT=1" target="_top"><span>Gewählte Gruppen</span></a></li></ul></li></ul></div><div class="clearfloat"></div></div></li><li class="hasChilds" data-id="900000009" data-owner="29880" id="leben"><a href="https://www.taunusstein.de/leben/"><span>Leben</span></a><div class="megamenu"></div><div class="wrapper"><div class="top_trenner nr0"><ul><li class="hasChilds" data-id="900000027" data-owner="29880"><a href="https://www.taunusstein.de/leben/wohnen/"><span>Wohnen</span></a><ul id="topnavi_megamenu0_900000027" class="topnavi_megamenu0"><li class="" data-id="900000062" data-owner="29880"><a href="https://www.taunusstein.de/leben/wohnen/muell-abfallwirtschaft/"><span>Müll &amp; Abfallwirtschaft</span></a></li><li class="" data-id="900000083" data-owner="29880"><a href="https://www.taunusstein.de/leben/wohnen/oepnv/"><span>ÖPNV</span></a></li><li class="" data-id="900000061" data-owner="29880"><a href="https://www.taunusstein.de/leben/wohnen/mietspiegel/"><span>Mietspiegel</span></a></li><li class="" data-id="900000077" data-owner="29880"><a href="https://www.taunusstein.de/leben/wohnen/energie/"><span>Energie</span></a></li><li class="" data-id="900000076" data-owner="29880"><a href="https://www.taunusstein.de/leben/wohnen/internet-ausbau/"><span>Internet-Ausbau</span></a></li><li class="" data-id="900000066" data-owner="29880"><a href="https://www.taunusstein.de/leben/wohnen/winterdienst/"><span>Winterdienst</span></a></li></ul></li><li class="" data-id="900000031" data-owner="29880"><a href="https://www.taunusstein.de/leben/jugend/"><span>Jugend</span></a></li><li class="" data-id="900000035" data-owner="29880"><a href="https://www.taunusstein.de/leben/menschen-mit-behinderungen/"><span>Menschen mit Behinderungen</span></a></li><li class="" data-id="900000038" data-owner="29880"><a href="https://www.taunusstein.de/leben/schulen/"><span>Schulen</span></a></li></ul></div><div class="top_trenner nr1"><ul><li class="hasChilds" data-id="900000028" data-owner="29880"><a href="https://www.taunusstein.de/leben/stadtentwicklung-bauen/"><span>Stadtentwicklung &amp; Bauen</span></a><ul id="topnavi_megamenu0_900000028" class="topnavi_megamenu0"><li class="" data-id="900000167" data-owner="29880"><a href="https://www.taunusstein.de/leben/stadtentwicklung-bauen/stadtplanung/"><span>Stadtplanung</span></a></li><li class="" data-id="900000168" data-owner="29880"><a href="https://www.taunusstein.de/leben/stadtentwicklung-bauen/bauberatung/"><span>Bauberatung</span></a></li><li class="" data-id="900000169" data-owner="29880"><a href="https://www.taunusstein.de/leben/stadtentwicklung-bauen/grundstuecke-immobilien/"><span>Grundstücke &amp; Immobilien</span></a></li><li class="" data-id="900000204" data-owner="29880"><a href="http://straßen-in-taunusstein.de/" target="_blank"><span>Straßenbeiträge</span></a></li><li class="" data-id="900000207" data-owner="29880"><a href="https://www.taunusstein.de/leben/stadtentwicklung-bauen/aartal-konzept/"><span>Aartal-Konzept</span></a></li></ul></li><li class="hasChilds" data-id="900000032" data-owner="29880"><a href="https://www.taunusstein.de/leben/senioren/"><span>Senioren</span></a><ul id="topnavi_megamenu0_900000032" class="topnavi_megamenu0"><li class="" data-id="900000085" data-owner="29880"><a href="https://www.taunusstein.de/leben/senioren/leitstelle-aelterwerden/"><span>Leitstelle Älterwerden</span></a></li><li class="" data-id="900000211" data-owner="29880"><a href="https://www.taunusstein.de/leben/senioren/demenzarbeit/"><span>Demenzarbeit</span></a></li></ul></li><li class="hasChilds" data-id="900000036" data-owner="29880"><a href="https://www.taunusstein.de/leben/freiwilliges-engagement/"><span>Freiwilliges Engagement</span></a><ul id="topnavi_megamenu0_900000036" class="topnavi_megamenu0"><li class="" data-id="900000170" data-owner="29880"><a href="https://www.taunusstein.de/leben/freiwilliges-engagement/engagement-lotsen/"><span>Engagement-Lotsen</span></a></li><li class="" data-id="900000180" data-owner="29880"><a href="https://www.taunusstein.de/leben/freiwilliges-engagement/gruenpflegepatenschaften/"><span>Grünpflegepatenschaften</span></a></li></ul></li><li class="" data-id="900000039" data-owner="29880"><a href="https://www.taunusstein.de/leben/stadt-schulbuecherei/"><span>Stadt- &amp; Schulbücherei</span></a></li></ul></div><div class="top_trenner nr2"><ul><li class="hasChilds" data-id="900000029" data-owner="29880"><a href="https://www.taunusstein.de/leben/stadtportrait/"><span>Stadtportrait</span></a><ul id="topnavi_megamenu0_900000029" class="topnavi_megamenu0"><li class="" data-id="900000081" data-owner="29880"><a href="https://www.taunusstein.de/leben/stadtportrait/staedtepartnerschaften/"><span>Städtepartnerschaften</span></a></li><li class="" data-id="900000084" data-owner="29880"><a href="https://www.taunusstein.de/leben/stadtportrait/statistik/"><span>Statistik</span></a></li><li class="" data-id="900000086" data-owner="29880"><a href="https://www.taunusstein.de/leben/stadtportrait/stadtwald/"><span>Stadtwald</span></a></li></ul></li><li class="" data-id="900000033" data-owner="29880"><a href="https://www.taunusstein.de/leben/frauen/"><span>Frauen</span></a></li><li class="" data-id="900000166" data-owner="29880"><a href="https://www.taunusstein.de/leben/stiftungen/"><span>Stiftungen</span></a></li><li class="" data-id="900000092" data-owner="29880"><a href="https://www.taunusstein.de/leben/gesundheit-aerzte/"><span>Gesundheit &amp; Ärzte</span></a></li></ul></div><div class="top_trenner nr3"><ul><li class="hasChilds" data-id="900000030" data-owner="29880"><a href="https://www.taunusstein.de/leben/kinder/"><span>Kinder</span></a><ul id="topnavi_megamenu0_900000030" class="topnavi_megamenu0"><li class="" data-id="900000109" data-owner="29880"><a href="https://www.taunusstein.de/leben/kinder/kinderbetreuung/"><span>Kinderbetreuung</span></a></li><li class="" data-id="900000110" data-owner="29880"><a href="https://www.taunusstein.de/leben/kinder/tageselternvermittlung/"><span>Tageselternvermittlung</span></a></li><li class="" data-id="900000179" data-owner="29880"><a href="https://www.taunusstein.de/leben/kinder/taunussteiner-modell/"><span>Taunussteiner Modell</span></a></li></ul></li><li class="" data-id="900000163" data-owner="29880"><a href="https://www.taunusstein.de/leben/kinderfreundliche-kommune-taunusstein/"><span>Kinderfreundliche Kommune Taunusstein</span></a></li><li class="" data-id="900000037" data-owner="29880"><a href="https://www.taunusstein.de/leben/kirchen/"><span>Kirchen</span></a></li></ul></div><div class="clearfloat"></div></div></li><li class="hasChilds" data-id="900000010" data-owner="29880" id="freizeit"><a href="https://www.taunusstein.de/freizeit/"><span>Freizeit</span></a><div class="megamenu"></div><div class="wrapper"><div class="top_trenner nr0"><ul><li class="" data-id="900000184" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/buergerfest-10-an-einem-langen-tisch-/"><span>Bürgerfest &quot;10 an einem langen Tisch&quot;</span></a></li><li class="" data-id="900000049" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/limes/"><span>Limes</span></a></li><li class="" data-id="900000044" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/grillplaetze/"><span>Grillplätze</span></a></li><li class="" data-id="900000105" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/freibad/"><span>Freibad</span></a></li></ul></div><div class="top_trenner nr1"><ul><li class="" data-id="900000183" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/kultursommer/"><span>Kultursommer</span></a></li><li class="hasChilds" data-id="900000043" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/kunst-kultur/"><span>Kunst &amp; Kultur</span></a><ul id="topnavi_megamenu0_900000043" class="topnavi_megamenu0"><li class="" data-id="900000111" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/kunst-kultur/museum-im-wehener-schloss/"><span>Museum im Wehener Schloss</span></a></li><li class="" data-id="900000089" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/kunst-kultur/kunsthaus-taunusstein/"><span>Kunsthaus Taunusstein</span></a></li><li class="" data-id="900000113" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/kunst-kultur/musikschule/"><span>Musikschule</span></a></li><li class="" data-id="900000090" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/kunst-kultur/salon-theater/"><span>Salon-Theater</span></a></li><li class="" data-id="900000112" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/kunst-kultur/kunst-und-kulturstiftung/"><span>Kunst- und Kulturstiftung</span></a></li></ul></li><li class="" data-id="900000046" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/gaststaetten/"><span>Gaststätten</span></a></li></ul></div><div class="top_trenner nr2"><ul><li class="hasChilds" data-id="900000040" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/veranstaltungen/"><span>Veranstaltungen</span></a><ul id="topnavi_megamenu0_900000040" class="topnavi_megamenu0"><li class="" data-id="900000106" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/veranstaltungen/veranstaltung-eintragen/"><span>Veranstaltung eintragen</span></a></li></ul></li><li class="hasChilds" data-id="900000042" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/sport-aktiv/"><span>Sport &amp; Aktiv</span></a><ul id="topnavi_megamenu0_900000042" class="topnavi_megamenu0"><li class="" data-id="900000107" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/sport-aktiv/rad-wandern/"><span>Rad &amp; Wandern</span></a></li></ul></li><li class="" data-id="900000047" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/unterkuenfte/"><span>Unterkünfte</span></a></li></ul></div><div class="top_trenner nr3"><ul><li class="hasChilds" data-id="900000041" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/vereine/"><span>Vereine</span></a><ul id="topnavi_megamenu0_900000041" class="topnavi_megamenu0"><li class="" data-id="900000103" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/vereine/verein-eintragen/"><span>Verein eintragen</span></a></li></ul></li><li class="" data-id="900000045" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/spiel-sportplaetze/"><span>Spiel- &amp; Sportplätze</span></a></li><li class="" data-id="900000048" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/buergerhaeuser-mehrzweckeinrichtungen/"><span>Bürgerhäuser &amp; Mehrzweckeinrichtungen</span></a></li></ul></div><div class="clearfloat"></div></div></li><li class="hasChilds" data-id="900000011" data-owner="29880" id="wirtschaft"><a href="https://www.taunusstein.de/wirtschaft/"><span>Wirtschaft</span></a><div class="megamenu"></div><div class="wrapper"><div class="top_trenner nr0"><ul><li class="" data-id="900000051" data-owner="29880"><a href="https://www.taunusstein.de/wirtschaft/stata-gmbh/"><span>StaTa GmbH</span></a></li><li class="" data-id="900000054" data-owner="29880"><a href="https://www.taunusstein.de/wirtschaft/gewerbe/"><span>Gewerbe</span></a></li></ul></div><div class="top_trenner nr1"><ul><li class="hasChilds" data-id="900000052" data-owner="29880"><a href="https://www.taunusstein.de/wirtschaft/wirtschaftsstandort/"><span>Wirtschaftsstandort</span></a><ul id="topnavi_megamenu0_900000052" class="topnavi_megamenu0"><li class="" data-id="900000091" data-owner="29880"><a href="https://www.taunusstein.de/wirtschaft/wirtschaftsstandort/flaechen-immobilien/"><span>Flächen &amp; Immobilien</span></a></li></ul></li><li class="" data-id="900000055" data-owner="29880"><a href="https://www.taunusstein.de/wirtschaft/messen-und-seminare/"><span>Messen und Seminare</span></a></li></ul></div><div class="top_trenner nr2"><ul><li class="" data-id="900000108" data-owner="29880"><a href="https://www.taunusstein.de/wirtschaft/unternehmensservice/"><span>Unternehmensservice</span></a></li><li class="" data-id="900000056" data-owner="29880"><a href="https://www.taunusstein.de/wirtschaft/ausschreibungen/"><span>Ausschreibungen</span></a></li></ul></div><div class="top_trenner nr3"><ul><li class="" data-id="900000053" data-owner="29880"><a href="https://www.taunusstein.de/wirtschaft/gruender/"><span>Gründer</span></a></li></ul></div><div class="clearfloat"></div></div></li></ul>      </div>

    </div>

    <div id="middle">


      <div id="middle_in">

                  <div id="brot">
            <strong>Sie sind hier:</strong> <span itemscope itemtype="http://data-vocabulary.org/Breadcrumb"><a  href="https://www.taunusstein.de/portal/seiten/rathaus-900000096-29880.html?naviID=900000005&amp;brotID=900000005&amp;rubrik=900000003" style="color:#0091d4;" itemprop="url title">Rathaus</a></span></div>

        <!-- <main id="content">  -->
        <div id="content" role="main">
          <div id="content_in">
            <div id="nolis_content">
              <!-- Seiteninhalt -->
              <div id="nolis_content_heading">
                <div id="nolis_content_site" class="nolis_content_site">
                  <!-- platzhalter_vois //-->
                  <!-- Layout CSS -->
                  <link id="theme-css" rel="stylesheet" type="text/css" href="assets/theme/theme-vois.css">
                  <link id="layout-css" rel="stylesheet" type="text/css" href="assets/layout/css/layout-vois.css">
                  <script type="text/javascript" src="./app-form-presenter-elements-es2015.js"></script>
                  <app-form-presenter-elements></app-form-presenter-elements>
                </div>
              </div>
              <!-- /Seiteninhalt -->
            </div>
          </div>
          <div style="clear: both;"></div>
        </div>

                  <!-- <nav id="navigation" aria-label="Hauptnavigation">  -->
          <div id="navigation" role="navigation" aria-label="Hauptnavigation">
            <h2>Navigation</h2>
            <h3>rathaus</h3>            <div id="navigation_in">
              <ul id="naviEbene0_900000005" class="naviEbene0"><li class="hasChilds active hasChilds_active" data-id="900000012" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/aktuelles/"><span>Aktuelles</span></a><ul id="naviEbene1_900000012" class="naviEbene1"><li class="" data-id="900000057" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/aktuelles/archiv/"><span>Archiv</span></a></li><li class="" data-id="900000094" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/aktuelles/newsletter/"><span>Newsletter</span></a></li><li class="" data-id="900000220" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/aktuelles/taunussteiner-stadtnachrichten/"><span>Taunussteiner Stadtnachrichten</span></a></li></ul></li><li class="hasChilds" data-id="900000013" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/was-erledige-ich-wo-/"><span>Was erledige ich wo?</span></a></li><li class="hasChilds" data-id="900000014" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/verwaltung/"><span>Verwaltung</span></a></li><li class="" data-id="900000015" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/feuerwehr/"><span>Feuerwehr</span></a></li><li class="" data-id="900000016" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/ortsgericht-schiedsamt/"><span>Ortsgericht &amp; Schiedsamt</span></a></li><li class="" data-id="900000017" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/notruf-servicenummern/"><span>Notruf- &amp; Servicenummern</span></a></li><li class="" data-id="900000093" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/so-informieren-wir/"><span>So informieren wir</span></a></li><li class="" data-id="900000018" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/formulare/"><span>Formulare</span></a></li><li class="" data-id="900000019" data-owner="29880"><a href="https://www.stadtwerke-taunusstein.de/" target="_blank"><span>Stadtwerke Taunusstein</span></a></li><li class="" data-id="900000020" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/im-gespraech/"><span>Im Gespräch</span></a></li><li class="" data-id="900000021" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/wahlen/"><span>Wahlen</span></a></li><li class="hasChilds" data-id="900000022" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/kommunalpolitik/"><span>Kommunalpolitik</span></a></li><li class="hasChilds" data-id="900000023" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/karriere/"><span>Karriere</span></a></li><li class="" data-id="900000024" data-owner="29880"><a href="https://maengelmelder.taunusstein.de/" target="_blank"><span>Mängelmelder</span></a></li><li class="" data-id="900000026" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/stadtplan/"><span>Stadtplan</span></a></li></ul>            </div>
            <div id="navigation_bottom">
              <a href="javascript:"></a>
            </div>
          </div>

                    <!-- <aside>  -->
          <div id="info" role="complementary">
            <div id="nolis_info">
              <h2>Infobereich</h2>
                          </div>
          </div>

        <div style="clear: both;"></div>
      </div>
    </div>

    <div id="sticky_box">
      <a class="sticky" id="oeffnungszeiten" href="https://www.taunusstein.de/portal/seiten/oeffnungszeiten-900000105-29880.html?titel=%C3%96ffnungszeiten" title="Öffnungszeiten">
        <span class="tool-tipp">Öffnungszeiten</span>
      </a>
      <a class="sticky" id="kontakt" href="https://www.taunusstein.de/portal/seiten/kontakt-900000168-29880.html" title="Kontakt">
        <span class="tool-tipp">Kontakt</span>
      </a>
      <a class="sticky" id="whatsapp" href="https://www.taunusstein.de/rathaus/so-informieren-wir/" title="WhatsApp">
        <span class="tool-tipp">WhatsApp</span>
      </a>
      <a class="sticky" id="facebook" href="https://www.facebook.com/pressestelle.taunusstein/" title="Facebook" target="_blank">
        <span class="tool-tipp">Facebook</span>
      </a>
      <a class="sticky" id="newsletter" href="https://www.taunusstein.de/rathaus/aktuelles/newsletter/" title="Newsletter">
        <span class="tool-tipp">Newsletter</span>
      </a>
      <a class="sticky" target="_blank" id="navigator" href="https://internetcity.geoas.de/taunusstein/buergerportal/" title="Stadtplan">
        <span class="tool-tipp">Stadtplan</span>
      </a>
      <a class="sticky" id="translate" href="javascript:" title="Seite übersetzen">
        <span class="tool-tipp">
          Seite übersetzen
        </span>
        <div id="google_translate_element"></div>
        <script type="text/javascript">
          function googleTranslateElementInit() {
            new google.translate.TranslateElement({pageLanguage: 'de', includedLanguages: 'en,nl,es,pt,it,ar,tr,ru,pl,cs,da,sv,no,fr', layout: google.translate.TranslateElement.InlineLayout.SIMPLE, autoDisplay: false}, 'google_translate_element');
          }
        </script>
        <script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
      </a>
    </div>

    <!-- <footer>  -->
    <div id="foot" role="contentinfo">

      <ul id="footer_adresse">
        <li>Aarstr. 150</li>
        <li>65232 Taunusstein</li>
      </ul>

      <ul id="footer_data">
        <li>Telefon: <a href="tel:061282410">06128/241-0</a></li>
        <li>Fax: 06128-241172</li>
        <li>E-Mail: <a href="mailto:redaktion@taunusstein.de">redaktion@taunusstein.de</a></li>
      </ul>

      <ul id="footer_links">
        <li><a href="#top">Nach oben</a></li>
        <li><a href="https://www.taunusstein.de/portal/startseite.html">Startseite</a></li>
        <li><a href="https://www.taunusstein.de/portal/seiten/kontakt-900000168-29880.html">Kontakt</a></li>
        <li><a href="https://www.taunusstein.de/portal/seiten/datenschutz-900000015-29880.html?titel=Datenschutz">Datenschutz</a></li>
        <li><a href="https://www.taunusstein.de/portal/seiten/impressum-900000014-29880.html?titel=Impressum">Impressum</a></li>
      </ul>
    </div>

    <a id="toggle_menu"></a>

    <div id="nolis_mobil_navigation">

      <div id="nav_reiter">
        <a id="tab_startseite" href="javascript:"></a>
        <a id="nav_item_1" href="javascript:" onclick="tab_click(jQuery(this));"></a>
        <a id="nav_item_2" href="javascript:" onclick="tab_click(jQuery(this));"></a>
        <a id="nav_item_3" href="javascript:" onclick="tab_click(jQuery(this));"></a>
        <a id="nav_item_4" href="javascript:" onclick="tab_click(jQuery(this));"></a>
      </div>

      <a id="home" href="https://www.taunusstein.de/portal/startseite.html">Startseite</a>
      <!--<span class="responsive"></span>-->

      <h2>Mobil Navigation</h2>
      <ul id="mobilnavigation0_0" class="mobilnavigation0"><li class="hasChilds childActive hasChilds_childActive" data-id="900000005" data-owner="29880"><a href="javascript:" title="Untermenü ausklappen" class="responsive"><span></span></a><a href="https://www.taunusstein.de/rathaus/"><span>Rathaus</span></a><ul id="mobilnavigation1_900000005" class="mobilnavigation1"><li class="hasChilds active hasChilds_active" data-id="900000012" data-owner="29880"><a href="javascript:" title="Untermenü ausklappen" class="responsive"><span></span></a><a href="https://www.taunusstein.de/rathaus/aktuelles/"><span>Aktuelles</span></a><ul id="mobilnavigation2_900000012" class="mobilnavigation2"><li class="" data-id="900000057" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/aktuelles/archiv/"><span>Archiv</span></a></li><li class="" data-id="900000094" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/aktuelles/newsletter/"><span>Newsletter</span></a></li><li class="" data-id="900000220" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/aktuelles/taunussteiner-stadtnachrichten/"><span>Taunussteiner Stadtnachrichten</span></a></li></ul></li><li class="hasChilds" data-id="900000013" data-owner="29880"><a href="javascript:" title="Untermenü ausklappen" class="responsive"><span></span></a><a href="https://www.taunusstein.de/rathaus/was-erledige-ich-wo-/"><span>Was erledige ich wo?</span></a><ul id="mobilnavigation2_900000013" class="mobilnavigation2"><li class="" data-id="900000114" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/was-erledige-ich-wo-/organisationsstruktur/"><span>Organisationsstruktur</span></a></li><li class="" data-id="900000104" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/was-erledige-ich-wo-/buergerbuero/"><span>Bürgerbüro</span></a></li><li class="" data-id="900000074" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/was-erledige-ich-wo-/mobiles-buergerbuero/"><span>Mobiles Bürgerbüro</span></a></li><li class="" data-id="900000075" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/was-erledige-ich-wo-/rentenberatung/"><span>Rentenberatung</span></a></li><li class="" data-id="900000082" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/was-erledige-ich-wo-/standesamt-aartal/"><span>Standesamt Aartal</span></a></li></ul></li><li class="hasChilds" data-id="900000014" data-owner="29880"><a href="javascript:" title="Untermenü ausklappen" class="responsive"><span></span></a><a href="https://www.taunusstein.de/rathaus/verwaltung/"><span>Verwaltung</span></a><ul id="mobilnavigation2_900000014" class="mobilnavigation2"><li class="" data-id="900000058" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/verwaltung/buergermeister/"><span>Bürgermeister</span></a></li><li class="" data-id="900000060" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/verwaltung/haushalt-finanzen/"><span>Haushalt &amp; Finanzen</span></a></li><li class="" data-id="900000059" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/verwaltung/bankverbindungen/"><span>Bankverbindungen</span></a></li><li class="" data-id="900000063" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/verwaltung/oeffentliche-bekanntmachungen/"><span>Öffentliche Bekanntmachungen</span></a></li><li class="" data-id="900000064" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/verwaltung/satzungen-gebuehren/"><span>Satzungen &amp; Gebühren</span></a></li><li class="" data-id="900000067" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/verwaltung/zentr-vergabeberatungsstelle/"><span>Zentr. Vergabeberatungsstelle</span></a></li></ul></li><li class="" data-id="900000015" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/feuerwehr/"><span>Feuerwehr</span></a></li><li class="" data-id="900000016" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/ortsgericht-schiedsamt/"><span>Ortsgericht &amp; Schiedsamt</span></a></li><li class="" data-id="900000017" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/notruf-servicenummern/"><span>Notruf- &amp; Servicenummern</span></a></li><li class="" data-id="900000093" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/so-informieren-wir/"><span>So informieren wir</span></a></li><li class="" data-id="900000018" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/formulare/"><span>Formulare</span></a></li><li class="" data-id="900000019" data-owner="29880"><a href="https://www.stadtwerke-taunusstein.de/" target="_blank"><span>Stadtwerke Taunusstein</span></a></li><li class="" data-id="900000020" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/im-gespraech/"><span>Im Gespräch</span></a></li><li class="" data-id="900000021" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/wahlen/"><span>Wahlen</span></a></li><li class="hasChilds" data-id="900000022" data-owner="29880"><a href="javascript:" title="Untermenü ausklappen" class="responsive"><span></span></a><a href="https://www.taunusstein.de/rathaus/kommunalpolitik/"><span>Kommunalpolitik</span></a><ul id="mobilnavigation2_900000022" class="mobilnavigation2"><li class="" data-id="900000095" data-owner="29880"><a href="https://www.taunusstein.de/allris/si010_e.asp" target="_top"><span>Sitzungskalender</span></a></li><li class="" data-id="900000096" data-owner="29880"><a href="https://www.taunusstein.de/allris/pa021.asp" target="_top"><span>Stadtverordneten­versammlung</span></a></li><li class="" data-id="900000097" data-owner="29880"><a href="https://www.taunusstein.de/allris/au020.asp?AULFDNR=18" target="_top"><span>Magistrat</span></a></li><li class="" data-id="900000098" data-owner="29880"><a href="https://www.taunusstein.de/allris/au010.asp?T1=Aussch%FCsse&amp;AU=Ausschuss&amp;SORTVON=1&amp;SORTBIS=5&amp;SELECT=1" target="_top"><span>Ausschüsse</span></a></li><li class="" data-id="900000099" data-owner="29880"><a href="https://www.taunusstein.de/allris/au010.asp?T1=Ortsbeirat&amp;AU=Ortsbeirat&amp;SORTVON=30&amp;SORTBIS=30&amp;SELECT=1" target="_top"><span>Ortsbeiräte</span></a></li><li class="" data-id="900000100" data-owner="29880"><a href="https://www.taunusstein.de/allris/au020.asp?AULFDNR=17&amp;altoption=Sonstige%20Gremien" target="_top"><span>Seniorenbeirat</span></a></li><li class="" data-id="900000101" data-owner="29880"><a href="https://www.taunusstein.de/allris/au020.asp?AULFDNR=7&amp;altoption=Sonstige%20Gremien" target="_top"><span>Jugendparlament</span></a></li><li class="" data-id="900000102" data-owner="29880"><a href="https://www.taunusstein.de/allris/fr010.asp?SELECT=1" target="_top"><span>Gewählte Gruppen</span></a></li></ul></li><li class="hasChilds" data-id="900000023" data-owner="29880"><a href="javascript:" title="Untermenü ausklappen" class="responsive"><span></span></a><a href="https://www.taunusstein.de/rathaus/karriere/"><span>Karriere</span></a><ul id="mobilnavigation2_900000023" class="mobilnavigation2"><li class="" data-id="900000219" data-owner="29880"><a href="https://www.mein-check-in.de/taunusstein/index" target="_blank"><span>Online-Bewerberportal</span></a></li><li class="" data-id="900000218" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/karriere/praktikum-ausbildung/"><span>Praktikum &amp; Ausbildung</span></a></li></ul></li><li class="" data-id="900000024" data-owner="29880"><a href="https://maengelmelder.taunusstein.de/" target="_blank"><span>Mängelmelder</span></a></li><li class="" data-id="900000026" data-owner="29880"><a href="https://www.taunusstein.de/rathaus/stadtplan/"><span>Stadtplan</span></a></li></ul></li><li class="hasChilds" data-id="900000009" data-owner="29880"><a href="javascript:" title="Untermenü ausklappen" class="responsive"><span></span></a><a href="https://www.taunusstein.de/leben/"><span>Leben</span></a><ul id="mobilnavigation1_900000009" class="mobilnavigation1"><li class="hasChilds" data-id="900000027" data-owner="29880"><a href="javascript:" title="Untermenü ausklappen" class="responsive"><span></span></a><a href="https://www.taunusstein.de/leben/wohnen/"><span>Wohnen</span></a><ul id="mobilnavigation2_900000027" class="mobilnavigation2"><li class="" data-id="900000062" data-owner="29880"><a href="https://www.taunusstein.de/leben/wohnen/muell-abfallwirtschaft/"><span>Müll &amp; Abfallwirtschaft</span></a></li><li class="" data-id="900000083" data-owner="29880"><a href="https://www.taunusstein.de/leben/wohnen/oepnv/"><span>ÖPNV</span></a></li><li class="" data-id="900000061" data-owner="29880"><a href="https://www.taunusstein.de/leben/wohnen/mietspiegel/"><span>Mietspiegel</span></a></li><li class="" data-id="900000077" data-owner="29880"><a href="https://www.taunusstein.de/leben/wohnen/energie/"><span>Energie</span></a></li><li class="" data-id="900000076" data-owner="29880"><a href="https://www.taunusstein.de/leben/wohnen/internet-ausbau/"><span>Internet-Ausbau</span></a></li><li class="" data-id="900000066" data-owner="29880"><a href="https://www.taunusstein.de/leben/wohnen/winterdienst/"><span>Winterdienst</span></a></li></ul></li><li class="hasChilds" data-id="900000028" data-owner="29880"><a href="javascript:" title="Untermenü ausklappen" class="responsive"><span></span></a><a href="https://www.taunusstein.de/leben/stadtentwicklung-bauen/"><span>Stadtentwicklung &amp; Bauen</span></a><ul id="mobilnavigation2_900000028" class="mobilnavigation2"><li class="" data-id="900000167" data-owner="29880"><a href="https://www.taunusstein.de/leben/stadtentwicklung-bauen/stadtplanung/"><span>Stadtplanung</span></a></li><li class="" data-id="900000168" data-owner="29880"><a href="https://www.taunusstein.de/leben/stadtentwicklung-bauen/bauberatung/"><span>Bauberatung</span></a></li><li class="" data-id="900000169" data-owner="29880"><a href="https://www.taunusstein.de/leben/stadtentwicklung-bauen/grundstuecke-immobilien/"><span>Grundstücke &amp; Immobilien</span></a></li><li class="" data-id="900000204" data-owner="29880"><a href="http://straßen-in-taunusstein.de/" target="_blank"><span>Straßenbeiträge</span></a></li><li class="" data-id="900000207" data-owner="29880"><a href="https://www.taunusstein.de/leben/stadtentwicklung-bauen/aartal-konzept/"><span>Aartal-Konzept</span></a></li></ul></li><li class="hasChilds" data-id="900000029" data-owner="29880"><a href="javascript:" title="Untermenü ausklappen" class="responsive"><span></span></a><a href="https://www.taunusstein.de/leben/stadtportrait/"><span>Stadtportrait</span></a><ul id="mobilnavigation2_900000029" class="mobilnavigation2"><li class="" data-id="900000081" data-owner="29880"><a href="https://www.taunusstein.de/leben/stadtportrait/staedtepartnerschaften/"><span>Städtepartnerschaften</span></a></li><li class="" data-id="900000084" data-owner="29880"><a href="https://www.taunusstein.de/leben/stadtportrait/statistik/"><span>Statistik</span></a></li><li class="" data-id="900000086" data-owner="29880"><a href="https://www.taunusstein.de/leben/stadtportrait/stadtwald/"><span>Stadtwald</span></a></li></ul></li><li class="hasChilds" data-id="900000030" data-owner="29880"><a href="javascript:" title="Untermenü ausklappen" class="responsive"><span></span></a><a href="https://www.taunusstein.de/leben/kinder/"><span>Kinder</span></a><ul id="mobilnavigation2_900000030" class="mobilnavigation2"><li class="" data-id="900000109" data-owner="29880"><a href="https://www.taunusstein.de/leben/kinder/kinderbetreuung/"><span>Kinderbetreuung</span></a></li><li class="" data-id="900000110" data-owner="29880"><a href="https://www.taunusstein.de/leben/kinder/tageselternvermittlung/"><span>Tageselternvermittlung</span></a></li><li class="" data-id="900000179" data-owner="29880"><a href="https://www.taunusstein.de/leben/kinder/taunussteiner-modell/"><span>Taunussteiner Modell</span></a></li></ul></li><li class="" data-id="900000031" data-owner="29880"><a href="https://www.taunusstein.de/leben/jugend/"><span>Jugend</span></a></li><li class="hasChilds" data-id="900000032" data-owner="29880"><a href="javascript:" title="Untermenü ausklappen" class="responsive"><span></span></a><a href="https://www.taunusstein.de/leben/senioren/"><span>Senioren</span></a><ul id="mobilnavigation2_900000032" class="mobilnavigation2"><li class="" data-id="900000085" data-owner="29880"><a href="https://www.taunusstein.de/leben/senioren/leitstelle-aelterwerden/"><span>Leitstelle Älterwerden</span></a></li><li class="" data-id="900000211" data-owner="29880"><a href="https://www.taunusstein.de/leben/senioren/demenzarbeit/"><span>Demenzarbeit</span></a></li></ul></li><li class="" data-id="900000033" data-owner="29880"><a href="https://www.taunusstein.de/leben/frauen/"><span>Frauen</span></a></li><li class="" data-id="900000163" data-owner="29880"><a href="https://www.taunusstein.de/leben/kinderfreundliche-kommune-taunusstein/"><span>Kinderfreundliche Kommune Taunusstein</span></a></li><li class="" data-id="900000035" data-owner="29880"><a href="https://www.taunusstein.de/leben/menschen-mit-behinderungen/"><span>Menschen mit Behinderungen</span></a></li><li class="hasChilds" data-id="900000036" data-owner="29880"><a href="javascript:" title="Untermenü ausklappen" class="responsive"><span></span></a><a href="https://www.taunusstein.de/leben/freiwilliges-engagement/"><span>Freiwilliges Engagement</span></a><ul id="mobilnavigation2_900000036" class="mobilnavigation2"><li class="" data-id="900000170" data-owner="29880"><a href="https://www.taunusstein.de/leben/freiwilliges-engagement/engagement-lotsen/"><span>Engagement-Lotsen</span></a></li><li class="" data-id="900000180" data-owner="29880"><a href="https://www.taunusstein.de/leben/freiwilliges-engagement/gruenpflegepatenschaften/"><span>Grünpflegepatenschaften</span></a></li></ul></li><li class="" data-id="900000166" data-owner="29880"><a href="https://www.taunusstein.de/leben/stiftungen/"><span>Stiftungen</span></a></li><li class="" data-id="900000037" data-owner="29880"><a href="https://www.taunusstein.de/leben/kirchen/"><span>Kirchen</span></a></li><li class="" data-id="900000038" data-owner="29880"><a href="https://www.taunusstein.de/leben/schulen/"><span>Schulen</span></a></li><li class="" data-id="900000039" data-owner="29880"><a href="https://www.taunusstein.de/leben/stadt-schulbuecherei/"><span>Stadt- &amp; Schulbücherei</span></a></li><li class="" data-id="900000092" data-owner="29880"><a href="https://www.taunusstein.de/leben/gesundheit-aerzte/"><span>Gesundheit &amp; Ärzte</span></a></li></ul></li><li class="hasChilds" data-id="900000010" data-owner="29880"><a href="javascript:" title="Untermenü ausklappen" class="responsive"><span></span></a><a href="https://www.taunusstein.de/freizeit/"><span>Freizeit</span></a><ul id="mobilnavigation1_900000010" class="mobilnavigation1"><li class="" data-id="900000184" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/buergerfest-10-an-einem-langen-tisch-/"><span>Bürgerfest &quot;10 an einem langen Tisch&quot;</span></a></li><li class="" data-id="900000183" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/kultursommer/"><span>Kultursommer</span></a></li><li class="hasChilds" data-id="900000040" data-owner="29880"><a href="javascript:" title="Untermenü ausklappen" class="responsive"><span></span></a><a href="https://www.taunusstein.de/freizeit/veranstaltungen/"><span>Veranstaltungen</span></a><ul id="mobilnavigation2_900000040" class="mobilnavigation2"><li class="" data-id="900000106" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/veranstaltungen/veranstaltung-eintragen/"><span>Veranstaltung eintragen</span></a></li></ul></li><li class="hasChilds" data-id="900000041" data-owner="29880"><a href="javascript:" title="Untermenü ausklappen" class="responsive"><span></span></a><a href="https://www.taunusstein.de/freizeit/vereine/"><span>Vereine</span></a><ul id="mobilnavigation2_900000041" class="mobilnavigation2"><li class="" data-id="900000103" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/vereine/verein-eintragen/"><span>Verein eintragen</span></a></li></ul></li><li class="" data-id="900000049" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/limes/"><span>Limes</span></a></li><li class="hasChilds" data-id="900000043" data-owner="29880"><a href="javascript:" title="Untermenü ausklappen" class="responsive"><span></span></a><a href="https://www.taunusstein.de/freizeit/kunst-kultur/"><span>Kunst &amp; Kultur</span></a><ul id="mobilnavigation2_900000043" class="mobilnavigation2"><li class="" data-id="900000111" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/kunst-kultur/museum-im-wehener-schloss/"><span>Museum im Wehener Schloss</span></a></li><li class="" data-id="900000089" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/kunst-kultur/kunsthaus-taunusstein/"><span>Kunsthaus Taunusstein</span></a></li><li class="" data-id="900000113" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/kunst-kultur/musikschule/"><span>Musikschule</span></a></li><li class="" data-id="900000090" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/kunst-kultur/salon-theater/"><span>Salon-Theater</span></a></li><li class="" data-id="900000112" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/kunst-kultur/kunst-und-kulturstiftung/"><span>Kunst- und Kulturstiftung</span></a></li></ul></li><li class="hasChilds" data-id="900000042" data-owner="29880"><a href="javascript:" title="Untermenü ausklappen" class="responsive"><span></span></a><a href="https://www.taunusstein.de/freizeit/sport-aktiv/"><span>Sport &amp; Aktiv</span></a><ul id="mobilnavigation2_900000042" class="mobilnavigation2"><li class="" data-id="900000107" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/sport-aktiv/rad-wandern/"><span>Rad &amp; Wandern</span></a></li></ul></li><li class="" data-id="900000045" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/spiel-sportplaetze/"><span>Spiel- &amp; Sportplätze</span></a></li><li class="" data-id="900000044" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/grillplaetze/"><span>Grillplätze</span></a></li><li class="" data-id="900000046" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/gaststaetten/"><span>Gaststätten</span></a></li><li class="" data-id="900000047" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/unterkuenfte/"><span>Unterkünfte</span></a></li><li class="" data-id="900000048" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/buergerhaeuser-mehrzweckeinrichtungen/"><span>Bürgerhäuser &amp; Mehrzweckeinrichtungen</span></a></li><li class="" data-id="900000105" data-owner="29880"><a href="https://www.taunusstein.de/freizeit/freibad/"><span>Freibad</span></a></li></ul></li><li class="hasChilds" data-id="900000011" data-owner="29880"><a href="javascript:" title="Untermenü ausklappen" class="responsive"><span></span></a><a href="https://www.taunusstein.de/wirtschaft/"><span>Wirtschaft</span></a><ul id="mobilnavigation1_900000011" class="mobilnavigation1"><li class="" data-id="900000051" data-owner="29880"><a href="https://www.taunusstein.de/wirtschaft/stata-gmbh/"><span>StaTa GmbH</span></a></li><li class="hasChilds" data-id="900000052" data-owner="29880"><a href="javascript:" title="Untermenü ausklappen" class="responsive"><span></span></a><a href="https://www.taunusstein.de/wirtschaft/wirtschaftsstandort/"><span>Wirtschaftsstandort</span></a><ul id="mobilnavigation2_900000052" class="mobilnavigation2"><li class="" data-id="900000091" data-owner="29880"><a href="https://www.taunusstein.de/wirtschaft/wirtschaftsstandort/flaechen-immobilien/"><span>Flächen &amp; Immobilien</span></a></li></ul></li><li class="" data-id="900000108" data-owner="29880"><a href="https://www.taunusstein.de/wirtschaft/unternehmensservice/"><span>Unternehmensservice</span></a></li><li class="" data-id="900000053" data-owner="29880"><a href="https://www.taunusstein.de/wirtschaft/gruender/"><span>Gründer</span></a></li><li class="" data-id="900000054" data-owner="29880"><a href="https://www.taunusstein.de/wirtschaft/gewerbe/"><span>Gewerbe</span></a></li><li class="" data-id="900000055" data-owner="29880"><a href="https://www.taunusstein.de/wirtschaft/messen-und-seminare/"><span>Messen und Seminare</span></a></li><li class="" data-id="900000056" data-owner="29880"><a href="https://www.taunusstein.de/wirtschaft/ausschreibungen/"><span>Ausschreibungen</span></a></li></ul></li></ul>
<script>
function responsiveMenu(divid, ul_ebene){
  jQuery('#'+divid+' > '+ul_ebene+' > li.hasChilds > a.responsive').click(function() {
    if(jQuery(this).parent().hasClass('current')) {
      jQuery(this).siblings('ul').slideUp(200, function() {
        jQuery(this).parent().removeClass('current');
        jQuery(this).parent().parent().removeClass('close');
      });
    } else {
      jQuery('#'+divid+' '+ul_ebene+' li.current ul').slideUp(200, function() {
        jQuery(this).parent().removeClass('current');
        jQuery(this).parent().parent().removeClass('close');
      });      jQuery(this).siblings('ul').slideToggle(200, function() {
        jQuery(this).parent().toggleClass('current');
        jQuery(this).parent().parent().toggleClass('close', 350);
      });
    }
    return false;
  });
}
jQuery(document).ready(function() {
  responsiveMenu('nolis_mobil_navigation', 'ul');
  responsiveMenu('nolis_mobil_navigation', 'ul > li > ul');
  responsiveMenu('nolis_mobil_navigation', 'ul > li > ul > li > ul');
  responsiveMenu('nolis_mobil_navigation', 'ul > li > ul > li > ul > li > ul');
  responsiveMenu('nolis_mobil_navigation', 'ul > li > ul > li > ul > li > ul > li> ul');
  jQuery('#nolis_mobil_navigation li.childActive').addClass('current');
  jQuery('#nolis_mobil_navigation li.childActive > ul ').show();
  jQuery('#nolis_mobil_navigation li.childActive').parent('ul').addClass('close');
});
</script>
    </div>

</div>

</body>
</html>

`

fs.ensureFileSync(`${targetdir}/index.html`)
fs.writeFileSync(`${targetdir}/index.html`, indexHtml)