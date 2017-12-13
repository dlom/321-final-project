insert into Action (village_id, end_time, type, building_level) VALUES (?, timestampadd(second, ?, now()), ?, ?);
