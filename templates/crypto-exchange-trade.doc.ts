import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Exchange Trading View',
  description:
    'Crypto exchange trading desk for the fictional Meridian Markets (cyan accent on a scheme-locked dark stage): a pair header with SOL-USD last price, signed 24h delta, and high/low/volume chips derived from the chart series; an SVG candlestick chart with labeled price/time axes, volume band, dashed last-price line, and a 15m/1H/4H/1D interval SegmentedControl; an order book column with red asks and green bids whose cumulative depth bars meet at a spread row; a recent-trades ticker column; a trade ticket card with Buy/Sell tabs, Market/Limit SegmentedControl, amount input with 25/50/75/Max chips, maker/taker fee breakdown, and a cyan confirm CTA; plus an open-orders strip with a 43% partially-filled order and working Cancel buttons. Choose over portfolio-holdings when the surface is a live exchange trading venue — order book, tape, and order entry around one market — rather than a brokerage portfolio of owned positions, allocation, and watchlists.',
  category: 'Startup Showcase',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Icon',
    'IconButton',
    'Layout',
    'ProgressBar',
    'SegmentedControl',
    'Text',
    'TextInput',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
