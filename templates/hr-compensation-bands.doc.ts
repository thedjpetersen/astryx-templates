import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Compensation Bands',
  description:
    'Comp-admin band explorer for a workforce platform (Kestrel Labs, 140 people): an app-shell frame whose defining region is a level × geo band matrix Table (L3–L7 rows; SF HQ, Lisbon, Remote-US columns) of clickable min/mid/max cells with in-band headcount chips that reconcile to the 52-person Engineering ladder; selecting a cell drives a band range bar on one shared %-of-domain scale — band fill between labeled min/mid/max axis marks, dashed market-percentile ticks (P25/P50/P75 from a fictional Meridian survey), and employee-placement dot buttons with the below-band outlier flagged red in a tinted below-min zone; a 340px band-detail end panel lists band metadata (spread, geo factor, mid vs P50), percentile markers, and the in-band employees with compa-ratio Tokens; a proposed-adjustment queue (2 pending band-driven raises with approve/deny — approving moves the dot and recomputes compa) and a pinned market-data-refresh footer (source, refresh date, band effective date) complete the surface; header carries a job-family Selector with honest empty states for unpublished ladders. Choose over hr-employee-profile when the job is administering the band structure across levels and geos (and deciding band-driven adjustments), not reading one person’s record; over hr-headcount-planning when the money is pay-range policy rather than hiring-plan budget vs actuals; over review-cycle-calibration when the surface is comp-band governance, not performance calibration; over expense-approval-queue when the approvals are salary adjustments against bands, not expense reports.',
  category: 'Workforce HR',
  componentsUsed: [
    'Avatar',
    'Button',
    'Divider',
    'EmptyState',
    'Heading',
    'Icon',
    'Layout',
    'MetadataList',
    'Selector',
    'Table',
    'Text',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
