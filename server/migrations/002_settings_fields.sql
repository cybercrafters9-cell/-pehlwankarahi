-- Migration 002: Add extended settings fields for order acceptance, announcements, timings, and free delivery threshold

ALTER TABLE settings ADD is_accepting_orders TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE settings ADD announcement_enabled TINYINT(1) NOT NULL DEFAULT 1;
ALTER TABLE settings ADD opening_time VARCHAR(50) NOT NULL DEFAULT '12:00 PM';
ALTER TABLE settings ADD closing_time VARCHAR(50) NOT NULL DEFAULT '02:00 AM';
ALTER TABLE settings ADD free_delivery_threshold INT NOT NULL DEFAULT 3000;
