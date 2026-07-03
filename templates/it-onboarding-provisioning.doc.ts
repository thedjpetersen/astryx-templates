import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Day-1 Provisioning Status',
  description:
    'IT-side run-time console for new-hire provisioning runs on the Kestrel Labs workforce platform (frozen Fri, Jul 3 2026): a 300px run rail with per-run 9-segment progress tracks (Ava Lindqvist complete 9/9 with a missed-day-1-SLA badge, Ken Tanaka 6 of 9, Ines Ferreira pre-start with 1 failed step), an upcoming-starts list (3 hires in the next 2 weeks with kit-readiness pills), and a pinned SLA strip (98% day-1 ready · 47 of 48 trailing 90 days, median ready-by 18h before start, with the single miss attributed to the GitHub seat-pool failure); the selected run renders a step-chip pipeline with timestamps (account created, email, SSO groups, Slack, GitHub/Salesforce seat, laptop imaged, shipped, MDM enrolled, day-1 check), a failed-step error region (GitHub seat pool exhausted, seat_limit_reached HTTP 422) with working Retry (queues behind the Jul 5 seat release) and Skip (base seat only, add-on to backlog) actions that re-derive every count, dense step rows with actor/duration/notes, and a kit-template chip row diffing the Engineering vs GTM kits (GitHub + Copilot + dev image vs Salesforce seat + standard image, kit-specific steps highlighted); a 340px end panel toggles between the selected step’s mono output log + metadata and the run’s event log. Choose over workflow-studio-canvas when the job is run-time status of live per-hire provisioning runs — step outcomes, failures, retries, SLA — not design-time orchestration of a workflow node graph; choose over scheduled-jobs-manager when rows are one-shot per-hire pipelines keyed to start dates with kit templates, not recurring cron/interval jobs; choose over hr-onboarding-flow when the audience is IT watching automated system steps, not the cross-team human task checklist; choose over it-app-provisioning when the surface is per-hire pipeline execution, not per-app seat and license administration.',
  category: 'Workforce IT',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'MetadataList',
    'SegmentedControl',
    'Selector',
    'StackItem',
    'StatusDot',
    'Text',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
