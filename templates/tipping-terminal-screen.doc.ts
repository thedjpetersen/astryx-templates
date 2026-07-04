import type {AstryxBlockTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'block',
  name: 'Tipping Terminal Screen',
  description:
    'Counter-facing tip prompt for the fictional Counterpoint POS (warm cream hardware surface, single ink accent), shown as two portrait tablet specimens centered on a cream stage: specimen 01 carries the merchant name + $23.40 order-total hero, three big tip tiles (18% / 20% / 25% with computed dollar amounts; the selected tile fills with the ink accent), No tip and Custom tiles, a live new-total preview bar that reconciles with the selection ($28.08 at 20%), a split-payment link, a signature strip with a placeholder squiggle and Clear link, and a "server looks away" privacy hint chip; specimen 02 freezes the custom-tip numpad state with cents-style amount entry ($5.00 → $28.40 new total), a 3x4 keypad with backspace, and Apply/Back actions. Choose over hosted-checkout-flow when the surface is the in-person payment-terminal tip screen a customer taps at the counter, not a PSP-hosted web payment page with card fields; choose over cart-checkout-flow when there is no cart, shipping, or multi-step review — just tip selection and signature on an existing order total.',
  category: 'Startup Showcase',
  componentsUsed: ['Heading', 'HStack', 'Icon', 'Text', 'VStack'],
} satisfies AstryxBlockTemplate;

export default template;
