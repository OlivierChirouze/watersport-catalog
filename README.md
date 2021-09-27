# watersport-catalog

Small library to scrape information about water sports material:
- windsurfing sails
- windsurfing boards
- ... more to come

Some info can also be manually added to match the general data model

## Content
The library contains both the code to scrape information (in `src`)
and the latest catalog information in JSON format (in `products`).

The **product definition** is described in details in [product.ts](src/model/product.ts)

## Currently supported brands

- [Gaastra](https://ga-windsurfing.com/)
- [Exocet](https://www.exocet-original.fr/)
- [Patrik](https://patrik-windsurf.com/)
- [Point-7](https://point-7.com/)
- [Fanatic](https://www.fanatic.com/fr/windsurfing)

## Use data

Data is in JSON format available in the [data](./data) directory 

The project can be imported in other projects to use both data and data model:

```shell
# In your own project
npm install watersport-catalog
```

## Contribute

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

## Todo
- [ ] scrape brand info (logo, description, links)
- [ ] support all models from the current brands
- [ ] add brands
- [ ] add kitesurfing
- [ ] add wingfoiling
