import { Link, NavLink, To } from "react-router-dom";
import usePage from "../../../1_application/page/usePage";
import styles from "./Header.module.css";

const Header: React.FC = () => {
  const pageController = usePage();

  const links = pageController.pages.map((p) => (
    <li key={p.label}>
      <TransNavLink to={p.to}>{p.label}</TransNavLink>
    </li>
  ));

  return (
    <header className={styles.header}>
      <Link to="/">
        <div className={styles.logo}>트랜센던스</div>
      </Link>
      <nav>
        <ul>{links}</ul>
      </nav>
    </header>
  );
};

type TransNavLinkProps = {
  children?: React.ReactNode;
  to: To;
};

const TransNavLink: React.FC<TransNavLinkProps> = (props) => {
  return (
    <NavLink
      to={props.to}
      className={({ isActive }) => (isActive ? styles.active : "")}
    >
      {props.children}
    </NavLink>
  );
};

export default Header;
