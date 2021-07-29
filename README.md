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

## Todo
- [ ] scrape brand info (logo, description, links)
- [ ] support all models from the current brands
- [ ] add brands
- [ ] add kitesurfing
- [ ] add wingfoiling
