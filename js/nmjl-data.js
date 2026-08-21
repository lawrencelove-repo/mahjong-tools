/**
 * Unofficial NMJL-style card data by year.
 *
 * NOT the official National Mah Jongg League card. Patterns are approximate
 * placeholders so the UI can be built without reproducing copyrighted hands.
 * Replace / correct lines against your licensed card (esp. any marked verify).
 *
 * To add a new year (e.g. 2027):
 *   1. Add an entry to NMJL_REGISTRY.cards
 *   2. Prepend the year to NMJL_REGISTRY.years (newest first)
 */

/**
 * @typedef {object} NmjlHand
 * @property {string} id
 * @property {string} tiles - hand notation (see tiles.js); 14 tiles for standard hands
 * @property {number} value - points (e.g. 25, 30, 50)
 * @property {boolean} [concealed] - concealed-only / C on the card
 * @property {string} [note] - short free-text (e.g. "Any 3 suits", "No jokers")
 * @property {boolean} [verify] - flag: intentionally off / needs manual fix vs official card
 */

/**
 * @typedef {object} NmjlCategory
 * @property {string} id
 * @property {string} title
 * @property {NmjlHand[]} hands
 */

/**
 * @typedef {object} NmjlCard
 * @property {number} year
 * @property {string} title
 * @property {string} [blurb]
 * @property {NmjlCategory[]} categories
 */

