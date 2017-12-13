select count(*) as score from Village join Action using (village_id) where player_id = ? and type = "win" and building_level = 1;
