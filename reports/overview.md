# TraceIQ — Corpus Overview

```sql stats
select count(*) as events,
       count(distinct place_id) as places,
       count(*) filter (where overnight_simple) as overnights,
       min(start_eastern)::date as first_day,
       max(start_eastern)::date as last_day
from analysis.latest_events
```

{% big_value data="stats" value="events" title="Events (deduped)" /%}
{% big_value data="stats" value="places" title="Distinct places" /%}
{% big_value data="stats" value="overnights" title="Overnight events" /%}
{% big_value data="stats" value="first_day" title="First day" /%}
{% big_value data="stats" value="last_day" title="Last day" /%}

## Monthly coverage (gap hunting)

```sql monthly
select (month || '-01')::date as month_start, events, days_with_data
from analysis.monthly_coverage
order by month_start
```

{% bar_chart data="monthly" x="month_start" y="days_with_data"
   title="Days with data per month — holes are the story" /%}

{% callout status="warning" %}
Known gaps: 2017-11 → 2018-01 and the nine-month block 2020-04 → 2021-01.
See VALIDATION_REPORT.md finding #1 — build the explanation lane before opposing counsel asks.
{% /callout %}

## Event mix

```sql mix
select raw_type, count(*) as n from analysis.latest_events group by 1 order by 2 desc
```

{% bar_chart data="mix" x="raw_type" y="n" swap_x_y=true title="Events by Google type" /%}
