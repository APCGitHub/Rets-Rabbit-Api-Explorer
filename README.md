# Rets-Rabbit-Api-Explorer
This is an angular module which acts as a drop in directive for an API explorer for Retsrabbit

##Installation
You can either clone/download this repo or install the package via bower.

```bash
$ bower install rr-api-explorer
```

##Usage
Make sure to import the module

```javascript
app.module('app', ['rr.api.v2.explorer']);

or

app.module('app', [require('rr.api.v2.explorer')];
```

This directive can either be used as an element or an attribute

```html
<api-explorer></api-explorer>
```

```html
<div api-explorer></div>
```

You may also pass in a search parameter which the directive will use to bind values to the search parameters. The parameter must match the following format where the key values follow the RESO spec. See the Rets Rabbit [docs](https://retsrabbit.com/docs) for help.

The directive will watch for changes on the query variable and update the explorer inputs if it detects a change.

```javascript
$scope.query = {
	select: 'ListingId, ListPrice, ListingContractDate',
    filter: [
        {value: 'year(ListingContractDate) eq 2016', join: 'and'},
        {value: 'month(ListingContractDate) eq 6', join: ''}
    ],
    orderby: [{value: 'ListPrice', direction: 'asc'}],
    top: '10',
    skip: '11'
};
```

```html
<api-explorer search="query"></api-explorer>
```

When a search is being performed, the directive will display a loading image/gif where the results are if you supply the loader parameter with a valid path.

```html
<api-explorer search="query" loader="'public/img/loader.gif'"></api-explorer>
```

###Customization
Currently there are no customization options. The directive is built with Bootstrap classes, so it will work best when that framework is present. In the future we hope to provide

1. Framework specific templating
2. Customization attributes
