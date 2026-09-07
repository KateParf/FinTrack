import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export function Navbar() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        signOut();
        navigate("/login");
    }

    return (
        <nav className="navbar d-flex flex-column align-items-start vh-100 fs-5 border-end">
            <Link className="navbar-brand ps-2 fs-3 w-100" to="/"><span style={{ color: '#68904D' }}>Fin</span>Track</Link>
            <ul className="navbar-nav ps-2 gap-3 w-100">
                <li className="nav-item"><Link className="nav-link" to="/">Главная</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/accounts">Счета</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/categories">Категории</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/saving-goals">Накопления</Link></li>
            </ul>
            <ul className="navbar-nav w-100 border-top">
                <li className="nav-item ps-2 "><button className="nav-link" onClick={handleLogout}>Выйти</button></li>
            </ul>
        </nav>
    )
}