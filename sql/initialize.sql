-- drop table if exists Action;
-- drop table if exists Village;
-- drop table if exists Player;

-- drop table if exists Cost;
-- drop table if exists Rate;
-- drop table if exists Multiplier;

create table if not exists Rate (
  building_level int unsigned not null,
  rate int unsigned not null
);

create table if not exists Cost (
  type varchar(20) not null,
  building_level int unsigned not null,
  cost int not null,
  time int unsigned not null,
  primary key (type, building_level)
);

create table if not exists Multiplier (
  building_level int unsigned not null,
  multiplier double not null
);

create table if not exists Player (
  player_id int unsigned not null auto_increment,
  name varchar(20) not null,
  primary key (player_id)
);

create table if not exists Village (
  village_id int unsigned not null auto_increment,
  player_id int unsigned not null,
  name varchar(20) not null,
  x_coord double not null,
  y_coord double not null,
  primary key (village_id),
  foreign key (player_id) references Player(player_id)
);

create table if not exists Action (
  action_id int unsigned not null auto_increment,
  village_id int unsigned not null,
  end_time datetime not null,
  type varchar(20) not null,
  building_level int unsigned not null,
  primary key (action_id),
  foreign key (village_id) references Village(village_id),
  foreign key (type, building_level) references Cost(type, building_level)
);
