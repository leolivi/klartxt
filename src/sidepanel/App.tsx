import "./styles/App.css";
import logoLight from "../../public/img/logo/Klartxt_logo_lm.svg";
import logoDark from "../../public/img/logo/Klartxt_logo_dm.svg";

function App() {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const logo = isDark ? logoDark : logoLight;

  return (
    <>
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <h1>Klartxt</h1>
          <img src={logo} alt="Klartxt logo" />
        </div>
      </div>
    </>
  );
}

export default App;