/** @type {{ years: number[], defaultYear: number, cards: Record<number, NmjlCard> }} */
window.NMJL_REGISTRY = {
  years: [2026, 2025],
  defaultYear: 2026,
  cards: {
    2026: {
      year: 2026,
      title: "2026 NMJL Card",
      blurb: "Unofficial placeholders — correct against your licensed 2026 card.",
      categories: [
        {
          id: "year",
          title: "2026",
          hands: [
            {
              id: "2026-a",
              tiles: "2B*3 | 0P*3 | 2C*4 | 6C*4",
              value: 25,
              note: "Soap as 0.  Any 2 suits",
            },
            {
              id: "2026-b",
              tiles: "2026B | GD*3 | 3C*4 | RD*3",
              value: 25,
              note: "Any 2 Suits w Matching Dragons, Kong 2 or 6",
            },
            {
              id: "2026-c",
              tiles: "FFF | 2026B | 2C*3 | 6P*4",
              value: 30,
              note: "Any 3 suits",
            },
            {
              id: "2026-d",
              tiles: "22B | 00P | 222C | 666C | NEWS",
              value: 35,
              concealed: true,
              note: "Any 2 suits",
            },
          ],
        },
        {
          id: "2468",
          title: "2468",
          hands: [
            {
              id: "2468-a",
              tiles: "22P | 44P | 66P | 88P | 2468B | FF",
              value: 25,
              note: "Even pairs + run + F",
            },
            {
              id: "2468-b",
              tiles: "222P | 444P | 666P | 888B | 88C",
              value: 30,
              note: "Pungs of 2/4/6 + kong 8s",
            },
            {
              id: "2468-c",
              tiles: "2468P | 2468B | 222C | 888C",
              value: 30,
              note: "Two runs + matching pungs",
            },
            {
              id: "2468-d",
              tiles: "22P 44P 66P 88P | 22B 44B | FF",
              value: 50,
              concealed: true,
              note: "Even pairs · concealed",
            },
          ],
        },
        {
          id: "like-numbers",
          title: "Any Like Numbers",
          hands: [
            {
              id: "like-a",
              tiles: "111P | 111B | 111C | 11P | FFF",
              value: 25,
              note: "Like number in 3 suits + pair + F",
            },
            {
              id: "like-b",
              tiles: "1111P | 1111B | 111C | 111C",
              value: 30,
              note: "Two kongs + two pungs",
            },
            {
              id: "like-c",
              tiles: "111P | 111B | 111C | NEWS | F",
              value: 35,
              note: "Like pungs + NEWS",
              verify: true,
            },
          ],
        },
        {
          id: "quints",
          title: "Quints",
          hands: [
            {
              id: "quint-a",
              tiles: "11111P | 222B | 333B | 444B",
              value: 40,
              note: "Quint + consecutive pungs",
            },
            {
              id: "quint-b",
              tiles: "FFFFF | 111P | 222P | 333P",
              value: 45,
              note: "Flower quint + run pungs",
            },
            {
              id: "quint-c",
              tiles: "55555P | 55555B | 55C | FF",
              value: 50,
              note: "Two quints + pair + F",
            },
          ],
        },
        {
          id: "consecutive",
          title: "Consecutive Run",
          hands: [
            {
              id: "run-a",
              tiles: "111P | 222P | 333P | 444P | 55P",
              value: 25,
              note: "One suit run",
            },
            {
              id: "run-b",
              tiles: "111P | 222P | 333B | 444B | 55C",
              value: 30,
              note: "Two suits + pair",
            },
            {
              id: "run-c",
              tiles: "123P | 123P | 123B | 123B | 11C",
              value: 30,
              note: "Matching chows",
            },
            {
              id: "run-d",
              tiles: "1111P | 2222P | 3333B | 44B",
              value: 35,
              note: "Kongs in run",
            },
          ],
        },
        {
          id: "13579",
          title: "13579",
          hands: [
            {
              id: "odd-a",
              tiles: "11P | 33P | 55P | 77P | 99P | 135B | F",
              value: 25,
              note: "Odd pairs + run",
            },
            {
              id: "odd-b",
              tiles: "111P | 333P | 555P | 777B | 99B",
              value: 30,
              note: "Odd pungs",
            },
            {
              id: "odd-c",
              tiles: "13579P | 13579B | 11C | 99C",
              value: 35,
              note: "Two odd runs",
            },
          ],
        },
        {
          id: "winds-dragons",
          title: "Winds — Dragons",
          hands: [
            {
              id: "wd-a",
              tiles: "NEWS | FF | RD RD RD | GD GD GD | WD WD",
              value: 25,
              note: "NEWS + dragons",
            },
            {
              id: "wd-b",
              tiles: "EEEE | SSSS | WW | NN | FF",
              value: 30,
              note: "Wind kongs / pairs",
            },
            {
              id: "wd-c",
              tiles: "RD RD RD RD | GD GD GD GD | WD WD WD WD | FF",
              value: 40,
              note: "Dragon kongs + flowers",
            },
            {
              id: "wd-d",
              tiles: "NEWS | NEWS | DD | DD | DD",
              value: 50,
              concealed: true,
              note: "Placeholder winds/dragons · concealed",
            },
          ],
        },
        {
          id: "369",
          title: "369",
          hands: [
            {
              id: "369-a",
              tiles: "333P | 666P | 999P | 33B | 66B | F",
              value: 25,
              note: "3/6/9 pungs + pairs",
            },
            {
              id: "369-b",
              tiles: "369P | 369B | 369C | 333P | FF",
              value: 30,
              note: "369 in three suits",
            },
            {
              id: "369-c",
              tiles: "3333P | 6666P | 9999B | 99C",
              value: 35,
              note: "Kongs of 3/6/9",
            },
          ],
        },
        {
          id: "singles-pairs",
          title: "Singles and Pairs",
          hands: [
            {
              id: "sp-a",
              tiles: "11P 22P 33P 44P 55P 66P 77P",
              value: 50,
              concealed: true,
              note: "No jokers · concealed",
            },
            {
              id: "sp-b",
              tiles: "FF | 2026P | NEWS | DD | DD",
              value: 50,
              concealed: true,
              note: "Year + NEWS + dragons · no jokers",
            },
            {
              id: "sp-c",
              tiles: "2468P | 2468B | 2468C | FF",
              value: 75,
              concealed: true,
              note: "Three even runs · concealed",
            },
          ],
        },
      ],
    },

    2025: {
      year: 2025,
      title: "2025 NMJL Card",
      blurb: "Unofficial placeholders — correct against your licensed 2025 card.",
      categories: [
        {
          id: "year",
          title: "2025",
          hands: [
            {
              id: "2025-a",
              tiles: "2P 0P 2P 5P | 2B 0B 2B 5B | 2C*3 | 5C*3",
              value: 25,
              note: "Year across suits",
            },
            {
              id: "2025-b",
              tiles: "22P | 0000P | 222P | 555P | 25P",
              value: 30,
              concealed: true,
              note: "One suit · concealed",
            },
            {
              id: "2025-c",
              tiles: "2025P | 2025B | FF | NEWS",
              value: 35,
              note: "Two years + F + NEWS",
            },
          ],
        },
        {
          id: "2468",
          title: "2468",
          hands: [
            {
              id: "2468-a",
              tiles: "222P | 444P | 666P | 888P | 88B",
              value: 25,
              note: "One suit even pungs",
            },
            {
              id: "2468-b",
              tiles: "2468P | 2468B | 22C | 44C | 66C",
              value: 30,
              note: "Two runs + pairs",
            },
            {
              id: "2468-c",
              tiles: "22P 44P 66P 88P | FF | 2468B",
              value: 35,
              note: "Pairs + flowers + run",
            },
          ],
        },
        {
          id: "like-numbers",
          title: "Any Like Numbers",
          hands: [
            {
              id: "like-a",
              tiles: "1111P | 1111B | 1111C | 11P",
              value: 30,
              note: "Three kongs + pair",
            },
            {
              id: "like-b",
              tiles: "222P | 222B | 222C | NEWS | F",
              value: 30,
              note: "Like pungs + NEWS",
            },
          ],
        },
        {
          id: "quints",
          title: "Quints",
          hands: [
            {
              id: "quint-a",
              tiles: "11111P | 22222B | 33C | FF",
              value: 40,
              note: "Two quints + pair + F",
            },
            {
              id: "quint-b",
              tiles: "FFFFF | NEWS | 111P | 11P",
              value: 45,
              note: "Flower quint + NEWS",
            },
          ],
        },
        {
          id: "consecutive",
          title: "Consecutive Run",
          hands: [
            {
              id: "run-a",
              tiles: "111P | 222P | 333P | 444P | 55P",
              value: 25,
              note: "One suit",
            },
            {
              id: "run-b",
              tiles: "1234P | 1234B | 1234C | 11P",
              value: 30,
              note: "Matching runs three suits",
            },
            {
              id: "run-c",
              tiles: "1111P | 2222P | 3333P | 44B",
              value: 35,
              note: "Kong run",
            },
          ],
        },
        {
          id: "13579",
          title: "13579",
          hands: [
            {
              id: "odd-a",
              tiles: "111P | 333P | 555P | 777P | 99P",
              value: 25,
              note: "Odd pungs one suit",
            },
            {
              id: "odd-b",
              tiles: "13579P | 13579B | FF | 11C",
              value: 30,
              note: "Two odd runs",
            },
          ],
        },
        {
          id: "winds-dragons",
          title: "Winds — Dragons",
          hands: [
            {
              id: "wd-a",
              tiles: "NEWS | 111P | 111B | 11C | FF",
              value: 25,
              note: "NEWS + like numbers",
            },
            {
              id: "wd-b",
              tiles: "EEEE | SSSS | WWWW | NN",
              value: 40,
              note: "All winds",
            },
            {
              id: "wd-c",
              tiles: "RD RD RD | GD GD GD | WD WD WD | NEWS | F",
              value: 35,
              note: "Dragon pungs + NEWS",
            },
          ],
        },
        {
          id: "369",
          title: "369",
          hands: [
            {
              id: "369-a",
              tiles: "333P | 666P | 999P | 369B | FF",
              value: 25,
              note: "Pungs + 369 run",
            },
            {
              id: "369-b",
              tiles: "369P | 369B | 369C | FF | 33P | F",
              value: 30,
              note: "Three suits + F",
            },
          ],
        },
        {
          id: "singles-pairs",
          title: "Singles and Pairs",
          hands: [
            {
              id: "sp-a",
              tiles: "2025P | 2025B | NEWS | FF",
              value: 50,
              concealed: true,
              note: "No jokers · concealed",
            },
            {
              id: "sp-b",
              tiles: "11P 33P 55P 77P 99P | 11B 33B",
              value: 50,
              concealed: true,
              note: "Odd pairs · concealed",
            },
            {
              id: "sp-c",
              tiles: "NEWS | NEWS | 2025P | DD",
              value: 75,
              concealed: true,
              note: "Placeholder high value · verify",
              verify: true,
            },
          ],
        },
      ],
    },
  },
};

