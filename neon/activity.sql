-- Aggregate-only activity: no visitor or session identifiers.
create table if not exists public.portfolio_activity_daily (
  day date not null,
  kind text not null check (kind in ('visit_start','page_time','section_time','project_time','form_open','sky_open','sky_time_change','sky_region_change','sky_weather_change','sky_time')),
  target text not null,
  country_code char(2) not null default 'ZZ' check (country_code ~ '^[A-Z]{2}$'),
  event_count bigint not null default 0,
  duration_seconds bigint not null default 0,
  primary key (day, kind, target, country_code)
);
revoke all on public.portfolio_activity_daily from public;
