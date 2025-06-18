import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { UserContext } from '../context/UserContext';

const Login = () => {
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.pseudo) {
      setPseudo(location.state.pseudo);
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://diapo-app.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }, 
        body: JSON.stringify({
          pseudo,
          password,
        }),
      });

      const userData = await response.json();
      console.log("Réponse backend:", userData);

      if (response.ok) {
        if (!userData.user) {
          setError("Réponse inattendue du serveur. L'utilisateur est manquant.");
          return;
        }

        const completeUser = {
          _id: userData.user._id,
          pseudo: userData.user.pseudo || pseudo,
          numero_telephone: userData.user.numero_telephone || '',
          ville_residence: userData.user.ville_residence || '',
          avatar: userData.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(pseudo)}`,
          token: userData.token,
        };

        login(completeUser);
        localStorage.setItem("token", userData.token);
        localStorage.setItem('user', JSON.stringify(completeUser));
        localStorage.setItem("userId", userData.user._id);

        navigate('/Dashboard');
      } else {
        setError(userData.message || 'Erreur lors de la connexion.');
      }
    } catch (err) {
      console.error("Erreur réseau ou serveur :", err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Partie Gauche */}
      <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-white text-white p-8">
        <img src="/logo_diapo.png" alt="Logo" className="absolute top-4 left-4 max-w-[150px]" />
        <p className="text-lg text-center text-gray-950 mb-6">
          "Ensemble, partageons l’espoir et semons la générosité : chaque don, aussi petit soit-il, change une vie."
        </p>
        <img src="/assets/charity1.png" alt="Illustration" className="w-3/4 max-w-md" />
      </div>

      {/* Partie Droite */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8 bg-white shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Se connecter</h2>

        {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} autoComplete="off" className="space-y-4 w-full max-w-md">
          <div>
            <label className="block text-gray-700">Pseudo <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              autoComplete="off"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              value={pseudo} 
              onChange={(e) => setPseudo(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <label className="block text-gray-700">Mot de passe <span className="text-red-500">*</span></label>
            <input 
              type={showPassword ? "text" : "password"}
              autoComplete="off"
              className="w-full px-4 py-2 pr-10 border rounded-md focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div 
              className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </div>
            <div className="text-right mt-1">
              <a href="/" className="text-sm text-blue-500 hover:underline">
                Mot de passe oublié ?
              </a>
            </div>
          </div>


          <button 
            type="submit" 
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition">
            Se connecter
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Vous n'avez pas de compte ? <a href="/signup" className="text-blue-500 hover:underline">Créer un compte</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
