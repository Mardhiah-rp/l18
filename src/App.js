import "./App.css";
import rpLogo from "./assets/rplogo.jpeg";
import homeBanner from "./assets/homebanner.jpg";

import { useEffect, useState } from "react";
import { Routes, Route, Link, Outlet, useParams } from "react-router-dom";
import { diplomas } from "./data/diplomas";

// ===== LocalStorage Helpers (Favourites) =====
function getFavs() {
  const raw = localStorage.getItem("favs");
  return raw ? JSON.parse(raw) : [];
}

function saveFavs(favs) {
  localStorage.setItem("favs", JSON.stringify(favs));
}

// ===== Pages =====
function Home() {
  return (
    <div className="page-container">
      {/* Banner */}
      <div className="home-banner">
        <img src={homeBanner} alt="SOI Home Banner" />
      </div>

      {/* Text content */}
      <h2>Welcome to SOI</h2>

      <p className="page-text">
        If you are excited by the latest technological advances and have a passion for
        problem-solving, join us at Republic Polytechnic School of Infocomm (SOI).
      </p>

      <p className="page-text">
        Browse diplomas, explore modules, save favourites, and register interest.
      </p>
    </div>
  );
}


function Diplomas() {
  const [query, setQuery] = useState("");

  const filteredDiplomas = diplomas.filter((d) => {
    const text = (d.name + " " + d.description).toLowerCase();
    return text.includes(query.toLowerCase());
  });

  return (
    <div className="page-container">
      <h2>Diplomas</h2>
      <p className="page-text muted">Browse SOI diplomas and explore modules offered.</p>

      <input
        className="search-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search diplomas..."
      />

      <div className="card-grid">
        {filteredDiplomas.map((d) => (
          <div className="card" key={d.id}>
            <h3>{d.name}</h3>
            <p className="muted">{d.description}</p>
            <Link className="card-link" to={`/diplomas/${d.id}`}>
              View Modules →
            </Link>
          </div>
        ))}
      </div>

      <Outlet />
    </div>
  );
}

function DiplomaDetail() {
  const { diplomaId } = useParams();
  const diploma = diplomas.find((d) => d.id === diplomaId);

  // used to force re-render when favourites change
  const [tick, setTick] = useState(0);

  useEffect(() => {
    function rerender() {
      setTick((t) => t + 1);
    }
    window.addEventListener("storage", rerender);
    return () => window.removeEventListener("storage", rerender);
  }, []);

  if (!diploma) {
    return (
      <div className="detail-box">
        <h3>Diploma not found</h3>
        <p className="muted">Please return to Diplomas and select a valid diploma.</p>
      </div>
    );
  }

  return (
    <div className="detail-box">
      <h3>{diploma.name}</h3>
      <p className="muted">{diploma.description}</p>

      <h4 className="section-title">Modules</h4>

      <div className="module-grid">
        {diploma.modules.map((m) => {
          const key = `${diplomaId}:${m.id}`;
          const favs = getFavs();
          const isSaved = favs.includes(key);

          function toggleSave() {
            const current = getFavs();
            let updated;

            if (current.includes(key)) {
              updated = current.filter((x) => x !== key);
            } else {
              updated = [...current, key];
            }

            saveFavs(updated);
            window.dispatchEvent(new Event("storage"));
          }

          return (
            <div className="module-card" key={m.id}>
              <div className="module-top">
                <b>{m.name}</b>

                {/* ✅ FAV BUTTON HERE */}
                <button className="save-btn" onClick={toggleSave}>
                  {isSaved ? "★ Saved" : "☆ Save"}
                </button>
              </div>

              <p className="muted">{m.overview}</p>

              <div className="module-links">
                <Link className="card-link" to={`/diplomas/${diplomaId}/${m.id}`}>
                  View Details →
                </Link>

                <Link className="card-link" to={`/register?d=${diplomaId}&m=${m.id}`}>
                  Register Interest →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <Outlet />
    </div>
  );
}

function ModuleDetail() {
  const { diplomaId, moduleId } = useParams();
  const diploma = diplomas.find((d) => d.id === diplomaId);

  if (!diploma) {
    return <div className="module-detail">Diploma not found.</div>;
  }

  const module = diploma.modules.find((m) => m.id === moduleId);

  if (!module) {
    return <div className="module-detail">Module not found.</div>;
  }

  return (
    <div className="module-detail">
      <h4>Module Detail</h4>
      <p><b>Diploma:</b> {diploma.name}</p>
      <p><b>Module:</b> {module.name}</p>
      <p className="muted"><b>Overview:</b> {module.overview}</p>
    </div>
  );
}

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    if (name.trim() === "" || email.trim() === "" || course === "") {
      alert("Please fill in all fields.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="page-container">
        <div className="detail-box">
          <h2>Registration Successful ✅</h2>
          <p><b>Name:</b> {name}</p>
          <p><b>Email:</b> {email}</p>
          <p><b>Course Selected:</b> {course}</p>
          <p className="muted" style={{ marginTop: 12 }}>
            Thank you for registering your interest. We will contact you soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-wrapper">
      <div className="register-box">
        <h2>Register Interest</h2>

        <form className="register-form" onSubmit={handleSubmit}>
          <div>
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label>Course</label>
            <select value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="">-- Select a course --</option>
              {diplomas.map((d) =>
                d.modules.map((m) => (
                  <option key={`${d.id}-${m.id}`} value={`${d.name} — ${m.name}`}>
                    {d.name} — {m.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

function Favourites() {
  const favs = getFavs();

  const saved = [];
  favs.forEach((key) => {
    const [dId, mId] = key.split(":");
    const d = diplomas.find((x) => x.id === dId);
    const m = d?.modules.find((x) => x.id === mId);

    if (d && m) {
      saved.push({ diplomaName: d.name, moduleName: m.name, overview: m.overview, dId, mId });
    }
  });

  return (
    <div className="page-container">
      <h2>Favourites</h2>

      {saved.length === 0 ? (
        <p className="muted">No favourites yet. Go to Diplomas and click “Save”.</p>
      ) : (
        <div className="card-grid">
          {saved.map((item) => (
            <div className="card" key={`${item.dId}:${item.mId}`}>
              <h3>{item.moduleName}</h3>
              <p className="muted">{item.diplomaName}</p>
              <p className="muted">{item.overview}</p>

              <Link className="card-link" to={`/diplomas/${item.dId}/${item.mId}`}>
                View Details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== App Root =====
function App() {
  return (
    <div className="App">
      <header className="app-header">
        <div className="header-bar">
          <h1 className="app-title">SOI Course Enrolment Portal</h1>
          <img src={rpLogo} alt="Republic Polytechnic Logo" className="rp-logo" />
        </div>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/diplomas">Diplomas</Link>
          <Link to="/register">Register</Link>
          <Link to="/favourites">Favourites</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/diplomas" element={<Diplomas />}>
          <Route path=":diplomaId" element={<DiplomaDetail />}>
            <Route path=":moduleId" element={<ModuleDetail />} />
          </Route>
        </Route>

        <Route path="/register" element={<Register />} />
        <Route path="/favourites" element={<Favourites />} />
      </Routes>
    </div>
  );
}

export default App;
