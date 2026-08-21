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
 * @property {string|string[]} tiles - one hand, or several alternates (same card, shown with “-or-”)
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
      title: "2026 NMJL Cheatsheet",
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
              note: "Soap as 0.  Any 2 Suits",
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
              value: 25,
              note: "Any 3 Suits",
            },
            {
              id: "2026-d",
              tiles: "22B | 00P | 222C | 666C | NEWS",
              value: 30,
              concealed: true,
              note: "Any 2 Suits",
            },
          ],
        },
        {
          id: "2468",
          title: "2468",
          hands: [
            {
              id: "2468-a",
              tiles: [
                "222P | 444P | 6666P | 8888P",
                "222B | 444B | 6666C | 8888C",
              ],
              value: 25,
              note: "Any 1 or 2 Suits",
            },
            {
              id: "2468-b",
              tiles: "F*2 | 2222B | 4466C | 8888B",
              value: 30,
              note: "Any 2 Suits",
            },
            {
              id: "2468-c",
              tiles: "EW*2 | 22P | 444P | 666P | 88P | WW*2",
              value: 30,
              note: "Any 1 Suit, East and West Only",
            },
            {
              id: "2468-d",
              tiles: "2222B | BD*3 | 8888C | RD*3",
              value: 25,
              note: "Any 2 Suits w Matching Dragons, These Nos. Only",
            },
            {
              id: "2468-e",
              tiles: "F*3 | 22P | 44P | 666P | 8888P",
              value: 25,
              note: "Any 1 suit",
            },
            {
              id: "2468-f",
              tiles: "2468B | 2222C | RD | 2222P | PD",
              value: 25,
              note: "Any 3 Suits, Like Kongs 2, 4, 5, 6, or 8",
            },
            {
              id: "2468-g",
              tiles: "F*3 | 2468B | F*3 | 2222C",
              value: 30,
              note: "Any 2 Suits, Kong 2, 4, 6, 8",
            },
            {
              id: "2468-h",
              tiles: "F*2 | 246B | 888B | 246C | 888C",
              value: 30,
              concealed: true,
              note: "Any 2 Suits",
            },
          ],
        },
        {
          id: "like-numbers",
          title: "Any Like Numbers",
          hands: [
            {
              id: "like-a",
              tiles: "1B*4 | F*6 | 1C*4",
              value: 30,
              note: "Any 2 Suits",
            },
            {
              id: "like-b",
              tiles: "1B*4 | BD | 1C*3 | RD | 1P*4 | PD",
              value: 25,
              note: "Any 2 Suits",
            },
            {
              id: "like-c",
              tiles: "F*2 | 1B*4 | 11C | 1P*4 | BD*2",
              value: 25,
              note: "Any 3 Suits w Any Dragon",
            },
          ],
        },
        {
          id: "quints",
          title: "Quints",
          hands: [
            {
              id: "quint-a",
              tiles: "1B*5 | 1C*4 | 1P*5",
              value: 40,
              note: "Any 3 Suits, Any Like Nos.",
            },
            {
              id: "quint-b",
              tiles: "F*2 | 1P*5 | 22P | 3P*5",
              value: 45,
              note: "Any 1 Suits Any 3 Consec. Nos.",
            },
            {
              id: "quint-c",
              tiles: "1B*5 | 4B*5 | RD*4",
              value: 40,
              note: "Any 2 Nos. in Any 1 Suit w Opp. Dragon",
            },
          ],
        },
        {
          id: "consecutive",
          title: "Consecutive Run",
          hands: [
            {
              id: "run-a",
              tiles: [
                "11P | 2P*3 | 33P | 4P*3 | 5P*4",
                "55P | 6P*3 | 77P | 8P*3 | 9P*4",
              ],
              value: 25,
              note: "Any 1 Suit, These Nos. only",
            },
            {
              id: "run-b",
              tiles: [
                "F*3 | 1P*4 | 234P | 5P*4",
                "F*3 | 1B*4 | 234C | 5B*4",
              ],
              value: 25,
              note: "Any 1 or 2 Suits, Any 5 Consec. Nos.",
            },
            {
              id: "run-c",
              tiles: "11B | 22B | 1C*3 | 2C*3 | 3P*4",
              value: 25,
              note: "Any 3 Suits, Any 3 Consec. Nos.",
            },
            {
              id: "run-d",
              tiles: [
                "1P*3 | 2P*3 | 3P*4 | 4P*4",
                "1B*3 | 2B*3 | 3C*4 | 4C*4",
              ],
              value: 25,
              note: "Any 1 or 2 Suits, Any 4 Consec. Nos.",
            },
            {
              id: "run-e",
              tiles: [
                "F*3 | 11P | 22P | 3P*3 | PD*4",
                "F*3 | 11B | 22C | 3B*3 | RD*4",
              ],
              value: 25,
              note: "1 or 2 Suits, Any Run, Ds Match Middle No",
            },
            {
              id: "run-f",
              tiles: "1P*4 | F*6 | 2P*4",
              value: 30,
              note: "Any 1 Suit, Any 2 Consec. Nos.",
            },
            {
              id: "run-g",
              tiles: [
                "F*2 | 1P*4 | 2P*4 | 3P*4",
                "F*2 | 1B*4 | 2C*4 | 3P*4",
              ],
              value: 25,
              note: "Any 1 or 3 Suits, Any 3 Consec. Nos.",
            },
            {
              id: "run-h",
              tiles: "1B | 22B | 3B*3 | 1C | 22C | 3C*3 | 44P",
              value: 35,
              concealed: true,
              note: "Any 3 Suits, Any 4 Consec. Nos.",
            },
          ],
        },
        {
          id: "13579",
          title: "13579",
          hands: [
            {
              id: "odd-a",
              tiles: [
                "11P | 3P*3 | 55P | 7P*3 | 9P*4",
                "11B | 3B*3 | 55C | 7C*3 | 9P*4",
              ],
              value: 25,
              note: "Any 1 or 3 Suits",
            },
            {
              id: "odd-b",
              tiles: [
                "1B*3 | 3B*3 | 3C*4 | 5C*4",
                "5B*3 | 7B*3 | 7C*4 | 9C*4",
              ],
              value: 25,
              note: "Any 2 Suits",
            },
            {
              id: "odd-c",
              tiles: [
                "NW*2 | 1P*4 | 33P | 5P*4 | SW*2",
                "NW*2 | 5P*4 | 77P | 9P*4 | SW*2",
              ],
              value: 30,
              note: "Any 1 Suit, North and South Only",
            },
            {
              id: "odd-d",
              tiles: "11B | 3579B | 1C*4 | 1P*4",
              value: 25,
              note: "Any 3 Suits, Pair Any Odd., Kongs Match Pair",
            },
            {
              id: "odd-e",
              tiles: [
                "F*3 | 11P | 33P | 5P*3 | PD*4",
                "F*3 | 55P | 77P | 9P*3 | PD*4",
              ],
              value: 25,
              note: "Any 1 Suite w Matching Dragon",
            },
            {
              id: "odd-f",
              tiles: [
                "11B | 33B | 1C*3 | 3C*3 | 5P*4",
                "55B | 77B | 5C*3 | 7C*3 | 9P*4",
              ],
              value: 25,
              note: "Any 3 Suits",
            },
            {
              id: "odd-g",
              tiles: [
                "1P*4 | 33P | 55P | 77P | 9P*4",
                "1B*4 | 33C | 55C | 77C | 9B*4",
              ],
              value: 30,
              note: "Any 1 or 2 Suits",
            },
            {
              id: "odd-h",
              tiles: [
                "F*2 | 11B | 33B | 55B | 1C*3 | 1P*3",
                "F*2 | 55B | 77B | 99B | 5C*3 | 5P*3",
              ],
              value: 35,
              concealed: true,
              note: "Any 3 Suits, These Nos. Only",
            },
            {
              id: "odd-i",
              tiles: "F*2 | 135B | 7B*3 | 9B*3 | RD*3",
              value: 30,
              concealed: true,
              note: "Any 1 Suit w Opp. Dragon",
            },
          ],
        },
        {
          id: "winds-dragons",
          title: "Winds — Dragons",
          hands: [
            {
              id: "wd-a",
              tiles: [
                "NW*4 | EW*3 | WW*3 | SW*4",
                "NW*3 | EW*4 | WW*4 | SW*3",
              ],
              value: 25,
              note: "Only These Winds",
            },
            {
              id: "wd-b",
              tiles: "1234P | BD*3 | RD*3 | PD*4",
              value: 25,
              note: "Any 4 Consec. Nos. in Any Suit, And 3 Dragons",
            },
            {
              id: "wd-c",
              tiles: "NW*3 | 1B*4 | 1C*4 | SW*3",
              value: 25,
              note: "Any Like Odd Nos. in Any 2 Suits",
            },
            {
              id: "wd-d",
              tiles: "EW*3 | 2B*4 | 2C*4 | WW*3",
              value: 25,
              note: "Any Like Even Nos. in Any 2 Suits",
            },
            {
              id: "wd-e",
              tiles: "F*3 | NW*4 | F*3 | PD*4",
              value: 25,
              note: "Any Wind, Any Dragon",
            },
            {
              id: "wd-f",
              tiles: "1P | NW | 2P | EW*2 | 3P | WW*3 | 4P | SW*4",
              value: 25,
              note: "Any 1 Suit, These Nos. Only",
            },
            {
              id: "wd-g",
              tiles: [
                "F*2 | NW*4 | SW*4 | BD*2 | RD*2",
                "F*2 | EW*4 | WW*4 | BD*2 | RD*2",
              ],
              value: 25,
              note: "Any 2 Dragons",
            },
            {
              id: "wd-h",
              tiles: "NW*2 | EW*3 | 2026P | WW*3 | SW*2",
              value: 30,
              concealed: true,
              note: "2026 Any 1 Suit",
            },
          ],
        },
        {
          id: "369",
          title: "369",
          hands: [
            {
              id: "369-a",
              tiles: [
                "3B*3 | 6B*3 | 6C*4 | 9C*4",
                "3B*3 | 6B*3 | 6C*4 | 9P*4",
              ],
              value: 25,
              note: "Any 2 or 3 Suits",
            },
            {
              id: "369-b",
              tiles: "33B | 66B | 3C*3 | 6C*3 | 9P*4",
              value: 25,
              note: "Any 3 Suits",
            },
            {
              id: "369-c",
              tiles: [
                "F*3 | 33P | 6P*3 | 99P | PD*4",
                "F*3 | 33B | 6B*3 | 99B | RD*4",
              ],
              value: 25,
              note: "1 Suit w Matching or Opp. Dragon",
            },
            {
              id: "369-d",
              tiles: "33B | 66B | 6C*3 | 9C*3 | NEWS",
              value: 30,
              note: "Any 2 Suits",
            },
            {
              id: "369-e",
              tiles: "F*2 | 33B | 6B | 9B | 3C*4 | 3P*4",
              value: 25,
              note: "Any 3 Suits, Pair 3, , or 9, Kongs Match Pair",
            },
            {
              id: "369-f",
              tiles: "F*2 | 3B*3 | 6B*3 | 9B*3 | 369C",
              value: 30,
              concealed: true,
              note: "Any 2 Suits",
            },
          ],
        },
        {
          id: "singles-pairs",
          title: "Singles and Pairs",
          hands: [
            {
              id: "sp-a",
              tiles: "NW*2 | EW*2 | WW*2 | SW*2 | 1B | BD | 1C | RD | 1P | PD",
              value: 50,
              concealed: true, 
              note: "Any 3 Suits, Any Like Nos. w Matching Dragon",
            },
            {
              id: "sp-b",
              tiles: "2B | 4B | 66B | 88B | 2C | 4C | 66C | 88C | 88P",
              value: 50,
              concealed: true,
              note: "Any 3 Suits, These Nos. Only",
            },
            {
              id: "sp-c",
              tiles: "F*2 | 33B | 6B | 9B | 3C | 66C | 9C | 369P | 9P",
              value: 50,
              concealed: true,
              note: "Any 3 Suits",
            },
            {
              id: "sp-d",
              tiles: "11P | 22P | 33P | 44P | 55P | 66P | 77P",
              value: 50,
              concealed: true,
              note: "Any 1 Suit, Any 7 Consec. Nos.",
            },
            {
              id: "sp-e",
              tiles: "11B | 357B | 99B | 11C | 357C | 99C",
              value: 50,
              concealed: true,
              note: "Any 2 Suits",
            },
            {
              id: "sp-f",
              tiles: "F*2 | 2026B | 2026C | 2026P",
              value: 75,
              concealed: true,
              note: "Any 3 Suits",
            },
          ],
        },
      ],
    },

    2025: {
      year: 2025,
      title: "2025 NMJL Cheatsheet",
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
