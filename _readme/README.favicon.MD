# Favicon

You may use an [online favicon generator](https://www.favicon-generator.org/) 
to create a progressive web-app compatible favicon for your page.

Copy the favicon resources into directory `src/assets/favicon` of your project.

So the directory may look like:
```
    src/
        assets/
            favicon/
                android-icon-36x36.png
                android-icon-48x48.png
                android-icon-72x72.png
                android-icon-96x96.png
                android-icon-144x144.png
                android-icon-192x192.png
                apple-icon.png
                apple-icon-57x57.png
                apple-icon-60x60.png
                apple-icon-72x72.png
                apple-icon-76x76.png
                apple-icon-114x114.png
                apple-icon-120x120.png
                apple-icon-144x144.png
                apple-icon-152x152.png
                apple-icon-180x180.png
                apple-icon-precomposed.png
                browserconfig.xml
                favicon.ico
                favicon-16x16.png
                favicon-32x32.png
                favicon-96x96.png
                manifest.json
                ms-icon-70x70.png
                ms-icon-144x144.png
                ms-icon-150x150.png
                ms-icon-310x310.png
```

Use [favicomatic](http://www.favicomatic.com/) to create a multi resolution **favicon**
and override that from above and copy it to
```
    src/
        assets/
            favicon/
                ...
                favicon.ico
                ...
```

Take a look at your `index.html` file and make sure the references to the icons a just right



### Splash Icon 512x512

Add the original 512x512 icon to the `manifest.json` and `link` information

In `manifest.json`
```
    {
      "src": ".\/assets\/favicon\/web_hi_res_512.png",
      "sizes": "512x512",
      "type": "image/png",
      "density": "5.0"
    },
```

In `index.html` 
```
    <link rel="icon" type="image/png" sizes="512x512" href="assets/favicon/web_hi_res_512.png">
```

Example `manifest.json`
```json
    {
     "short_name": "App Name",
     "name": "App Full Name",
     "icons": [
      {
       "src": ".\/assets\/favicon\/android-icon-36x36.png",
       "sizes": "36x36",
       "type": "image\/png",
       "density": "0.75"
      },
      {
       "src": ".\/assets\/favicon\/android-icon-48x48.png",
       "sizes": "48x48",
       "type": "image\/png",
       "density": "1.0"
      },
      {
       "src": ".\/assets\/favicon\/android-icon-72x72.png",
       "sizes": "72x72",
       "type": "image\/png",
       "density": "1.5"
      },
      {
       "src": ".\/assets\/favicon\/android-icon-96x96.png",
       "sizes": "96x96",
       "type": "image\/png",
       "density": "2.0"
      },
      {
       "src": ".\/assets\/favicon\/android-icon-144x144.png",
       "sizes": "144x144",
       "type": "image\/png",
       "density": "3.0"
      },
      {
       "src": ".\/assets\/favicon\/android-icon-192x192.png",
       "sizes": "192x192",
       "type": "image\/png",
       "density": "4.0"
      },
      {
       "src": ".\/assets\/favicon\/web_hi_res_512.png",
       "sizes": "512x512",
       "type": "image\/png",
       "density": "5.0"
      }
     ],
     "start_url": "./index.html",
     "display": "standalone",
     "theme_color": "#004987",
     "background_color": "#004987",
     "orientation": "portrait"
    }
```

Read https://developers.google.com/web/tools/lighthouse/audits/install-prompt 
for more on progressive web app feature install to home screen
