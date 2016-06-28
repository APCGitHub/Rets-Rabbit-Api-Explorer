# Rets-Rabbit-Api-Explorer
This is an angular module which acts as a drop in directive for an API explorer for Retsrabbit

##Installation
You can either clone/download this repo or install the package via bower.

```bash
$ bower install rr-api-explorer
```

##Usage
Make sure to import the module

```
app.module('app', ['rr.api.v2.explorer']);
```

This directive can either be used as an element or an attribute

```html
<api-explorer></api-explorer>
```

```html
<div api-explorer></div>
```
###Customization
Currently there are no customization options. The directive is built with Bootstrap classes, so it will work best when that framework is present. In the future we hope to provide

1. Framework specific templating
2. Customization attributes
