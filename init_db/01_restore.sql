--CREATE USER gilee PASSWORD '1234' SUPERUSER;

CREATE DATABASE transcendence;


ALTER DATABASE transcendence OWNER TO gilee;

\connect transcendence

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: gilee
--

--CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO gilee;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: gilee
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: achievements; Type: TABLE; Schema: public; Owner: gilee
--

CREATE TABLE public.achievements (
    id integer NOT NULL,
    title character varying(20) NOT NULL,
    content character varying(50) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.achievements OWNER TO gilee;

--
-- Name: achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: gilee
--

CREATE SEQUENCE public.achievements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.achievements_id_seq OWNER TO gilee;

--
-- Name: achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gilee
--

ALTER SEQUENCE public.achievements_id_seq OWNED BY public.achievements.id;


--
-- Name: blocks; Type: TABLE; Schema: public; Owner: gilee
--

CREATE TABLE public.blocks (
    "sourceId" integer NOT NULL,
    "targetId" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.blocks OWNER TO gilee;

--
-- Name: follows; Type: TABLE; Schema: public; Owner: gilee
--

CREATE TABLE public.follows (
    "sourceId" integer NOT NULL,
    "targetId" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.follows OWNER TO gilee;

--
-- Name: game_logs; Type: TABLE; Schema: public; Owner: gilee
--

CREATE TABLE public.game_logs (
    id integer NOT NULL,
    "playerAId" integer NOT NULL,
    "playerBId" integer NOT NULL,
    result smallint NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.game_logs OWNER TO gilee;

--
-- Name: game_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: gilee
--

CREATE SEQUENCE public.game_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.game_logs_id_seq OWNER TO gilee;

--
-- Name: game_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gilee
--

ALTER SEQUENCE public.game_logs_id_seq OWNED BY public.game_logs.id;


--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: gilee
--

CREATE TABLE public.user_achievements (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "achievementId" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_achievements OWNER TO gilee;

--
-- Name: user_achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: gilee
--

CREATE SEQUENCE public.user_achievements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_achievements_id_seq OWNER TO gilee;

--
-- Name: user_achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gilee
--

ALTER SEQUENCE public.user_achievements_id_seq OWNED BY public.user_achievements.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: gilee
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(10) NOT NULL,
    "displayName" character varying(20) NOT NULL,
    email character varying(100) NOT NULL,
    "imagePath" character varying(255) DEFAULT ''::character varying NOT NULL,
    "twoFactor" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO gilee;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: gilee
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO gilee;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gilee
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: achievements id; Type: DEFAULT; Schema: public; Owner: gilee
--

ALTER TABLE ONLY public.achievements ALTER COLUMN id SET DEFAULT nextval('public.achievements_id_seq'::regclass);


--
-- Name: game_logs id; Type: DEFAULT; Schema: public; Owner: gilee
--

ALTER TABLE ONLY public.game_logs ALTER COLUMN id SET DEFAULT nextval('public.game_logs_id_seq'::regclass);


--
-- Name: user_achievements id; Type: DEFAULT; Schema: public; Owner: gilee
--

ALTER TABLE ONLY public.user_achievements ALTER COLUMN id SET DEFAULT nextval('public.user_achievements_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: gilee
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);



SELECT pg_catalog.setval('public.achievements_id_seq', 1, false);


--
-- Name: game_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gilee
--

SELECT pg_catalog.setval('public.game_logs_id_seq', 1, false);


--
-- Name: user_achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gilee
--

SELECT pg_catalog.setval('public.user_achievements_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gilee
--

SELECT pg_catalog.setval('public.users_id_seq', 6745, true);


--
-- Name: achievements PK_1bc19c37c6249f70186f318d71d; Type: CONSTRAINT; Schema: public; Owner: gilee
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT "PK_1bc19c37c6249f70186f318d71d" PRIMARY KEY (id);


--
-- Name: game_logs PK_282d4487c41440a491e890d80b6; Type: CONSTRAINT; Schema: public; Owner: gilee
--

ALTER TABLE ONLY public.game_logs
    ADD CONSTRAINT "PK_282d4487c41440a491e890d80b6" PRIMARY KEY (id);


--
-- Name: follows PK_2ff03dffb7e539f00622b23420d; Type: CONSTRAINT; Schema: public; Owner: gilee
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT "PK_2ff03dffb7e539f00622b23420d" PRIMARY KEY ("sourceId", "targetId");


--
-- Name: user_achievements PK_3d94aba7e9ed55365f68b5e77fa; Type: CONSTRAINT; Schema: public; Owner: gilee
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT "PK_3d94aba7e9ed55365f68b5e77fa" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: gilee
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: blocks PK_f75a17ece8f1fa53b4f48d23053; Type: CONSTRAINT; Schema: public; Owner: gilee
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT "PK_f75a17ece8f1fa53b4f48d23053" PRIMARY KEY ("sourceId", "targetId");


--
-- Name: blocks FK_01b959ba2ef462cfa8d55f2860f; Type: FK CONSTRAINT; Schema: public; Owner: gilee
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT "FK_01b959ba2ef462cfa8d55f2860f" FOREIGN KEY ("sourceId") REFERENCES public.users(id);


--
-- Name: game_logs FK_1c1e891b481a04c70065a7285e7; Type: FK CONSTRAINT; Schema: public; Owner: gilee
--

ALTER TABLE ONLY public.game_logs
    ADD CONSTRAINT "FK_1c1e891b481a04c70065a7285e7" FOREIGN KEY ("playerBId") REFERENCES public.users(id);


--
-- Name: user_achievements FK_3ac6bc9da3e8a56f3f7082012dd; Type: FK CONSTRAINT; Schema: public; Owner: gilee
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT "FK_3ac6bc9da3e8a56f3f7082012dd" FOREIGN KEY ("userId") REFERENCES public.users(id);


--
-- Name: user_achievements FK_6a5a5816f54d0044ba5f3dc2b74; Type: FK CONSTRAINT; Schema: public; Owner: gilee
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT "FK_6a5a5816f54d0044ba5f3dc2b74" FOREIGN KEY ("achievementId") REFERENCES public.achievements(id);


--
-- Name: follows FK_6db43682ccd3d22e612ef362cff; Type: FK CONSTRAINT; Schema: public; Owner: gilee
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT "FK_6db43682ccd3d22e612ef362cff" FOREIGN KEY ("sourceId") REFERENCES public.users(id);


--
-- Name: game_logs FK_8fd5d8089160d83cf0ecba8b44c; Type: FK CONSTRAINT; Schema: public; Owner: gilee
--

ALTER TABLE ONLY public.game_logs
    ADD CONSTRAINT "FK_8fd5d8089160d83cf0ecba8b44c" FOREIGN KEY ("playerAId") REFERENCES public.users(id);


--
-- Name: follows FK_d80d4f5243277d90a956dba86cf; Type: FK CONSTRAINT; Schema: public; Owner: gilee
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT "FK_d80d4f5243277d90a956dba86cf" FOREIGN KEY ("targetId") REFERENCES public.users(id);


--
-- Name: blocks FK_f908fcd508004eaaeee5218d0b1; Type: FK CONSTRAINT; Schema: public; Owner: gilee
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT "FK_f908fcd508004eaaeee5218d0b1" FOREIGN KEY ("targetId") REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

