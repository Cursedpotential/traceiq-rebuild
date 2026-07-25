# TraceIQ — Live Map

{% range_calendar id="map_dates" /%}

```sql visits_in_range
select lat, lng,
       count(*) as visits,
       count(*) filter (where overnight_simple) as overnights,
       min(start_eastern)::date as first_seen,
       max(start_eastern)::date as last_seen
from analysis.latest_events
where event_type = 'visit' and lat is not null
  and start_eastern::date {{map_dates.between}}
group by lat, lng
```

{% map title="Visits in selected range" height=560 %}
    {% point_layer
        data="visits_in_range"
        lat="lat" lng="lng"
        size_value="visits"
        color_value="overnights"
        color_palette=["#dbeafe", "#93c5fd", "#3b82f6", "#1d4ed8", "#7c2d12"]
        tooltip=["visits", "overnights", "first_seen", "last_seen"]
    /%}
{% /map %}

## Density view (same range)

```sql waypoints_in_range
select w.lat, w.lng
from working.waypoint w
join analysis.latest_events e using (event_id)
where (w.ts_utc at time zone 'America/Detroit')::date {{map_dates.between}}
```

{% map title="Movement density" height=460 %}
    {% heatmap_layer data="waypoints_in_range" lat="lat" lng="lng" /%}
{% /map %}

## Unrecorded-stop candidates in range

```sql dwell_in_range
select serial_display, eastern, lat, lng, gap_minutes
from analysis.dwell_stops
where eastern::date {{map_dates.between}}
order by gap_minutes desc limit 200
```

{% map title="GPS went quiet here (dwell candidates)" height=460 %}
    {% point_layer data="dwell_in_range" lat="lat" lng="lng"
       color_value="gap_minutes" tooltip=["serial_display", "eastern", "gap_minutes"] /%}
{% /map %}
