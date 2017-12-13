INSERT INTO Cost (type, building_level, cost, time) VALUES
  ("iron", 1, 0, 0),
  ("iron", 2, -10, 3),
  ("iron", 3, -40, 6),
  ("iron", 4, -180, 13),
  ("iron", 5, -600, 24),
  ("iron", 6, -2400, 49),
  ("iron", 7, -7800, 88),
  ("iron", 8, -25200, 159),
  ("iron", 9, -61200, 247),
  ("iron", 10, -198000, 445),
  ("wood", 1, 0, 0),
  ("wood", 2, -10, 3),
  ("wood", 3, -40, 6),
  ("wood", 4, -180, 13),
  ("wood", 5, -600, 24),
  ("wood", 6, -2400, 49),
  ("wood", 7, -7800, 88),
  ("wood", 8, -25200, 159),
  ("wood", 9, -61200, 247),
  ("wood", 10, -198000, 445),
  ("hq", 1, 0, 0),
  ("hq", 2, -1200, 600),
  ("hq", 3, -6000, 1200),
  ("hq", 4, -23400, 1800),
  ("hq", 5, -81600, 2400),
  ("win", 0, 0, 0),
  ("win", 1, 320000, 86400);

INSERT INTO Rate (building_level, rate) VALUES
  (0, 0),
  (1, 1),
  (2, 2),
  (3, 3),
  (4, 5),
  (5, 8),
  (6, 13),
  (7, 21),
  (8, 34),
  (9, 55),
  (10, 89);

INSERT INTO Multiplier (building_level, multiplier) VALUES
  (1, 1),
  (2, 1.25),
  (3, 1.5),
  (4, 1.75),
  (5, 2);