import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Distributed Trace Waterfall',
  description:
    'Spanline APM trace view for one distributed request (POST /api/v1/checkout, 21 spans across 5 services): a trace header with mono trace-id chip (copy + toast), total duration, service/span counts, and an error badge; a p50/p95/p99 endpoint-latency strip with this trace marked on the same ms scale; the span waterfall — depth-indented rows with collapse chevrons, service color keys, right-aligned mono durations, and proportional bars over shared 100 ms gridlines, one failed psp.authorize span painted red with its successful retry child beneath; an end-panel span inspector with service/kind/status chips, a timing breakdown (start offset, % of trace, self-vs-child stacked bar with jump-to-child buttons), a key/value tags table, and the error stack excerpt in a CodeBlock; plus a 5-node service-map mini graph whose latency edges are computed from the same spans and whose nodes filter the waterfall, and a per-service self-time breakdown that sums exactly to the trace total. Choose over cpu-flame-graph when the subject is ONE DISTRIBUTED REQUEST across services on a wall-clock timeline (spans, retries, RPC edges), not CPU time by stack depth in a single process; over query-plan-profiler when rows are RPC/DB spans of a live trace, not query plan operators with cost estimates.',
  category: 'Startup Showcase',
  componentsUsed: [
    'Badge',
    'Button',
    'CodeBlock',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'LayoutPanel',
    'StackItem',
    'Table',
    'Text',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
