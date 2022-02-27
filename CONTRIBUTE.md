# Contribute

## Quick view

To contribute to this wonderful "wikipedia of water sport products":

- clone the project

```shell
git clone git@github.com:OlivierChirouze/watersport-catalog.git
```

- install

```shell
cd watersport-catalog
npm install
```

- in [src](./src)
    - create a new scrapper for brand or update an existing one
    - the "scrapper" can either read from a brand's website, or use handmade files

- run
    - create a new "generate:xxx" npm script in [package.json](package.json) if needed
    - run it, example:

```shell
npm run generate:patrik
```

- don't forget to **format created data**

```shell
npm run format:data
```

- To **overwrite existing files**, add `-- force` option, for example:

```shell
npm run generate:patrik -- force
```

- To **run debug mode**, add `-- debug` option, for example:

```shell
npm run generate:patrik -- debug
```

This will open the Chromium browser used to render scrapped pages

## In details

The general workflow to add a brand to parse is:

1. Create a `getBrandInfo` method to get brand description and pictures
2. Create an `Extract` interface to host "raw" data from a gear model, and an `extract` method that will run in the
   browser
    1. ⚠️ this method must be "self-sufficient" and cannot depend on any external parameter
    2. keep this method as simple as possible
3. Create a `parse` method that uses this "raw data" and reformat it to match the internal data model
4. Test this method on a couple of model pages
5. Create a method to parse the whole catalog and call the previous method
