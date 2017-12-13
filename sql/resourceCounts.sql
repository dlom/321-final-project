select type, sum(total) as total
from (

SELECT   type,
         Sum(rate * how_long) AS total
FROM     Rate
JOIN
         (
                SELECT lhs.type,
                       lhs.building_level,
                       Timestampdiff(second, lhs.end_time, rhs.end_time) AS how_long
                FROM   (
                                SELECT   type,
                                         end_time,
                                         building_level
                                FROM     Action
                                WHERE    end_time < Now()
                                AND      village_id = ?
                                ORDER BY type,
                                         end_time ASC) AS lhs
                JOIN
                       (
                              SELECT type,
                                     end_time,
                                     building_level
                              FROM   Action
                              WHERE  end_time < Now()
                              AND    building_level > 1
                              AND    village_id = ?
                              UNION
                              SELECT   type,
                                       Now(),
                                       Max(building_level) + 1
                              FROM     Action
                              WHERE    end_time < Now()
                              AND      village_id = ?
                              GROUP BY type
                              ORDER BY type,
                                       end_time ASC) AS rhs
                ON     (lhs.type = rhs.type
                AND    lhs.building_level = rhs.building_level - 1)) AS deltas
USING    (building_level)
GROUP BY type

UNION
select distinct type, (select sum(cost) from Action join Cost using (type, building_level) where village_id = ?) as "total" from Action

) as MEGAQUERY

group by type;
