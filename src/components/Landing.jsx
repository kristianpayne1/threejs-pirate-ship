import "../styles/landing.css";
import { useNavigate } from "react-router-dom";

function Landing() {
    const navigate = useNavigate();
    return (
        <div className="landing-container">
            <button
                aria-label={"Enter the experience, me hearty!"}
                onClick={() => navigate("/scene")}
            >
                Ahoy!
            </button>
            <p className="disclaimer">This is an audio enabled experience</p>
        </div>
    );
}

export default Landing;
