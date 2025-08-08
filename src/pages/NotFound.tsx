
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117] p-4">
      <div className="w-full max-w-3xl text-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="w-48 md:w-64 lg:w-80 mx-auto md:mx-0">
            <img 
              src="/lovable-uploads/4b186fbd-26a1-4d89-85fc-0ea60ae928e9.png" 
              alt="Illustration 404"
              className="w-full h-auto"
            />
          </div>
          
          <div className="space-y-6 md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
              <span className="text-yellow-400">404</span> - Page non trouvée
            </h1>
            
            <p className="text-xl text-gray-400 max-w-md">
              Oups ! Il semble que vous vous soyez égaré. La page que vous recherchez n'existe pas.
            </p>
            
            <Button 
              asChild 
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:opacity-90 text-black font-medium px-8 py-6 h-auto text-lg"
            >
              <Link to="/">Retourner à l'accueil</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
