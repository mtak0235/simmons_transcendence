CREATE DATABASE transcendence;

ALTER DATABASE transcendence OWNER TO gilee;

\connect transcendence

ALTER SCHEMA public OWNER TO gilee;

CREATE TABLE public.follows ("sourceId" integer NOT NULL, "targetId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2ff03dffb7e539f00622b23420d" PRIMARY KEY ("sourceId", "targetId"));
CREATE TABLE public.blocks ("sourceId" integer NOT NULL, "targetId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f75a17ece8f1fa53b4f48d23053" PRIMARY KEY ("sourceId", "targetId"));
CREATE TABLE public.game_logs ("id" SERIAL NOT NULL, "playerAId" integer NOT NULL, "playerBId" integer NOT NULL, "result" smallint NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_282d4487c41440a491e890d80b6" PRIMARY KEY ("id"));
CREATE TABLE public.achievements ("id" SERIAL NOT NULL, "title" character varying(20) NOT NULL, "content" character varying(50) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bc19c37c6249f70186f318d71d" PRIMARY KEY ("id"));
CREATE TABLE public.user_achievements ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "achievementId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3d94aba7e9ed55365f68b5e77fa" PRIMARY KEY ("id"));
CREATE TABLE public.users ("id" SERIAL NOT NULL, "username" character varying(10) NOT NULL, "displayName" character varying(20) NOT NULL, "email" character varying(100) NOT NULL, "imagePath" character varying(255) NOT NULL DEFAULT '', "twoFactor" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"));
ALTER TABLE public.follows ADD CONSTRAINT "FK_6db43682ccd3d22e612ef362cff" FOREIGN KEY ("sourceId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE public.follows ADD CONSTRAINT "FK_d80d4f5243277d90a956dba86cf" FOREIGN KEY ("targetId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE public.blocks ADD CONSTRAINT "FK_01b959ba2ef462cfa8d55f2860f" FOREIGN KEY ("sourceId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE public.blocks ADD CONSTRAINT "FK_f908fcd508004eaaeee5218d0b1" FOREIGN KEY ("targetId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE public.game_logs ADD CONSTRAINT "FK_8fd5d8089160d83cf0ecba8b44c" FOREIGN KEY ("playerAId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE public.game_logs ADD CONSTRAINT "FK_1c1e891b481a04c70065a7285e7" FOREIGN KEY ("playerBId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE public.user_achievements ADD CONSTRAINT "FK_3ac6bc9da3e8a56f3f7082012dd" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE public.user_achievements ADD CONSTRAINT "FK_6a5a5816f54d0044ba5f3dc2b74" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;