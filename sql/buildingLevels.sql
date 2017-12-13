select type, max(building_level) as building_level from Action where village_id = ? and end_time < now() group by type;
