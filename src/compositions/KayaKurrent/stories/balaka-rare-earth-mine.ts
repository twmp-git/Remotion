import type { KKStoryEntry } from "../schema";

// Source: Kaya Kurrent Notices and Stories 2026-10-16, item 6 (story only). Published as written.
// Headline shortened to 8 words (was "Rare Earth Mine in Balaka Aims for First Output This Year"). Source line dropped (no links on stories).
// Sources: Lindian Resources release (PR Newswire) http://www.prnewswire.com/news-releases/lindian-resources-kangankunde-rare-earths-project-advances-towards-december-first-production-302910733.html ;
// Business News Australia, 2 July https://www.businessnews.com.au/article/Lindian-fires-first-blast-as-Malawian-rare-earths-mining-kicks-off
// Non-breaking spaces (\u00a0) keep phrases together when the headline wraps.
export const balakaRareEarthMine: KKStoryEntry = {
  slug: "balaka-rare-earth-mine",
  headline: "Balaka Rare\u00a0Earth Mine Aims for First\u00a0Output",
  byline: "By Staff Reporter",
  lede: "An Australian company says its rare earths mine in Balaka District is on track to start producing before the end of 2026.",
  body: [
    "**Lindian Resources** owns the Kangankunde project. Rare earths are a group of minerals used in phones, electric car motors and wind turbines. Demand for them has grown fast around the world.",
    "The company fired its first mining blast in July. That blast broke about 13,100 tonnes of rock, including an estimated 5,500 tonnes of ore. Lorries have since been moving the ore to stockpiles at the site.",
    "By late June, the company said it had built a 27-kilometre power line to the site. It had also reached the halfway point on a dam for mine waste, called a tailings storage facility.",
    "In July, the company said it was targeting October to start up the processing plant and mid-November to finish building it. It aims to produce its first rare earths in the October to December quarter.",
    "A study due in December will look at expanding the mine to 120,000 tonnes of concentrate a year. Any expansion depends on that study and a final decision by the company.",
    "Executive director **Zac Komur** called the first blast 'a defining execution milestone'. He said the company went from building to mining in under 12 months.",
  ],
};
