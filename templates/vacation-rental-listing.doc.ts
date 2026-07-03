import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Vacation Rental Listing',
  description:
    "Airbnb-style vacation-rental listing detail for the fictional Hearthstay platform (coral accent): a 5-photo gradient-art mosaic with a show-all chip that opens a 12-photo Dialog grid, a title row with rating, Hearth Host badge, location, and share/save actions, stay highlights, sleeping-arrangement Cards, an icon amenity grid, a click-to-select July 2026 availability calendar strip, a sticky booking Card whose dates, guests stepper, and nightly breakdown recompute from the selected range (rate × nights + cleaning + service fee = total), a reviews section with rating histogram, category scores, and three review cards, a host card with response stats, and a schematic map placeholder with neighborhood highlights. Choose over product-detail-gallery when the subject is a one-of-a-kind, location-anchored stay booked by dates and guests (fee math, availability, host trust) rather than a SKU with variants, stock, and a cart; choose over booking-availability-picker when date selection is embedded in a property listing with pricing and reviews rather than the page being a host-meeting slot-picking flow.",
  category: 'Startup Showcase',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Dialog',
    'Divider',
    'Icon',
    'IconButton',
    'Layout',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
