import "../styles/landing.css";
import { useNavigate } from "react-router-dom";

function Landing() {
    const navigate = useNavigate();
    return (
        <div className="landing-container">
            <button onClick={() => navigate("/scene")}>Ahoy!</button>
        </div>
    );
}

export default Landing;
