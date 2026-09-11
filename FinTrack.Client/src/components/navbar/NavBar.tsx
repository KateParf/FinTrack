import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { BoxArrowRight, PersonCircle } from "react-bootstrap-icons";

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
            <div className="w-100 pe-0">
                <ul className="ps-2">
                    {user && (
                        <Link className="nav-link d-flex align-items-center gap-2 mb-2" to="/profile">
                            <PersonCircle className="fs-3" />
                            <div>
                                <div className="fw-semibold">{user.name}</div>
                                <div className="small text-secondary">Профиль</div>
                            </div>
                        </Link>
                    )}
                </ul>
                <ul className="ps-2 border-top">
                    <button className="nav-link d-flex align-items-center gap-2 pt-1"
                        type="button" onClick={() => void handleLogout()}>Выйти
                    </button>
                </ul>
            </div>
        </nav>
    )
}