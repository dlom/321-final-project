SELECT cost,
       floor(time / (SELECT max(multiplier)
                     FROM   Action
                            JOIN Multiplier using (building_level)
                     WHERE  type = "hq"
                            AND village_id = ?)) AS time
FROM   Cost
WHERE  type = ?
       AND building_level = ?;