/** Sugar used in card data: expand before Tiles.parseHand */
window.NMJL_NOTATION = {
  /** Map card sugar tokens → tiles.js tokens */
  expandHand(notation) {
    if (!notation) return "";
    return notation
      .trim()
      .split(/\s+/)
      .map((tok) => {
        if (tok === "|") return "|";
        if (/^NEWS$/i.test(tok)) return "NW EW WW SW";
        if (/^D{2,5}$/i.test(tok)) {
          return Array.from({ length: tok.length }, () => "RD").join(" ");
        }
        const windRep = tok.match(/^(E|S|W|N)\1{1,4}$/i);
        if (windRep) {
          const map = { E: "EW", S: "SW", W: "WW", N: "NW" };
          const id = map[windRep[1].toUpperCase()];
          return Array.from({ length: tok.length }, () => id).join(" ");
        }
        if (/^F{2,5}$/i.test(tok)) {
          return Array.from({ length: tok.length }, () => "F").join(" ");
        }
        const yearSuit = tok.match(/^([0-9]+)([BCP])$/i);
        if (yearSuit) {
          const suit = yearSuit[2].toUpperCase();
          return [...yearSuit[1]]
            .map((d) => (d === "0" ? `0${suit}` : `${d}${suit}`))
            .join(" ");
        }
        if (/^[0-9]{3,5}$/.test(tok)) {
          return [...tok].map((d) => (d === "0" ? "0P" : `${d}P`)).join(" ");
        }
        if (/^0[BCP]$/i.test(tok)) return tok.toUpperCase();
        return tok;
      })
      .join(" ");
  },
};
