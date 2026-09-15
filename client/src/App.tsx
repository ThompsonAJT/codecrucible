import { Link, NavLink, Route, Routes } from "react-router-dom";
import ProblemList from "./pages/ProblemList";
import ProblemView from "./pages/ProblemView";
import HelpPage from "./pages/HelpPage";

export default function App() {
  return (
    <>
      <header className="app-header">
        <Link to="/" className="logo">
          CodeCrucible
        </Link>
        <nav className="main-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Problems
          </NavLink>
          <NavLink to="/help" className={({ isActive }) => (isActive ? "active" : "")}>
            Help Me
          </NavLink>
        </nav>
      </header>
      <div className="page">
        <Routes>
          <Route path="/" element={<ProblemList />} />
          <Route path="/problems/:id" element={<ProblemView />} />
          <Route path="/help" element={<HelpPage />} />
        </Routes>
      </div>
    </>
  );
}
